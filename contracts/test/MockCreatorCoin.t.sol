// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {MockCreatorCoin} from "../src/MockCreatorCoin.sol";

contract MockCreatorCoinTest is Test {
    MockCreatorCoin public token;
    address public owner = address(0x1);
    address public user = address(0x2);
    
    string constant NAME = "Creator Coin";
    string constant SYMBOL = "CREATOR";
    
    function setUp() public {
        vm.prank(owner);
        token = new MockCreatorCoin(NAME, SYMBOL);
    }
    
    function testInitialState() public view {
        assertEq(token.name(), NAME);
        assertEq(token.symbol(), SYMBOL);
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), owner);
    }
    
    function testCustomNameAndSymbol() public {
        vm.prank(owner);
        MockCreatorCoin customToken = new MockCreatorCoin("GarryTan Coin", "GARRY");
        
        assertEq(customToken.name(), "GarryTan Coin");
        assertEq(customToken.symbol(), "GARRY");
    }
    
    function testMinting() public {
        uint256 mintAmount = 1000 * 10**18;
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount);
        assertEq(token.totalSupply(), mintAmount);
    }
    
    function testMintMultipleTimes() public {
        uint256 mintAmount = 500 * 10**18;
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount * 2);
        assertEq(token.totalSupply(), mintAmount * 2);
    }
    
    function testFailUnauthorizedMinting() public {
        vm.prank(user);
        token.mint(user, 1000 * 10**18);
    }
    
    function testTransfer() public {
        uint256 mintAmount = 1000 * 10**18;
        uint256 transferAmount = 100 * 10**18;
        
        vm.prank(owner);
        token.mint(owner, mintAmount);
        
        vm.prank(owner);
        token.transfer(user, transferAmount);
        
        assertEq(token.balanceOf(owner), mintAmount - transferAmount);
        assertEq(token.balanceOf(user), transferAmount);
    }
}
