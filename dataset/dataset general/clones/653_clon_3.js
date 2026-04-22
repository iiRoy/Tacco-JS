/*
 * This module manages the user interface and interaction logic for a web-based chess game.
 * It orchestrates communication between the visual chessboard and the underlying chess engine.
 * The aim is to provide a robust and responsive experience for playing chess in a browser.
 */

// Enforce strict parsing and error handling for cleaner, safer code.
'use strict';

// Global references for the core components of our chess application.
// These variables are accessible throughout the script's scope.
var gameEngine,   // An instance of the Chess.js library, handling game rules and state.
	displayBoard; // An instance of the Chessboard.js library, managing the visual board.

/**
 * Updates the various informational elements on the webpage, such as game status,
 * the current FEN string, and the Portable Game Notation (PGN) history.
 *
 * @param {string} currentStatusMessage - A descriptive string indicating the current state or event in the game.
 * @returns {void}
 */
function refreshGameStatusDisplay(currentStatusMessage) {
	// Validate the input message to ensure it's a non-empty string.
	// If invalid, a default message is used to prevent UI display issues.
	if (typeof currentStatusMessage !== 'string' || currentStatusMessage.trim().length === 0) {
		currentStatusMessage = 'Game state currently undetermined or message missing.';
	}

	// Update the main status indicator element.
	document.querySelector('#gameStatusDisplay').textContent = `Game Progress: ${currentStatusMessage}`;

	// Display the current Forsyth-Edwards Notation (FEN) string, which concisely describes the board state.
	document.getElementById('fenOutput').textContent = `FEN String: ${gameEngine.fen()}`;

	// Render the Portable Game Notation (PGN), a standard format for recording chess games.
	document.getElementById('pgnHistory').textContent = `PGN Log: ${gameEngine.pgn()}`;
}

/**
 * Resets the entire chess game to its initial starting position.
 * This function clears the board, resets the game engine's state,
 * and updates the user interface to reflect the new game.
 *
 * @returns {void}
 */
function initiateNewGame() {
	console.info('[Game Init] Starting a brand new game session...');

	// Retrieve the standard FEN string for the initial chess position.
	const initialPositionFEN = ChessUtils.FEN.startId;

	// Reset the visual chessboard to this standard starting position.
	displayBoard.setPosition(initialPositionFEN);

	// Instruct the underlying chess engine to reset its internal state.
	gameEngine.reset();

	// Update the UI to inform players that a new game has begun and White is to move.
	refreshGameStatusDisplay('A fresh game has commenced. White player to make the opening move.');
	console.log('[Game Init] Game board and engine successfully reset.');
}

/**
 * Determines and returns the human-readable label ('White' or 'Black') for the player
 * whose turn it currently is, based on the chess engine's state.
 *
 * @param {object} engineRef - A reference to the active chess game engine instance.
 * @returns {string} The string 'White' or 'Black' corresponding to the current player.
 */
function getPlayerLabel(engineRef) {
	// The engine's `turn()` method returns 'w' for White and 'b' for Black.
	return (engineRef.turn() === 'w') ? 'White' : 'Black';
}

/**
 * Processes a proposed chess move, updates the game engine, and refreshes the UI
 * based on the move's outcome (e.g., checkmate, draw, or a regular move).
 *
 * @param {object} moveDetails - An object containing `from` (start square) and `to` (end square)
 *                               in algebraic notation (e.g., { from: 'e2', to: 'e4' }).
 * @returns {object} An object containing the new FEN string and a boolean indicating if the move was successful.
 */
