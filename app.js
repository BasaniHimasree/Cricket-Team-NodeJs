const express = require('express')

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.messgae}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//API-1
app.get('/players/', async (request, response) => {
  const getBookQuery = `SELECT * FROM cricket_team`
  const getAllPlayers = await db.all(getBookQuery)
  response.send(
    getAllPlayers.map(each => ({
      playerId: each.player_id,
      playerName: each.player_name,
      jerseyNumber: each.jersey_number,
      role: each.role,
    })),
  )
})

//API-2
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayer = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES ('${playerName}',${jerseyNumber},'${role}')`
  const newPlayer = await db.run(addPlayer)
  const playerId = newPlayer.lastID
  response.send('Player Added to Team')
})

//API-3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `SELECT * FROM cricket_team WHERE player_id=${playerId}`
  const getplayerDetails = await db.get(getPlayer)
  response.send({
    playerId: getplayerDetails.player_id,
    playerName: getplayerDetails.player_name,
    jerseyNumber: getplayerDetails.jersey_number,
    role: getplayerDetails.role,
  })
})

//API-4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, role, jerseyNumber} = request.body
  const updatePlayer = `UPDATE cricket_team SET player_name='${playerName}' ,role='${role}', jersey_number=${jerseyNumber} WHERE player_id=${playerId}`
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

//API-5
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `DELETE FROM cricket_team WHERE player_id=${playerId}`
  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
