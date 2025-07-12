let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let playerSymbol = 'X';
let computerSymbol = 'O';
let gameOver = false;
let lastMoveIndex = null;
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function setPlayerSymbol(symbol) {
    playerSymbol = symbol;
    computerSymbol = symbol === 'X' ? 'O' : 'X';
    document.getElementById('choose-symbol').style.display = 'none';
    document.getElementById('start-game').style.display = 'block';
}

function startGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameOver = false;
    lastMoveIndex = null;
    currentPlayer = playerSymbol;
    document.getElementById('status').textContent = '';
    renderBoard();
    if (currentPlayer === computerSymbol) {
        makeComputerMove();
    }
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.textContent = cell;
        if (index === lastMoveIndex) {
            cellElement.classList.add('last-move');
        }
        cellElement.onclick = () => handleCellClick(index);
        boardElement.appendChild(cellElement);
    });
}

function handleCellClick(index) {
    if (board[index] !== '' || gameOver) return;
    lastMoveIndex = index;
    board[index] = currentPlayer;
    if (checkWin(currentPlayer)) {
        document.getElementById('status').textContent = `${currentPlayer} wins!`;
        gameOver = true;
        renderBoard();
        return;
    } else if (board.every(cell => cell !== '')) {
        document.getElementById('status').textContent = 'It\'s a draw!';
        gameOver = true;
        renderBoard();
        return;
    }
    currentPlayer = currentPlayer === playerSymbol ? computerSymbol : playerSymbol;
    renderBoard();
    if (currentPlayer === computerSymbol && !gameOver) {
        makeComputerMove();
    }
}

function checkWin(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

function makeComputerMove() {
    const bestMove = minimax(board, computerSymbol, 0).index;
    lastMoveIndex = bestMove;
    board[bestMove] = computerSymbol;
    currentPlayer = playerSymbol;
    renderBoard();
    if (checkWin(computerSymbol)) {
        document.getElementById('status').textContent = `${computerSymbol} wins!`;
        gameOver = true;
    } else if (board.every(cell => cell !== '')) {
        document.getElementById('status').textContent = 'It\'s a draw!';
        gameOver = true;
    }
}

function minimax(newBoard, player, depth) {
    const availableSpots = newBoard.reduce((acc, val, idx) => (val === '' ? acc.concat(idx) : acc), []);
    if (checkWin(playerSymbol)) return { score: -10 + depth };
    if (checkWin(computerSymbol)) return { score: 10 - depth };
    if (availableSpots.length === 0) return { score: 0 };
    const moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newBoard[availableSpots[i]] = player;
        const result = minimax(newBoard, player === computerSymbol ? playerSymbol : computerSymbol, depth + 1);
        move.score = result.score;
        newBoard[availableSpots[i]] = '';
        moves.push(move);
    }
    let bestMove;
    if (player === computerSymbol) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}
