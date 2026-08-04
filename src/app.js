import express from "express";
import { matchesRouter } from "./routes/matches.route.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from sportz server!");
})

app.use("/matches", matchesRouter);
