const counterContractAddress = "0xbFE1f7B7A5D60400D59132263F26487860938D89"; // add your contract address here
const counterContractAbi = [
  {
    type: "function",
    name: "increment",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const calls = [
  {
    address: counterContractAddress,
    abi: counterContractAbi,
    functionName: "increment",
    args: [],
  },
];
