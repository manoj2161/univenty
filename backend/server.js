import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();
const allowedOrigins = (
  process.env.CLIENT_URLS ||
  "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/", (_req, res) =>
  res.status(200).json({
    success: true,
    message: "Univenty API is running",
    timestamp: new Date().toISOString(),
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
// Mount more specific event sub-routes before /api/events/:id in eventRoutes.
app.use("/api/events", reviewRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

export const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured in backend/.env and contain at least 32 characters.",
    );
  }
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`Univenty backend listening on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error("Unable to start Univenty:", error.message);
    process.exit(1);
  });
}

export default app;
