import mongoose from "mongoose";

export async function ConnectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL!, { dbName: "Nagar" });
    const connection = mongoose.connection;
    console.log(connection);

    connection.on("connected", () => {
      console.log("MongDB Connected SuccessFully !");
    });

    connection.on("error", (err) => {
      console.log("Error while Connecting to the DB" + err);
      process.exit();
    });
  } catch (error) {
    console.log(`Unable to Connect the MongDB : ${error}`);
  }
}
