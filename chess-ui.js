let board = initBoard();
let currentColor = WHITE;
let moveCount = 0;
const positionHistory = {};

function renderBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.className = `square ${(Math.floor(i / 8) + i % 8) % 2 === 0 ? 'white' : 'black'}`;
        square.textContent = PIECE_CHARS[board[i]] || '';
        chessboard.appendChild(square);
    }
}

function updateMessage(msg) {
    document.getElementById('message').textContent = msg;
}

function makeMove() {
    const moveInput = document.getElementById('move');
    const move = moveInput.value.trim().toLowerCase();
    moveInput.value = '';

    if (move.length !== 4) {
        updateMessage("Invalid input. Please use the format 'e2e4'.");
        return;
    }

    const start = chessNotationToIndex(move.slice(0, 2));
    const end = chessNotationToIndex(move.slice(2));

    if (start === null || end === null) {
        updateMessage("Invalid square. Please use letters a-h and numbers 1-8.");
        return;
    }

    const legalMoves = getAllMoves(board, WHITE);
    if (!legalMoves.some(m => m[0] === start && m[1] === end)) {
        updateMessage("Invalid move. Please try again.");
        return;
    }

    board = makeMove(board, start, end);
    moveCount++;
    currentColor = BLACK;
    renderBoard();
    updateMessage("Bot is thinking...");

    setTimeout(() => {
        if (!hasLegalMoves(board, BLACK)) {
            if (!hasLegalMoves(board, WHITE)) {
                updateMessage("Game over: Draw (stalemate)");
            } else {
                updateMessage("Black has no legal moves. White wins!");
            }
            return;
        }

        const [botStart, botEnd] = makeBestMove(board, BLACK);
        board = makeMove(board, botStart, botEnd);
        moveCount++;
        currentColor = WHITE;
        renderBoard();
        updateMessage("Your turn");

        if (!hasLegalMoves(board, WHITE)) {
            if (!hasLegalMoves(board, BLACK)) {
                updateMessage("Game over: Draw (stalemate)");
            } else {
                updateMessage("White has no legal moves. Black wins!");
            }
        }
    }, 100);
}

function newGame() {
    board = initBoard();
    currentColor = WHITE;
    moveCount = 0;
    renderBoard();
    updateMessage("New game started. White to move.");
}

// Initialize the game
renderBoard();
updateMessage("White to move");
