import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  pinata: {
    pinataJwt: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  pinata: {
    pinataJwt: process.env.PINATA_JWT || "",
  },
};

export default config;
