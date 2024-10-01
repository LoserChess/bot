class LoserChessBot {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
    }

    initializeBoard() {
        return [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
    }

    makeMove(move) {
        const [fromFile, fromRank, toFile, toRank] = move.split('');
        const fromCol = fromFile.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromRow = 8 - parseInt(fromRank);
        const toCol = toFile.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(toRank);

        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            throw new Error('Invalid move');
        }

        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = ' ';

        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (piece === ' ' || !this.isCurrentPlayerPiece(piece)) {
            return false;
        }

        const moves = this.getPieceMoves(fromRow, fromCol);
        return moves.some(move => {
            const [, , moveToFile, moveToRank] = move.split('');
            const moveToCol = moveToFile.charCodeAt(0) - 'a'.charCodeAt(0);
            const moveToRow = 8 - parseInt(moveToRank);
            return moveToRow === toRow && moveToCol === toCol;
        });
    }

    getBotMove() {
        const moves = this.getAllPossibleMoves();
        if (moves.length === 0) return null;

        let bestMove = null;
        let bestScore = this.currentPlayer === 'white' ? -Infinity : Infinity;

        for (const move of moves) {
            const tempBoard = JSON.parse(JSON.stringify(this.board));
            const tempPlayer = this.currentPlayer;
            this.makeMove(move);
            const score = this.evaluateBoard();
            this.board = tempBoard;
            this.currentPlayer = tempPlayer;

            if (this.currentPlayer === 'white' && score > bestScore) {
                bestScore = score;
                bestMove = move;
            } else if (this.currentPlayer === 'black' && score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getAllPossibleMoves() {
        const moves = [];
        const captureMoves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (this.isCurrentPlayerPiece(piece)) {
                    const pieceMoves = this.getPieceMoves(row, col);
                    pieceMoves.forEach(move => {
                        const [, , toFile, toRank] = move.split('');
                        const toCol = toFile.charCodeAt(0) - 'a'.charCodeAt(0);
                        const toRow = 8 - parseInt(toRank);
                        if (this.board[toRow][toCol] !== ' ' && !this.isCurrentPlayerPiece(this.board[toRow][toCol])) {
                            captureMoves.push(move);
                        } else if (this.board[toRow][toCol] === ' ') {
                            moves.push(move);
                        }
                    });
                }
            }
        }

        return captureMoves.length > 0 ? captureMoves : moves;
    }

    isCurrentPlayerPiece(piece) {
        return this.currentPlayer === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
    }

    getPieceMoves(row, col) {
        const piece = this.board[row][col].toLowerCase();
        switch (piece) {
            case 'p': return this.getPawnMoves(row, col);
            case 'r': return this.getRookMoves(row, col);
            case 'n': return this.getKnightMoves(row, col);
            case 'b': return this.getBishopMoves(row, col);
            case 'q': return this.getQueenMoves(row, col);
            case 'k': return this.getKingMoves(row, col);
            default: return [];
        }
    }

    getPawnMoves(row, col) {
        const moves = [];
        const direction = this.currentPlayer === 'white' ? -1 : 1;
        const startRow = this.currentPlayer === 'white' ? 6 : 1;

        // Move forward
        if (this.isValidPosition(row + direction, col) && this.board[row + direction][col] === ' ') {
            moves.push(this.notateMove(row, col, row + direction, col));
            // Double move from start position
            if (row === startRow && this.board[row + 2 * direction][col] === ' ') {
                moves.push(this.notateMove(row, col, row + 2 * direction, col));
            }
        }

        // Capture diagonally
        for (const colOffset of [-1, 1]) {
            if (this.isValidPosition(row + direction, col + colOffset) && 
                this.board[row + direction][col + colOffset] !== ' ' && 
                !this.isCurrentPlayerPiece(this.board[row + direction][col + colOffset])) {
                moves.push(this.notateMove(row, col, row + direction, col + colOffset));
            }
        }

        return moves;
    }

    getRookMoves(row, col) {
        return this.getSlidingMoves(row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightOffsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        
        for (const [rowOffset, colOffset] of knightOffsets) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (this.isValidPosition(newRow, newCol) && 
                (this.board[newRow][newCol] === ' ' || !this.isCurrentPlayerPiece(this.board[newRow][newCol]))) {
                moves.push(this.notateMove(row, col, newRow, newCol));
            }
        }
        
        return moves;
    }

    getBishopMoves(row, col) {
        return this.getSlidingMoves(row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }

    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const kingOffsets = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [rowOffset, colOffset] of kingOffsets) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (this.isValidPosition(newRow, newCol) && 
                (this.board[newRow][newCol] === ' ' || !this.isCurrentPlayerPiece(this.board[newRow][newCol]))) {
                moves.push(this.notateMove(row, col, newRow, newCol));
            }
        }
        
        return moves;
    }

    getSlidingMoves(row, col, directions) {
        const moves = [];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (this.isValidPosition(newRow, newCol)) {
                if (this.board[newRow][newCol] === ' ') {
                    moves.push(this.notateMove(row, col, newRow, newCol));
                } else {
                    if (!this.isCurrentPlayerPiece(this.board[newRow][newCol])) {
                        moves.push(this.notateMove(row, col, newRow, newCol));
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    notateMove(fromRow, fromCol, toRow, toCol) {
        const files = 'abcdefgh';
        return `${files[fromCol]}${8 - fromRow}${files[toCol]}${8 - toRow}`;
    }

    evaluateBoard() {
        let score = 0;

        // Piece count
        const whitePieces = this.board.flat().filter(piece => piece.toUpperCase() === piece && piece !== ' ').length;
        const blackPieces = this.board.flat().filter(piece => piece.toLowerCase() === piece && piece !== ' ').length;
        score += (blackPieces - whitePieces) * 10;

        // Pawn advancement
        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 8; row++) {
                if (this.board[row][col] === 'P') score -= (6 - row) * 0.1;
                if (this.board[row][col] === 'p') score += row * 0.1;
            }
        }

        // Piece values (negative because we want to lose them)
        const pieceValues = { 'Q': -8, 'R': -5, 'q': 8, 'r': 5 };
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (pieceValues[piece]) score += pieceValues[piece];
            }
        }

        return score;
    }

    checkGameEnd() {
        const whitePieces = this.board.flat().filter(piece => piece.toUpperCase() === piece && piece !== ' ').length;
        const blackPieces = this.board.flat().filter(piece => piece.toLowerCase() === piece && piece !== ' ').length;

        if (whitePieces === 0) return 'White wins!';
        if (blackPieces === 0) return 'Black wins!';
        
        if (this.getAllPossibleMoves().length === 0) {
            return `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} has no legal moves. It's a draw!`;
        }
        
        return null;
    }
}

const bot = new LoserChessBot();
const moveInput = document.getElementById('moveInput');
const submitMove = document.getElementById('submitMove');
const botResponse = document.getElementById('botResponse');
const gameStatus = document.getElementById('gameStatus');

submitMove.addEventListener('click', () => {
    const playerMove = moveInput.value.toLowerCase();
    if (playerMove.length !== 4) {
        botResponse.textContent = 'Invalid move format. Please use format like e2e4.';
        return;
    }

    try {
        bot.makeMove(playerMove);
    } catch (error) {
        botResponse.textContent = 'Invalid move. Please try again.';
        return;
    }

    let status = bot.checkGameEnd();
    if (status) {
        gameStatus.textContent = status;
        return;
    }

    const botMove = bot.getBotMove();
    if (botMove) {
        bot.makeMove(botMove);
        botResponse.textContent = `Bot's move: ${botMove}`;
    } else {
        botResponse.textContent = "Bot couldn't make a move.";
    }

    status = bot.checkGameEnd();
    if (status) {
        gameStatus.textContent = status;
    }

    moveInput.value = '';
});
