/*
 *  Copyright (C) 2012 Juan Lasheras (http://www.juanl.org).
 *
 *  This file is part of Quirky.
 *
 *  Quirky is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Quirky is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Quirky.  If not, see <http://www.gnu.org/licenses/>.
 */

// This file contains the client-side JavaScript logic for the Quirky game.

/**
 * @fileoverview Quirky client library - Core game logic and UI interactions.
 * @author juan.lasheras@gmail.com (Juan Lasheras)
 */

( function () {

    "use strict" ;

}() ) ;

/**
 *  Predefined pastel colors for game pieces.
 *  These are used to style the pieces displayed on the board and in the player's hand.
 */
var pastels = {
    "green"  : "#A0E7A0" , // A soft green shade
    "yellow" : "#FFFB8C" , // A light yellow shade
    "red"    : "#CD2626" , // A vibrant red shade
    "orange" : "#FFAF5A" , // A warm orange shade
    "purple" : "#FF8CB6" , // A gentle purple shade (pinkish)
    "blue"   : "#97D0F9"   // A sky blue shade
} ;

/**
 *  Unicode shapes for game pieces.
 *  These characters represent different shapes for the game pieces.
 */
var ushapes = {
    "circle"   : "&#9679;" , // Unicode character for a black circle
    "star"     : "&#10022;" , // Unicode character for a star
    "diamond"  : "&#9670;" , // Unicode character for a black diamond
    "square"   : "&#9632;" , // Unicode character for a black square
    "triangle" : "&#9650;" , // Unicode character for an upward-pointing black triangle
    "clover"   : "&#9827;"   // Unicode character for a black club suit (clover)
} ;

// Regular expressions to validate user input length.
// These prevent excessively long names or chat messages.
var NAMERE = /^.{1,12}$/ ; // Matches strings 1 to 12 characters long.
var CHATRE = /^.{1,500}$/ ; // Matches strings 1 to 500 characters long.

// Game constants.
// How long each player's turn is allowed to last, in seconds.
var COUNTDOWNTIME = 60 ; // Equivalent to 1 minute.

// Maximum number of players allowed in a single game room.
var PLAYERLMT = 6 ;

// Global state variable indicating if the current player has the turn.
// Initialized to null, updated by server responses.
var HAVETURN = null ;

// Define DOM element IDs for easier and consistent access throughout the script.
// These are jQuery selectors.
var ADDGAME     = '#add_game' ;       // Button to add a new game.
var ADDGUEST    = '#add_guest' ;      // Section/panel for adding a guest player.
var ADDGUESTFRM = '#add_guest_form' ; // Form within the add guest section.
var ADDPIECE    = '#add_piece' ;      // Button or section for adding a game piece.
var BOARD       = '#board' ;          // The main game board area.
var CHATIN      = '#chat_input' ;     // Input field for chat messages.
var CHATLOG     = '#chat_log' ;       // Display area for chat history.
var CHATPNL     = '#chat_panel' ;     // The entire chat panel.
var COUNTDOWN   = '#countdown' ;      // Display for the turn countdown timer.
var ENDTURN     = '#end_turn' ;       // Button to explicitly end a player's turn.
var ERRORS      = '#errors' ;         // Area to display error messages to the user.
var FORKME      = '#forkme' ;         // (Likely a link/banner for GitHub 'Fork Me').
var GAMEPIECES  = '#game_pieces' ;    // Display for remaining game pieces.
var GAMEROOM    = '#game_room' ;      // The main game room container.
var GAMES       = '#games_tbl' ;      // Table displaying available games.
var GAMESHR     = '#lobby_game_panel>hr' ; // Horizontal rule in the lobby game panel.
var HOWTO       = "#howto" ;          // Section displaying game instructions.
var LEAVEGAME   = '#leave_game' ;     // Button to leave the current game.
var LOADINGGAME = '#loading_game' ;   // Indicator for when a game is loading.
var LOBBY       = '#lobby' ;          // The main lobby area.
var LOBBYCHAT   = '#lobby_chat' ;     // Chat area specific to the lobby.
var NOGAMESMSG  = '#no_games' ;       // Message displayed when no games are available.
var PIECES      = '#pieces' ;         // Container for a player's available pieces.
var PLAYERS     = '#players' ;        // Display area for the list of players.
var SIDEBOARD   = '#sideboard' ;      // Player's personal sideboard area.
var TURN        = '#turn' ;           // Display for turn-related information.

