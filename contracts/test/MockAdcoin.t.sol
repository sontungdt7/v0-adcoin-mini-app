// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {AdcoinToken} from "../src/MockAdcoin.sol";

contract MockAdcoinTest is Test {
    AdcoinToken public token;
    address public owner = address(0x1);
    address public user = address(0x2);
    
    function setUp() public {
        vm.prank(owner);
        token = new AdcoinToken();
    }
    
    function testInitialState() public view {
        assertEq(token.name(), "Adcoin");
        assertEq(token.symbol(), "ADCOIN");
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), owner);
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
