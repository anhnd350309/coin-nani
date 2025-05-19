import { Request, Response } from "express";
import { ipfsService, IPFSService } from "../services/ipfsService";
import { coinChainClient, signer } from "../services/tokenService";
import { ethers } from "ethers";
import { insertToken } from "./dbquery";
import config from "../config";

interface LaunchTokenRequest {
  name: string;
  symbol: string;
  description?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  image_url: string;
}

export const launchToken = async (req: Request, res: Response) => {
  try {
    const {
      name,
      symbol,
      description,
      twitter,
      telegram,
      website,
      image_url,
    }: LaunchTokenRequest = req.body;

    console.log("Request body:", req.body);
    if (config.nodeEnv === "development") {
      res.status(201).json({
        success: true,
        message: "Token launched successfully",
        token_address: "0xC39491284EE1d099A53e62098759282794ED9918",
      });
      return;
    }

    // Validate only required fields (name, symbol, image_url)
    if (!name || !symbol) {
      res.status(400).json({
        success: false,
        error: "Name, symbol are required",
      });
    }

    // Here you would implement the actual token launching logic

    let ipfsUrl = undefined;
    if (image_url) {
      ipfsUrl = await ipfsService.uploadImageFromUrl(image_url);
      console.log("IPFS URL:", ipfsUrl);
    }
    const metadataUrl = await ipfsService.createTokenURI({
      name,
      symbol,
      description: description || "New token nani coin",
      image: ipfsUrl,
    });

    console.log("Metadata URL:", metadataUrl);
    const inforToken = await coinChainClient.createToken({
      name,
      symbol,
      tokenURI: metadataUrl,
      poolSupply: 21000000000000000000000000n,
      ownerSupply: 0n,
      swapFee: 0,
      owner: await signer.getAddress(),
      ethAmount: ethers.utils.parseEther("0.000001"),
    });

    console.log("Token launched successfully:", inforToken);
    await insertToken({
      name,
      symbol,
      description,
      token_address: inforToken.coinId,
      image_url:
        ipfsUrl ?? "ipfs://QmbHoD9UJ1L2xfv5oFvhANsWzf1tMzN2Lr8YrPDACXt1aE",
    });

    res.status(201).json({
      success: true,
      message: "Token launched successfully",
      token_address: inforToken.tokenAddress,
    });
  } catch (error) {
    console.error("Error launching token:", error);
    res.status(500).json({
      success: false,
      error: "Failed to launch token",
    });
  }
};
