import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  pinata: {
    pinataJwt: string;
  };
  chain: {
    rpc_url: string;
  };
  private_key: string;
  db: {
    uri: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  pinata: {
    pinataJwt: process.env.PINATA_JWT || "",
  },
  chain: {
    rpc_url: process.env.RPC_URL || "",
  },
  private_key: process.env.PRIVATE_KEY || "",
  db: {
    uri: process.env.DB_URI || "",
  },
};

export default config;
