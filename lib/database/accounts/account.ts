import mongoose from "mongoose";

const ManualAssetSchema = new mongoose.Schema({
  category: String,
  subCategory: String,
  balance: Number,
  currency: String,
  label: String,
});

const AccountSchema = new mongoose.Schema({
  userId: String,
  manualAssets: [ManualAssetSchema],
  lastUpdated: { type: Date, default: Date.now },
});

export const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);