function processPlayerMove(moveDetails) {
	// Perform basic validation on the move details object.
	if (!moveDetails || typeof moveDetails.from !== 'string' || typeof moveDetails.to !== 'string') {
		console.warn('[Move Error] Invalid or incomplete move details provided:', moveDetails);
		refreshGameStatusDisplay('Error: An invalid move attempt was detected.');
		return { fen: gameEngine.fen(), success: false };
	}

	// In this simplified clone, all pawn promotions are hardcoded to a queen.
	const promotionPieceType = 'q';

	// Attempt to execute the move using the chess engine.
	const engineMoveResult = gameEngine.move({
		from: moveDetails.from,
		to: moveDetails.to,
		promotion: promotionPieceType
	});

	// If `engineMoveResult` is null, the move was illegal according to chess rules.
	if (engineMoveResult === null) {
		console.log('[Move Logic] Illegal move attempted:', moveDetails);
		refreshGameStatusDisplay('That specific move is not permitted. Please choose a valid move.');
		return { fen: gameEngine.fen(), success: false };
	}

	let moveOutcomeDescription = '';
	// Determine the label for the *next* player, whose turn it is after this move.
	const activePlayerLabel = getPlayerLabel(gameEngine);

	// Evaluate the game state after the successful move.
	if (gameEngine.in_checkmate()) {
		// If checkmate occurred, the player who *just moved* won.
		// Therefore, the *previous* player (whose turn it is NOT) lost.
		const losingPlayerLabel = (activePlayerLabel === 'White') ? 'Black' : 'White';
		moveOutcomeDescription = `CHECKMATE! The ${losingPlayerLabel} player has been defeated! Game Over.`;
	} else if (gameEngine.in_draw()) {
		moveOutcomeDescription = 'The game has concluded in a DRAW!';
	} else {
		// The game continues normally.
		moveOutcomeDescription = `The next turn belongs to the ${activePlayerLabel} player.`;

		// Check if the next player is in check.
		if (gameEngine.in_check()) {
			moveOutcomeDescription = `WARNING: The ${activePlayerLabel} player is currently in CHECK! ` + moveOutcomeDescription;
		}
	}

	// Update the UI with the latest status message.
	refreshGameStatusDisplay(moveOutcomeDescription);

	// Return the updated FEN and indicate that the move was successful.
	return { fen: gameEngine.fen(), success: true };
}

/**
 * Calculates and returns a list of valid target squares (represented by their numerical indices)
 * for a piece located on a `selectedSquareId`. This is used to highlight possible moves on the UI.
 *
 * @param {string} selectedSquareId - The algebraic notation of the square from which a piece is selected (e.g., 'a1', 'e7').
 * @returns {Array<number>} An array of numerical indices corresponding to valid destination squares.
 *                          Returns an empty array if no moves are possible or input is invalid.
 */
function getValidMoveTargets(selectedSquareId) {
	// Basic validation for the input square ID.
	if (typeof selectedSquareId !== 'string' || selectedSquareId.length !== 2) {
		console.warn('[Move Target] Invalid square ID format received:', selectedSquareId);
		return []; // Return an empty array for invalid input.
	}

	// Request all possible moves from the selected square, including verbose details for each move.
	const possibleMovesVerbose = gameEngine.moves({ square: selectedSquareId, verbose: true });

	// If there are no valid moves from this square, return an empty array immediately.
	if (possibleMovesVerbose.length === 0) {
		console.log(`[Move Target] No valid moves found from ${selectedSquareId}.`);
		return [];
	}

	const targetSquareIndices = [];
	// Iterate through the verbose move objects and extract the 'to' square's numerical index.
	for (let idx = 0; idx < possibleMovesVerbose.length; idx++) {
		const targetSquareNotation = possibleMovesVerbose[idx].to;
		const targetIndex = ChessUtils.convertNotationSquareToIndex(targetSquareNotation);
		targetSquareIndices.push(targetIndex);
	}

	// Return the compiled list of target square indices.
	return targetSquareIndices;
}

/**
 * Updates a specific UI element to display whether user interaction with the chessboard
 * (e.g., dragging pieces) is currently enabled or disabled.
 * It also applies CSS classes for visual feedback.
 *
 * @returns {void}
 */