// Define DOM class names for selecting groups of elements.
var GRIDCLS     = '.grid' ;     // Class for individual grid cells on the board.
var PIECECLS    = '.piece' ;    // Class for individual game pieces.
var SNAPGRIDCLS = '.snapgrid' ; // Class for grid cells where pieces can be dropped.

// Define timeout IDs for various asynchronous operations.
// These are used to clear timeouts when game state changes or actions are completed.
var DRAWCHATTID    = null ; // Timeout ID for refreshing chat log.
var GETGAMESTID    = null ; // Timeout ID for refreshing game list.
var GETPLAYERSTID  = null ; // Timeout ID for refreshing player list.
var COUNTDOWNTID   = null ; // Timeout ID for the turn countdown timer.

/**
 *  Escapes HTML special characters in a given string.
 *  This is crucial for displaying user-generated content safely, preventing XSS attacks.
 *  @param {string} str The string to escape.
 *  @returns {string} The HTML-escaped string.
 */
function esc ( str ) {

    return $( '<div/>' ).text( str ).html() ;

}

// Alias for `encodeURIComponent` for brevity when encoding URLs.
var enc = encodeURIComponent ;

/**
 *  Manages the countdown timer displayed during a player's turn.
 *  Updates the on-screen timer every second and automatically ends the turn
 *  if the time runs out.
 */
function countdownTimer () {

    $( COUNTDOWN ).html( "0m 0s" ) ; // Initialize display.

    var end_t = COUNTDOWNTIME ; // Total time for the countdown.
    var start_t = ( new Date() ).getTime() / 1000 ; // Start time in seconds.

    // Inner function for recursive countdown.
    function countdown () {

        var cur_t = ( new Date() ).getTime() / 1000 ; // Current time in seconds.
        var timeleft = ( end_t - ( cur_t - start_t ) ) ; // Calculate remaining time.

        if ( timeleft >= 0 ) {

            var min = Math.floor( timeleft / 60 ) ; // Minutes remaining.
            var sec = Math.floor( timeleft % 60 ) ; // Seconds remaining.
            $( COUNTDOWN ).html( min + "m " + sec + "s" ) ; // Update display.
            COUNTDOWNTID = setTimeout( countdown , 1000 ) ; // Schedule next update.

        } else {

            // Time has run out, send a request to end the turn.
            $.post( "/games/" + enc( $.cookie( "game" ) ) + "/players" ,
                    { end_turn : true } ,
                    function () {
                        getPlayers() ; // Refresh player data after turn ends.
                    } ) ;

        }
    }

    countdown() ; // Start the countdown immediately.

}

/*
 *  Processes player data received from the server.
 *  Updates the player list display and handles turn-related logic.
 *  @param {object} pdata JSON data containing player information from the server.
 */
function onGetPlayers ( pdata ) {

    $( PLAYERS ).empty() ; // Clear existing player list.

    // Display all players and their scores.
    for ( var p in pdata ) {

        if ( ! pdata.hasOwnProperty( p ) ) {
            continue ; // Skip inherited properties.
        }

        // Determine if the player currently has the turn for styling.
        var turn = pdata[ p ].has_turn ? "has_turn" : "" ;

        $( PLAYERS ).append( "<dt class='" + turn + "'>" + esc( p ) + "</dt>" +
                              "<dd>" + pdata[ p ].points + "</dd>" ) ;
    }

    var my_game = $.cookie( "game" ) ;     // Get current game name from cookie.
    var my_player = $.cookie( "player" ) ; // Get current player name from cookie.

    if ( my_player ) {

        if ( pdata[ my_player ] === undefined ) {
            // If player has a name but isn't in the game data, add them to the game.
            $.post( "/games/" + enc( my_game ) + "/players" , { name : my_player } ,
                    function () { getPlayers() ; } ) ;

        } else if ( HAVETURN !== pdata[ my_player ].has_turn ) {
            // If turn status has changed for the current player.
            HAVETURN = pdata[ my_player ].has_turn ; // Update global turn state.

            if ( HAVETURN ) {
                countdownTimer() ; // Start timer if it's my turn.
            } else {
                clearTimeout( COUNTDOWNTID ) ; // Stop timer if it's not my turn.
            }

            drawTurnInfo( pdata ) ; // Update UI based on turn info.
        }
    }
}

