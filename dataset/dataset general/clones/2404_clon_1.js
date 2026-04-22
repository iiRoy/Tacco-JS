// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// This file demonstrates a simple WebSocket-based game.
// It uses STOMP over WebSockets.

// STOMP connection URL for ActiveMQ
var url = "ws://0.0.0.0:61614/stomp";


// ActiveMQ user credentials: username and password.
// Default for both is "guest".
var un, pw = "guest";


// Client object, source and destination queues for STOMP messages.
var client, src, dest;


// Flags to track if users have made their choices.
var hasUserPicked, hasOpponentPicked = false;


// HTML string for the opponent's choice buttons.
// These are initially disabled.
var opponentsBtns = '<button id="opponentRockBtn" name="opponentRock" disabled="disabled">Rock</button>'
    + '<button id="opponentPaperBtn" name="opponentPaper" disabled="disabled">Paper</button>'
    + '<button id="opponentScissorsBtn" name="opponentScissors" disabled="disabled">Scissors</button>';

// Variable to store the opponent's selected button ID.
var opponentsPick;


// References to the user's three choice buttons.
var rockBtn, paperBtn, scissorsBtn;


// Document ready handler to check for WebSocket support and initialize UI.
$( document ).ready( function ( ) {

    // Check if the browser supports WebSocket API.
    if ( ! window.WebSocket ) {

        // If not supported, prepare an error message.
        var msg = "Your browser does not have WebSocket support. This example will not work properly.";

        // Hide name input fields.
        $( "#nameFields" ).css( "visibility", "hidden" );

        // Make instructions visible.
        $( "#instructions" ).css( "visibility", "visible" );

        // Display the error message.
        $( "#instructions" ).html( msg );
    }
} );


// Function to start the game after player names are submitted.
var startGame = function ( ) {

    // Disable name input fields to prevent further changes.
    $( "#myName" ).attr( "disabled", "disabled" );
    $( "#opponentName" ).attr( "disabled", "disabled" );
    $( "#goBtn" ).attr( "disabled", "disabled" );

    // Make game instructions and choice buttons visible.
    $( "#instructions" ).css( "visibility", "visible" );
    $( "#buttons" ).css( "visibility", "visible" );

    // Define STOMP destination and source queues based on player names.
    dest = "/queue/" + $( "#opponentName" ).val( );
    src = "/queue/" + $( "#myName" ).val( );

    // Establish the STOMP connection.
    connect( );
};


// Function to establish the STOMP connection to the broker.
var connect = function ( ) {

    client = Stomp.client( url ); // Initialize STOMP client.

    // Connect to the STOMP broker.
    client.connect( un, pw, onconnect, onerror );
};


// Callback function invoked upon successful connection to the STOMP broker.
var onconnect = function ( ) {

    console.log( "connected to " + url ); // Log successful connection.

    // Subscribe to the user's personal queue for incoming messages.
    client.subscribe( src, function ( message ) {
        console.log( "message received: " + message.body );

        // A message indicates the opponent has made a move.
        // Update the state accordingly.
        hasOpponentPicked = true;

        // If the local user hasn't picked yet, hide opponent's buttons temporarily.
        if ( ! hasUserPicked ) {
            $( "#opponentsButtons" ).css( "visibility", "hidden" );
            $( "#instructions" ).html( "<p>Your opponent is waiting for you. Make your move!</p>" );
        }
        else {
            // Both players have picked, display results.
            $( "#instructions" ).html( "<p>Results:</p>" );

            // Disconnect from the STOMP broker.
            client.disconnect( function ( ) {
                console.log( "Disconnected..." );
            } )
        }

        // Render the opponent's buttons.
        $( "#opponentsButtons" ).html( opponentsBtns );

        // Determine opponent's pick based on message body.
        switch ( message.body ) {
            case "rock"     :
                opponentsPick = "#opponentRockBtn";
                break;
            case "paper"    :
                opponentsPick = "#opponentPaperBtn";
                break;
            case "scissors" :
                opponentsPick = "#opponentScissorsBtn";
                break;
        }

        // Highlight the opponent's chosen button.
        $( opponentsPick ).css( "background-color", "yellow" );
    } );
    console.log( "subscribed to " + src ); // Log subscription status.
};


// Callback function invoked if connection fails or encounters an error.
var onerror = function ( error ) {
    console.log( error ); // Log the error message.
};


// Function triggered when a user's choice button is clicked.
var buttonClicked = function ( btn ) {

    // Send the user's choice to the opponent's queue.
    client.send( dest, null, btn.name );

    hasUserPicked = true; // Mark that this user has picked.

    console.log( "message sent: " + btn.name ); // Log the sent message.


    // Highlight the user's chosen button.
    $( "#" + btn.id ).css( "background-color", "orange" );

    // Disable all user choice buttons to prevent changing the vote.
    $( "#rockBtn" ).attr( "disabled", "disabled" );
    $( "#paperBtn" ).attr( "disabled", "disabled" );
    $( "#scissorsBtn" ).attr( "disabled", "disabled" );

    // Check if the opponent has already made their move.
    if ( hasOpponentPicked ) {

        // If opponent has picked, display their buttons and show results.
        $( "#opponentsButtons" ).css( "visibility", "visible" );
        $( "#instructions" ).html( "<p>Results:</p>" );

        // Disconnect from the STOMP broker.
        client.disconnect( function ( ) {

            // Overwrite onerror to prevent logging disconnect as an error.
            onerror = function ( ) {
            };
            console.log( "Disconnected..." );
        } );
    } else {
        // If opponent hasn't picked yet, display a waiting message.
        $( "#instructions" ).html( "<p>Waiting for opponent...</p>" );
    }
};