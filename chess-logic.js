const EMPTY = 0;
const PAWN = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK = 4;
const QUEEN = 5;
const KING = 6;

const BLACK = 8; 
const WHITE = 16; 

const PIECE_CHARS = {
    [PAWN | BLACK]: 'P', [KNIGHT | BLACK]: 'N', [BISHOP | BLACK]: 'B', [ROOK | BLACK]: 'R', [QUEEN | BLACK]: 'Q', [KING | BLACK]: 'K',
    [PAWN | WHITE]: 'p', [KNIGHT | WHITE]: 'n', [BISHOP | WHITE]: 'b', [ROOK | WHITE]: 'r', [QUEEN | WHITE]: 'q', [KING | WHITE]: 'k'
};

function initBoard() {
    return [
        ROOK | BLACK, KNIGHT | BLACK, BISHOP | BLACK, QUEEN | BLACK, KING | BLACK, BISHOP | BLACK, KNIGHT | BLACK, ROOK | BLACK,
        PAWN | BLACK, PAWN | BLACK, PAWN | BLACK, PAWN | BLACK, PAWN | BLACK, PAWN | BLACK, PAWN | BLACK, PAWN | BLACK,
        EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
        EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
        EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
        EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
        PAWN | WHITE, PAWN | WHITE, PAWN | WHITE, PAWN | WHITE, PAWN | WHITE, PAWN | WHITE, PAWN | WHITE, PAWN | WHITE,
        ROOK | WHITE, KNIGHT | WHITE, BISHOP | WHITE, QUEEN | WHITE, KING | WHITE, BISHOP | WHITE, KNIGHT | WHITE, ROOK | WHITE
    ];
}

function getPieceMoves(board, pos) {
    const piece = board[pos];
    const color = piece & (WHITE | BLACK);
    const pieceType = piece & 7;
    const moves = [];

    if (pieceType === PAWN) {
        const direction = color === WHITE ? -1 : 1;
        let newPos = pos + 8 * direction;
        if (0 <= newPos && newPos < 64 && board[newPos] === EMPTY) {
            moves.push(newPos);
            if ((color === WHITE && 48 <= pos && pos <= 55) || (color === BLACK && 8 <= pos && pos <= 15)) {
                newPos = pos + 16 * direction;
                if (0 <= newPos && newPos < 64 && board[newPos] === EMPTY) {
                    moves.push(newPos);
                }
            }
        }
        for (const offset of [-1, 1]) {
            newPos = pos + 8 * direction + offset;
            if (0 <= newPos && newPos < 64 && board[newPos] !== EMPTY && (board[newPos] & (WHITE | BLACK)) !== color) {
                moves.push(newPos);
            }
        }
    } else if (pieceType === KNIGHT) {
        const offsets = [-17, -15, -10, -6, 6, 10, 15, 17];
        for (const offset of offsets) {
            const newPos = pos + offset;
            if (0 <= newPos && newPos < 64 && Math.abs((newPos % 8) - (pos % 8)) <= 2) {
                if (board[newPos] === EMPTY || (board[newPos] & (WHITE | BLACK)) !== color) {
                    moves.push(newPos);
                }
            }
        }
    } else if ([BISHOP, ROOK, QUEEN].includes(pieceType)) {
        const directions = [];
        if ([BISHOP, QUEEN].includes(pieceType)) {
            directions.push(-9, -7, 7, 9);
        }
        if ([ROOK, QUEEN].includes(pieceType)) {
            directions.push(-8, -1, 1, 8);
        }
        for (const direction of directions) {
            let newPos = pos + direction;
            while (0 <= newPos && newPos < 64 && Math.abs((newPos % 8) - ((newPos - direction) % 8)) <= 1) {
                if (board[newPos] === EMPTY) {
                    moves.push(newPos);
                } else if ((board[newPos] & (WHITE | BLACK)) !== color) {
                    moves.push(newPos);
                    break;
                } else {
                    break;
                }
                newPos += direction;
            }
        }
    } else if (pieceType === KING) {
        const offsets = [-9, -8, -7, -1, 1, 7, 8, 9];
        for (const offset of offsets) {
            const newPos = pos + offset;
            if (0 <= newPos && newPos < 64 && Math.abs((newPos % 8) - (pos % 8)) <= 1) {
                if (board[newPos] === EMPTY || (board[newPos] & (WHITE | BLACK)) !== color) {
                    moves.push(newPos);
                }
            }
        }
    }

    return moves;
}

