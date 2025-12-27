import type { Address } from "viem";

export type AdcoinOffer = {
  id: string;
  advertiser: Address;
  creator: Address;
  targetCoin: Address;
  creatorCoin: Address;
  xAmount: number;
  yAmount: number;
  expiry: number;
  executed: boolean;
  cancelled: boolean;
  expiresIn: string;
};
