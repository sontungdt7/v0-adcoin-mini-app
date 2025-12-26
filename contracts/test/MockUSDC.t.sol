// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public token;
    address public owner = address(0x1);
    address public user = address(0x2);
    
    function setUp() public {
        vm.prank(owner);
        token = new MockUSDC();
    }
    
    function testInitialState() public view {
        assertEq(token.name(), "Mock USDC");
        assertEq(token.symbol(), "USDC");
        assertEq(token.decimals(), 6);
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), owner);
    }
    
    function testDecimals() public view {
        assertEq(token.decimals(), 6);
    }
    
    function testMinting() public {
        uint256 mintAmount = 1000 * 10**6; // 1000 USDC with 6 decimals
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount);
        assertEq(token.totalSupply(), mintAmount);
    }
    
    function testMintLargeAmount() public {
        uint256 mintAmount = 1_000_000 * 10**6; // 1 million USDC
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount);
    }
    
    function testMintMultipleTimes() public {
        uint256 mintAmount = 500 * 10**6;
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount * 2);
        assertEq(token.totalSupply(), mintAmount * 2);
    }
    
    function test_RevertWhen_UnauthorizedMinting() public {
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, 1000 * 10**6);
    }
    
    function testTransfer() public {
        uint256 mintAmount = 1000 * 10**6;
        uint256 transferAmount = 100 * 10**6;
        
        vm.prank(owner);
        token.mint(owner, mintAmount);
        
        vm.prank(owner);
        token.transfer(user, transferAmount);
        
        assertEq(token.balanceOf(owner), mintAmount - transferAmount);
        assertEq(token.balanceOf(user), transferAmount);
    }
    
    function testApproveAndTransferFrom() public {
        uint256 mintAmount = 1000 * 10**6;
        uint256 approveAmount = 500 * 10**6;
        
        vm.prank(owner);
        token.mint(owner, mintAmount);
        
        vm.prank(owner);
        token.approve(user, approveAmount);
        
        vm.prank(user);
        token.transferFrom(owner, user, approveAmount);
        
        assertEq(token.balanceOf(user), approveAmount);
        assertEq(token.balanceOf(owner), mintAmount - approveAmount);
    }
}
