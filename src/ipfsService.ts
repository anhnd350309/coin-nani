import { createReadStream } from "fs";
import type { IPFSHTTPClient } from "ipfs-http-client";
import { create } from "ipfs-http-client";
import fetch from "node-fetch";
import path from "path";
import config from "./config";

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string; // IPFS URI (e.g., ipfs://<cid>)
}

export class IPFSService {
  private ipfs: IPFSHTTPClient;

  constructor() {
    const { projectId, projectSecret } = config.infura;
    if (!projectId || !projectSecret) {
      throw new Error("Infura IPFS credentials are missing in config.infura");
    }

    const auth =
      "Basic " +
      Buffer.from(`${projectId}:${projectSecret}`).toString("base64");

    this.ipfs = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: { authorization: auth },
    });
  }

  /**
   * Uploads a local file to IPFS via Infura and returns an ipfs:// CID URI.
   */
  async uploadImageFromFile(filePath: string): Promise<string> {
    try {
      const stream = createReadStream(filePath);
      const { cid } = await this.ipfs.add(stream);
      return `ipfs://${cid.toString()}`;
    } catch (err: any) {
      throw new Error(
        `uploadImageFromFile(${filePath}) failed: ${err.message}`
      );
    }
  }

  /**
   * Fetches an image from a URL and uploads it to IPFS, returning an ipfs:// URI.
   */
  async uploadImageFromUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const { cid } = await this.ipfs.add(Buffer.from(buffer));
      return `ipfs://${cid.toString()}`;
    } catch (err: any) {
      throw new Error(`uploadImageFromUrl(${imageUrl}) failed: ${err.message}`);
    }
  }

  /**
   * Packs TokenMetadata as JSON, uploads to IPFS, and returns the ipfs:// CID URI.
   */
  async createTokenURI(metadata: TokenMetadata): Promise<string> {
    try {
      const buf = Buffer.from(JSON.stringify(metadata));
      const { cid } = await this.ipfs.add(buf);
      return `ipfs://${cid.toString()}`;
    } catch (err: any) {
      throw new Error(`createTokenURI failed: ${err.message}`);
    }
  }
}

// Simple test
async function testIPFS() {
  const ipfsService = new IPFSService();

  try {
    // First upload the local image to IPFS
    const localImagePath = path.join(__dirname, "../assets/token-image.jpg");
    console.log("Uploading local image from:", localImagePath);
    const imageUri = await ipfsService.uploadImageFromFile(localImagePath);
    console.log("Image uploaded to IPFS:", imageUri);

    // Then create token URI with the uploaded image
    const metadata: TokenMetadata = {
      name: "NANIFUN",
      symbol: "NANIFUN",
      description: "NANIFUN Token",
      image: imageUri,
    };

    const tokenURI = await ipfsService.createTokenURI(metadata);
    console.log("Token URI created:", tokenURI);
  } catch (error) {
    console.error("Failed to create token URI:", error);
  }
}

// Run test
testIPFS();
