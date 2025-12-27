// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {AdcoinToken} from "../src/MockAdcoin.sol";

contract DeployMockAdcoin is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        uint256 initialMintAmount = 1_000_000 * 10**18; // 1 million tokens
        
        vm.startBroadcast(deployerPrivateKey);
        
        AdcoinToken token = new AdcoinToken();
        
        token.mint(deployerAddress, initialMintAmount);
        
        vm.stopBroadcast();
        
        console.log("AdcoinToken deployed to:", address(token));
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());
        console.log("Deployer balance:", token.balanceOf(deployerAddress));
    }
}