/**
 *  Fetches the latest player data from the server.
 *  Calls `onGetPlayers` to process the received data.
 */
function getPlayers () {

    $.getJSON( "/games/" + enc( $.cookie( "game" ) ) +
               "/players" , onGetPlayers ) ;

}

/**
 *  Draws the player's available pieces and updates the "It's Your Turn" information.
 *  This function is called when player data is updated.
 *  @param {object} pdata JSON data containing player information from the server.
 */
function drawTurnInfo ( pdata ) {

    var my_game = $.cookie( "game" ) ;
    var my_player = pdata[ $.cookie( "player" ) ] ;

    $( PIECES ).empty() ;    // Clear player's current hand.
    $( ADDPIECE ).show() ; // Ensure the 'add piece' button is visible.

    // Enable/disable the "End Turn" button based on current player's turn status.
    if ( my_player.has_turn ) {

        $( ENDTURN ).removeAttr( 'disabled' ) ; // Enable button.
        $( TURN ).html( "It's your turn! You have " +
                     "<span id='countdown'>0m 0s</span> left." ) ; // Update turn message.

        // Assign click handler to end turn button.
        $( ENDTURN )[ 0 ].onclick = function () {
            $.post( "/games/" + enc( my_game ) + "/players" , { end_turn : true } , function () {
                getPlayers() ; // Refresh player data.

                /*
                 *  Typically, HAVETURN is updated from the server in onGetPlayers().
                 *  However, if there's only one player, the server might not trigger a new turn
                 *  for the same player immediately. So, we force HAVETURN to false here
                 *  in this special case to correctly update the UI.
                 */
                if ( Object.keys( pdata ).length === 1 ) {
                    HAVETURN = false ;
                    clearTimeout( COUNTDOWNTID ) ;
                }
            } ) ;
        } ;

    } else {

        $( ENDTURN ).attr( 'disabled' , '' ) ; // Disable button.
        $( TURN ).html( "It's not your turn." ) ; // Update turn message.

    }

    getPiecesLeft() ; // Update the count of pieces remaining in the bag.
    getBoard() ;      // Refresh the game board display.
    getMyPieces( my_player ) ; // Draw the current player's pieces.

}

/**
 *  Adds the current player's pieces to their sideboard and makes them draggable
 *  if it's their turn.
 *  @param {object} player The player object containing their pieces.
 */
function getMyPieces ( player ) {

    // Iterate through the player's pieces and add them to the UI.
    for ( var i in player.pieces ) {

        var piece = player.pieces[ i ] ;
        $( PIECES ).append( '<div class="piece" style="color:' +
                         pastels[ piece.color ] + '">' + ushapes[ piece.shape ] + '</div>' ) ;

        // Store piece data directly on the DOM element for later retrieval.
        $( PIECECLS + ":last-child" ).data( "piece" , piece ) ;

        // Add a small float div for spacing between pieces.
        $( PIECES ).append( "<div style='float: left; margin: 3px'></div>" ) ;

    }

    // Function to set dimensions and font size for pieces based on grid size.
    function setDimensions () {

        $( PIECECLS ).width( $( GRIDCLS ).width() ) ;
        $( PIECECLS ).height( $( GRIDCLS ).height() ) ;

        var fontsize = $( GRIDCLS ).css( "font-size" ) ;
        $( PIECECLS ).css( "font-size" , fontsize ) ;
        $( PIECECLS ).css( "line-height" , fontsize ) ;

    }

    /*
     *  Style switching can be flaky due to timing issues. The width of GRIDCLS
     *  might not be fully set when setDimensions() is first called.
     *  A short delay ensures styles are applied correctly after rendering.
     */
    setDimensions() ;
    setTimeout( setDimensions , 250 ) ; // Re-apply dimensions after a short delay.

    // If it's the player's turn, make their pieces draggable.
    if ( player.has_turn ) {

        $( PIECECLS ).draggable( {
            containment : "#board" , // Restrict dragging within the board area.
            snap        : ".snapgrid" // Snap to droppable grid cells.
        } ) ;

    }

}

/**
 *  Publishes the total number of pieces remaining in the game's "bag".
 *  Fetches data from the server and updates the UI.
 */
