import mongoose from "mongoose";
import env from "../../env";

export async function setupMongo() {
	try {
		console.log("🎲 Connecting to MongoDB!");

		await mongoose.connect(env.MONGO_URL, {
			serverSelectionTimeoutMS: 5000,
		});

		console.log("✅ Connected to MongoDB!");
	} catch (_error) {
		throw new Error("❌ Error connecting to MongoDB!");
	}
}
