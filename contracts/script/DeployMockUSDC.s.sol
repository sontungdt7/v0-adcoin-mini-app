// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract DeployMockUSDC is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        uint256 initialMintAmount = 1_000_000 * 10**6; // 1 million USDC (6 decimals)
        
        vm.startBroadcast(deployerPrivateKey);
        
        MockUSDC usdc = new MockUSDC();
        
        usdc.mint(deployerAddress, initialMintAmount);
        
        vm.stopBroadcast();
        
        console.log("MockUSDC deployed to:", address(usdc));
        console.log("Token name:", usdc.name());
        console.log("Token symbol:", usdc.symbol());
        console.log("Decimals:", usdc.decimals());
        console.log("Deployer balance:", usdc.balanceOf(deployerAddress));
    }
}
