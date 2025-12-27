import { type Abi } from "viem";

export const ADCOIN_ADDRESS = "0x5c75DF65cBB35474D10Adeb72Aa3b1035185223e" as const;
export const MOCKUSDC_ADDRESS = "0x40FF34E722067C488b39F07bC572DedB519Ac09e" as const;

export const ADCOIN_ABI: Abi = [
  {
    inputs: [
      { internalType: "address", name: "_usdc", type: "address" },
      { internalType: "address", name: "_treasury", type: "address" },
      { internalType: "address", name: "_adcoinToken", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "ADCOIN_BUY_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "BPS_DENOMINATOR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "CREATOR_BUY_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "PROTOCOL_FEE_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "USDC",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "allowedRouters",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "adcoinToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "offerId", type: "uint256" }],
    name: "cancelOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "address", name: "targetCoin", type: "address" },
      { internalType: "address", name: "creatorCoin", type: "address" },
      { internalType: "uint256", name: "xAmount", type: "uint256" },
      { internalType: "uint256", name: "yAmount", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" }
    ],
    name: "createOffer",
    outputs: [{ internalType: "uint256", name: "offerId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "nextOfferId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "offers",
    outputs: [
      { internalType: "address", name: "advertiser", type: "address" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "address", name: "targetCoin", type: "address" },
      { internalType: "address", name: "creatorCoin", type: "address" },
      { internalType: "uint256", name: "xAmount", type: "uint256" },
      { internalType: "uint256", name: "yAmount", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "bool", name: "executed", type: "bool" },
      { internalType: "bool", name: "cancelled", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "address", name: "advertiser", type: "address" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint256", name: "xAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "yAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "expiry", type: "uint256" }
    ],
    name: "OfferCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "offerId", type: "uint256" }],
    name: "OfferExecuted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "offerId", type: "uint256" }],
    name: "OfferCancelled",
    type: "event"
  }
] as const;

export const ERC20_ABI: Abi = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  }
] as const;