function updateInteractionStatusView() {
	// Query the current state of user input enablement from the display board.
	const isEnabled = displayBoard.isUserInputEnabled();
	// Determine the descriptive text based on the enablement state.
	const statusText = isEnabled ? 'active' : 'inactive';
	// Get a reference to the HTML element that displays this status.
	const statusElement = document.getElementById('interactionStatusIndicator');

	// Update the text content of the status indicator.
	statusElement.textContent = `User interaction status: ${statusText}.`;

	// Apply or remove CSS classes to visually indicate the status.
	// This allows for styling changes (e.g., color change) based on enablement.
	if (isEnabled) {
		statusElement.classList.remove('status-inactive');
		statusElement.classList.add('status-active');
	} else {
		statusElement.classList.remove('status-active');
		statusElement.classList.add('status-inactive');
	}
}

/**
 * A utility function to simplify the process of attaching event listeners to buttons.
 * It ensures the button exists before attempting to attach a handler.
 *
 * @param {string} buttonId - The DOM ID of the button element.
 * @param {Function} handlerFunction - The callback function to execute when the button is clicked.
 * @returns {void}
 */
function setupButtonHandler(buttonId, handlerFunction) {
	const buttonElement = document.getElementById(buttonId);
	if (buttonElement) {
		buttonElement.addEventListener('click', handlerFunction);
		console.log(`[Event Setup] Attached click handler to button: #${buttonId}`);
	} else {
		console.warn(`[Event Setup] Button with ID '${buttonId}' not found. Cannot attach handler.`);
	}
}


// This block of code executes once the entire HTML document has been fully loaded and parsed.
document.addEventListener('DOMContentLoaded', function () {
	console.log('DOM content fully loaded. Commencing chess application initialization...');

	// 1. Initialize the chess game engine.
	gameEngine = new Chess();
	if (!gameEngine) {
		console.error('CRITICAL ERROR: Failed to initialize Chess.js game engine! Application cannot proceed.');
		return; // Halt execution if the engine fails to load.
	}
	console.log('[Init] Chess game engine successfully instantiated.');

	// 2. Initialize the visual chessboard display.
	displayBoard = new Chessboard('board', {
		position: ChessUtils.FEN.startId, // Start with the standard initial position.
		eventHandlers: {
			onPieceSelected: getValidMoveTargets, // Callback when a piece is selected.
			onMove: processPlayerMove          // Callback when a move is attempted.
		}
	});
	if (!displayBoard) {
		console.error('CRITICAL ERROR: Failed to initialize Chessboard.js display! Application cannot proceed.');
		return; // Halt execution if the display fails to load.
	}
	console.log('[Init] Chessboard display component successfully instantiated.');

	// 3. Set up event listeners for control buttons.
	setupButtonHandler('resetGameButton', function () {
		initiateNewGame();
	});

	// 4. Perform initial game setup and UI update.
	initiateNewGame();

	// 5. Configure user input enablement/disablement controls.
	updateInteractionStatusView(); // Display initial input status.

	setupButtonHandler('enableInputControl', function () {
		displayBoard.enableUserInput(true);
		updateInteractionStatusView();
		console.log('[Interaction] User input enabled.');
	});

	setupButtonHandler('disableInputControl', function () {
		displayBoard.enableUserInput(false);
		updateInteractionStatusView();
		console.log('[Interaction] User input disabled.');
	});

	// Optional: Add a debug button to log current game state to console.
	setupButtonHandler('debugLogButton', function() {
		console.groupCollapsed('Current Game State Debug Info');
		console.info('Current FEN:', gameEngine.fen());
		console.info('Current PGN:', gameEngine.pgn());
		console.info('Is in Check:', gameEngine.in_check());
		console.info('Is Checkmate:', gameEngine.in_checkmate());
		console.info('Is Draw:', gameEngine.in_draw());
		console.info('Turn:', getPlayerLabel(gameEngine));
		console.groupEnd();
	});

	console.log('Chess application initialization process complete.');
});