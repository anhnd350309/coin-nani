import { ipfsService } from "./ipfsService";

const verifyIpfs = async () => {
  console.log("\n=== Verifying uploaded data ===");
  // const tokenURI = "ipfs://QmZ7je9W5rNGyM17ZJwdnva9rCeWAPyKDVZ2zCAYnt6M9D";
  const tokenURI = "ipfs://QmfUquoquk2Jvm1MekuoU8euQP4nqJdq7BaDT3jPFBJj59";

  // Read and verify metadata
  console.log("\nReading metadata from IPFS...");
  const metadataData = await ipfsService.readFromIPFS(tokenURI);
  console.log("Metadata content:", JSON.stringify(metadataData, null, 2));

  const image = metadataData.image;

  // // Read and verify URL image
  // console.log("\nReading URL image from IPFS...");
  // const urlImageData = await ipfsService.readFromIPFS(urlImageUri);
  // console.log("URL image size:", urlImageData.byteLength, "bytes");
};

verifyIpfs();
