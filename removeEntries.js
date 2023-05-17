const path = require("path");
require("dotenv").config({path : path.resolve(__dirname, 'credentials/.env')})

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

const database = {db: "FinalProject", collection: "Players"};

const {MongoClient, ServerApiVersion} = require('mongodb');

async function removeAll() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.1jobk6s.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const result = await client.db(database.db).collection(database.collection).deleteMany({});
        const deletedCount = result.deletedCount;
        return deletedCount;
    } catch (error) {
        console.error('Error removing entries:', error);
    } finally {
        await client.close();
    }
}

  
  module.exports = {removeAll};
