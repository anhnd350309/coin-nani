import { pool } from "./dbController";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Define token interface
export interface Token {
  id?: number;
  name: string;
  symbol: string;
  description?: string;
  token_address?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  image_url: string;
  created_at?: Date;
}

// Initialize token table
export const initTokenTable = async (): Promise<void> => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        description TEXT,
        token_address VARCHAR(255),
        twitter VARCHAR(255) NULL,
        telegram VARCHAR(255) NULL,
        website VARCHAR(255) NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Token table initialized");
  } catch (error) {
    console.error("Failed to initialize token table:", error);
    throw error;
  }
};

// Insert a new token
export const insertToken = async (token: Token): Promise<number> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tokens (name, symbol, description, token_address, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [
        token.name,
        token.symbol,
        token.description || null,
        token.token_address || null,
        token.image_url,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Failed to insert token:", error);
    throw error;
  }
};

// Get token by ID
export const getTokenById = async (id: number): Promise<Token | null> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM tokens WHERE id = ?",
      [id]
    );

    return rows.length > 0 ? (rows[0] as Token) : null;
  } catch (error) {
    console.error("Failed to get token:", error);
    throw error;
  }
};

// insertToken({
//   name: "Test Token",
//   symbol: "TTK",
//   description: "This is a test token",
//   token_address: "0xC39491284EE1d099A53e62098759282794ED9918",
//   image_url: "https://example.com/image.png",
// });
