import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  chain: {
    rpc_url: string;
  };
  private_key: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  chain: {
    rpc_url: process.env.RPC_URL || "",
  },
  private_key: process.env.PRIVATE_KEY || "",
};

export default config;
