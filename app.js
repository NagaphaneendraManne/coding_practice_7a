const express = require("express");
const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT player_id AS playerId,player_name AS playerName FROM player_details;`;
  const playersArray = await db.all(playersQuery);
  response.send(playersArray);
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT player_id AS playerId,player_name AS playerName FROM player_details WHERE player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(player);
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const playerQuery = `
     UPDATE
     player_details
     SET
     player_name = '${playerName}'
     WHERE player_id = ${playerId};`;
  await db.run(playerQuery);
  response.send("Player Details Updated");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    SELECT
    match_id AS matchId,
    match,year
    FROM
    match_details
    WHERE match_id = ${matchId};`;
  const match = await db.get(matchQuery);
  response.send(match);
});

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
    SELECT match_id AS matchId,match,year FROM player_match_score
    NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatchQuery);

  response.send(playerMatches);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchQuery = `
    SELECT player_id AS playerId,player_name as playerName FROM player_match_score
    NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;
  const matches = await db.all(getPlayerMatchQuery);
  response.send(matches);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
   SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
  const player = await db.get(getPlayerMatchQuery);
  response.send(player);
});
module.exports = app;
