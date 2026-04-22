// This file contains logic for a simple game using WebSockets.

// Connection details for the messaging system.
var serverEndpoint = "ws://0.0.0.0:61614/stomp";

// Default authentication details for the messaging service.
var userCred, passCred = "guest";

// Variables for managing the STOMP session and communication channels.
var stompSession, incomingChannel, outgoingChannel;

// Flags to track if each player has made their move in the current round.
var playerOneTurnDone, playerTwoTurnDone = false;

// HTML markup for the adversary's choice buttons, and a variable to hold their specific selection.
var rivalActionButtonsHtml = '<button id="foeStoneBtn" name="stone" disabled="disabled">Rock</button>' + '<button id="foeLeafBtn" name="leaf" disabled="disabled">Paper</button>' + '<button id="foeShearsBtn" name="shears" disabled="disabled">Scissors</button>';
var rivalSelectionId;

// References to the local player's action buttons.
var stoneButton, leafButton, shearsButton;

// Document ready handler to perform initial browser capability check.
$( document ).ready( function() {
    if ( !window.WebSocket ) {
        var notificationText = "Your web browser lacks WebSocket support. This demonstration will not function correctly.";
        $("#userEntryFields").css( "visibility", "hidden" );
        $("#directives").css( "visibility", "visible" );
        $("#directives").html( notificationText );
    }
} );

// Function to kick off the game once player names are submitted.
var initiateMatch = function() {

    // Disable the name input fields to prevent further changes.
    $("#myIdentity").attr( "disabled", "disabled" );
    $("#rivalIdentity").attr( "disabled", "disabled" );
    $("#launchButton").attr( "disabled", "disabled" );

    // Make the game instructions and action buttons visible to the user.
    $("#directives").css( "visibility", "visible" );
    $("#actionControls").css( "visibility", "visible" );

    // Define the communication channels based on the player names.
    outgoingChannel = "/queue/" + $( "#rivalIdentity" ).val();
    incomingChannel = "/queue/" + $( "#myIdentity" ).val();

    // Proceed to establish the WebSocket connection.
    establishConnection();
};

// Establishes the STOMP connection to the message broker.
var establishConnection = function() {
    stompSession = Stomp.client( serverEndpoint );
    stompSession.connect( userCred, passCred, onConnectionSuccess, onConnectionFailure );
};

// Callback function executed upon successful connection to the STOMP broker.
var onConnectionSuccess = function() {
    console.log( "Successfully linked to " + serverEndpoint );
    stompSession.subscribe( incomingChannel, function( incomingMessage ) {
        console.log( "Incoming data: " + incomingMessage.body );
        // The received message signifies the adversary has made their move.
        // We prepare their buttons. If the local player hasn't moved yet,
        // we keep the adversary's buttons hidden until the local player acts.
        playerTwoTurnDone = true;
        if ( !playerOneTurnDone ) {
            $( "#rivalActionControls" ).css( "visibility", "hidden" );
            $( "#directives" ).html( "<p>Your adversary awaits your decision. Make your move!</p>" );
        } else {
            $( "#directives" ).html( "<p>Match Outcome:</p>" );
            stompSession.disconnect( function() {
                console.log( "Connection terminated..." );
            } )
        }
        $( "#rivalActionControls" ).html( rivalActionButtonsHtml );
        switch ( incomingMessage.body ) {
            case "stone" :
                rivalSelectionId = "#foeStoneBtn";
                break;
            case "leaf" :
                rivalSelectionId = "#foeLeafBtn";
                break;
            case "shears" :
                rivalSelectionId = "#foeShearsBtn";
                break;
        }
        $( rivalSelectionId ).css( "background-color", "yellow" );
    } );
    console.log( "Subscribed to channel: " + incomingChannel );
};

// Callback for handling connection errors.
var onConnectionFailure = function( issue ) {
    console.log( issue );
};

// Function invoked when a player's action button is clicked.
var playerActionChosen = function( actionElement ) {
    stompSession.send( outgoingChannel, null, actionElement.name );
    playerOneTurnDone = true;
    console.log( "Data dispatched: " + actionElement.name );

    // Highlight the selected button for the local player.
    // Disable all local player buttons to prevent re-selection.
    $( "#" + actionElement.id ).css( "background-color", "orange" );
    $( "#stoneButton" ).attr( "disabled", "disabled" );
    $( "#leafButton" ).attr( "disabled", "disabled" );
    $( "#shearsButton" ).attr( "disabled", "disabled" );

    // Check if the opponent has already made their move.
    // If so, display their buttons and the results.
    if ( playerTwoTurnDone ) {
        $( "#rivalActionControls" ).css( "visibility", "visible" );
        $( "#directives" ).html( "<p>Match Outcome:</p>" );
        stompSession.disconnect( function() {
            onConnectionFailure = function() {
            }; // Clear any previous error handler
            console.log( "Disconnected from service..." );
        } );
    } else {
        $( "#directives" ).html( "<p>Awaiting adversary's move...</p>" );
    }
};