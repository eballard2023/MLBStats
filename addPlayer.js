const path = require("path");
require("dotenv").config({path : path.resolve(__dirname, 'credentials/.env')})

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

const database = {db: "FinalProject", collection: "Players"};

const {MongoClient, ServerApiVersion} = require('mongodb');

async function addPlayer(player,selectedStats) {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.1jobk6s.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        await client.connect();
        const collection = client.db(database.db).collection(database.collection);
        const existingPlayer = await collection.findOne({ player: player });
        if (existingPlayer) {
          console.log('Player already exists.');
      
          return;
        }
        
        let players = {
        player: player,
        selectedStats:selectedStats
        }
        
        

        const result = await collection.insertOne(players);
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    

}

async function fetchAllPlayers() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.1jobk6s.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      const playersCollection = client.db(database.db).collection(database.collection);
      const allPlayers = await playersCollection.find().toArray();
      return allPlayers;
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching players from the database");
    } finally {
      await client.close();
    }
  }

  async function getPlayerCount() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.1jobk6s.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      const collection = client.db(database.db).collection(database.collection);
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get player count');
    } finally {
      await client.close();
    }
  }
  
  module.exports = { addPlayer, fetchAllPlayers, getPlayerCount };
  

