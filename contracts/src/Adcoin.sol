// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Adcoin is ReentrancyGuard, Ownable {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant PROTOCOL_FEE_BPS = 300; // 3%
    uint256 public constant ADCOIN_BUY_BPS   = 300; // 3%
    uint256 public constant CREATOR_BUY_BPS  = 9400; // 94%

    IERC20 public immutable USDC;

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Offer {
        address advertiser;
        address creator;

        address targetCoin;   // coin creator must buy
        address creatorCoin;  // coin advertiser will buy

        uint256 xAmount; // creator spends X USDC
        uint256 yAmount; // advertiser deposited Y USDC

        uint256 expiry;
        bool executed;
        bool cancelled;
    }

    struct SwapData {
        address router;
        bytes calldataData;
        uint256 usdcAmount;
        uint256 minBuyAmount;
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public nextOfferId;
    mapping(uint256 => Offer) public offers;

    mapping(address => bool) public allowedRouters;

    address public treasury;     // protocol fee receiver
    address public adcoinToken;  // Adcoin protocol token

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event OfferCreated(
        uint256 indexed offerId,
        address indexed advertiser,
        address indexed creator,
        uint256 xAmount,
        uint256 yAmount,
        uint256 expiry
    );

    event OfferExecuted(uint256 indexed offerId);
    event OfferCancelled(uint256 indexed offerId);

    event SwapExecuted(
        address indexed buyToken,
        uint256 usdcSpent,
        uint256 amountReceived
    );

    event RouterUpdated(address router, bool allowed);
    event TreasuryUpdated(address treasury);
    event AdcoinTokenUpdated(address token);

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _usdc, address _treasury, address _adcoinToken) Ownable(msg.sender) {
        require(_usdc != address(0), "INVALID_USDC");
        require(_treasury != address(0), "INVALID_TREASURY");
        require(_adcoinToken != address(0), "INVALID_ADCOIN");

        USDC = IERC20(_usdc);
        treasury = _treasury;
        adcoinToken = _adcoinToken;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN CONTROLS
    //////////////////////////////////////////////////////////////*/

    function setRouter(address router, bool allowed) external onlyOwner {
        allowedRouters[router] = allowed;
        emit RouterUpdated(router, allowed);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "INVALID_TREASURY");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setAdcoinToken(address _token) external onlyOwner {
        require(_token != address(0), "INVALID_ADCOIN");
        adcoinToken = _token;
        emit AdcoinTokenUpdated(_token);
    }

    /*//////////////////////////////////////////////////////////////
                            OFFER CREATION
    //////////////////////////////////////////////////////////////*/

    function createOffer(
        address creator,
        address targetCoin,
        address creatorCoin,
        uint256 xAmount,
        uint256 yAmount,
        uint256 expiry
    ) external nonReentrant returns (uint256 offerId) {
        require(creator != address(0), "INVALID_CREATOR");
        require(targetCoin != address(0), "INVALID_TARGET");
        require(creatorCoin != address(0), "INVALID_CREATOR_COIN");
        require(xAmount > 0 && yAmount > 0, "INVALID_AMOUNTS");
        require(expiry > block.timestamp, "INVALID_EXPIRY");

        // Transfer Y USDC from advertiser to contract
        require(
            USDC.transferFrom(msg.sender, address(this), yAmount),
            "USDC_TRANSFER_FAILED"
        );

        offerId = nextOfferId++;

        offers[offerId] = Offer({
            advertiser: msg.sender,
            creator: creator,
            targetCoin: targetCoin,
            creatorCoin: creatorCoin,
            xAmount: xAmount,
            yAmount: yAmount,
            expiry: expiry,
            executed: false,
            cancelled: false
        });

        emit OfferCreated(
            offerId,
            msg.sender,
            creator,
            xAmount,
            yAmount,
            expiry
        );
    }

    /*//////////////////////////////////////////////////////////////
                            OFFER EXECUTION
    //////////////////////////////////////////////////////////////*/

    function executeOffer(
        uint256 offerId,
        SwapData calldata creatorBuysTarget,
        SwapData calldata advertiserBuysCreator,
        SwapData calldata advertiserBuysAdcoin
    ) external nonReentrant {
        Offer storage o = offers[offerId];

        require(!o.executed, "ALREADY_EXECUTED");
        require(!o.cancelled, "CANCELLED");
        require(block.timestamp <= o.expiry, "EXPIRED");
        require(msg.sender == o.creator, "ONLY_CREATOR");

        // --------------------------------
        // 1. Creator buys target coin (X)
        // --------------------------------
        _executeSwap(
            creatorBuysTarget,
            o.targetCoin,
            o.xAmount
        );

        // --------------------------------
        // 2. Split advertiser Y
        // --------------------------------
        uint256 protocolFee = (o.yAmount * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 adcoinAmount = (o.yAmount * ADCOIN_BUY_BPS) / BPS_DENOMINATOR;
        uint256 creatorBuyAmount = o.yAmount - protocolFee - adcoinAmount;

        // --------------------------------
        // 3. Protocol fee transfer
        // --------------------------------
        require(
            USDC.transfer(treasury, protocolFee),
            "FEE_TRANSFER_FAILED"
        );

        // --------------------------------
        // 4. Buy Adcoin → Advertiser
        // --------------------------------
        _executeSwap(
            advertiserBuysAdcoin,
            adcoinToken,
            adcoinAmount
        );

        uint256 adcoinBalance = IERC20(adcoinToken).balanceOf(address(this));
        if (adcoinBalance > 0) {
            IERC20(adcoinToken).transfer(o.advertiser, adcoinBalance);
        }

        // --------------------------------
        // 5. Buy Creator Coin → Advertiser
        // --------------------------------
        _executeSwap(
            advertiserBuysCreator,
            o.creatorCoin,
            creatorBuyAmount
        );

        uint256 creatorCoinBalance =
            IERC20(o.creatorCoin).balanceOf(address(this));

        if (creatorCoinBalance > 0) {
            IERC20(o.creatorCoin).transfer(o.advertiser, creatorCoinBalance);
        }

        o.executed = true;
        emit OfferExecuted(offerId);
    }

    /*//////////////////////////////////////////////////////////////
                            CANCELLATION
    //////////////////////////////////////////////////////////////*/

    function cancelOffer(uint256 offerId) external nonReentrant {
        Offer storage o = offers[offerId];

        require(msg.sender == o.advertiser, "ONLY_ADVERTISER");
        require(!o.executed, "ALREADY_EXECUTED");
        require(!o.cancelled, "ALREADY_CANCELLED");

        o.cancelled = true;

        // Refund USDC
        require(
            USDC.transfer(o.advertiser, o.yAmount),
            "REFUND_FAILED"
        );

        emit OfferCancelled(offerId);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL SWAP EXECUTOR
    //////////////////////////////////////////////////////////////*/

    function _executeSwap(
        SwapData calldata swap,
        address buyToken,
        uint256 expectedUsdc
    ) internal {
        require(allowedRouters[swap.router], "ROUTER_NOT_ALLOWED");
        require(swap.usdcAmount == expectedUsdc, "USDC_MISMATCH");

        // Approve router
        USDC.approve(swap.router, 0);
        USDC.approve(swap.router, swap.usdcAmount);

        uint256 balanceBefore = IERC20(buyToken).balanceOf(address(this));

        (bool success, ) = swap.router.call(swap.calldataData);
        require(success, "SWAP_FAILED");

        uint256 balanceAfter = IERC20(buyToken).balanceOf(address(this));
        uint256 boughtAmount = balanceAfter - balanceBefore;

        require(boughtAmount >= swap.minBuyAmount, "SLIPPAGE_TOO_HIGH");

        emit SwapExecuted(buyToken, swap.usdcAmount, boughtAmount);
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY WITHDRAW
    //////////////////////////////////////////////////////////////*/

    function withdrawToken(
        IERC20 token,
        uint256 amount
    ) external onlyOwner {
        token.transfer(msg.sender, amount);
    }
}
