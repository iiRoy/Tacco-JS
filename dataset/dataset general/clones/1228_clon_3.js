// Expert Chess AI Module - for HTML5 Chess Game
// Based on principles from various open-source engines
// Author: AI Architect
// Contact: ai.architect@example.com

// Define the core AI object, ensuring it exists
const ChessBrain = ChessBrain || {};

// --- Configuration and Constants ---
ChessBrain.MAX_EVAL_SCORE = 99999;
ChessBrain.MIN_EVAL_SCORE = -99999;
ChessBrain.KING_CAPTURED_SCORE = 8888; // Score indicating a king capture
ChessBrain.DEFAULT_SEARCH_DEPTH = 3;   // Initial search depth for the AI
ChessBrain.RETRY_SEARCH_DEPTH = 2;    // Reduced depth for retry if first search fails

// --- Internal State and Caches ---
ChessBrain.moveCache = {};         // Cache for storing evaluated positions (simplified transposition table)
ChessBrain.cacheEntryCount = 0;    // Tracks number of entries in the move cache

// --- Main AI Move Generation Function ---
ChessBrain.computeBestMove = function(currentMoveSequence) {
  let openingBook = ChessBrain.currentBookBranch || gameEngine.gambitData; // Use opening book if available
  let bestMoveCoordinates;

  // --- Opening Book Lookup ---
  if (openingBook && openingBook.length > 0) {
    const sequenceLength = currentMoveSequence.length;
    let matchingBookMoves = [];

    // Find all book moves that match the current game history
    for (let i = 0; i < openingBook.length; i++) {
      if (openingBook[i].startsWith(currentMoveSequence)) {
        matchingBookMoves.push(openingBook[i]);
      }
    }

    if (matchingBookMoves.length > 0) {
      // Select a random move from the matching book entries
      const randomIndex = Math.floor(Math.random() * matchingBookMoves.length);
      ChessBrain.currentBookBranch = matchingBookMoves; // Update current branch for next lookup
      const selectedBookMove = matchingBookMoves[randomIndex];
      bestMoveCoordinates = selectedBookMove.substring(sequenceLength, sequenceLength + 4).split("");
      // Convert to numbers for consistency
      return bestMoveCoordinates.map(coord => parseInt(coord, 10));
    } else {
      // No matching book moves found, clear the book branch
      ChessBrain.currentBookBranch = [];
    }
  }

  // --- AI Search Initialization ---
  const searchStartTime = new Date().getTime();
  ChessBrain.currentSearchDepth = gameEngine.config.aiDepth || ChessBrain.DEFAULT_SEARCH_DEPTH;
  ChessBrain.positionsEvaluatedCount = 0; // Reset counter for this search

  // Perform the initial Alpha-Beta search
  let searchResult = ChessBrain.alphaBetaSearch(
    ChessBrain.MIN_EVAL_SCORE,
    ChessBrain.MAX_EVAL_SCORE,
    ChessBrain.currentSearchDepth,
    utils.clone2DArray(gameEngine.boardMap), // Clone board to avoid modifying global state
    gameEngine.activePlayer // The player whose turn it is
  );

  // If the initial search failed (e.g., immediate king capture detected for opponent, or no valid moves)
  if (!searchResult || searchResult.evaluationScore === -ChessBrain.KING_CAPTURED_SCORE) { // Using negative for opponent king capture
    console.warn("Initial AI search failed or indicated immediate loss, retrying with reduced depth.");
    ChessBrain.currentSearchDepth = ChessBrain.RETRY_SEARCH_DEPTH; // Reduce depth for a quicker, safer move
    searchResult = ChessBrain.alphaBetaSearch(
      ChessBrain.MIN_EVAL_SCORE,
      ChessBrain.MAX_EVAL_SCORE,
      ChessBrain.currentSearchDepth,
      utils.clone2DArray(gameEngine.boardMap),
      gameEngine.activePlayer
    );
  }

  // --- Process Search Results and Update UI ---
  if (searchResult && searchResult.evaluationScore !== -ChessBrain.KING_CAPTURED_SCORE) {
    const pieceMakingMove = gameEngine.allPieces[searchResult.pieceIdentifier];
    const searchEndTime = new Date().getTime();
    const elapsedTimeMs = searchEndTime - searchStartTime;

    // Construct move description for UI
    const moveDescription = utils.formatMoveDescription(
      utils.clone2DArray(gameEngine.boardMap),
      pieceMakingMove.xPos,
      pieceMakingMove.yPos,
      searchResult.targetX,
      searchResult.targetY
    );

    // Update UI with search statistics
    const outputElement = utils.getElementById("analysisOutput");
    if (outputElement) {
      outputElement.innerHTML = `
        <h3>AI Search Results:</h3>
        <p>Best Move: ${moveDescription}</p>
        <p>Search Depth: ${ChessBrain.currentSearchDepth}</p>
        <p>Positions Evaluated: ${ChessBrain.positionsEvaluatedCount}</p>
        <p>Best Move Evaluation: ${searchResult.evaluationScore} points</p>
        <p>Search Time: ${elapsedTimeMs} ms</p>
      `;
    }

    // Return the best move coordinates
    return [pieceMakingMove.xPos, pieceMakingMove.yPos, searchResult.targetX, searchResult.targetY];
  } else {
    console.error("AI could not find a valid move.");
    return false; // AI failed to find any suitable move
  }
};

