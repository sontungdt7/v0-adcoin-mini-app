// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Adcoin} from "../src/Adcoin.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {AdcoinToken} from "../src/MockAdcoin.sol";
import {MockCreatorCoin} from "../src/MockCreatorCoin.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockRouter {
    IERC20 public usdc;
    IERC20 public outputToken;
    uint256 public rate; // output per USDC (scaled by 1e18)

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        rate = 1e18; // 1:1 default
    }

    function setOutputToken(address _token) external {
        outputToken = IERC20(_token);
    }

    function setRate(uint256 _rate) external {
        rate = _rate;
    }

    function swap(uint256 usdcAmount, uint256 minOutput) external returns (uint256) {
        usdc.transferFrom(msg.sender, address(this), usdcAmount);
        uint256 outputAmount = (usdcAmount * rate) / 1e18;
        require(outputAmount >= minOutput, "Slippage");
        outputToken.transfer(msg.sender, outputAmount);
        return outputAmount;
    }
}

contract AdcoinTest is Test {
    Adcoin public adcoin;
    MockUSDC public usdc;
    AdcoinToken public adcoinToken;
    MockCreatorCoin public creatorCoin;
    MockCreatorCoin public targetCoin;
    MockRouter public router;

    address public owner = address(0x1);
    address public treasury = address(0x2);
    address public advertiser = address(0x3);
    address public creator = address(0x4);
    address public user = address(0x5);

    uint256 constant USDC_AMOUNT = 1000 * 10**6; // 1000 USDC
    uint256 constant X_AMOUNT = 10 * 10**6; // 10 USDC (creator spend)
    uint256 constant Y_AMOUNT = 100 * 10**6; // 100 USDC (advertiser deposit)

    function setUp() public {
        vm.startPrank(owner);

        // Deploy tokens
        usdc = new MockUSDC();
        adcoinToken = new AdcoinToken();
        creatorCoin = new MockCreatorCoin("Creator Coin", "CREATOR");
        targetCoin = new MockCreatorCoin("Target Coin", "TARGET");

        // Deploy Adcoin contract
        adcoin = new Adcoin(address(usdc), treasury, address(adcoinToken));

        // Deploy mock router
        router = new MockRouter(address(usdc));

        // Allow router
        adcoin.setRouter(address(router), true);

        // Mint tokens
        usdc.mint(advertiser, USDC_AMOUNT);
        usdc.mint(creator, USDC_AMOUNT);
        adcoinToken.mint(address(router), 1_000_000 * 10**18);
        creatorCoin.mint(address(router), 1_000_000 * 10**18);
        targetCoin.mint(address(router), 1_000_000 * 10**18);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR TESTS
    //////////////////////////////////////////////////////////////*/

    function testInitialState() public view {
        assertEq(address(adcoin.USDC()), address(usdc));
        assertEq(adcoin.treasury(), treasury);
        assertEq(adcoin.adcoinToken(), address(adcoinToken));
        assertEq(adcoin.owner(), owner);
        assertEq(adcoin.nextOfferId(), 0);
    }

    function test_RevertWhen_ConstructorInvalidUsdc() public {
        vm.prank(owner);
        vm.expectRevert("INVALID_USDC");
        new Adcoin(address(0), treasury, address(adcoinToken));
    }

    function test_RevertWhen_ConstructorInvalidTreasury() public {
        vm.prank(owner);
        vm.expectRevert("INVALID_TREASURY");
        new Adcoin(address(usdc), address(0), address(adcoinToken));
    }

    function test_RevertWhen_ConstructorInvalidAdcoin() public {
        vm.prank(owner);
        vm.expectRevert("INVALID_ADCOIN");
        new Adcoin(address(usdc), treasury, address(0));
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function testSetRouter() public {
        address newRouter = address(0x999);
        
        vm.prank(owner);
        adcoin.setRouter(newRouter, true);
        
        assertTrue(adcoin.allowedRouters(newRouter));
    }

    function testSetTreasury() public {
        address newTreasury = address(0x888);
        
        vm.prank(owner);
        adcoin.setTreasury(newTreasury);
        
        assertEq(adcoin.treasury(), newTreasury);
    }

    function testSetAdcoinToken() public {
        address newToken = address(0x777);
        
        vm.prank(owner);
        adcoin.setAdcoinToken(newToken);
        
        assertEq(adcoin.adcoinToken(), newToken);
    }

    function test_RevertWhen_NonOwnerSetsRouter() public {
        vm.prank(user);
        vm.expectRevert();
        adcoin.setRouter(address(0x999), true);
    }

    function test_RevertWhen_SetTreasuryZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("INVALID_TREASURY");
        adcoin.setTreasury(address(0));
    }

    function test_RevertWhen_SetAdcoinTokenZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("INVALID_ADCOIN");
        adcoin.setAdcoinToken(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        OFFER CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testCreateOffer() public {
        uint256 expiry = block.timestamp + 1 days;

        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        uint256 offerId = adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            expiry
        );
        vm.stopPrank();

        assertEq(offerId, 0);
        assertEq(adcoin.nextOfferId(), 1);
        assertEq(usdc.balanceOf(address(adcoin)), Y_AMOUNT);

        (
            address offerAdvertiser,
            address offerCreator,
            address offerTargetCoin,
            address offerCreatorCoin,
            uint256 xAmount,
            uint256 yAmount,
            uint256 offerExpiry,
            bool executed,
            bool cancelled
        ) = adcoin.offers(offerId);

        assertEq(offerAdvertiser, advertiser);
        assertEq(offerCreator, creator);
        assertEq(offerTargetCoin, address(targetCoin));
        assertEq(offerCreatorCoin, address(creatorCoin));
        assertEq(xAmount, X_AMOUNT);
        assertEq(yAmount, Y_AMOUNT);
        assertEq(offerExpiry, expiry);
        assertFalse(executed);
        assertFalse(cancelled);
    }

    function testCreateMultipleOffers() public {
        uint256 expiry = block.timestamp + 1 days;

        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT * 2);
        
        uint256 offerId1 = adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            expiry
        );
        
        uint256 offerId2 = adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            expiry
        );
        vm.stopPrank();

        assertEq(offerId1, 0);
        assertEq(offerId2, 1);
        assertEq(adcoin.nextOfferId(), 2);
    }

    function test_RevertWhen_CreateOfferInvalidCreator() public {
        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        vm.expectRevert("INVALID_CREATOR");
        adcoin.createOffer(
            address(0),
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            block.timestamp + 1 days
        );
        vm.stopPrank();
    }

    function test_RevertWhen_CreateOfferInvalidAmounts() public {
        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        vm.expectRevert("INVALID_AMOUNTS");
        adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            0,
            Y_AMOUNT,
            block.timestamp + 1 days
        );
        vm.stopPrank();
    }

    function test_RevertWhen_CreateOfferExpiredTime() public {
        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        vm.expectRevert("INVALID_EXPIRY");
        adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            block.timestamp - 1
        );
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        OFFER CANCELLATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testCancelOffer() public {
        uint256 expiry = block.timestamp + 1 days;

        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        uint256 offerId = adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            expiry
        );
        
        uint256 balanceBefore = usdc.balanceOf(advertiser);
        adcoin.cancelOffer(offerId);
        uint256 balanceAfter = usdc.balanceOf(advertiser);
        vm.stopPrank();

        assertEq(balanceAfter - balanceBefore, Y_AMOUNT);
        
        (,,,,,,, bool executed, bool cancelled) = adcoin.offers(offerId);
        assertFalse(executed);
        assertTrue(cancelled);
    }

    function test_RevertWhen_NonAdvertiserCancels() public {
        uint256 expiry = block.timestamp + 1 days;

        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        uint256 offerId = adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            expiry
        );
        vm.stopPrank();

        vm.prank(user);
        vm.expectRevert("ONLY_ADVERTISER");
        adcoin.cancelOffer(offerId);
    }

    function test_RevertWhen_CancelAlreadyCancelled() public {
        uint256 expiry = block.timestamp + 1 days;

        vm.startPrank(advertiser);
        usdc.approve(address(adcoin), Y_AMOUNT);
        uint256 offerId = adcoin.createOffer(
            creator,
            address(targetCoin),
            address(creatorCoin),
            X_AMOUNT,
            Y_AMOUNT,
            expiry
        );
        
        adcoin.cancelOffer(offerId);
        
        vm.expectRevert("ALREADY_CANCELLED");
        adcoin.cancelOffer(offerId);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAW TOKEN TESTS
    //////////////////////////////////////////////////////////////*/

    function testWithdrawToken() public {
        // Send some tokens to the contract
        vm.prank(owner);
        usdc.mint(address(adcoin), 1000 * 10**6);

        uint256 balanceBefore = usdc.balanceOf(owner);
        
        vm.prank(owner);
        adcoin.withdrawToken(IERC20(address(usdc)), 500 * 10**6);
        
        uint256 balanceAfter = usdc.balanceOf(owner);
        assertEq(balanceAfter - balanceBefore, 500 * 10**6);
    }

    function test_RevertWhen_NonOwnerWithdraws() public {
        vm.prank(owner);
        usdc.mint(address(adcoin), 1000 * 10**6);

        vm.prank(user);
        vm.expectRevert();
        adcoin.withdrawToken(IERC20(address(usdc)), 500 * 10**6);
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTANTS TESTS
    //////////////////////////////////////////////////////////////*/

    function testConstants() public view {
        assertEq(adcoin.BPS_DENOMINATOR(), 10_000);
        assertEq(adcoin.PROTOCOL_FEE_BPS(), 300);
        assertEq(adcoin.ADCOIN_BUY_BPS(), 300);
        assertEq(adcoin.CREATOR_BUY_BPS(), 9400);
    }

    function testFeeCalculation() public pure {
        uint256 yAmount = 100 * 10**6; // 100 USDC
        
        uint256 protocolFee = (yAmount * 300) / 10_000; // 3%
        uint256 adcoinAmount = (yAmount * 300) / 10_000; // 3%
        uint256 creatorBuyAmount = yAmount - protocolFee - adcoinAmount; // 94%
        
        assertEq(protocolFee, 3 * 10**6); // 3 USDC
        assertEq(adcoinAmount, 3 * 10**6); // 3 USDC
        assertEq(creatorBuyAmount, 94 * 10**6); // 94 USDC
    }
}