function getPiecesLeft () {

    $.getJSON( "/games/" + enc( $.cookie( "game" ) ) +
              "/pieces" , function ( data ) {

        $( GAMEPIECES ).empty() ; // Clear current display.
        var npieces = 0 ;         // Counter for total pieces.

        // Sum up the counts of all different pieces.
        for ( var i in data ) {
            npieces += data[ i ].count ;
        }

        $( GAMEPIECES ).html( npieces ) ; // Update UI with total count.

    } ) ;

}

/**
 *  Callback function executed when a piece is dropped onto the board.
 *  Sends a POST request to the server to add the piece to the board.
 *  Handles success and error responses, updating the UI accordingly.
 *  @param {event} event The drop event object.
 *  @param {object} ui The UI object from jQuery UI draggable/droppable.
 */
function onPieceDrop ( event , ui ) {

    var col = $( this ).data().col ;     // Column of the grid cell where piece was dropped.
    var row = $( this ).data().row ;     // Row of the grid cell where piece was dropped.
    var piece = $( ui.draggable ).data().piece ; // Data of the draggable piece.

    $.ajax( {
        type    : 'POST' , // HTTP method.
        url     : "/games/" + enc( $.cookie( "game" ) ) + "/board" , // API endpoint.
        data    : {
            shape  : piece.shape ,
            color  : piece.color ,
            row    : row ,
            column : col
        } ,
        success : function () {
            $( ERRORS ).empty() ; // Clear any previous error messages.
        } ,
        error   : function ( jqXHR , textStatus , errorThrown ) {
            $( ERRORS ).empty() ; // Clear old errors.
            // Display new error message from server response.
            $( ERRORS ).append( "<div class='error'>&#9888; " + jqXHR.responseText + "</div>" ) ;
        } ,
        complete : function () {
            // Always refresh player and board info after an attempt to place a piece.
            $.getJSON( "/games/" + enc( $.cookie( "game" ) ) +
                      "/players" , drawTurnInfo ) ;
        }
    } ) ;

}

/**
 *  Draws the game board.
 *  Fetches board dimensions and piece placements from the server,
 *  then renders the grid and existing pieces.
 */
