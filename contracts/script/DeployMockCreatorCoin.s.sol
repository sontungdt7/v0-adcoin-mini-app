// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {MockCreatorCoin} from "../src/MockCreatorCoin.sol";

contract DeployMockCreatorCoin is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        string memory name = "GarryTan Coin";
        string memory symbol = "GARRY";
        uint256 initialMintAmount = 1_000_000 * 10**18; // 1 million tokens
        
        vm.startBroadcast(deployerPrivateKey);
        
        MockCreatorCoin token = new MockCreatorCoin(name, symbol);
        
        token.mint(deployerAddress, initialMintAmount);
        
        vm.stopBroadcast();
        
        console.log("MockCreatorCoin deployed to:", address(token));
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());
        console.log("Deployer balance:", token.balanceOf(deployerAddress));
    }
}
