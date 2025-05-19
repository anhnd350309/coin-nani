import mysql from "mysql2/promise";
import config from "../config";

// Create connection pool
const pool = mysql.createPool({
  uri: config.db.uri || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connection established");
    connection.release();
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    process.exit(1);
  }
};

export { pool, testConnection };
