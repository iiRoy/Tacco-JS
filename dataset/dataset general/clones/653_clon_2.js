/* This JavaScript file manages the user interface and game logic for a digital board game. */
/* It utilizes external libraries for game engine and board visualization. */

'use strict'; // Enforce strict parsing and error handling

var gameEngine, // Instance of the core game logic
	visualBoard; // Instance of the graphical board display


/**
 * Updates various information panels on the user interface.
 * @param {string} messageText - The status message to display.
 */
function refreshGameStatus( messageText )
{
	// Update the main status indicator
	$( '#info-status' ).html( messageText );

	// Display the current FEN (Forsyth-Edwards Notation) string
	$( '#info-fen' ).html( gameEngine.fenRepresentation() );

	// Show the PGN (Portable Game Notation) history
	$( '#info-pgn' ).html( gameEngine.pgnNotation() );
}


/**
 * Resets the entire game to its initial state.
 */
function reinitializeGame()
{
	// Set the visual board to the starting position
	visualBoard.setBoardPosition( GameUtilities.FEN_CONSTANTS.STARTING_POSITION_ID );

	// Reset the underlying game logic to default
	gameEngine.resetGameInstance();

	// Inform the user about the next player
	refreshGameStatus( 'Next participant is white.' );
}


/**
 * Handles the event when a piece is moved on the board.
 * This function processes the move and updates the game state.
 * @param {object} playedMove - An object containing details of the performed move (sourceSquare, targetSquare).
 * @returns {string} The FEN string after the move.
 */
function processMoveAttempt( playedMove )
{

	var activePlayer, // Stores the name of the player whose turn it is
		currentMessage, // Holds the status message to be displayed
		executedMove = gameEngine.performMove( { // Attempt to execute the move in the game engine
			sourceSquare: playedMove.sourceSquare,
			targetSquare: playedMove.targetSquare,
			promotion: 'q' // Always promote to queen for simplicity in this example
		} );


	activePlayer = 'white';
	if ( gameEngine.getCurrentPlayerTurn() === 'b' ) // Check if it's black's turn
	{
		activePlayer = 'black';
	}

	if ( executedMove !== null ) // If the move was valid and executed
	{
		if ( gameEngine.isCheckmate() === true )
		{
			currentMessage = 'CHECKMATE! Participant ' + activePlayer + ' lost.';
		}
		else if ( gameEngine.isDraw() === true )
		{
			currentMessage = 'DRAW!';
		}
		else
		{
			currentMessage = 'Next participant is ' + activePlayer + '.';

			if ( gameEngine.isCheck() === true )
			{
				currentMessage = 'CHECK! ' + currentMessage; // Prepend "CHECK!" if the king is attacked
			}
		}

		refreshGameStatus( currentMessage ); // Update the UI with the latest status
	}

	return gameEngine.fenRepresentation(); // Return the new FEN string
}


/**
 * Determines and returns a list of valid squares a selected piece can move to.
 * @param {string} squareIdentifier - The algebraic notation of the selected square (e.g., 'e2').
 * @returns {number[]} An array of indices representing valid destination squares.
 */
function getValidSelections( squareIdentifier )
{
	var idx, // Loop counter for iterating through moves
		detailedMoves, // Array of verbose move objects from the game engine
		targetIndices = []; // Array to store destination square indices

	detailedMoves = gameEngine.getAvailableMoves( { currentSquare: squareIdentifier, detailedOutput: true } );
	for ( idx = 0; idx < detailedMoves.length; idx++ )
	{
		targetIndices.push( GameUtilities.transformAlgebraicToIndex( detailedMoves[idx].destination ) );
	}
	return targetIndices;
}


/**
 * Updates the display indicating whether user input is currently enabled or disabled.
 */
function refreshInputStatusDisplay()
{
	// Update the text based on the current input state of the visual board
	$( '#isUserInputEnabled' ).html( 'Player input is ' + ( visualBoard.isPlayerInputEnabled() ? 'enabled' : 'disabled' ) );
}


// Entry point for the application, executed when the DOM is fully loaded.
$( document ).ready( function ()
{
	gameEngine = new GameCore(); // Initialize the game logic instance
	visualBoard = new BoardRenderer( 'board', { // Initialize the visual board
		initialPosition: GameUtilities.FEN_CONSTANTS.STARTING_POSITION_ID, // Set initial board layout
		eventCallbacks: { // Define event handlers for board interactions
			onSquareSelected: getValidSelections, // Callback when a piece is selected
			onPieceMoved: processMoveAttempt // Callback when a piece completes a move
		}
	} );

	// Attach click event to the reset button
	$( '#btn-reset-game' ).click( function ()
	{
		reinitializeGame(); // Call the game reset function
	} );
	reinitializeGame(); // Perform initial game setup and display

	// Section for managing user input enablement
	refreshInputStatusDisplay(); // Display initial input status
	$( '#btnEnableUserInput' ).click( function ()
	{
		visualBoard.allowPlayerInput( true ); // Enable user interaction with the board
		refreshInputStatusDisplay(); // Update the status display
	} );
	$( '#btnDisableUserInput' ).click( function ()
	{
		visualBoard.allowPlayerInput( false ); // Disable user interaction with the board
		refreshInputStatusDisplay(); // Update the status display
	} );

} );