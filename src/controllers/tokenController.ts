import { Request, Response } from "express";
import { ipfsService, IPFSService } from "../services/ipfsService";
import { coinChainClient, signer } from "../services/tokenService";
import { ethers } from "ethers";

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

    // Validate only required fields (name, symbol, image_url)
    if (!name || !symbol || !image_url) {
      res.status(400).json({
        success: false,
        error: "Name, symbol, and image_url are required",
      });
    }

    // Here you would implement the actual token launching logic

    // Mock response for now
    const token = {
      id: Date.now().toString(),
      name,
      symbol,
      image_url,
      description: description || null,
      twitter: twitter || null,
      telegram: telegram || null,
      website: website || null,
      created_at: new Date().toISOString(),
    };

    const ipfsUrl = await ipfsService.uploadImageFromUrl(image_url);
    const metadataUrl = await ipfsService.createTokenURI({
      name,
      symbol,
      description: description || "New token nani coin",
      image: ipfsUrl,
    });
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

    res.status(201).json({
      success: true,
      message: "Token launched successfully",
      mint_address: inforToken.coinId,
    });
  } catch (error) {
    console.error("Error launching token:", error);
    res.status(500).json({
      success: false,
      error: "Failed to launch token",
    });
  }
};