function getBoard () {

    var game = $.cookie( "game" ) ; // Get current game name.
    var board_margin = 5 ;          // Extra margin for board expansion.

    // First, get board dimensions to calculate grid layout.
    $.getJSON( "/games/" + enc( game ) + "/dimensions" , function ( data ) {

        var dimensions = data ;
        // Add margin to dimensions to allow for new piece placements around existing ones.
        var top    = dimensions.top - board_margin ;
        var bottom = dimensions.bottom + board_margin ;
        var left   = dimensions.left - board_margin ;
        var right  = dimensions.right + board_margin ;

        $( BOARD ).empty() ; // Clear the board before redrawing.

        var rows = bottom - top + 1 ; // Total rows in the expanded grid.
        var cols = right - left + 1 ; // Total columns in the expanded grid.

        // Create grid cells for the board.
        for ( var i = 0 ; i < rows ; i ++ ) {
            for ( var j = 0 ; j < cols ; j ++ ) {
                $( BOARD ).append( '<div class="grid"></div>' ) ;
                // Store grid coordinates in data attributes for each cell.
                $( GRIDCLS + ":last-child" ).data(
                    "col" , ( j + left ) ).data( "row" , ( top + i ) ) ;
            }
        }

        // The commented out section below suggests an attempt to make the board square,
        // but it's currently inactive.
        // if ($(BOARD).width() < $(BOARD).height()) {
        //     $(BOARD).height($(BOARD).width());
        // } else {
        //     $(BOARD).width($(BOARD).height());
        // }

        // Set CSS for grid cells to distribute them evenly.
        $( GRIDCLS ).css( "width" , ( 100 / cols ) + "%" ) ;
        $( GRIDCLS ).css( "height" , ( 100 / rows ) + "%" ) ;

        // Calculate font size for pieces based on grid cell dimensions.
        var fontsize = Math.min( $( GRIDCLS ).height() , $( GRIDCLS ).width() ) ;
        $( GRIDCLS ).css( "font-size" , fontsize ) ;

        // Another commented out section, likely for fixed board sizing.
        // $(BOARD).css("width", (($(GRIDCLS).width()) * 10))
        // $(BOARD).css("height", (($(GRIDCLS).height()) * 10))

        // Now, get the actual pieces placed on the board.
        $.getJSON( "/games/" + enc( game ) + "/board" , function ( data ) {

            var i , idx ;
            // Place existing pieces on the board.
            if ( data.length > 0 ) {

                for ( i in data ) {

                    var piece = data[ i ].piece ;
                    var row = data[ i ].row ;
                    var col = data[ i ].column ;

                    // Calculate display row/column based on expanded dimensions.
                    var drow = row - dimensions.top + board_margin ;
                    var dcol = col - dimensions.left + board_margin ;
                    idx = drow * cols + dcol + 1 ; // Calculate 1-based index for nth-child.

                    // Style the grid cell with the piece.
                    $( GRIDCLS + ":nth-child(" + idx + ")" ).addClass( "boardpiece" ) ;
                    $( GRIDCLS + ":nth-child(" + idx + ")" ).css( "color" ,
                                                      pastels[ piece.color ] ) ;
                    $( GRIDCLS + ":nth-child(" + idx + ")" ).html( ushapes[ piece.shape ] ) ;

                }

                // Adjust line-height for pieces to center them vertically.
                $( ".boardpiece" ).css( "line-height" , fontsize + "px" ) ;

            } else {
                // If the board is empty, place a snapgrid marker in the center.
                idx = parseInt( ( $( GRIDCLS ).length + 1 ) / 2 , 10 ) ;
                $( GRIDCLS + ":nth-child(" + idx + ")" ).addClass( 'snapgrid' ) ;
            }

            // Iterate through the board to mark spots adjacent to existing pieces as 'snapgrid'.
            if ( data.length > 0 ) {

                var offsets = [ 1 , -1 , cols , -cols ] ; // Offsets for adjacent cells (horizontal/vertical).

                for ( i = 1 ; i <= $( GRIDCLS ).length ; i ++ ) {

                    var cur = $( GRIDCLS + ":nth-child(" + i + ")" ) ; // Current grid cell.

                    for ( var j in offsets ) {

                        var next = $( GRIDCLS + ":nth-child(" + ( i + offsets[ j ] ) + ")" ) ; // Adjacent cell.

                        // If current cell is empty and adjacent cell has a piece, make current cell a snapgrid.
                        if ( ! cur.hasClass( "boardpiece" ) &&
                            next.hasClass( "boardpiece" ) ) {
                            cur.addClass( "snapgrid" ) ;
                        }

                    }
                }
            }

            // Configure droppable behavior for snapgrid cells.
            $( SNAPGRIDCLS ).droppable( {
                accept     : PIECECLS , // Only accept elements with the 'piece' class.
                activate   : function ( event , ui ) {
                    // When dragging starts, show a visual indicator on snapgrid cells.
                    $( SNAPGRIDCLS ).html( "&middot;" ) ;
                    $( BOARD ).addClass( "activate" ) ; // Add class to board for visual feedback.
                } ,
                deactivate : function ( event , ui ) {
                    // When dragging ends, clear the visual indicator.
                    $( SNAPGRIDCLS ).html( "" ) ;
                    $( BOARD ).removeClass( "activate" ) ; // Remove board class.
                } ,
                drop       : onPieceDrop // Call onPieceDrop when a piece is successfully dropped.
            } ) ;

        } ) ;

    } ) ;

}

/**
 *  Displays the game play instructions panel.
 *  Hides the lobby and shows the "How To Play" section.
 */
function drawHowTo () {

    $( LOBBY ).hide() ; // Hide the lobby UI.
    $( HOWTO ).show() ; // Show the instructions UI.

}

/**
 *  Draws the chat input area and sets up its functionality.
 *  Handles submitting chat messages to the server.
 */
