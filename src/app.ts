import express from "express";
import tokenRoutes from "./routes/tokenRoutes";

const app = express();

app.use(express.json());

app.use("/", tokenRoutes);
// Routes

export default app;
