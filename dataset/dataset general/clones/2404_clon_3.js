// Core license information for the software components utilized.
// This code is distributed under the terms of the Apache License, Version 2.0.
// For full details, refer to http://www.apache.org/licenses/LICENSE-2.0.

// A simple demonstration of WebSocket functionality for a game.

// WebSocket endpoint for the STOMP broker.
const stompServiceUrl = "ws://0.0.0.0:61614/stomp";

// Credentials for broker access.
const connectionUser = "guest";
const connectionSecret = "guest";

// Global instances and state trackers.
let stompClientInstance;
let incomingMessageQueue;
let outgoingMessageQueue;

// Flags indicating player action status.
let localPlayerActed = false;
let rivalPlayerActed = false;

// HTML structure for the opponent's choice buttons.
const rivalChoiceButtonsMarkup = `
    <button id="rivalRockButton" name="rock" disabled>Stone</button>
    <button id="rivalPaperButton" name="paper" disabled>Scroll</button>
    <button id="rivalScissorsButton" name="scissors" disabled>Shears</button>
`;
let selectedRivalOptionId; // Stores the ID of the rival's chosen button.

// DOM element references (for cleaner access).
let domElements = {};

// Helper to update visibility of a DOM element.
const setElementVisibility = (element, isVisible) => {
    $(element).css("visibility", isVisible ? "visible" : "hidden");
};

// Ensures the browser supports WebSockets upon document load.
$(document).ready(function() {
    domElements.nameEntryArea = $("#nameFields");
    domElements.statusDisplay = $("#instructions");
    domElements.playerControls = $("#buttons");
    domElements.rivalControls = $("#opponentsButtons");
    domElements.localPlayerNameInput = $("#myName");
    domElements.rivalPlayerNameInput = $("#opponentName");
    domElements.initiateGameButton = $("#goBtn");

    if (!window.WebSocket) {
        const compatibilityMessage = "Your web browser lacks WebSocket support. Game functionality will be impaired.";
        setElementVisibility(domElements.nameEntryArea, false);
        setElementVisibility(domElements.statusDisplay, true);
        domElements.statusDisplay.html(`<p class="error-msg">${compatibilityMessage}</p>`);
        // Early exit if no WebSocket support.
        return;
    }
    // Initialize buttons for the current player for later use.
    domElements.localRockButton = $("#rockBtn");
    domElements.localPaperButton = $("#paperBtn");
    domElements.localScissorsButton = $("#scissorsBtn");
});

// Kicks off the game after player names are submitted.
const commenceMatch = function() {
    // Basic validation for player names.
    const playerOneName = domElements.localPlayerNameInput.val().trim();
    const playerTwoName = domElements.rivalPlayerNameInput.val().trim();

    if (!playerOneName || !playerTwoName) {
        domElements.statusDisplay.html('<p class="warning-msg">Please enter names for both players to start.</p>');
        return; // Guard clause: prevent game start without names.
    }

    // Lock down name input fields and the start button.
    domElements.localPlayerNameInput.prop("disabled", true);
    domElements.rivalPlayerNameInput.prop("disabled", true);
    domElements.initiateGameButton.prop("disabled", true);

    // Reveal game instructions and controls.
    setElementVisibility(domElements.statusDisplay, true);
    setElementVisibility(domElements.playerControls, true);

    // Define message queues based on player names.
    outgoingMessageQueue = `/queue/${playerTwoName}`;
    incomingMessageQueue = `/queue/${playerOneName}`;

    // Proceed to establish the STOMP connection.
    establishSocketConnection();
};

// Sets up the STOMP WebSocket connection.
const establishSocketConnection = function() {
    stompClientInstance = Stomp.client(stompServiceUrl);
    stompClientInstance.connect(connectionUser, connectionSecret, handleConnectionSuccess, handleConnectionFailure);
};

// Callback for a successful STOMP connection.
const handleConnectionSuccess = function() {
    console.info(`Connection established to: ${stompServiceUrl}`);

    // Subscribe to the incoming message queue.
    stompClientInstance.subscribe(incomingMessageQueue, function(msgEnvelope) {
        console.log(`Incoming message received: ${msgEnvelope.body}`);

        // The rival has made their move.
        rivalPlayerActed = true;

        // Determine the rival's choice and highlight it.
        const rivalChoiceMap = {
            "rock": "#rivalRockButton",
            "paper": "#rivalPaperButton",
            "scissors": "#rivalScissorsButton"
        };
        selectedRivalOptionId = rivalChoiceMap[msgEnvelope.body];

        // Update UI based on game state.
        if (!localPlayerActed) {
            setElementVisibility(domElements.rivalControls, false);
            domElements.statusDisplay.html("<p>Your opponent is awaiting your decision. Make your move!</p>");
        } else {
            domElements.statusDisplay.html("<p>Game Round Complete!</p>");
            // Disconnect if both players have acted.
            stompClientInstance.disconnect(() => console.log("Disconnected after round completion."));
        }

        // Render and highlight the rival's choices.
        domElements.rivalControls.html(rivalChoiceButtonsMarkup);
        $(selectedRivalOptionId).css("background-color", "yellow");
    });
    console.info(`Subscription active for: ${incomingMessageQueue}`);
};

// Callback for connection errors.
const handleConnectionFailure = function(connectionError) {
    console.error("STOMP connection error:", connectionError);
    domElements.statusDisplay.html(`<p class="error-msg">Connection failed: ${connectionError.headers ? connectionError.headers.message : connectionError}</p>`);
    // Potentially re-enable input fields or offer retry.
    domElements.localPlayerNameInput.prop("disabled", false);
    domElements.rivalPlayerNameInput.prop("disabled", false);
    domElements.initiateGameButton.prop("disabled", false);
};

// Handles a player's choice.
const processPlayerChoice = function(chosenButton) {
    // Send the player's choice to the rival.
    stompClientInstance.send(outgoingMessageQueue, {}, chosenButton.name);
    localPlayerActed = true;
    console.log(`Player selected: ${chosenButton.name}`);

    // Visually indicate the player's choice and disable further actions.
    $(`#${chosenButton.id}`).css("background-color", "orange");
    domElements.localRockButton.prop("disabled", true);
    domElements.localPaperButton.prop("disabled", true);
    domElements.localScissorsButton.prop("disabled", true);

    // Check if the rival has already made a move.
    if (rivalPlayerActed) {
        setElementVisibility(domElements.rivalControls, true);
        domElements.statusDisplay.html("<p>Round Outcome:</p>");
        // Disconnect after both players have acted.
        stompClientInstance.disconnect(function() {
            // Suppress error logging during intentional disconnect.
            stompClientInstance.onerror = function() {};
            console.log("Session concluded. Disconnecting...");
        });
    } else {
        domElements.statusDisplay.html("<p>Awaiting opponent's decision...</p>");
    }
};