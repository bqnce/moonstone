import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // select: false -> Alapból ne adja vissza lekérdezésnél
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Fontos: "models.User" ellenőrzés a hot-reload miatt
export const User = models.User || model("User", UserSchema);