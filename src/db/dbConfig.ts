import mongoose from "mongoose";

const connection: { isConnected?: number } = {};

export async function ConnectDB() {
  try {
    // Check if already connected
    if (connection.isConnected === 1) {
      return;
    }

    // Check if connection is in progress
    if (mongoose.connection.readyState === 1) {
      connection.isConnected = 1;
      return;
    }

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL!, { dbName: "Nagar" });
    const dbConnection = mongoose.connection;

    connection.isConnected = dbConnection.readyState;

    // Only add event listeners once
    if (dbConnection.listeners("connected").length === 0) {
      dbConnection.on("connected", () => {
        console.log("MongoDB Connected Successfully!");
        connection.isConnected = 1;
      });
    }

    if (dbConnection.listeners("error").length === 0) {
      dbConnection.on("error", (err) => {
        console.log("Error while Connecting to the DB:", err);
        connection.isConnected = 0;
      });
    }

    if (dbConnection.listeners("disconnected").length === 0) {
      dbConnection.on("disconnected", () => {
        console.log("MongoDB Disconnected");
        connection.isConnected = 0;
      });
    }
  } catch (error) {
    console.log(`Unable to Connect the MongoDB: ${error}`);
    connection.isConnected = 0;
    throw error;
  }
}
