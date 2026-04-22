// This file is part of the "BoardGameForge" project.
//
// Copyright (C) 2023 [Your Name/Organization].
//
// BoardGameForge is free software: you can redistribute it and/or modify
// it under the terms of the MIT License.
//
// A copy of the MIT License should have been provided with this software.
// If not, see <https://opensource.org/licenses/MIT>.

/**
 * @fileoverview Client-side library for the BoardGameForge application.
 * @author [Your Name/Email]
 */

(function gameClientModule() {
    "use strict";

    // Configuration for visual elements and game rules
    const colorPalette = new Map([
        ["emerald", "#82E0AA"],
        ["sunshine", "#F7DC6F"],
        ["crimson", "#CB4335"],
        ["tangerine", "#F5B041"],
        ["lavender", "#AF7AC5"],
        ["sky", "#5DADE2"]
    ]);

    const glyphSet = new Map([
        ["disk", "&#9679;"],
        ["starfish", "&#10022;"],
        ["rhombus", "&#9670;"],
        ["block", "&#9632;"],
        ["peak", "&#9650;"],
        ["trefoil", "&#9827;"]
    ]);

    // Regular expressions for input validation
    const playerNamePattern = /^[a-zA-Z0-9_ -]{2,15}$/; // Min 2, max 15 chars, allow spaces and hyphens
    const messageContentPattern = /^.{1,600}$/; // Max 600 characters

    // Game timing and limits
    const turnDurationSeconds = 75; // Increased turn time
    const maxGameParticipants = 8; // Increased player limit
    let currentTurnStatus = null; // Tracks if the local player has the current turn

    // DOM element selectors using data attributes for robust selection
    const uiElements = {
        gameCreationBtn: '[data-ui-element="game-creation-btn"]',
        playerJoinBtn: '[data-ui-element="player-join-btn"]',
        playerJoinForm: '[data-ui-element="player-join-form"]',
        piecePlacementBtn: '[data-ui-element="piece-placement-btn"]',
        gameBoardArea: '[data-ui-element="game-board-area"]',
        chatInputBox: '[data-ui-element="chat-input-box"]',
        chatHistoryLog: '[data-ui-element="chat-history-log"]',
        chatPanelContainer: '[data-ui-element="chat-panel-container"]',
        turnTimerDisplay: '[data-ui-element="turn-timer-display"]',
        endTurnActionBtn: '[data-ui-element="end-turn-action-btn"]',
        errorDisplayArea: '[data-ui-element="error-display-area"]',
        githubLink: '[data-ui-element="github-link"]', // Renamed FORKME
        playerPiecesArea: '[data-ui-element="player-pieces-area"]',
        gameRoomView: '[data-ui-element="game-room-view"]',
        gameListTable: '[data-ui-element="game-list-table"]',
        gameListSeparator: '[data-ui-element="lobby-game-panel"] > hr', // Keep specific selector for now
        instructionsModal: '[data-ui-element="instructions-modal"]', // Renamed HOWTO
        leaveGameBtn: '[data-ui-element="leave-game-btn"]',
        loadingGameIndicator: '[data-ui-element="loading-game-indicator"]',
        lobbyView: '[data-ui-element="lobby-view"]',
        lobbyChatArea: '[data-ui-element="lobby-chat-area"]',
        noGamesMessage: '[data-ui-element="no-games-message"]',
        playerHandDisplay: '[data-ui-element="player-hand-display"]', // Renamed PIECES
        playerScoreboard: '[data-ui-element="player-scoreboard"]', // Renamed PLAYERS
        sidePanel: '[data-ui-element="side-panel"]', // Renamed SIDEBOARD
        turnInfoMessage: '[data-ui-element="turn-info-message"]' // Renamed TURN
    };

    // DOM class names
    const gridCellClass = 'grid-cell'; // Renamed GRIDCLS
    const gamePieceClass = 'game-piece'; // Renamed PIECECLS
    const snapTargetClass = 'snap-target'; // Renamed SNAPGRIDCLS

    // Timer IDs for managing asynchronous operations
    let chatLogRefreshTimer = null;
    let gameListRefreshTimer = null;
    let playerListRefreshTimer = null;
    let turnCountdownInterval = null; // Changed to interval

    /**
     * Sanitizes a string for HTML display to prevent XSS.
     * @param {string} rawString - The string to sanitize.
     * @returns {string} The HTML-safe string.
     */
    function sanitizeHtml(rawString) {
        if (typeof rawString !== 'string') {
            console.warn("sanitizeHtml received non-string input:", rawString);
            return ''; // Return empty string for invalid input
        }
        const tempDiv = document.createElement('div');
        tempDiv.textContent = rawString;
        return tempDiv.innerHTML;
    }

    const uriEncoder = encodeURIComponent;

    /**
     * Manages the turn countdown timer displayed on screen.
     * Ends the turn automatically if time runs out.
     */
    function initiateTurnTimer() {
        const timerElement = $(uiElements.turnTimerDisplay);
        timerElement.html("00:00"); // Start with double zero format
        let remainingSeconds = turnDurationSeconds;

        // Clear any existing interval to prevent multiple timers
        if (turnCountdownInterval) {
            clearInterval(turnCountdownInterval);
        }

        turnCountdownInterval = setInterval(() => {
            if (remainingSeconds >= 0) {
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                timerElement.html(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
                remainingSeconds--;
            } else {
                clearInterval(turnCountdownInterval);
                timerElement.html("00:00"); // Ensure it shows 00:00 after timeout
                // Automatically end turn via server call
                $.post(`/game-sessions/${uriEncoder($.cookie("activeGameId"))}/player-actions`,
                       { action: "end_turn_timeout" }, () => {
                    fetchPlayerStatus(); // Refresh player data after turn ends
                }).fail((jqXHR) => {
                    displayUserError("Failed to end turn automatically: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
                });
            }
        }, 1000);
    }

    /**
     * Processes player data received from the server and updates the UI.
     * @param {object} playerData - JSON data representing players in the current game.
     */
    function handlePlayerUpdate(playerData) {
        const playerBoard = $(uiElements.playerScoreboard);
        playerBoard.empty();

        // Guard clause for empty player data
        if ($.isEmptyObject(playerData)) {
            playerBoard.append("<p class='no-players-msg'>No participants yet.</p>");
            return;
        }

        // Display all players and their scores
        Object.keys(playerData).forEach(playerKey => {
            const playerDetails = playerData[playerKey];
            const turnIndicator = playerDetails.is_active_turn_holder ? "active-player" : "";
            playerBoard.append(`<dt class='${turnIndicator}'>${sanitizeHtml(playerKey)}</dt>` +
                               `<dd>${playerDetails.score}</dd>`);
        });

        const activeGameId = $.cookie("activeGameId");
        const localPlayerName = $.cookie("localPlayerId");

        // If a local player is identified, check their status
        if (localPlayerName) {
            const localPlayerDetails = playerData[localPlayerName];
            if (!localPlayerDetails) {
                // Local player name exists but not in the game, attempt to re-add
                $.post(`/game-sessions/${uriEncoder(activeGameId)}/player-actions`,
                       { action: "join_game", playerName: localPlayerName },
                       () => { fetchPlayerStatus(); })
                    .fail((jqXHR) => {
                        displayUserError("Could not rejoin game: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
                    });
            } else if (currentTurnStatus !== localPlayerDetails.is_active_turn_holder) {
                currentTurnStatus = localPlayerDetails.is_active_turn_holder;
                if (currentTurnStatus) {
                    initiateTurnTimer();
                } else {
                    clearInterval(turnCountdownInterval);
                    $(uiElements.turnTimerDisplay).html("00:00"); // Reset display when turn ends
                }
                updateTurnInformation(playerData);
            }
        }
    }

    /**
     * Retrieves player data from the server.
     */
    function fetchPlayerStatus() {
        const gameIdentifier = $.cookie("activeGameId");
        if (!gameIdentifier) {
            console.warn("No active game ID found for fetching player status.");
            return;
        }
        $.getJSON(`/game-sessions/${uriEncoder(gameIdentifier)}/players`, handlePlayerUpdate)
            .fail((jqXHR) => {
                displayUserError("Failed to retrieve player list: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
            });
    }

    /**
     * Updates the UI with current turn information and player's pieces.
     * @param {object} currentPlayersData - JSON data from the server about all players.
     */
    function updateTurnInformation(currentPlayersData) {
        const gameId = $.cookie("activeGameId");
        const playerIdentifier = $.cookie("localPlayerId");
        const localPlayer = currentPlayersData[playerIdentifier];

        const playerHandContainer = $(uiElements.playerHandDisplay);
        playerHandContainer.empty();
        $(uiElements.piecePlacementBtn).show();

        // Control the 'End Turn' button and message
        const endTurnButton = $(uiElements.endTurnActionBtn);
        const turnMessageDisplay = $(uiElements.turnInfoMessage);

        if (localPlayer && localPlayer.is_active_turn_holder) {
            endTurnButton.prop('disabled', false); // Enable button
            turnMessageDisplay.html(`It's your turn! You have <span ${uiElements.turnTimerDisplay.substring(1)}>00:00</span> remaining.`);

            // Attach event handler for ending turn
            endTurnButton.off('click').on('click', () => { // Use .off().on() to prevent multiple bindings
                $.post(`/game-sessions/${uriEncoder(gameId)}/player-actions`, { action: "end_turn_manual" }, () => {
                    fetchPlayerStatus(); // Refresh player status
                    // Special handling for single-player game: immediately update local state
                    if (Object.keys(currentPlayersData).length === 1) {
                        currentTurnStatus = false;
                        clearInterval(turnCountdownInterval);
                        $(uiElements.turnTimerDisplay).html("00:00");
                    }
                }).fail((jqXHR) => {
                    displayUserError("Failed to manually end turn: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
                });
            });
        } else {
            endTurnButton.prop('disabled', true); // Disable button
            turnMessageDisplay.html("Waiting for your turn...");
        }

        // Fetch and display remaining pieces in the bag and player's hand
        fetchRemainingPiecesCount();
        renderGameBoard();
        populatePlayerHand(localPlayer);
    }

    /**
     * Renders the player's pieces in their hand/sideboard.
     * Makes pieces draggable if it's the player's turn.
     * @param {object} currentPlayerDetails - Details of the current local player.
     */
    function populatePlayerHand(currentPlayerDetails) {
        const handContainer = $(uiElements.playerHandDisplay);
        if (!currentPlayerDetails || !Array.isArray(currentPlayerDetails.pieces)) {
            console.warn("No player details or pieces array found for populating hand.");
            return;
        }

        currentPlayerDetails.pieces.forEach(piece => {
            const pieceMarkup = `<div class="${gamePieceClass}" style="color:${colorPalette.get(piece.color)}">${glyphSet.get(piece.shape)}</div>`;
            handContainer.append(pieceMarkup);
            $(`.${gamePieceClass}:last-child`).data("pieceInfo", piece);
            // Add a small spacer for visual separation
            handContainer.append("<div style='float: left; margin: 3px'></div>");
        });

        // Function to set piece dimensions based on grid cell size
        const adjustPieceDimensions = () => {
            const gridCell = $(`.${gridCellClass}`).first();
            if (gridCell.length === 0) return; // No grid cells yet, wait.

            const cellWidth = gridCell.width();
            const cellHeight = gridCell.height();
            const cellFontSize = gridCell.css("font-size");

            $(`.${gamePieceClass}`).css({
                "width": cellWidth,
                "height": cellHeight,
                "font-size": cellFontSize,
                "line-height": cellFontSize
            });
        };

        // Apply dimensions immediately and then again after a short delay
        // to account for potential late rendering of grid cells.
        adjustPieceDimensions();
        setTimeout(adjustPieceDimensions, 300); // Increased delay slightly

        // Enable dragging if it's the player's turn
        if (currentPlayerDetails.is_active_turn_holder) {
            $(`.${gamePieceClass}`).draggable({
                containment: uiElements.gameBoardArea,
                snap: `.${snapTargetClass}`,
                snapMode: "inner", // Snap to inside of the target
                revert: "invalid", // Revert if not dropped on a valid target
                helper: "clone", // Drag a clone, original stays in hand
                start: function(event, ui) {
                    $(this).css('z-index', 1000); // Bring dragged piece to front
                },
                stop: function(event, ui) {
                    $(this).css('z-index', ''); // Reset z-index
                }
            });
        }
    }

    /**
     * Fetches and displays the number of pieces remaining in the game's central bag.
     */
    function fetchRemainingPiecesCount() {
        const gameId = $.cookie("activeGameId");
        if (!gameId) return;

        $.getJSON(`/game-sessions/${uriEncoder(gameId)}/available-pieces`, (data) => {
            const piecesCounterElement = $(uiElements.playerPiecesArea);
            piecesCounterElement.empty();
            let totalPieces = 0;
            if (Array.isArray(data)) {
                data.forEach(pieceType => {
                    totalPieces += pieceType.count;
                });
            } else {
                console.warn("Received unexpected data format for available pieces:", data);
            }
            piecesCounterElement.html(`Pieces in bag: ${totalPieces}`);
        }).fail((jqXHR) => {
            displayUserError("Failed to fetch available pieces count: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
        });
    }

    /**
     * Handles a piece drop event on the game board.
     * Sends piece placement data to the server.
     * @param {Event} event - The drop event.
     * @param {object} ui - UI object from jQuery UI draggable/droppable.
     */
    function handlePieceDrop(event, ui) {
        const targetCell = $(this);
        const colIndex = targetCell.data().columnIndex;
        const rowIndex = targetCell.data().rowIndex;
        const pieceData = $(ui.draggable).data().pieceInfo;

        if (!pieceData || colIndex === undefined || rowIndex === undefined) {
            displayUserError("Invalid piece or target cell data during drop.");
            return;
        }

        $.ajax({
            type: 'POST',
            url: `/game-sessions/${uriEncoder($.cookie("activeGameId"))}/board-placements`,
            data: {
                pieceShape: pieceData.shape,
                pieceColor: pieceData.color,
                targetRow: rowIndex,
                targetColumn: colIndex
            },
            success: () => {
                $(uiElements.errorDisplayArea).empty(); // Clear previous errors
            },
            error: (jqXHR) => {
                displayUserError("Placement error: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
            },
            complete: () => {
                // Always refresh turn info and board after an attempt to place
                $.getJSON(`/game-sessions/${uriEncoder($.cookie("activeGameId"))}/players`, updateTurnInformation)
                    .fail(() => {
                        displayUserError("Failed to refresh player info after piece placement.");
                    });
            }
        });
    }

    /**
     * Renders the game board dynamically based on server data.
     */
    function renderGameBoard() {
        const gameId = $.cookie("activeGameId");
        const boardPadding = 3; // Reduced padding slightly

        if (!gameId) {
            console.warn("No active game ID found for rendering board.");
            return;
        }

        // First, get board dimensions
        $.getJSON(`/game-sessions/${uriEncoder(gameId)}/board-dimensions`, (dimData) => {
            const boardContainer = $(uiElements.gameBoardArea);
            boardContainer.empty(); // Clear existing board

            // Validate dimensions data
            if (!dimData || typeof dimData.top === 'undefined' || typeof dimData.bottom === 'undefined' ||
                typeof dimData.left === 'undefined' || typeof dimData.right === 'undefined') {
                displayUserError("Invalid board dimensions received from server.");
                return;
            }

            const effectiveTop = dimData.top - boardPadding;
            const effectiveBottom = dimData.bottom + boardPadding;
            const effectiveLeft = dimData.left - boardPadding;
            const effectiveRight = dimData.right + boardPadding;

            const totalRows = effectiveBottom - effectiveTop + 1;
            const totalCols = effectiveRight - effectiveLeft + 1;

            // Generate grid cells
            for (let r = 0; r < totalRows; r++) {
                for (let c = 0; c < totalCols; c++) {
                    const cell = $(`<div class="${gridCellClass}"></div>`);
                    cell.data("columnIndex", c + effectiveLeft);
                    cell.data("rowIndex", r + effectiveTop);
                    boardContainer.append(cell);
                }
            }

            // Apply CSS for grid layout
            boardContainer.css({
                'display': 'grid',
                'grid-template-columns': `repeat(${totalCols}, 1fr)`,
                'grid-template-rows': `repeat(${totalRows}, 1fr)`
            });
            $(`.${gridCellClass}`).css({
                "width": "100%", // Cells fill their grid area
                "height": "100%",
                "box-sizing": "border-box",
                "border": "1px solid #eee", // Light border for visibility
                "display": "flex",
                "align-items": "center",
                "justify-content": "center"
            });

            // Calculate font size based on cell dimensions for pieces
            const sampleCell = $(`.${gridCellClass}`).first();
            let cellSize = Math.min(sampleCell.height(), sampleCell.width());
            if (cellSize > 0) {
                $(`.${gridCellClass}`).css("font-size", `${cellSize * 0.8}px`); // 80% of cell size
            }


            // Second, get actual board pieces
            $.getJSON(`/game-sessions/${uriEncoder(gameId)}/current-board-state`, (boardState) => {
                const occupiedCells = new Set(); // To track cells with pieces

                if (Array.isArray(boardState) && boardState.length > 0) {
                    boardState.forEach(item => {
                        const piece = item.piece;
                        const row = item.row;
                        const col = item.column;

                        // Calculate display row/col relative to the generated grid
                        const displayRow = row - effectiveTop;
                        const displayCol = col - effectiveLeft;

                        if (displayRow >= 0 && displayRow < totalRows &&
                            displayCol >= 0 && displayCol < totalCols) {
                            const targetIndex = displayRow * totalCols + displayCol;
                            const targetCell = $(`.${gridCellClass}`).eq(targetIndex);
                            if (targetCell.length) {
                                targetCell.addClass("occupied-cell"); // New class for occupied cells
                                targetCell.css("color", colorPalette.get(piece.color));
                                targetCell.html(glyphSet.get(piece.shape));
                                occupiedCells.add(targetCell[0]); // Add native DOM element to set
                            }
                        }
                    });
                } else {
                    // If board is empty, mark the center cell as a snap target
                    const centerIndex = Math.floor((totalRows * totalCols) / 2);
                    $(`.${gridCellClass}`).eq(centerIndex).addClass(snapTargetClass);
                }

                // Iterate through all cells to find valid snap targets (adjacent to existing pieces)
                $(`.${gridCellClass}`).each(function(index) {
                    const currentCell = $(this);
                    if (currentCell.hasClass("occupied-cell")) {
                        return; // Occupied cells are not snap targets
                    }

                    const currentRow = currentCell.data("rowIndex");
                    const currentCol = currentCell.data("columnIndex");

                    // Check 8-directional neighbors (expanded from 4)
                    const neighborOffsets = [
                        {dr: 0, dc: 1}, {dr: 0, dc: -1},
                        {dr: 1, dc: 0}, {dr: -1, dc: 0},
                        {dr: 1, dc: 1}, {dr: 1, dc: -1},
                        {dr: -1, dc: 1}, {dr: -1, dc: -1}
                    ];

                    let isAdjacentToPiece = false;
                    for (const offset of neighborOffsets) {
                        const neighborRow = currentRow + offset.dr;
                        const neighborCol = currentCol + offset.dc;

                        // Find the corresponding DOM element for the neighbor
                        const neighborElement = $(`.${gridCellClass}`).filter(function() {
                            return $(this).data("rowIndex") === neighborRow && $(this).data("columnIndex") === neighborCol;
                        });

                        if (neighborElement.length && neighborElement.hasClass("occupied-cell")) {
                            isAdjacentToPiece = true;
                            break;
                        }
                    }

                    if (isAdjacentToPiece) {
                        currentCell.addClass(snapTargetClass);
                    }
                });

                // Initialize droppable functionality for all snap targets
                $(`.${snapTargetClass}`).droppable({
                    accept: `.${gamePieceClass}`,
                    hoverClass: "drop-hover", // Add a class when a draggable is hovered over it
                    tolerance: "pointer", // More precise hover detection
                    activate: (event, ui) => {
                        $(`.${snapTargetClass}`).html("&#183;"); // Use a slightly different dot
                        boardContainer.addClass("drag-active");
                    },
                    deactivate: (event, ui) => {
                        $(`.${snapTargetClass}`).html("");
                        boardContainer.removeClass("drag-active");
                    },
                    drop: handlePieceDrop
                });
            }).fail((jqXHR) => {
                displayUserError("Failed to fetch current board state: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
            });
        }).fail((jqXHR) => {
            displayUserError("Failed to fetch board dimensions: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
        });
    }

    /**
     * Displays the game instructions modal.
     */
    function showGameInstructions() {
        $(uiElements.lobbyView).hide();
        $(uiElements.gameRoomView).hide(); // Ensure game room is also hidden
        $(uiElements.instructionsModal).show();
    }

    /**
     * Sets up the chat input functionality.
     */
    function configureChatInput() {
        const chatInputContainer = $(uiElements.chatInputBox);
        chatInputContainer.show();

        const submitChatMessage = () => {
            const inputField = chatInputContainer.find('input[type="text"]');
            const messageText = inputField.val().trim();

            if (!messageContentPattern.test(messageText)) {
                if (messageText.length > 0) {
                    displayUserError("Chat message is too long (max 600 characters) or invalid.");
                }
                return false;
            }
            if (messageText.length === 0) { // Don't send empty messages
                return false;
            }

            const activeGameId = $.cookie("activeGameId");
            const resourcePath = activeGameId ? `/game-sessions/${uriEncoder(activeGameId)}/messages` : "/global-chat";

            $.post(resourcePath, {
                content: messageText,
                sender: $.cookie("localPlayerId")
            }, () => {
                inputField.val(''); // Clear input on success
                refreshChatLog();
            }).fail((jqXHR) => {
                displayUserError("Failed to send chat message: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
            });
            return true;
        };

        chatInputContainer.find('button').off('click').on('click', submitChatMessage);
        chatInputContainer.find('input[type="text"]').off('keydown').on('keydown', (event) => {
            if (event.key === 'Enter') {
                submitChatMessage();
            }
        });
        chatInputContainer.find('input[type="text"]').focus();
    }

    /**
     * Displays the player join widget.
     * Sets the player cookie upon successful submission and initializes the main application.
     */
    function displayPlayerJoinForm() {
        $(uiElements.playerJoinBtn).show();
        const joinForm = $(uiElements.playerJoinForm);

        const processPlayerJoin = () => {
            const playerNameInput = joinForm.find('input[type="text"]');
            const newPlayerName = playerNameInput.val().trim();

            if (!playerNamePattern.test(newPlayerName)) {
                if (newPlayerName.length > 0) {
                    displayUserError("Player name must be 2-15 characters long and contain only letters, numbers, spaces, underscores, or hyphens.");
                }
                return false;
            }

            // Set cookie for the player ID
            $.cookie("localPlayerId", newPlayerName, { expires: 7 }); // Player ID persists for 7 days
            initializeApplication(); // Re-initialize the app with the new player
            return true;
        };

        joinForm.find('button').off('click').on('click', processPlayerJoin);
        joinForm.find('input[type="text"]').off('keydown').on('keydown', (event) => {
            if (event.key === 'Enter') {
                processPlayerJoin();
            }
        });
        joinForm.find('input[type="text"]').focus();
    }

    /**
     * Manages and refreshes the chat log.
     * Uses a closure to maintain the `lastReceivedMessageId` for incremental updates.
     */
    const refreshChatLog = (() => {
        const lastReceivedMessageId = {}; // Stores last ID per chat resource path

        return () => {
            const localPlayer = $.cookie("localPlayerId");
            const activeGame = $.cookie("activeGameId");
            const chatResourceUri = activeGame ? `/game-sessions/${uriEncoder(activeGame)}/messages` : "/global-chat";
            const chatLogDisplay = $(uiElements.chatHistoryLog);

            $.getJSON(chatResourceUri, { sinceId: lastReceivedMessageId[chatResourceUri] }, (messageData) => {
                if (!Array.isArray(messageData) || messageData.length === 0) {
                    return; // No new messages
                }

                // Append messages in reverse order to maintain chronological display in prepended log
                messageData.reverse().forEach(message => {
                    const senderName = message.sender;
                    const messageClass = (senderName === localPlayer) ? "my-message" : "other-message";
                    chatLogDisplay.prepend(`<div><span class="${messageClass}">${sanitizeHtml(senderName)}</span>: ${sanitizeHtml(message.content)}</div>`);
                });

                // Update the last received ID if there are new messages
                if (messageData.length > 0) {
                    lastReceivedMessageId[chatResourceUri] = messageData[0].id; // The first message in reversed array is the latest
                }
            }).fail((jqXHR) => {
                console.error("Failed to fetch chat log:", jqXHR);
                // Optionally display a less intrusive error for chat if it fails frequently
            });
        };
    })();

    /**
     * Displays a list of available game sessions in the lobby.
     * @param {Array<object>} gameSessions - Array of game session objects from the server.
     */
    function renderGameList(gameSessions) {
        const gameListContainer = $(uiElements.gameListTable);
        gameListContainer.empty();

        // Add table header
        gameListContainer.append("<thead><tr><th>Session Name</th><th>Players</th><th>Action</th></tr></thead>");
        const tbody = $('<tbody></tbody>').appendTo(gameListContainer);

        if (!Array.isArray(gameSessions) || gameSessions.length === 0) {
            $(uiElements.noGamesMessage).show();
            return;
        } else {
            $(uiElements.noGamesMessage).hide();
        }

        gameSessions.forEach(session => {
            const currentPlayers = session.current_players || 0;
            const maxPlayers = session.max_players || maxGameParticipants;
            const isFull = currentPlayers >= maxPlayers;
            const joinButton = isFull
                ? `<button disabled class="join-game-btn disabled-btn">Full</button>`
                : `<button class="join-game-btn" data-game-id="${sanitizeHtml(session.id)}">Join</button>`;

            tbody.append(`
                <tr>
                    <td>${sanitizeHtml(session.name)}</td>
                    <td>${currentPlayers}/${maxPlayers}</td>
                    <td>${joinButton}</td>
                </tr>
            `);
        });

        // Attach event listener for join buttons using delegation
        tbody.off('click', '.join-game-btn').on('click', '.join-game-btn', function() {
            const gameIdentifier = $(this).data('gameId');
            if (gameIdentifier) {
                $.cookie("activeGameId", gameIdentifier, { expires: 1 }); // Game ID persists for 1 day
                initializeApplication(); // Re-initialize to switch to game room view
            }
        });
    }

    /**
     * Creates a new game session on the server.
     */
    function createNewGameSession() {
        const newGameName = prompt("Enter a name for your new game session:");
        if (!newGameName || newGameName.trim() === "") {
            return; // User cancelled or entered empty name
        }
        if (!playerNamePattern.test(newGameName)) { // Reusing pattern for game names
            displayUserError("Game name must be 2-15 characters long and contain only letters, numbers, spaces, underscores, or hyphens.");
            return;
        }

        $.post("/game-sessions/create", { name: newGameName }, (response) => {
            if (response && response.id) {
                $.cookie("activeGameId", response.id, { expires: 1 });
                initializeApplication(); // Switch to game room
            } else {
                displayUserError("Failed to create game: Invalid response.");
            }
        }).fail((jqXHR) => {
            displayUserError("Failed to create game: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
        });
    }

    /**
     * Fetches the list of all active game sessions from the server.
     */
    function fetchGameSessions() {
        $.getJSON("/game-sessions/list", renderGameList)
            .fail((jqXHR) => {
                displayUserError("Failed to fetch game list: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
            });
    }

    /**
     * Handles leaving the current game session.
     */
    function leaveCurrentGame() {
        const gameIdentifier = $.cookie("activeGameId");
        const playerIdentifier = $.cookie("localPlayerId");

        if (!gameIdentifier || !playerIdentifier) {
            console.warn("Cannot leave game: Missing game ID or player ID.");
            return;
        }

        // Clear local game state cookies
        $.removeCookie("activeGameId");
        currentTurnStatus = null; // Reset turn status

        // Notify server that player is leaving
        $.post(`/game-sessions/${uriEncoder(gameIdentifier)}/player-actions`,
               { action: "leave_game", playerName: playerIdentifier },
               () => {
                   displayUserMessage("You have left the game.");
                   initializeApplication(); // Return to lobby
               })
            .fail((jqXHR) => {
                displayUserError("Failed to notify server of leaving game: " + (jqXHR.responseJSON?.message || jqXHR.responseText));
                initializeApplication(); // Still return to lobby even if server notification fails
            });
    }

    /**
     * Displays a user-friendly error message.
     * @param {string} message - The error message to display.
     */
    function displayUserError(message) {
        const errorArea = $(uiElements.errorDisplayArea);
        errorArea.empty().append(`<div class='alert-error'>&#9888; ${sanitizeHtml(message)}</div>`);
        setTimeout(() => errorArea.empty(), 5000); // Clear error after 5 seconds
    }

    /**
     * Displays a general user message (e.g., success, info).
     * @param {string} message - The message to display.
     */
    function displayUserMessage(message) {
        const errorArea = $(uiElements.errorDisplayArea); // Reusing error area for general messages
        errorArea.empty().append(`<div class='alert-info'>&#9432; ${sanitizeHtml(message)}</div>`);
        setTimeout(() => errorArea.empty(), 3000); // Clear message after 3 seconds
    }

    /**
     * Initializes the lobby view.
     */
    function setupLobbyView() {
        // Hide all game-related elements and show lobby
        $(uiElements.gameRoomView).hide();
        $(uiElements.instructionsModal).hide();
        $(uiElements.loadingGameIndicator).hide();
        $(uiElements.lobbyView).show();
        $(uiElements.playerJoinBtn).hide(); // Hide button initially, form handles visibility
        $(uiElements.playerJoinForm).show(); // Always show join form in lobby for player ID

        // Check for player ID
        if (!$.cookie("localPlayerId")) {
            displayPlayerJoinForm();
            $(uiElements.chatInputBox).hide(); // Hide chat input until player name is set
        } else {
            $(uiElements.playerJoinForm).hide(); // Hide form if player is already identified
            configureChatInput();
            // Start refreshing global chat
            clearInterval(chatLogRefreshTimer);
            chatLogRefreshTimer = setInterval(refreshChatLog, 3000); // Refresh every 3 seconds
            refreshChatLog(); // Initial refresh
        }

        // Event listeners for lobby actions
        $(uiElements.gameCreationBtn).off('click').on('click', createNewGameSession);
        $(uiElements.instructionsModal).off('click').on('click', showGameInstructions); // This is likely wrong, should be a button to open modal
        // Corrected instruction button handling:
        $('[data-ui-element="show-instructions-btn"]').off('click').on('click', showGameInstructions);

        // Fetch and display game list
        clearInterval(gameListRefreshTimer);
        gameListRefreshTimer = setInterval(fetchGameSessions, 5000); // Refresh game list every 5 seconds
        fetchGameSessions(); // Initial fetch
    }

    /**
     * Initializes the game room view.
     */
    function setupGameRoomView() {
        // Hide lobby elements and show game room
        $(uiElements.lobbyView).hide();
        $(uiElements.instructionsModal).hide();
        $(uiElements.loadingGameIndicator).show(); // Show loading indicator initially
        $(uiElements.gameRoomView).show();

        // Clear lobby-specific timers
        clearInterval(gameListRefreshTimer);
        clearInterval(playerListRefreshTimer); // Ensure this is cleared if player list was active in lobby (unlikely)

        // Setup game-specific chat
        configureChatInput();
        clearInterval(chatLogRefreshTimer);
        chatLogRefreshTimer = setInterval(refreshChatLog, 3000);
        refreshChatLog();

        // Setup game-specific player and board updates
        playerListRefreshTimer = setInterval(fetchPlayerStatus, 4000); // Refresh player list every 4 seconds
        fetchPlayerStatus(); // Initial fetch
        renderGameBoard(); // Initial board render

        $(uiElements.loadingGameIndicator).hide(); // Hide loading after initial setup

        // Event listener for leaving game
        $(uiElements.leaveGameBtn).off('click').on('click', leaveCurrentGame);
    }

    /**
     * The main application initialization function.
     * Determines whether to show the lobby or a game room.
     */
    function initializeApplication() {
        const activeGameIdentifier = $.cookie("activeGameId");
        const localPlayerIdentifier = $.cookie("localPlayerId");

        // Guard clause: ensure player ID exists before proceeding to game logic
        if (!localPlayerIdentifier) {
            setupLobbyView(); // Force lobby view to get player name
            return;
        }

        if (activeGameIdentifier) {
            setupGameRoomView();
        } else {
            setupLobbyView();
        }
    }

    // Initial call to start the application when the DOM is ready
    $(document).ready(initializeApplication);

}()); // End of gameClientModule IIFE