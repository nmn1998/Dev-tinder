const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://nmnagrawal99_db_user:199809@namancluster.frntp1e.mongodb.net/";

const client = new MongoClient(url);

const dbName = "Hello";

// async function connect() {
//   try {
//     await client.connect();
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error(error);
//   }
// }

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to mongodb server");
  const db = client.db(dbName);
  const collection = db.collection("User");

  const user = {
    firstName: "shivam",
    lastName: "kumar",
  };

  //   const insertResult = await collection.insertOne(user);
  //   console.log("Inserted document =>", insertResult);
  const updateResult = await collection.updateOne({ firstName: "shivam" }, { $set: { firstName: "shiva" } });
  console.log("Updated documents =>", updateResult);

  const findResult = await collection.find({}).toArray();
  console.log("Found documents =>", findResult);

  return "done.";
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
