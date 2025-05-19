import axios from "axios";
import FormData from "form-data";
import * as fs from "fs";
import fetch from "node-fetch";
import path from "path";
import config from "../config";

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
   * Downloads an image from a URL and uploads it to IPFS via Pinata, returning an ipfs:// URI.
   */
  async uploadImageFromUrl(imageUrl: string): Promise<string> {
    try {
      // Download image using axios
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      // Get content type from response headers
      const contentType = response.headers["content-type"];
      const extension = contentType.split("/")[1] || "jpg"; // Default to jpg if can't determine

      // Create form data with the image
      const formData = new FormData();
      formData.append("file", Buffer.from(response.data), {
        filename: `image.${extension}`,
        contentType: contentType,
      });

      // Upload to Pinata
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
      if (!metadata.image) {
        metadata.image =
          "ipfs://QmbHoD9UJ1L2xfv5oFvhANsWzf1tMzN2Lr8YrPDACXt1aE";
      }
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

  /**
   * Reads data from an IPFS URL using the public gateway
   */
  async readFromIPFS(ipfsUrl: string): Promise<any> {
    try {
      // Convert ipfs:// URL to public gateway URL
      const gatewayUrl = ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");

      const response = await fetch(gatewayUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if it's JSON or binary data
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      } else {
        // For binary data (like images), return the buffer
        return await response.arrayBuffer();
      }
    } catch (err: any) {
      throw new Error(`readFromIPFS(${ipfsUrl}) failed: ${err.message}`);
    }
  }
}

export const ipfsService = new IPFSService();

// TEST
async function testIPFS() {
  const ipfsService = new IPFSService();

  try {
    // Test 1: Upload local image
    console.log("\n=== Test 1: Upload local image ===");
    const localImagePath = path.join(__dirname, "../assets/token-image.jpg");
    console.log("Uploading local image from:", localImagePath);
    const localImageUri = await ipfsService.uploadImageFromFile(localImagePath);
    console.log("Local image uploaded to IPFS:", localImageUri);

    // Test 2: Upload image from URL
    console.log("\n=== Test 2: Upload image from URL ===");
    const imageUrl =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png"; // Example image URL
    console.log("Uploading image from URL:", imageUrl);
    const urlImageUri = await ipfsService.uploadImageFromUrl(imageUrl);
    console.log("URL image uploaded to IPFS:", urlImageUri);

    // Create token URI with the local image
    console.log("\n=== Creating token URI ===");
    const metadata: TokenMetadata = {
      name: "NANIFUN",
      symbol: "NNF",
      description: "NANIFUN Token",
      image: localImageUri,
    };

    const tokenURI = await ipfsService.createTokenURI(metadata);
    console.log("Token URI created:", tokenURI);
    return tokenURI;

    // Verify the uploaded data
    console.log("\n=== Verifying uploaded data ===");

    // Read and verify metadata
    console.log("\nReading metadata from IPFS...");
    const metadataData = await ipfsService.readFromIPFS(tokenURI);
    console.log("Metadata content:", JSON.stringify(metadataData, null, 2));

    // Read and verify local image
    console.log("\nReading local image from IPFS...");
    const localImageData = await ipfsService.readFromIPFS(localImageUri);
    console.log("Local image size:", localImageData.byteLength, "bytes");

    // Read and verify URL image
    console.log("\nReading URL image from IPFS...");
    const urlImageData = await ipfsService.readFromIPFS(urlImageUri);
    console.log("URL image size:", urlImageData.byteLength, "bytes");
  } catch (error) {
    console.error("Failed to create or verify token URI:", error);
  }
}

const verifyIpfs = async () => {
  console.log("\n=== Verifying uploaded data ===");
  // const tokenURI = "ipfs://QmZ7je9W5rNGyM17ZJwdnva9rCeWAPyKDVZ2zCAYnt6M9D";
  const tokenURI = "ipfs://QmbHoD9UJ1L2xfv5oFvhANsWzf1tMzN2Lr8YrPDACXt1aE";

  // Read and verify metadata
  console.log("\nReading metadata from IPFS...");
  const metadataData = await ipfsService.readFromIPFS(tokenURI);
  console.log("Metadata content:", JSON.stringify(metadataData, null, 2));

  // // Read and verify URL image
  // console.log("\nReading URL image from IPFS...");
  // const urlImageData = await ipfsService.readFromIPFS(urlImageUri);
  // console.log("URL image size:", urlImageData.byteLength, "bytes");
};
// verifyIpfs();
// Run test
// testIPFS();
