const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(express.static('templates'));

const { addPlayer, fetchAllPlayers, getPlayerCount } = require("./addPlayer.js");
const {removeAll} = require("./removeEntries.js");

const validPort = /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

const portNumber = process.argv.slice(2);

if (!validPort.test(portNumber)) {
    console.log("error: no port number");
    process.exit(1);

}

process.stdin.setEncoding('utf8');
process.stdin.on("readable", function readCommand() {

    let dataInput = process.stdin.read();

    if (dataInput != null) {
        let command = dataInput.trim();

        if (command === "stop") {
            console.log('Shutting down the server');
            process.exit(0);
        }
    }
});



const port = portNumber[0];

const fetchMLBPlayerData = async (playerId, tournamentId, seasonId) => {
    const url = `https://baseballapi.p.rapidapi.com/api/baseball/player/${playerId}/tournament/${tournamentId}/season/${seasonId}/statistics/regularSeason`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '7a5e91a7cdmsh0a346c7be5d3633p13a688jsna43538c0bf62',
        'X-RapidAPI-Host': 'baseballapi.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios(url, options);
      const playerData = response.data; 
  
      if (!playerData) {
        throw new Error('Player not found');
      }
  
      return playerData;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching player data');
    }
  };


const fetchPlayerId = async (term) => {
    const url = `https://baseballapi.p.rapidapi.com/api/baseball/search/${term}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '7a5e91a7cdmsh0a346c7be5d3633p13a688jsna43538c0bf62',
            'X-RapidAPI-Host': 'baseballapi.p.rapidapi.com'
        }
    };

    try {
        const response = await axios(url, options);
  
        return response.data.results[0].entity.id; 
    } catch (error) {
        console.error(error);
        throw error; 
    }
};






app.get("/", async (req, res) => {
    const playerCount = await getPlayerCount();
    
    res.render("index", {players: playerCount, message: "" });

});

  app.route("/trackplayers")
  .post(async (req, res) => {
    const playerName = req.body.playerName; 
    let selectedStats = Object.keys(req.body).filter(key => key !== "playerName");
    if (selectedStats.length == 0){
      selectedStats = ["hittingObp", "hittingAvg", "hittingOps"];
    }
    
    
    

    

    res.redirect(`/trackplayers/${playerName}/${selectedStats}`);
  });

app.route("/trackplayers/:playerName/:selectedStats")
  .get(async (req, res) => {
    try {
      const tournamentId = 11205; 
      const seasonId = 46674; 
    
      const playerName = req.params.playerName;
      const selectedStats = req.params.selectedStats.split(",");
      const playerID = await fetchPlayerId(playerName);
      
      const playerData = await fetchMLBPlayerData(playerID, tournamentId, seasonId);
      
      
      await addPlayer(playerName, selectedStats); 
      res.render("trackplayers", {playerData, playerName, selectedStats });
      
    } catch (error) {
        console.error(error);
        res.status(500).send("Player not found. Please enter a valid player name");
      }
  });

  app.route("/trackplayers/:playerName")
  .get(async (req, res) => {
    try {
      const tournamentId = 11205; 
      const seasonId = 46674; 
    
      const playerName = req.params.playerName;
      const selectedStats = req.query.selectedStats || []; 
      selectedStats = selectedStats.length > 0 ? selectedStats : ["hittingObp", "hittingAvg", "hittingOps"]; 
      const playerID = await fetchPlayerId(playerName);
      
      const playerData = await fetchMLBPlayerData(playerID, tournamentId, seasonId);
      await addPlayer(playerName, selectedStats); 
      res.render("trackplayers", { playerData, playerName, selectedStats });
    } catch (error) {
      console.error(error);
      res.status(500).send("Player not found. Please enter a valid player name.");
    }
  });


  app.post("/allPlayers", async (req, res) => {
    try {
        const allPlayers = await fetchAllPlayers();

        const playerData = await Promise.all(
            allPlayers.map(async (player) => {
                const playerName = player.player;
                const specificStats = player.selectedStats;
                const tournamentId = 11205; 
                const seasonId = 46674; 

                const playerID = await fetchPlayerId(playerName);
                const playerStats = await fetchMLBPlayerData(playerID, tournamentId, seasonId);

                return { playerName, specificStats, playerStats };
            })
        );

        const specificStats = allPlayers.length > 0 ? allPlayers[0].selectedStats : [];

        res.render("allPlayers", { playerData, specificStats });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching player data");
    }
});


app.post("/removeallPlayers", async (req, res) => {
    
    const deleted = await removeAll();
    res.render('removalConfirm', { number: deleted }); 
    
});






app.listen(port, (err) => {
    if (err) {
      console.log("Starting server failed.");
    } else {
      console.log(`Web server started and running at http://localhost:${port}`);
      console.log("Stop to shutdown the server: ");
 
    }
 });

 module.exports = {fetchAllPlayers, addPlayer, getPlayerCount}
 module.exports = {removeAll}