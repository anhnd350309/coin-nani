import { BigNumberish, ethers } from "ethers";
import config from "./config";

const COINCHAN_ADDRESS = "0x00000000007762d8dcadeddd5aa5e9a5e2b7c6f5";
const COINCHAN_ABI = [
  "function make(string name, string symbol, string tokenURI, uint256 poolSupply, uint256 ownerSupply, uint96 swapFee, address owner) external payable returns (uint256 coinId, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "function makeLocked(string name, string symbol, string tokenURI, uint256 poolSupply, uint256 creatorSupply, uint96 swapFee, address creator, uint256 unlock, bool vesting) external payable returns (uint256 coinId, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "function makeHold(string name, string symbol, string tokenURI, uint256 poolSupply, uint256 creatorSupply, uint96 swapFee, address creator) external payable returns (uint256 coinId, uint256 amount0, uint256 amount1, uint256 liquidity)",
];

export interface TokenCreationResult {
  coinId: string;
  amount0: string;
  amount1: string;
  liquidity: string;
  tokenAddress: string;
  receipt: ethers.ContractReceipt;
}

export class CoinChanClient {
  private contract: ethers.Contract;

  constructor(signer: ethers.Signer) {
    this.contract = new ethers.Contract(COINCHAN_ADDRESS, COINCHAN_ABI, signer);
  }

  async createToken(params: {
    name: string;
    symbol: string;
    tokenURI: string;
    poolSupply: BigNumberish;
    ownerSupply: BigNumberish;
    swapFee: number;
    owner: string;
    ethAmount: BigNumberish;
  }): Promise<TokenCreationResult> {
    const [coinId, amount0, amount1, liquidity] =
      await this.contract.callStatic.make(
        params.name,
        params.symbol,
        params.tokenURI,
        params.poolSupply,
        params.ownerSupply,
        params.swapFee,
        params.owner,
        { value: params.ethAmount }
      );

    const tx = await this.contract.make(
      params.name,
      params.symbol,
      params.tokenURI,
      params.poolSupply,
      params.ownerSupply,
      params.swapFee,
      params.owner,
      { value: params.ethAmount }
    );
    const receipt = await tx.wait();

    const coinIdBN = ethers.BigNumber.from(coinId);
    const tokenAddress = ethers.utils.getAddress(
      ethers.utils.hexZeroPad(coinIdBN.toHexString(), 20)
    );

    return {
      coinId: coinId.toString(),
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      liquidity: liquidity.toString(),
      tokenAddress,
      receipt,
    };
  }

  async createLockedToken(params: {
    name: string;
    symbol: string;
    tokenURI: string;
    poolSupply: BigNumberish;
    creatorSupply: BigNumberish;
    swapFee: number;
    creator: string;
    unlock: BigNumberish;
    vesting: boolean;
    ethAmount: BigNumberish;
  }): Promise<TokenCreationResult> {
    const [coinId, amount0, amount1, liquidity] =
      await this.contract.callStatic.makeLocked(
        params.name,
        params.symbol,
        params.tokenURI,
        params.poolSupply,
        params.creatorSupply,
        params.swapFee,
        params.creator,
        params.unlock,
        params.vesting,
        { value: params.ethAmount }
      );

    const tx = await this.contract.makeLocked(
      params.name,
      params.symbol,
      params.tokenURI,
      params.poolSupply,
      params.creatorSupply,
      params.swapFee,
      params.creator,
      params.unlock,
      params.vesting,
      { value: params.ethAmount }
    );
    const receipt = await tx.wait();

    const coinIdBN = ethers.BigNumber.from(coinId);
    const tokenAddress = ethers.utils.getAddress(
      ethers.utils.hexZeroPad(coinIdBN.toHexString(), 20)
    );

    return {
      coinId: coinId.toString(),
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      liquidity: liquidity.toString(),
      tokenAddress,
      receipt,
    };
  }

  async createHoldToken(params: {
    name: string;
    symbol: string;
    tokenURI: string;
    poolSupply: BigNumberish;
    creatorSupply: BigNumberish;
    swapFee: number;
    creator: string;
    ethAmount: BigNumberish;
  }): Promise<TokenCreationResult> {
    const [coinId, amount0, amount1, liquidity] =
      await this.contract.callStatic.makeHold(
        params.name,
        params.symbol,
        params.tokenURI,
        params.poolSupply,
        params.creatorSupply,
        params.swapFee,
        params.creator,
        { value: params.ethAmount }
      );

    const tx = await this.contract.makeHold(
      params.name,
      params.symbol,
      params.tokenURI,
      params.poolSupply,
      params.creatorSupply,
      params.swapFee,
      params.creator,
      { value: params.ethAmount }
    );
    const receipt = await tx.wait();

    const coinIdBN = ethers.BigNumber.from(coinId);
    const tokenAddress = ethers.utils.getAddress(
      ethers.utils.hexZeroPad(coinIdBN.toHexString(), 20)
    );

    return {
      coinId: coinId.toString(),
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      liquidity: liquidity.toString(),
      tokenAddress,
      receipt,
    };
  }
}

const provider = new ethers.providers.JsonRpcProvider(config.chain.rpc_url);
const signer = new ethers.Wallet(config.private_key, provider);
export const client = new CoinChanClient(signer);

// TEST

async function testMake() {
  const result = await client.createToken({
    name: "NANIFUUUUNNNNN",
    symbol: "NANIFUN",
    tokenURI: "https://nanifun.com",
    poolSupply: 1000000000000000000n,
    ownerSupply: 1000000000000000000n,
    swapFee: 10000,
    owner: "0x0000000000000000000000000000000000000000",
    ethAmount: ethers.utils.parseEther("0.000001"),
  });
  console.log(result);
}

async function testMakeLock() {
  // Get current timestamp and add 30 days for unlock time
  const unlockTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

  const result = await client.createLockedToken({
    name: "NANIFUN-LOCKED",
    symbol: "NANIFUN-L",
    tokenURI: "https://nanifun.com/locked",
    poolSupply: 1000000000000000000n,
    creatorSupply: 1000000000000000000n,
    swapFee: 10000,
    creator: "0x0000000000000000000000000000000000000000",
    unlock: unlockTime,
    vesting: true, // Enable vesting
    ethAmount: ethers.utils.parseEther("0.000001"),
  });
  console.log(result);
}

async function testMakeHold() {
  const result = await client.createHoldToken({
    name: "NANIFUN-HOLD",
    symbol: "NANIFUN-H",
    tokenURI: "https://nanifun.com/hold",
    poolSupply: 1000000000000000000n,
    creatorSupply: 1000000000000000000n,
    swapFee: 10000,
    creator: "0x0000000000000000000000000000000000000000",
    ethAmount: ethers.utils.parseEther("0.000001"),
  });
  console.log(result);
}

// testMake();
// testMakeLock();
// testMakeHold();
