// @/lib/database/accounts/models/manualAssetSchema.ts
import mongoose from "mongoose";

const ManualAssetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, required: true },
  label: { type: String, required: true }
});

const BalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  manualAssets: [ManualAssetSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { 
  collection: 'accounts', // KÉNYSZERÍTÉS: Csak ezt használja!
  timestamps: true 
});

export const Balance = mongoose.models.Balance || mongoose.model("Balance", BalanceSchema);