function getAllMoves(board, color) {
    const allMoves = [];
    for (let pos = 0; pos < 64; pos++) {
        if (board[pos] !== EMPTY && (board[pos] & (WHITE | BLACK)) === color) {
            const moves = getPieceMoves(board, pos);
            allMoves.push(...moves.map(move => [pos, move]));
        }
    }
    
    const capturingMoves = allMoves.filter(move => board[move[1]] !== EMPTY);
    return capturingMoves.length > 0 ? capturingMoves : allMoves;
}

function makeMove(board, start, end) {
    const newBoard = [...board];
    newBoard[end] = newBoard[start];
    newBoard[start] = EMPTY;
    return newBoard;
}

function countPieces(board, color) {
    return board.filter(piece => piece !== EMPTY && (piece & (WHITE | BLACK)) === color).length;
}

function calculateMobility(board, color) {
    return [...Array(64).keys()].reduce((sum, pos) => {
        return sum + (board[pos] !== EMPTY && (board[pos] & (WHITE | BLACK)) === color ? getPieceMoves(board, pos).length : 0);
    }, 0);
}

function calculatePawnRanks(board, color) {
    let pawnRanks = 0;
    for (let pos = 0; pos < 64; pos++) {
        if (board[pos] === (PAWN | color)) {
            const rank = color === WHITE ? 7 - Math.floor(pos / 8) : Math.floor(pos / 8);
            pawnRanks += rank;
        }
    }
    return pawnRanks;
}

function scoreBoard(board, botColor) {
    const opponentColor = botColor === BLACK ? WHITE : BLACK;

    const botPieces = countPieces(board, botColor);
    const opponentPieces = countPieces(board, opponentColor);
    let score = (opponentPieces - botPieces) * 10;

    const botMoves = getAllMoves(board, botColor);
    const opponentMoves = getAllMoves(board, opponentColor);
    const botMustCapture = botMoves.some(move => board[move[1]] !== EMPTY);
    const opponentMustCapture = opponentMoves.some(move => board[move[1]] !== EMPTY);
    score += botMustCapture ? -5 : 0;
    score += opponentMustCapture ? 5 : 0;

    const botCaptureCount = botMoves.filter(move => board[move[1]] !== EMPTY).length;
    const opponentCaptureCount = opponentMoves.filter(move => board[move[1]] !== EMPTY).length;
    score += botCaptureCount > 1 ? (botCaptureCount - 1) * -0.5 : 0;
    score += opponentCaptureCount > 1 ? (opponentCaptureCount - 1) * 0.5 : 0;

    const botPawnRanks = calculatePawnRanks(board, botColor);
    const opponentPawnRanks = calculatePawnRanks(board, opponentColor);
    score += -0.1 * botPawnRanks + 0.1 * opponentPawnRanks;

    const botMobility = calculateMobility(board, botColor);
    const opponentMobility = calculateMobility(board, opponentColor);
    score += -0.1 * botMobility + 0.1 * opponentMobility;

    score += (board.includes(QUEEN | botColor) ? 0 : -8);
    score += (board.includes(QUEEN | opponentColor) ? 0 : 8);
    score += -5 * board.filter(piece => piece === (ROOK | botColor)).length;
    score += 5 * board.filter(piece => piece === (ROOK | opponentColor)).length;

    if (botPieces === 0) {
        return 1000;
    } else if (opponentPieces === 0) {
        return -1000;
    }

    return score;
}

function hasLegalMoves(board, color) {
    return getAllMoves(board, color).length > 0;
}

