const socket = io();

let firstPlayerName;
let secondPlayerName;

const userName = document.querySelector('#name');
const submitName = document.querySelector('#btn2');
const nameForm = document.querySelector('.user-name');

submitName.addEventListener('click', (e) => {
    e.preventDefault();
    if (userName.value) {
        socket.emit('userName', userName.value);
        nameForm.classList.add('hide');
    }
    else {
        alert('Please enter a valid name');
    }
});

socket.on('userName', (playerNames) => {
    firstPlayerName = playerNames[0];
    secondPlayerName = playerNames[1];
    gameInfo.innerText = `Current player - ${firstPlayerName}`;
});

const boxes = document.querySelectorAll(".box");
const gameInfo = document.querySelector(".game-info");
const newGameBtn = document.querySelector(".btn");

let currentPlayer;
let gameBoard = ['', '', '', '', '', '', '', '', ''];

const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function checkGameOver() {

    if (gameBoard.every(box => box !== "")) {
        gameInfo.innerText = "Game Tied!";
        newGameBtn.classList.add("active");
    }

    for (let i = 0; i < winPatterns.length; i++) {

        const [a, b, c] = winPatterns[i];
        if (gameBoard[a] !== "" && gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c]) {

            if (gameBoard[a] === 'X') {
                gameInfo.innerText = `Winner player - ${firstPlayerName}`;
                console.log('X');
            }
            else {
                gameInfo.innerText = `Winner player - ${secondPlayerName}`;
                console.log('O');
            }

            newGameBtn.classList.add("active");
            boxes[winPatterns[i][0]].classList.add("win");
            boxes[winPatterns[i][1]].classList.add("win");
            boxes[winPatterns[i][2]].classList.add("win");

            boxes.forEach((box) => {
                box.style.pointerEvents = "none";
            });
        }
    }

   
}


socket.on('playerInfo', (symbol) => {
    console.log(socket.id);
    Id = socket.id;
    if (symbol === 'X') {
        firstPlayerSymbol = 'X';

    } else if ((symbol === 'O')) {
        SecondPlayerSymbol = 'O';
    }
});

//whene the game is full
const gameIsFull = document.querySelector(".full");
socket.on('connectionRejected', (message) => {
    gameIsFull.classList.add("active");
});

function swapTurn() {
    if (currentPlayer === 'X') {
        currentPlayer = 'O';
        gameInfo.innerText = `Current player - ${secondPlayerName}`;
    } else {
        currentPlayer = "X";
        gameInfo.innerText = `Current player - ${firstPlayerName}`;
    }

}


function handleClick(index, symbol) {
    currentPlayer = symbol;
    if (gameBoard[index] === "") {
        boxes[index].innerText = currentPlayer;
        gameBoard[index] = currentPlayer;
        boxes[index].style.pointerEvents = "none";
        swapTurn();
        checkGameOver();
    }
}
const wrongTurn = document.querySelector(".wrong-turn");

//click event on boxes
let flag = true;
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        try {
            if (flag === true) {
                socket.emit('clicked', { index, socketId: socket.id, symbol: firstPlayerSymbol });
                console.log("playerId is ", socket.id);
            }
            else if (flag === false) {
                socket.emit('clicked', { index, socketId: socket.id, symbol: SecondPlayerSymbol });
                console.log("playerId is ", socket.id);
            }
        } catch (error) {
            wrongTurn.classList.add("on");
            setTimeout(() => {
                wrongTurn.classList.remove("on");
            }, 500);
        }
    });
});

//handle click event on boxes received
socket.on('clicked', (clickedData) => {
    handleClick(clickedData.index, clickedData.symbol);
    flag = !flag;
});

//wrong turn
socket.on('wrongTurn', (message) => {
    wrongTurn.classList.add("on");
    setTimeout(() => {
        wrongTurn.classList.remove("on");
    }, 500);
});


function initGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    flag = true;
    boxes.forEach((box, index) => {
        box.innerText = "";
        boxes[index].style.pointerEvents = "all";
        //remove color
        boxes[index].classList.remove("win");

    });
    newGameBtn.classList.remove("active");
    gameInfo.innerText = `Current player - ${firstPlayerName}`;
}

initGame();
newGameBtn.addEventListener("click", () => {
    socket.emit('newGame', "newGameStart");
});

socket.on('newGame', (start) => {
    console.log(start);
    if (start === "newGameStart") {
        initGame();
    }
})


