import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import AppDataSource from "./config/AppDataSource";
import sampleRoutes from "./routes/sampleRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import tissueTypeRoutes from "./routes/tissueTypeRoutes";
import imageRoutes from "./routes/imageRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { Request, Response, NextFunction } from "express";

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const dziFilesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3000,
  message: "Too many requests for DZI files",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3001",
      "http://localhost:5500",
      
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600,
  }),
);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

const initializeApp = async () => {
  try {
    const requiredEnvVars = [
      "DB_HOST",
      "DB_PORT",
      "DB_USER",
      "DB_PASSWORD",
      "DB_NAME",
      "JWT_SECRET",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    await AppDataSource.initialize();
    console.log("Database initialized successfully!");

    app.use("/api/auth", apiLimiter, authRoutes);
    app.use("/api/users", apiLimiter, userRoutes);
    app.use("/api/samples", apiLimiter, sampleRoutes);
    app.use("/api/tissue-types", apiLimiter, tissueTypeRoutes);
    app.use("/api", imageRoutes);

    app.use((_req: Request, res: Response) => {
      res.status(404).json({
        status: "error",
        message: "Route not found",
        path: _req.path,
        method: _req.method,
        timestamp: new Date(),
      });
    });

    app.use(errorHandler);

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
      );
    });

    server.timeout = 60000;
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
};

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  try {
    await AppDataSource.destroy();
    console.log("Database connections closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  },
);

initializeApp();

export default app;

