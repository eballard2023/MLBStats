const path = require("path");
require("dotenv").config({path : path.resolve(__dirname, 'credentials/.env')})

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

const database = {db: "FinalProject", collection: "Players"};

const {MongoClient, ServerApiVersion} = require('mongodb');

async function removePlayers() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.1jobk6s.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        await client.connect();

        const result = await client.db(database.db)
        .collection(database.collection)
        .deleteMany();

        let deletedCount = result.deletedCount;
        return deletedCount;


    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    

}

module.exports = {removePlayers};