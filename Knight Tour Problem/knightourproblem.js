const boardSize = 8;
const moves = [
    [2, 1], [1, 2], [-1, 2], [-2, 1],
    [-2, -1], [-1, -2], [1, -2], [2, -1]
];
let board = [];
let tourPath = [];
let moveIndex = 0;
let heuristicInfo = [];

// Initialize the board and render it
function createBoard() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    tourPath = [];
    heuristicInfo = [];
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            boardElement.appendChild(cell);
        }
    }
}

// Update the board UI to show the order of traversal and heuristic info
function updateBoardUI() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / boardSize);
        const col = index % boardSize;
        if (board[row][col] !== false) {
            cell.classList.add('visited');
            cell.textContent = board[row][col]; // Show the move number
        }
    });

    const heuristicElement = document.getElementById('heuristic');
    heuristicElement.textContent = `Heuristic Info: ${JSON.stringify(heuristicInfo)}`;
}

// Check if a move is valid
function isValidMove(x, y) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize && board[x][y] === false;
}

// Generate all possible knight moves
function getPossibleMoves(x, y) {
    return moves.map(([dx, dy]) => [x + dx, y + dy])
                .filter(([nx, ny]) => isValidMove(nx, ny));
}

// Warnsdorff's heuristic: count possible moves for each potential move
function getMoveWithFewestOptions(x, y) {
    const options = getPossibleMoves(x, y);
    if (options.length === 0) return null;

    // Store heuristic information for debugging
    heuristicInfo = options.map(([nx, ny]) => {
        return { move: [nx, ny], optionsCount: getPossibleMoves(nx, ny).length };
    });

    options.sort((a, b) => getPossibleMoves(a[0], a[1]).length - getPossibleMoves(b[0], b[1]).length);
    return options[0];
}

// Show each move on the board with a delay
function showMove(x, y, stepNumber, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            board[x][y] = stepNumber;
            tourPath.push([x, y]);
            updateBoardUI();
            resolve();
        }, delay);
    });
}

// Start the Knight's Tour using Warnsdorff's heuristic and animate the moves
async function startTour() {
    createBoard();
    const startX = 0;
    const startY = 0;
    board[startX][startY] = 1;
    tourPath.push([startX, startY]);

    let [x, y] = [startX, startY];
    const delay = 2500; // Adjust delay (in milliseconds) for animation speed

    for (let i = 2; i <= boardSize * boardSize; i++) {
        const nextMove = getMoveWithFewestOptions(x, y);
        if (!nextMove) {
            console.log('No more moves available');
            break;
        }
        [x, y] = nextMove;
        await showMove(x, y, i, delay);
    }
}

// Initialize the board on page load
window.onload = createBoard;
