import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import projectRoutes from "./routes/projectRoutes";
import promptRoutes from "./routes/promptRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { getUserCredits, deductCredits } from "./controllers/creditController";
import { createCheckoutSession } from "./controllers/paymentController";
import { stripeWebhook } from "./controllers/stripeWebhook";
import { verifyPayment } from "./controllers/verifyPayment";

const app = express();
app.use(cors());

// Stripe webhook must use raw body
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// All other routes can use JSON body parsing
app.use(express.json());

// Credits routes
app.get("/api/credits/:userId", getUserCredits);
app.post("/api/credits/:userId/deduct", deductCredits);

// Stripe checkout + verify routes
app.post("/api/create-checkout-session", createCheckoutSession);
app.get("/api/verify-payment", verifyPayment);

// Existing routes
app.use("/projects", projectRoutes);
app.use("/prompts", promptRoutes);

// Error handler
app.use(errorHandler);

export default app;