// --- Iterative Deepening Search (currently not used in main flow) ---
ChessBrain.progressiveDeepeningSearch = function(board, playerSide) {
  const maxSearchDurationMs = 100; // Max time for search
  let currentDepth = 1;
  const absoluteMaxDepth = 8;     // Upper bound for iterative deepening
  const searchStartTime = new Date().getTime();
  let latestBestResult = {};

  for (let d = currentDepth; d <= absoluteMaxDepth; d++) {
    ChessBrain.currentSearchDepth = d;
    // The original had a typo 'aotuDepth', interpreting as current auto depth
    ChessBrain.currentAutoDepth = d;

    const iterationResult = ChessBrain.alphaBetaSearch(
      ChessBrain.MIN_EVAL_SCORE,
      ChessBrain.MAX_EVAL_SCORE,
      ChessBrain.currentSearchDepth,
      board,
      playerSide
    );

    if (iterationResult) {
      latestBestResult = iterationResult;
    }

    // Check for timeout
    if ((new Date().getTime() - searchStartTime) > maxSearchDurationMs) {
      console.log(`Progressive deepening timed out after ${d} depths.`);
      return latestBestResult;
    }
  }
  return latestBestResult; // Return the best result found within time/depth limits
};

// --- Helper: Get All Active Pieces for a Player ---
ChessBrain.getAllActivePieces = function(boardLayout, playerSide) {
  const activePlayerPieces = [];
  for (let row = 0; row < boardLayout.length; row++) {
    for (let col = 0; col < boardLayout[row].length; col++) {
      const pieceId = boardLayout[row][col];
      if (pieceId) {
        const pieceData = gameEngine.allPieces[pieceId];
        if (pieceData && pieceData.playerSide === playerSide) {
          // Update piece's current position in its data object temporarily
          pieceData.xPos = col;
          pieceData.yPos = row;
          activePlayerPieces.push(pieceData);
        }
      }
    }
  }
  return activePlayerPieces;
};

// --- Helper: Generate All Legal Moves for a Player ---
ChessBrain.generateLegalMoves = function(boardLayout, playerSide) {
  const allPlayerPieces = ChessBrain.getAllActivePieces(boardLayout, playerSide);
  const possibleMoves = [];
  const lastForbiddenMove = gameEngine.forbiddenMove; // For detecting perpetual checks/draws

  for (const piece of allPlayerPieces) {
    // Assume piece.getValidMoves(boardLayout) returns an array of [targetX, targetY]
    const validDestinations = piece.getValidMoves(boardLayout);

    for (const dest of validDestinations) {
      const fromX = piece.xPos;
      const fromY = piece.yPos;
      const toX = dest[0];
      const toY = dest[1];

      // Check for perpetual check rule (preventing a move that repeats the forbidden state)
      if (lastForbiddenMove &&
        lastForbiddenMove[0] === fromX &&
        lastForbiddenMove[1] === fromY &&
        lastForbiddenMove[2] === toX &&
        lastForbiddenMove[3] === toY) {
        // This move is forbidden due to repetition, skip it
        continue;
      }

      // Store move as an object for better readability
      possibleMoves.push({
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
        pieceIdentifier: piece.id
      });
    }
  }
  return possibleMoves;
};

