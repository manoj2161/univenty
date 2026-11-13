import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const seedAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before running npm run seed:admin.");
    }
    if (process.env.ADMIN_PASSWORD.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
    }
    await connectDB();
    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || "Univenty Administrator",
        email,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        category: "Admin",
        isAdmin: true,
        isVerified: true,
        accountStatus: "Active",
      });
      console.log(`Administrator account created: ${email}`);
    } else {
      admin.category = "Admin";
      admin.isAdmin = true;
      admin.isVerified = true;
      admin.accountStatus = "Active";
      if (process.env.RESET_ADMIN_PASSWORD === "true") {
        admin.password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      }
      await admin.save();
      console.log(`Administrator account verified: ${email}`);
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

seedAdmin();
