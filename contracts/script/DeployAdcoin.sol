// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Adcoin} from "../src/Adcoin.sol";

contract DeployAdcoinSepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        address usdc = vm.envAddress("MOCKUSDC_ADDRESS");
        address adcoinToken = vm.envAddress("MOCKADCOINTOKEN_ADDRESS");
        address treasury = deployerAddress;
        
        console.log("Deploying Adcoin contract...");
        console.log("USDC:", usdc);
        console.log("Adcoin Token:", adcoinToken);
        console.log("Treasury:", treasury);
        
        vm.startBroadcast(deployerPrivateKey);
        
        Adcoin adcoin = new Adcoin(usdc, treasury, adcoinToken);
        
        vm.stopBroadcast();
        
        console.log("Adcoin deployed to:", address(adcoin));
        console.log("Owner:", adcoin.owner());
    }
}