function drawChatIn () {

    $( CHATIN ).show() ; // Ensure the chat input is visible.

    // Function to handle chat message submission.
    function submit () {

        var chatin = $( CHATIN + "> input" )[ 0 ].value ; // Get message text.

        // Validate chat message length.
        if ( ! CHATRE.test( chatin ) ) {

            if ( chatin ) {
                alert( "Your input text is too long!" ) ; // Alert if too long.
            }

            return false ; // Prevent submission.
        }

        var game = $.cookie( "game" ) ; // Get current game name.
        var resource ;                  // API endpoint for chat.

        if ( game ) {
            resource = "/games/" + enc( game ) + "/chat" ; // Game-specific chat.
        } else {
            resource = "/chat" ; // Lobby chat.
        }

        // Send chat message to the server.
        $.post( resource , {
            input : chatin ,
            name  : $.cookie( "player" ) // Include player name.
        } , function () {
            $( CHATIN + "> input" ).val( '' ) ; // Clear input field on success.
            drawChatLog() ; // Refresh chat log to show new message.
        } ) ;

    }

    $( CHATIN + "> button" ).click( submit ) ; // Attach submit to button click.
    $( CHATIN + "> input:visible" ).focus() ;   // Focus on the input field.

    // Attach submit to 'Enter' key press in the input field.
    $( CHATIN + "> input" ).keydown( function ( event ) {
        if ( event.keyCode === 13 ) { // Key code for Enter.
            submit() ;
        }
    } ) ;

}

/**
 *  Draws the "Add Guest" widget, allowing users to enter a player name.
 *  Sets a player cookie upon submission and then reloads the main application.
 */
function drawAddGuest () {

    $( ADDGUEST ).show() ; // Make the add guest section visible.

    // Function to handle guest name submission.
    function submit () {

        var name = $( ADDGUESTFRM + "> input" )[ 0 ].value ; // Get player name.

        // Validate player name length.
        if ( ! NAMERE.test( name ) ) {

            if ( name ) {
                alert( "Your input text is too long!" ) ; // Alert if too long.
            }

            return false ; // Prevent submission.
        }

        $.cookie( "player" , name ) ; // Set the player name as a cookie.
        main() ; // Reload the main application to reflect the new player.

    }

    $( ADDGUESTFRM + "> button" ).click( submit ) ; // Attach submit to button click.
    $( ADDGUESTFRM + "> input:visible" ).focus() ;   // Focus on the input field.

    // Attach submit to 'Enter' key press in the input field.
    $( ADDGUESTFRM + "> input" ).keydown( function ( event ) {
        if ( event.keyCode === 13 ) { // Key code for Enter.
            submit() ;
        }
    } ) ;

}

/**
 *  Draws the chat log by fetching new messages from the server.
 *  This is implemented as a closure to maintain state about the last received message ID,
 *  preventing redundant message fetching.
 */
var drawChatLog = ( function () {

    var lastids = {} ; // Stores the last message ID for each chat resource.

    return function () {

        var my_player = $.cookie( "player" ) ; // Current player name.
        var my_game = $.cookie( "game" ) ;     // Current game name.

        // Determine the correct chat API endpoint.
        var uri = my_game ? '/games/' + enc( my_game ) + '/chat' : '/chat' ;

        // Fetch chat messages, sending the last known ID to get only new messages.
        $.getJSON( uri , { lastid : lastids[ uri ] } , function ( data ) {

            if ( $.isEmptyObject( data ) ) {
                // If server returns an empty object, there are no new messages.
                return ;
            }

            // Append new messages to the chat log.
            for ( var i = 0 ; i < data.length ; i ++ ) {

                var name = data[ i ].name ;
                // Style messages differently based on whether they are from the current player.
                var msgcls = ( name === my_player ) ? "mymsg" : "othermsg" ;

                $( CHATLOG ).prepend( '<div><span class="' + msgcls + '">' +
                                   esc( data[ i ].name ) + '</span>: ' +
                                   esc( data[ i ].input ) + '</div>' ) ;

            }

            // Update the last known message ID for this URI.
            lastids[ uri ] = data[ i - 1 ] ? data[ i - 1 ].id : undefined ;

        } ) ;

    } ;

}() ) ; // Immediately invoke the closure to create the `drawChatLog` function.

/**
 *  Draws the list of available games in the lobby.
 *  @param {object} games An object containing game data.
 */
function drawGameList ( games ) {

    $( GAMES ).empty() ; // Clear the existing game list table.

    // Define the table header.
    var thead = "<th>Game Room</th><th>Players</th><th></th>" ;

    // Iterate through the games and add them to the table.
    for ( var i in games ) {

        if ( ! games.hasOwnProperty( i ) ) {
            continue ; // Skip inherited properties.
        }

        var name = games[ i ].name ; // Get game name.