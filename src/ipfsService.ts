import FormData from "form-data";
import * as fs from "fs";
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
  private readonly pinataJwt: string;

  constructor() {
    const { pinataJwt } = config.pinata;
    if (!pinataJwt) {
      throw new Error("Pinata JWT is missing in config.pinata");
    }
    this.pinataJwt = pinataJwt;
  }

  /**
   * Uploads a local file to IPFS via Pinata and returns an ipfs:// CID URI.
   */
  async uploadImageFromFile(filePath: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.pinataJwt}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return `ipfs://${data.IpfsHash}`;
    } catch (err: any) {
      throw new Error(
        `uploadImageFromFile(${filePath}) failed: ${err.message}`
      );
    }
  }

  /**
   * Fetches an image from a URL and uploads it to IPFS via Pinata, returning an ipfs:// URI.
   */
  async uploadImageFromUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const formData = new FormData();
      formData.append("file", Buffer.from(buffer), {
        filename: "image.jpg",
        contentType: "image/jpeg",
      });

      const uploadResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.pinataJwt}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(
          `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`
        );
      }

      const data = await uploadResponse.json();
      return `ipfs://${data.IpfsHash}`;
    } catch (err: any) {
      throw new Error(`uploadImageFromUrl(${imageUrl}) failed: ${err.message}`);
    }
  }

  /**
   * Packs TokenMetadata as JSON, uploads to IPFS via Pinata, and returns the ipfs:// CID URI.
   */
  async createTokenURI(metadata: TokenMetadata): Promise<string> {
    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.pinataJwt}`,
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return `ipfs://${data.IpfsHash}`;
    } catch (err: any) {
      throw new Error(`createTokenURI failed: ${err.message}`);
    }
  }
}

// TEST
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
