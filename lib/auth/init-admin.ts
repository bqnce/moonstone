import clientPromise from "@/lib/database/connection";

export async function initAdminUser() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({
      username: "admin",
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    await usersCollection.insertOne({
      username: "admin",
      password: "admin", // Plain text for now as per requirements
      email: "admin@moonstone.com",
      role: "admin",
      createdAt: new Date(),
    });

    console.log("✅ Admin user created successfully");
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
    throw error;
  }
}

