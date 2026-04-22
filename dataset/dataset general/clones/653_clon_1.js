/*
 * This is a JavaScript file for a chess game application.
 * It handles game logic, board display, and user interactions.
 *
 * JSLint directives:
 * - node: true (Node.js environment)
 * - plusplus: true (Allow ++ and -- operators)
 * - devel: true (Allow development console functions)
 * - browser: true (Browser environment)
 */
/*
 * Global variables declared here for JSLint:
 * - $: jQuery library
 * - Chess: Chess.js library for game logic
 * - Chessboard: Chessboard.js library for board display
 * - ChessUtils: Custom utility functions for chess
 */


'use strict' ; // Enforce strict mode for better code quality and error handling.


var    chess,        // Main Chess.js game instance.
       board;        // Main Chessboard.js display instance.


/*
 * Function: updateGameInfo
 * Description: Updates the display elements with current game status, FEN, and PGN.
 * Parameter:
 *   status (string): The current status message to display.
 */
function updateGameInfo ( status )
{
    // Update the status message display.
    $ ( '#info-status' ) . html ( status ) ;
    // Update the FEN (Forsyth-Edwards Notation) display.
    $ ( '#info-fen' ) . html ( chess . fen ( ) ) ;
    // Update the PGN (Portable Game Notation) display.
    $ ( '#info-pgn' ) . html ( chess . pgn ( ) ) ;
}


/*
 * Function: resetGame
 * Description: Resets the chess board and game state to the initial position.
 */
function resetGame ( )
{
    // Reset the visual board to the starting FEN.
    board . setPosition ( ChessUtils . FEN . startId ) ;
    // Reset the internal chess game state.
    chess . reset ( ) ;

    // Update the game information display to reflect the reset.
    updateGameInfo ( 'Next player is white.' ) ;
}


/**
 * Function: pieceMove
 * Description: Handles a piece movement event from the chessboard.
 *              It attempts to make the move in the Chess.js engine and updates game state.
 * @param {object} move - An object containing move details (from, to).
 * @returns {string} The FEN string of the current board state after the move.
 */
function pieceMove ( move )
{
    var nextPlayer , // Stores the color of the next player.
        status ,     // Stores the status message for the game.
        chessMove ;  // Result of the chess engine's move attempt.

    // Attempt to make the move in the chess engine.
    // Promotion is hardcoded to 'q' (queen) for simplicity.
    chessMove = chess . move ( {
        from      : move . from , // Starting square of the move.
        to        : move . to ,   // Destination square of the move.
        promotion : 'q'           // Default promotion to a queen.
    } ) ;


    // Determine whose turn it is next.
    nextPlayer = 'white' ;
    if ( chess . turn ( ) === 'b' )
    {
        nextPlayer = 'black' ;
    }

    // Only proceed if the move was valid according to the chess engine.
    if ( chessMove !== null )
    {
        // Check for various game-ending or status conditions.
        if ( chess . in_checkmate ( ) === true )
        {
            status = 'CHECKMATE! Player ' + nextPlayer + ' lost.' ;
        }
        else if ( chess . in_draw ( ) === true )
        {
            status = 'DRAW!' ;
        }
        else
        {
            // If the game is ongoing, determine the next player.
            status = 'Next player is ' + nextPlayer + '.' ;

            // Check if the next player is in check.
            if ( chess . in_check ( ) === true )
            {
                status = 'CHECK! ' + status ; // Prepend "CHECK!" to the status.
            }
        }

        // Update the game information display with the new status.
        updateGameInfo ( status ) ;
    }

    // Return the FEN of the current board state.
    return chess . fen ( ) ;
}


/*
 * Function: pieceSelected
 * Description: Callback function when a piece is selected on the board.
 *              It returns an array of valid destination squares for the selected piece.
 * @param {string} notationSquare - The square notation (e.g., 'e2') of the selected piece.
 * @returns {Array<number>} An array of valid destination square indices.
 */
function pieceSelected ( notationSquare )
{
    var i ,                 // Loop counter.
        movesNotation ,     // Array of possible moves in notation format.
        movesPosition = [ ] ; // Array to store valid destination square indices.

    // Get all possible moves for the selected piece, including verbose details.
    movesNotation = chess . moves ( { square : notationSquare , verbose : true } ) ;
    // Iterate through the possible moves to convert them to board positions.
    for ( i = 0 ; i < movesNotation . length ; i ++ )
    {
        // Convert the destination square notation to a numeric index.
        movesPosition . push ( ChessUtils . convertNotationSquareToIndex ( movesNotation [ i ] . to ) ) ;
    }
    return movesPosition ; // Return the list of valid destination positions.
}


/*
 * Function: updateUserInputEnabledInfo
 * Description: Updates the display to show whether user input is enabled or disabled for the board.
 */
function updateUserInputEnabledInfo ( )
{
    // Update the HTML element with the current user input status.
    $ ( '#isUserInputEnabled' ) . html ( 'User input is ' + ( board . isUserInputEnabled ( ) ? 'enabled' : 'disabled' ) ) ;
}


// Document ready function: Ensures the DOM is fully loaded before executing.
$ ( document ) . ready ( function ( )
{
    // Initialize a new Chess.js game instance.
    chess = new Chess ( ) ;
    // Initialize the Chessboard.js instance.
    board = new Chessboard ( 'board' , {
        position      : ChessUtils . FEN . startId , // Set the initial board position.
        eventHandlers : {
            onPieceSelected : pieceSelected , // Handler for when a piece is selected.
            onMove          : pieceMove       // Handler for when a piece is moved.
        }
    } ) ;

    // Attach an event listener to the reset game button.
    $ ( '#btn-reset-game' ) . click ( function ( )
    {
        resetGame ( ) ; // Call the resetGame function when the button is clicked.
    } ) ;
    // Perform an initial reset of the game.
    resetGame ( ) ;

    // --- User Input Enabled/Disabled Functionality ---
    // Update the initial status of user input.
    updateUserInputEnabledInfo ( ) ;

    // Attach click handler for the 'Enable User Input' button.
    $ ( '#btnEnableUserInput' ) . click ( function ( )
    {
        board . enableUserInput ( true ) ; // Enable user input on the board.
        updateUserInputEnabledInfo ( ) ;   // Update the display.
    } ) ;

    // Attach click handler for the 'Disable User Input' button.
    $ ( '#btnDisableUserInput' ) . click ( function ( )
    {
        board . enableUserInput ( false ) ; // Disable user input on the board.
        updateUserInputEnabledInfo ( ) ;    // Update the display.
    } ) ;

} ) ;