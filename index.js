import express from "express";
import http from "http";
import { dirname, join } from "path";
import { fileURLToPath } from 'url';
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = dirname(currentFilename);

app.use(express.static(join(currentDirname, 'public')));

let playerNo = 0;
let players = {};
let playerNames = [];

io.on('connection', async (socket) => {
  console.log(socket.id);
  console.log(playerNo);
  
  if (playerNo < 2) {
    
    socket.on('userName', (userName) => {
      playerNames.push(userName);
      if (playerNames.length === 2) {
        io.emit('userName', playerNames);
      }
    });
    
    players[socket.id] = playerNo;
    
    const symbol = (playerNo === 0) ? 'X' : 'O';
    
    io.emit('playerInfo', symbol);
    
    //click event on boxes
    socket.on('clicked', (clickedData) => {
      
      const playerNumber = players[clickedData.socketId];
      let playerSymbol;
      
      if (playerNumber === 0) {
        playerSymbol = 'X';
      } else if (playerNumber === 1) {
        playerSymbol = 'O';
      }

      if (playerSymbol === 'X' && clickedData.symbol === 'X') {
        io.emit('clicked', { ...clickedData });
      }
      else if (playerSymbol === 'O' && clickedData.symbol === 'O') {
        io.emit('clicked', { ...clickedData });
      }
      else{
        io.emit('wrongTurn', 'It is not your turn.');
      }

    });


    socket.on('newGame', (newGameStart) => {
      io.emit('newGame', newGameStart);
    })

    socket.on('disconnect', () => {
      playerNo--;
    });

    playerNo++;
  } else {
    socket.emit('connectionRejected', 'The game is already full.');
    socket.disconnect();
  }

});


app.get('/', (req, res) => {
  res.sendFile(join(currentDirname, 'index.html'));
});


server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
