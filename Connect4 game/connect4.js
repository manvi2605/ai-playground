const rows = 6;
const cols = 7;
let board = [];
const PLAYER = 'R';  // Red (Player)
const AI = 'Y';      // Yellow (AI)
let currentPlayer = PLAYER;
let gameOver = false;

// Initialize empty board
function createBoard() {
    board = Array(rows).fill(null).map(() => Array(cols).fill(null));
    gameOver = false; // Reset gameOver flag
}

// Create visual board in HTML
function drawBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[row][col] === PLAYER) {
                cell.classList.add('player');
            } else if (board[row][col] === AI) {
                cell.classList.add('ai');
            }
            cell.dataset.col = col;

            // Only add click event listener if the game is not over
            if (!gameOver && currentPlayer === PLAYER && board[0][col] === null) {
                cell.addEventListener('click', handleClick);
            }

            boardDiv.appendChild(cell);
        }
    }
}

// Drop a piece into the selected column
function handleClick(event) {
    const col = parseInt(event.target.dataset.col);  // Convert to number
    const row = getLowestAvailableRow(board, col);  // Find lowest available row
    if (row !== -1 && makeMove(board, col, row, PLAYER)) {
        drawBoard();  // Immediately reflect the move in the UI
        if (checkWin(board, PLAYER)) {
            gameOver = true; // Mark the game as over
            drawBoard();
            setTimeout(() => {
                alert('Player wins!');
                createBoard(); // Reset the board after a win
                drawBoard();
            }, 500);
            return;
        } else if (isDraw(board)) {
            gameOver = true; // Mark the game as over
            drawBoard();
            setTimeout(() => {
                alert('Draw!');
                createBoard();
                drawBoard();
            }, 500);
            return;
        }
        currentPlayer = AI; // Switch to AI's turn
        drawBoard();
        setTimeout(aiMove, 500); // Delay for AI move
    }
}

// Make the AI move using Alpha-Beta Pruning
function aiMove() {
    const bestMove = alphaBetaPruning(board, 5, -Infinity, Infinity, true);
    const row = getLowestAvailableRow(board, bestMove.col);  // Find lowest available row
    makeMove(board, bestMove.col, row, AI);
    drawBoard();  // Immediately reflect AI's move in the UI
    if (checkWin(board, AI)) {
        gameOver = true; // Mark the game as over
        drawBoard();
        setTimeout(() => {
            alert('AI wins!');
            createBoard(); // Reset the board after a win
            drawBoard();
        }, 500);
        return;
    } else if (isDraw(board)) {
        gameOver = true; // Mark the game as over
        drawBoard();
        setTimeout(() => {
            alert('Draw!');
            createBoard();
            drawBoard();
        }, 500);
        return;
    }
    currentPlayer = PLAYER; // Switch back to player's turn
    drawBoard();
}

// Make a move and drop the piece into the specified row and column
function makeMove(board, col, row, player) {
    board[row][col] = player;
    return true;
}

// Find the lowest available row in the given column
function getLowestAvailableRow(board, col) {
    for (let row = rows - 1; row >= 0; row--) {
        if (!board[row][col]) {
            return row;
        }
    }
    return -1;  // Return -1 if the column is full
}

// Check if the player has won
function checkWin(board, player) {
    return checkHorizontal(board, player) || checkVertical(board, player) || checkDiagonal(board, player);
}

// Alpha-Beta Pruning Algorithm for AI with Improved Heuristic
function alphaBetaPruning(board, depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || checkWin(board, PLAYER) || checkWin(board, AI) || isDraw(board)) {
        return { score: evaluateBoard(board) };
    }

    const validMoves = getValidMoves(board).sort((a, b) => b === 3 ? 1 : 0);  // Prioritize center column
    let bestMove = { col: validMoves[0], score: maximizingPlayer ? -Infinity : Infinity };

    for (let move of validMoves) {
        const tempBoard = copyBoard(board);  // Use tempBoard, not original board
        const row = getLowestAvailableRow(tempBoard, move);  // Get row for the move
        makeMove(tempBoard, move, row, maximizingPlayer ? AI : PLAYER);

        const result = alphaBetaPruning(tempBoard, depth - 1, alpha, beta, !maximizingPlayer);

        if (maximizingPlayer) {
            if (result.score > bestMove.score) {
                bestMove = { col: move, score: result.score };
            }
            alpha = Math.max(alpha, bestMove.score);
        } else {
            if (result.score < bestMove.score) {
                bestMove = { col: move, score: result.score };
            }
            beta = Math.min(beta, bestMove.score);
        }

        if (beta <= alpha) break;
    }

    return bestMove;
}