// --- Core Alpha-Beta Search Algorithm ---
ChessBrain.alphaBetaSearch = function(alpha, beta, remainingDepth, currentBoard, activePlayer) {
  // Base case: If depth is zero, evaluate the current board state
  if (remainingDepth === 0) {
    return { evaluationScore: ChessBrain.evaluateBoardPosition(currentBoard, activePlayer) };
  }

  // Generate all legal moves for the active player
  const candidateMoves = ChessBrain.generateLegalMoves(currentBoard, activePlayer);

  // If no legal moves, it's either checkmate or stalemate
  if (candidateMoves.length === 0) {
    // If current player is in check, it's checkmate (loss for current player)
    // This check would ideally be more robust, involving a 'isKingInCheck' function.
    // For simplicity, we assume no moves means a significant disadvantage.
    return { evaluationScore: ChessBrain.MIN_EVAL_SCORE + 1000 }; // A very bad score for the current player
  }

  let bestMoveForCurrentNode = null;

  // Iterate through each candidate move
  for (const move of candidateMoves) {
    const { fromX, fromY, toX, toY, pieceIdentifier } = move;
    const currentPiece = gameEngine.allPieces[pieceIdentifier];

    // --- Make the move on a temporary board state ---
    const capturedPieceId = currentBoard[toY][toX] || 0; // Store captured piece ID, use 0 for empty
    currentBoard[toY][toX] = pieceIdentifier; // Move piece to new position
    currentBoard[fromY][fromX] = 0;           // Clear old position

    // Update piece's internal coordinates temporarily (important for subsequent move generation/evaluation)
    const originalPieceX = currentPiece.xPos;
    const originalPieceY = currentPiece.yPos;
    currentPiece.xPos = toX;
    currentPiece.yPos = toY;

    // Check if the king of the *opponent* was captured (instant win for current player)
    // Assuming 'j0'/'J0' are king IDs for red/black
    const opponentKingId = (activePlayer === gameEngine.RED_PLAYER) ? 'j0' : 'J0'; // Corrected opponent king ID
    if (capturedPieceId === opponentKingId) {
      // Restore board and piece position before returning
      currentPiece.xPos = originalPieceX;
      currentPiece.yPos = originalPieceY;
      currentBoard[fromY][fromX] = pieceIdentifier;
      currentBoard[toY][toX] = capturedPieceId; // Restore captured piece
      return {
        pieceIdentifier: pieceIdentifier,
        fromX: fromX,
        fromY: fromY,
        targetX: toX,
        targetY: toY,
        evaluationScore: ChessBrain.KING_CAPTURED_SCORE
      };
    }

    // --- Recursive call for opponent's turn (negamax principle) ---
    // The value from the recursive call is for the *opponent*, so negate it
    const recursiveResult = ChessBrain.alphaBetaSearch(
      -beta,
      -alpha,
      remainingDepth - 1,
      currentBoard,
      -activePlayer // Switch player side
    );

    // Extract the evaluation score; if recursive result is null (e.g., no moves), handle it
    let currentMoveEvaluation = recursiveResult ? -recursiveResult.evaluationScore : ChessBrain.MIN_EVAL_SCORE;

    // --- Undo the move on the temporary board state ---
    currentPiece.xPos = originalPieceX;
    currentPiece.yPos = originalPieceY;
    currentBoard[fromY][fromX] = pieceIdentifier; // Move piece back
    currentBoard[toY][toX] = capturedPieceId;     // Restore captured piece (or 0 if none)

    // --- Alpha-Beta Pruning ---
    if (currentMoveEvaluation >= beta) {
      // Beta cutoff: Opponent has a better option elsewhere, so this branch is not explored further
      return {
        pieceIdentifier: pieceIdentifier,
        fromX: fromX,
        fromY: fromY,
        targetX: toX,
        targetY: toY,
        evaluationScore: beta
      };
    }
    if (currentMoveEvaluation > alpha) {
      // Found a better move for the current player
      alpha = currentMoveEvaluation;
      if (remainingDepth === ChessBrain.currentSearchDepth) { // Only update root best move
        bestMoveForCurrentNode = {
          pieceIdentifier: pieceIdentifier,
          fromX: fromX,
          fromY: fromY,
          targetX: toX,
          targetY: toY,
          evaluationScore: alpha
        };
      }
    }
  }

  // If at the root of the search tree, return the best move found
  if (remainingDepth === ChessBrain.currentSearchDepth) {
    if (!bestMoveForCurrentNode) {
      // This case indicates no valid moves were found or all led to immediate loss
      return false; // Or a specific error object
    } else {
      return bestMoveForCurrentNode;
    }
  }

  // For non-root nodes, return just the alpha value (best score found for this node)
  return { evaluationScore: alpha };
};