function makeBestMove(board, botColor, depth = 3) {
    function minimax(board, depth, maximizingPlayer, alpha, beta) {
        if (depth === 0) {
            return scoreBoard(board, botColor);
        }

        const color = maximizingPlayer ? botColor : (botColor === BLACK ? WHITE : BLACK);
        const moves = getAllMoves(board, color);

        if (moves.length === 0) {
            if (!hasLegalMoves(board, color === BLACK ? WHITE : BLACK)) {
                return 0; // Draw
            }
            return scoreBoard(board, botColor);
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const [start, end] of moves) {
                const newBoard = makeMove(board, start, end);
                const eval = minimax(newBoard, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const [start, end] of moves) {
                const newBoard = makeMove(board, start, end);
                const eval = minimax(newBoard, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }

    let bestMove = null;
    let bestScore = -Infinity;
    const moves = getAllMoves(board, botColor);
    for (const [start, end] of moves) {
        const newBoard = makeMove(board, start, end);
        const score = minimax(newBoard, depth - 1, false, -Infinity, Infinity);
        if (score > bestScore) {
            bestScore = score;
            bestMove = [start, end];
        }
    }

    return bestMove;
}

function playGame() {
    let board = initBoard();
    let currentColor = WHITE; 
    let moveCount = 0;
    const positionHistory = {};

    while (true) {
        printBoard(board);
        console.log(`${currentColor === WHITE ? 'White' : 'Black'} to move`);

        if (!hasLegalMoves(board, currentColor)) {
            if (!hasLegalMoves(board, currentColor === WHITE ? BLACK : WHITE)) {
                console.log("Game over: Draw (stalemate)");
                return "Draw";
            }
            console.log(`${currentColor === WHITE ? 'White' : 'Black'} has no legal moves. Skipping turn.`);
            currentColor = currentColor === WHITE ? BLACK : WHITE;
            continue;
        }

        let start, end;
        if (currentColor === BLACK) { 
            [start, end] = makeBestMove(board, BLACK);
            console.log(`Bot moves: ${chessNotation(start)} to ${chessNotation(end)}`);
        } else { 
            while (true) {
                const move = prompt("Enter your move (e.g., e2e4): ").trim().toLowerCase();
                if (move.length !== 4) {
                    console.log("Invalid input. Please use the format 'e2e4'.");
                    continue;
                }
                start = chessNotationToIndex(move.slice(0, 2));
                end = chessNotationToIndex(move.slice(2));
                if (start === null || end === null) {
                    console.log("Invalid square. Please use letters a-h and numbers 1-8.");
                    continue;
                }
                
                console.log(`Debug: start = ${start}, end = ${end}`);
                console.log(`Debug: piece at start = ${PIECE_CHARS[board[start]] || 'Empty'}`);
                console.log(`Debug: piece at end = ${PIECE_CHARS[board[end]] || 'Empty'}`);
                
                const legalMoves = getAllMoves(board, WHITE);
                console.log(`Debug: legal moves = ${legalMoves.map(m => `${chessNotation(m[0])}-${chessNotation(m[1])}`).join(', ')}`);
                
                if (!legalMoves.some(m => m[0] === start && m[1] === end)) {
                    console.log("Invalid move. Please try again.");
                    continue;
                }
                break;
            }
        }

        board = makeMove(board, start, end);
        moveCount += 1;

        const boardString = board.join('');
        positionHistory[boardString] = (positionHistory[boardString] || 0) + 1;
        if (positionHistory[boardString] === 3) {
            console.log("Game over: Draw (threefold repetition)");
            return "Draw";
        }

        if (moveCount === 100) {
            console.log("Game over: Draw (fifty-move rule)");
            return "Draw";
        }

        if (countPieces(board, currentColor) === 0) {
            console.log(`Game over: ${currentColor === WHITE ? 'Black' : 'White'} wins!`);
            return currentColor === WHITE ? "Black" : "White";
        }

        currentColor = currentColor === WHITE ? BLACK : WHITE;
    }
}

function chessNotation(index) {
    return String.fromCharCode('a'.charCodeAt(0) + (index % 8)) + (8 - Math.floor(index / 8));
}

function chessNotationToIndex(notation) {
    if (notation.length !== 2 || !'abcdefgh'.includes(notation[0]) || !'12345678'.includes(notation[1])) {
        return null;
    }
    const col = notation[0].charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(notation[1]);
    return row * 8 + col;
}

function printBoard(board) {
    for (let i = 0; i < 8; i++) {
        const row = [...Array(8).keys()].map(j => PIECE_CHARS[board[i * 8 + j]] || '.').join(' ');
        console.log(`${8 - i} ${row}`);
    }
    console.log("  a b c d e f g h");
}

playGame();