// Improved evaluation function with heuristic scoring
function evaluateBoard(board) {
    let score = 0;

    // Check for center column preference
    for (let row = 0; row < rows; row++) {
        if (board[row][3] === AI) {
            score += 3;  // Favor the AI for being in the center
        } else if (board[row][3] === PLAYER) {
            score -= 3;  // Decrease score if player is in center
        }
    }

    score += countConnections(board, AI, 2) * 10;
    score += countConnections(board, AI, 3) * 50;
    score -= countConnections(board, PLAYER, 2) * 10;
    score -= countConnections(board, PLAYER, 3) * 50;

    if (checkWin(board, AI)) {
        score += 1000;  // Winning board
    } else if (checkWin(board, PLAYER)) {
        score -= 1000;  // Losing board
    }

    return score;
}

// Count connections (for heuristic evaluation)
function countConnections(board, player, num) {
    let count = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === player) {
                // Check horizontal, vertical, and diagonal directions for `num` connections
                if (checkConnection(board, row, col, 0, 1, num, player) ||  // Horizontal
                    checkConnection(board, row, col, 1, 0, num, player) ||  // Vertical
                    checkConnection(board, row, col, 1, 1, num, player) ||  // Diagonal \
                    checkConnection(board, row, col, 1, -1, num, player)) {  // Diagonal /
                    count++;
                }
            }
        }
    }
    return count;
}

// Helper function to check for connections of 'num' length
function checkConnection(board, row, col, rowDir, colDir, num, player) {
    let connected = 0;
    for (let i = 0; i < num; i++) {
        const newRow = row + i * rowDir;
        const newCol = col + i * colDir;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] === player) {
            connected++;
        } else {
            break;
        }
    }
    return connected === num;
}

// Check if the board is full (draw)
function isDraw(board) {
    return board[0].every(col => col !== null);
}

// Get valid moves (columns that are not full)
function getValidMoves(board) {
    return board[0].map((_, col) => col).filter(col => board[0][col] === null);
}

// Check horizontal win
function checkHorizontal(board, player) {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col <= cols - 4; col++) {
            if (board[row][col] === player && board[row][col + 1] === player && board[row][col + 2] === player && board[row][col + 3] === player) {
                return true;
            }
        }
    }
    return false;
}

// Check vertical win
function checkVertical(board, player) {
    for (let row = 0; row <= rows - 4; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === player && board[row + 1][col] === player && board[row + 2][col] === player && board[row + 3][col] === player) {
                return true;
            }
        }
    }
    return false;
}

// Check diagonal win
function checkDiagonal(board, player) {
    // Check \ diagonals
    for (let row = 0; row <= rows - 4; row++) {
        for (let col = 0; col <= cols - 4; col++) {
            if (board[row][col] === player && board[row + 1][col + 1] === player && board[row + 2][col + 2] === player && board[row + 3][col + 3] === player) {
                return true;
            }
        }
    }
    // Check / diagonals
    for (let row = 0; row <= rows - 4; row++) {
        for (let col = 3; col < cols; col++) {
            if (board[row][col] === player && board[row + 1][col - 1] === player && board[row + 2][col - 2] === player && board[row + 3][col - 3] === player) {
                return true;
            }
        }
    }
    return false;
}

// Create a deep copy of the board
function copyBoard(board) {
    return board.map(row => row.slice());
}

// Initialize the board on page load
createBoard();
drawBoard();