// --- Board Evaluation Function ---
ChessBrain.evaluateBoardPosition = function(boardLayout, playerPerspective) {
  let totalBoardValue = 0;
  for (let row = 0; row < boardLayout.length; row++) {
    for (let col = 0; col < boardLayout[row].length; col++) {
      const pieceId = boardLayout[row][col];
      if (pieceId && pieceId !== 0) { // Ensure it's a valid piece, not an empty square marker
        const pieceData = gameEngine.allPieces[pieceId];
        // Each piece has a value matrix (e.g., pieceData.positionalValue[row][col])
        // and a playerSide (e.g., +1 for red, -1 for black)
        totalBoardValue += pieceData.positionalValue[row][col] * pieceData.playerSide;
      }
    }
  }
  // Increment the counter for evaluated positions
  ChessBrain.positionsEvaluatedCount++;
  // Return the value from the perspective of the current player
  return totalBoardValue * playerPerspective;
};

// --- Placeholder for external game engine and utility objects ---
// These would typically be defined elsewhere in the game's codebase
const gameEngine = {
  gambitData: [ // Example opening book data
    "00102030", // Example: piece at 0,0 moves to 1,0, then piece at 2,0 moves to 3,0
    "00112131",
    "00102040",
  ],
  boardMap: [
    ['R0', 'N0', 'B0', 'A0', 'J0', 'A1', 'B1', 'N1', 'R1'],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 'C0', 0, 0, 0, 0, 0, 'C1', 0],
    ['P0', 0, 'P1', 0, 'P2', 0, 'P3', 0, 'P4'],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ['p0', 0, 'p1', 0, 'p2', 0, 'p3', 0, 'p4'],
    [0, 'c0', 0, 0, 0, 0, 0, 'c1', 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ['r0', 'n0', 'b0', 'a0', 'j0', 'a1', 'b1', 'n1', 'r1']
  ],
  allPieces: {
    // Example piece data (would be much more extensive)
    'R0': { id: 'R0', playerSide: 1, xPos: 0, yPos: 0, positionalValue: Array(10).fill(0).map(()=>Array(9).fill(100)), getValidMoves: (b) => [[0,1],[1,0]] },
    'N0': { id: 'N0', playerSide: 1, xPos: 1, yPos: 0, positionalValue: Array(10).fill(0).map(()=>Array(9).fill(40)), getValidMoves: (b) => [[2,2],[0,2]] },
    'J0': { id: 'J0', playerSide: 1, xPos: 4, yPos: 0, positionalValue: Array(10).fill(0).map(()=>Array(9).fill(1000)), getValidMoves: (b) => [[4,1],[5,0]] }, // Red King
    'j0': { id: 'j0', playerSide: -1, xPos: 4, yPos: 9, positionalValue: Array(10).fill(0).map(()=>Array(9).fill(1000)), getValidMoves: (b) => [[4,8],[5,9]] }, // Black King
    // ... more pieces
  },
  activePlayer: 1, // 1 for red, -1 for black
  config: {
    aiDepth: 3
  },
  forbiddenMove: null, // [fromX, fromY, toX, toY] for draw detection
  RED_PLAYER: 1,
  BLACK_PLAYER: -1
};

const utils = {
  clone2DArray: (arr) => arr.map(row => [...row]),
  getElementById: (id) => typeof document !== 'undefined' ? document.getElementById(id) : ({ innerHTML: '' }),
  formatMoveDescription: (board, fx, fy, tx, ty) => {
    // This is a simplified version; a real one would convert coordinates to chess notation
    const pieceId = board[fy][fx];
    return `${pieceId} from (${fx},${fy}) to (${tx},${ty})`;
  }
};