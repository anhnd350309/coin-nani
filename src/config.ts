import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  infura: {
    projectId: string;
    projectSecret: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  infura: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID || "",
    projectSecret: process.env.INFURA_IPFS_PROJECT_SECRET || "",
  },
};

console.log(config);

export default config;
