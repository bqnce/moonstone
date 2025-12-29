import mongoose, { Schema, model, models } from "mongoose";

// 1. Define the TypeScript Interface
export interface IEvent {
  userId: string;
  accountId: string; // The ID of the wallet or manual asset account
  category: string;
  subcategory?: string;
  source: "MANUAL" | "SALARY" | "ONCHAIN";
  delta: number;      // The change amount (e.g., -50 or +1000)
  balanceAfter: number; // Snapshot of balance after transaction
  currency: string;
  metadata?: {
    month?: string; 
    note?: string;
  };
  timestamp: Date;
}

// 2. Define the Mongoose Schema
const EventSchema = new Schema<IEvent>({
  userId: { 
    type: String, 
    required: true, 
    index: true // Indexed for faster queries by user
  },
  accountId: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  subcategory: { 
    type: String, 
    required: false 
  },
  source: { 
    type: String, 
    enum: ["MANUAL", "SALARY", "ONCHAIN"], 
    required: true 
  },
  delta: { 
    type: Number, 
    required: true 
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true, 
    uppercase: true // Enforce 'USD', 'HUF' format
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true // Indexed for sorting history by date
  },
  metadata: {
    month: { type: String, required: false },
    note: { type: String, required: false }
  }
});

// 3. Export the Model
// The 'models' check prevents recompilation errors in Next.js hot-reloading
export const EventLog = models.Event || model<IEvent>("Event", EventSchema);