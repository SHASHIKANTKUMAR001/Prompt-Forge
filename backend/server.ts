// backend/index.ts
import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const port = Number(process.env.PORT) || 5000;

// Bind to 0.0.0.0 so it works in containers
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${port}`);
});
