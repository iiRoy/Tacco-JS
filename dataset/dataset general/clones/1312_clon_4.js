class GameClient {
    constructor() {
        this.clientConfig = {
            turnDurationSeconds: 60,
            maxRoomOccupancy: 6,
            boardMarginExtension: 5,
            pieceDimensionSyncDelayMs: 250,
            chatPollIntervalMs: 2000
        };

        this.visualScheme = {
            colorMap: new Map([
                ["green", "#A0E7A0"],
                ["yellow", "#FFFB8C"],
                ["red", "#CD2626"],
                ["orange", "#FFAF5A"],
                ["purple", "#FF8CB6"],
                ["blue", "#97D0F9"]
            ]),
            symbolMap: new Map([
                ["circle", "&#9679;"],
                ["star", "&#10022;"],
                ["diamond", "&#9670;"],
                ["square", "&#9632;"],
                ["triangle", "&#9650;"],
                ["clover", "&#9827;"]
            ])
        };

        this.validationRules = {
            aliasLength: { min: 1, max: 12 },
            messageLength: { min: 1, max: 500 }
        };

        this.cssDesignations = {
            gridUnit: "unit-cell",
            gamePiece: "board-token",
            droppableZone: "drop-target",
            activePieceDisplay: "display-token",
            activePlayerClass: "current-player-indicator",
            errorMessageClass: "alert-message"
        };

        this.applicationState = {
            playerAlias: null,
            roomIdentifier: null,
            playerHasActiveTurn: null,
            activeIntervalIds: {
                turnCountdown: null,
                chatRefresh: null,
                playerListRefresh: null,
                gameListRefresh: null
            },
            lastFetchedChatIds: new Map(),
            elementReferences: {},
            draggedPieceData: null
        };

        this.utility = {
            escapeHtmlEntities: (inputString) => {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return inputString.replace(/[&<>"']/g, (char) => map[char]);
            },
            encodeUrlPart: (part) => encodeURIComponent(part),
            getPersistentValue: (key) => {
                const name = key + "=";
                const decodedCookie = decodeURIComponent(document.cookie);
                const ca = decodedCookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) === 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },
            setPersistentValue: (key, value, days = 7) => {
                const d = new Date();
                d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
                const expires = "expires=" + d.toUTCString();
                document.cookie = key + "=" + value + ";" + expires + ";path=/";
            }
        };

        this.initializeApplication();
    }

    initializeApplication() {
        this.applicationState.playerAlias = this.utility.getPersistentValue("player");
        this.applicationState.roomIdentifier = this.utility.getPersistentValue("game");
        this.cacheDomElements();
        this.setupGlobalEventHandlers();
        this.transitionToMainView();
    }

    cacheDomElements() {
        const refs = this.applicationState.elementReferences;
        refs.gameAddControl = document.querySelector('[data-component="game-addition"]');
        refs.guestEntrySection = document.querySelector('[data-component="guest-onboarding"]');
        refs.guestEntryForm = document.querySelector('[data-component="guest-entry-form"]');
        refs.pieceAddButton = document.querySelector('[data-component="piece-addition-button"]');
        refs.gameBoardDisplay = document.querySelector('[data-component="game-board-area"]');
        refs.chatInputArea = document.querySelector('[data-component="chat-input-field"]');
        refs.chatHistoryLog = document.querySelector('[data-component="chat-history-display"]');
        refs.chatPanelContainer = document.querySelector('[data-component="chat-interaction-panel"]');
        refs.turnClockDisplay = document.querySelector('[data-component="turn-timer-display"]');
        refs.turnConclusionButton = document.querySelector('[data-component="end-turn-button"]');
        refs.errorNotificationZone = document.querySelector('[data-component="error-messages"]');
        refs.githubLink = document.querySelector('[data-component="fork-me-link"]');
        refs.remainingPiecesCount = document.querySelector('[data-component="available-game-pieces"]');
        refs.gameRoomArea = document.querySelector('[data-component="active-game-room"]');
        refs.gameListingTable = document.querySelector('[data-component="game-listing-table"]');
        refs.lobbySeparator = document.querySelector('[data-component="lobby-separator"]');
        refs.instructionManual = document.querySelector('[data-component="how-to-play-guide"]');
        refs.leaveGameButton = document.querySelector('[data-component="exit-game-action"]');
        refs.gameLoadingIndicator = document.querySelector('[data-component="game-loading-status"]');
        refs.lobbyArea = document.querySelector('[data-component="main-lobby-view"]');
        refs.lobbyChatDisplay = document.querySelector('[data-component="lobby-chat-log"]');
        refs.noGamesMessage = document.querySelector('[data-component="no-active-games-message"]');
        refs.playerPieceContainer = document.querySelector('[data-component="player-piece-tray"]');
        refs.playerListDisplay = document.querySelector('[data-component="player-list-section"]');
        refs.sidePanelArea = document.querySelector('[data-component="game-side-panel"]');
        refs.turnStatusDisplay = document.querySelector('[data-component="turn-information-banner"]');

        if (refs.guestEntryForm) {
            refs.guestNameInput = refs.guestEntryForm.querySelector('input');
            refs.guestSubmitButton = refs.guestEntryForm.querySelector('button');
        }
        if (refs.chatInputArea) {
            refs.chatTextInput = refs.chatInputArea.querySelector('input');
            refs.chatSendButton = refs.chatInputArea.querySelector('button');
        }

        refs.boardGridCells = refs.gameBoardDisplay;
    }

    setupGlobalEventHandlers() {
        const refs = this.applicationState.elementReferences;

        if (refs.guestSubmitButton) {
            refs.guestSubmitButton.addEventListener('click', () => this.handleGuestSubmission());
            refs.guestNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleGuestSubmission();
            });
        }

        if (refs.chatSendButton) {
            refs.chatSendButton.addEventListener('click', () => this.submitChatMessage());
            refs.chatTextInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.submitChatMessage();
            });
        }

        if (refs.leaveGameButton) {
            refs.leaveGameButton.addEventListener('click', () => this.processGameExit());
        }

        if (refs.pieceAddButton) {
            refs.pieceAddButton.addEventListener('click', () => this.requestNewPiece());
        }
    }

    transitionToMainView() {
        const refs = this.applicationState.elementReferences;

        [refs.gameRoomArea, refs.lobbyArea, refs.instructionManual, refs.guestEntrySection].forEach(el => {
            if (el) el.style.display = 'none';
        });

        if (!this.applicationState.playerAlias) {
            refs.guestEntrySection.style.display = 'block';
            if (refs.guestNameInput) refs.guestNameInput.focus();
            this.applicationState.activeIntervalIds.chatRefresh = setInterval(() => this.refreshMessageLog(refs.lobbyChatDisplay, '/chat'), this.clientConfig.chatPollIntervalMs);
            this.configureMessageInput(refs.lobbyChatDisplay);
        } else if (this.applicationState.roomIdentifier) {
            refs.gameRoomArea.style.display = 'block';
            this.retrievePlayerInfoForRoom();
            this.applicationState.activeIntervalIds.chatRefresh = setInterval(() => this.refreshMessageLog(refs.chatHistoryLog, `/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/chat`), this.clientConfig.chatPollIntervalMs);
            this.configureMessageInput(refs.chatHistoryLog);
        } else {
            refs.lobbyArea.style.display = 'block';
            this.retrieveGameList();
            this.applicationState.activeIntervalIds.gameListRefresh = setInterval(() => this.retrieveGameList(), 5000);
            this.applicationState.activeIntervalIds.chatRefresh = setInterval(() => this.refreshMessageLog(refs.lobbyChatDisplay, '/chat'), this.clientConfig.chatPollIntervalMs);
            this.configureMessageInput(refs.lobbyChatDisplay);
        }
        if (this.applicationState.playerAlias && refs.chatInputArea) {
             refs.chatInputArea.style.display = 'block';
        } else if (refs.chatInputArea) {
             refs.chatInputArea.style.display = 'none';
        }
    }

    async makeApiRequest(path, httpMethod = 'GET', payload = null) {
        const options = {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (payload) {
            options.body = Object.keys(payload).map(key =>
                this.utility.encodeUrlPart(key) + '=' + this.utility.encodeUrlPart(payload[key])
            ).join('&');
        }

        try {
            const response = await fetch(path, options);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("API Request Failed:", error);
            this.displayErrorNotification(`Operation failed: ${error.message}`);
            throw error;
        }
    }

    displayErrorNotification(message) {
        const errorContainer = this.applicationState.elementReferences.errorNotificationZone;
        if (errorContainer) {
            errorContainer.innerHTML = `<div class="${this.cssDesignations.errorMessageClass}">&#9888; ${this.utility.escapeHtmlEntities(message)}</div>`;
        }
    }

    clearErrorNotification() {
        const errorContainer = this.applicationState.elementReferences.errorNotificationZone;
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    }

    handleGuestSubmission() {
        const aliasInput = this.applicationState.elementReferences.guestNameInput;
        const proposedAlias = aliasInput.value.trim();

        if (proposedAlias.length < this.validationRules.aliasLength.min || proposedAlias.length > this.validationRules.aliasLength.max) {
            alert(`Player name must be between ${this.validationRules.aliasLength.min} and ${this.validationRules.aliasLength.max} characters.`);
            return;
        }

        this.utility.setPersistentValue("player", proposedAlias);
        this.applicationState.playerAlias = proposedAlias;
        this.transitionToMainView();
        this.clearAllIntervals();
    }

    retrievePlayerInfoForRoom() {
        this.makeApiRequest(`/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/players`)
            .then(playerData => this.processPlayerInfo(playerData))
            .catch(error => console.error("Failed to fetch player info:", error));
    }

    processPlayerInfo(playerData) {
        const playerListContainer = this.applicationState.elementReferences.playerListDisplay;
        if (playerListContainer) playerListContainer.innerHTML = '';

        Object.entries(playerData).forEach(([alias, data]) => {
            const playerEntry = document.createElement('dl');
            const playerName = document.createElement('dt');
            playerName.textContent = this.utility.escapeHtmlEntities(alias);
            if (data.has_turn) {
                playerName.classList.add(this.cssDesignations.activePlayerClass);
            }
            const playerScore = document.createElement('dd');
            playerScore.textContent = data.points;
            playerEntry.appendChild(playerName);
            playerEntry.appendChild(playerScore);
            if (playerListContainer) playerListContainer.appendChild(playerEntry);
        });

        const currentAlias = this.applicationState.playerAlias;
        if (currentAlias && !playerData[currentAlias]) {
            this.makeApiRequest(`/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/players`, 'POST', { name: currentAlias })
                .then(() => this.retrievePlayerInfoForRoom())
                .catch(error => console.error("Failed to add player to room:", error));
        } else if (currentAlias && playerData[currentAlias]) {
            const playerTurnStatus = playerData[currentAlias].has_turn;
            if (this.applicationState.playerHasActiveTurn !== playerTurnStatus) {
                this.applicationState.playerHasActiveTurn = playerTurnStatus;
                if (playerTurnStatus) {
                    this.initiateTurnTimekeeper();
                } else {
                    this.terminateTurnTimekeeper();
                }
                this.displayTurnDetails(playerData[currentAlias]);
            }
        }
    }

    initiateTurnTimekeeper() {
        this.terminateTurnTimekeeper();
        const timerDisplay = this.applicationState.elementReferences.turnClockDisplay;
        let remainingSeconds = this.clientConfig.turnDurationSeconds;
        const startTime = Date.now();

        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const timeLeft = Math.max(0, remainingSeconds - elapsed);

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            if (timerDisplay) timerDisplay.textContent = `${minutes}m ${seconds}s`;

            if (timeLeft <= 0) {
                this.terminateTurnTimekeeper();
                this.makeApiRequest(`/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/players`, 'POST', { end_turn: true })
                    .then(() => this.retrievePlayerInfoForRoom())
                    .catch(error => console.error("Failed to end turn automatically:", error));
            }
        };

        updateTimer();
        this.applicationState.activeIntervalIds.turnCountdown = setInterval(updateTimer, 1000);
    }

    terminateTurnTimekeeper() {
        if (this.applicationState.activeIntervalIds.turnCountdown) {
            clearInterval(this.applicationState.activeIntervalIds.turnCountdown);
            this.applicationState.activeIntervalIds.turnCountdown = null;
        }
    }

    displayTurnDetails(playerData) {
        const refs = this.applicationState.elementReferences;
        const currentRoom = this.applicationState.roomIdentifier;

        if (refs.playerPieceContainer) refs.playerPieceContainer.innerHTML = '';
        if (refs.pieceAddButton) refs.pieceAddButton.style.display = 'block';

        if (playerData.has_turn) {
            if (refs.turnConclusionButton) {
                refs.turnConclusionButton.removeAttribute('disabled');
                if (!refs.turnConclusionButton._hasListener) {
                    refs.turnConclusionButton.addEventListener('click', async () => {
                        this.clearErrorNotification();
                        try {
                            await this.makeApiRequest(`/games/${this.utility.encodeUrlPart(currentRoom)}/players`, 'POST', { end_turn: true });
                            this.retrievePlayerInfoForRoom();
                            if (Object.keys(playerData).length === 1) {
                                this.applicationState.playerHasActiveTurn = false;
                                this.terminateTurnTimekeeper();
                            }
                        } catch (error) {
                            console.error("Failed to end turn:", error);
                        }
                    });
                    refs.turnConclusionButton._hasListener = true;
                }
            }
            if (refs.turnStatusDisplay) {
                refs.turnStatusDisplay.innerHTML = `It's your turn! You have <span data-component="turn-timer-display">0m 0s</span> left.`;
                refs.turnClockDisplay = refs.turnStatusDisplay.querySelector('[data-component="turn-timer-display"]');
            }
        } else {
            if (refs.turnConclusionButton) refs.turnConclusionButton.setAttribute('disabled', 'true');
            if (refs.turnStatusDisplay) refs.turnStatusDisplay.textContent = "It's not your turn.";
        }
        this.retrieveRemainingPiecesCount();
        this.renderGameboard();
        this.assignPlayerPieces(playerData);
    }

    assignPlayerPieces(playerData) {
        const piecesContainer = this.applicationState.elementReferences.playerPieceContainer;
        if (!piecesContainer) return;
        piecesContainer.innerHTML = '';

        playerData.pieces.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add(this.cssDesignations.gamePiece);
            pieceElement.style.color = this.visualScheme.colorMap.get(piece.color);
            pieceElement.innerHTML = this.visualScheme.symbolMap.get(piece.shape);
            pieceElement.dataset.pieceShape = piece.shape;
            pieceElement.dataset.pieceColor = piece.color;
            pieceElement.draggable = playerData.has_turn;

            if (playerData.has_turn) {
                pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, piece));
                pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
            }

            const wrapper = document.createElement('div');
            wrapper.style.float = 'left';
            wrapper.style.margin = '3px';
            wrapper.appendChild(pieceElement);
            piecesContainer.appendChild(wrapper);
        });

        const syncDimensions = () => {
            const firstGridCell = this.applicationState.elementReferences.gameBoardDisplay.querySelector(`.${this.cssDesignations.gridUnit}`);
            if (!firstGridCell) return;

            const gridWidth = firstGridCell.offsetWidth;
            const gridHeight = firstGridCell.offsetHeight;
            const gridFontSize = window.getComputedStyle(firstGridCell).fontSize;

            piecesContainer.querySelectorAll(`.${this.cssDesignations.gamePiece}`).forEach(pieceEl => {
                pieceEl.style.width = `${gridWidth}px`;
                pieceEl.style.height = `${gridHeight}px`;
                pieceEl.style.fontSize = gridFontSize;
                pieceEl.style.lineHeight = gridFontSize;
            });
        };

        syncDimensions();
        setTimeout(syncDimensions, this.clientConfig.pieceDimensionSyncDelayMs);
    }

    handleDragStart(event, pieceData) {
        this.applicationState.draggedPieceData = pieceData;
        event.dataTransfer.setData('text/plain', JSON.stringify(pieceData));
        event.dataTransfer.effectAllowed = 'move';
        const boardDisplay = this.applicationState.elementReferences.gameBoardDisplay;
        if (boardDisplay) {
            boardDisplay.classList.add("dragging-active");
            boardDisplay.querySelectorAll(`.${this.cssDesignations.droppableZone}`).forEach(cell => {
                if (!cell.querySelector(`.${this.cssDesignations.activePieceDisplay}`)) {
                     cell.innerHTML = "&middot;";
                }
            });
        }
    }

    handleDragEnd(event) {
        this.applicationState.draggedPieceData = null;
        const boardDisplay = this.applicationState.elementReferences.gameBoardDisplay;
        if (boardDisplay) {
            boardDisplay.classList.remove("dragging-active");
            boardDisplay.querySelectorAll(`.${this.cssDesignations.droppableZone}`).forEach(cell => {
                if (cell.innerHTML === "&middot;") {
                    cell.innerHTML = "";
                }
            });
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const targetCell = event.currentTarget;
        const droppedPiece = this.applicationState.draggedPieceData;

        if (!droppedPiece || !targetCell.classList.contains(this.cssDesignations.droppableZone)) {
            return;
        }

        const col = parseInt(targetCell.dataset.gridCol, 10);
        const row = parseInt(targetCell.dataset.gridRow, 10);

        this.clearErrorNotification();
        this.makeApiRequest(
            `/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/board`,
            'POST',
            {
                shape: droppedPiece.shape,
                color: droppedPiece.color,
                row: row,
                column: col
            }
        )
        .then(() => {
            this.retrievePlayerInfoForRoom();
        })
        .catch(error => {
            console.error("Piece placement failed:", error);
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        if (event.currentTarget.classList.contains(this.cssDesignations.droppableZone)) {
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
    }

    retrieveRemainingPiecesCount() {
        this.makeApiRequest(`/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/pieces`)
            .then(pieceData => {
                const totalPieces = pieceData.reduce((sum, item) => sum + item.count, 0);
                if (this.applicationState.elementReferences.remainingPiecesCount)
                    this.applicationState.elementReferences.remainingPiecesCount.textContent = totalPieces;
            })
            .catch(error => console.error("Failed to fetch remaining pieces:", error));
    }

    requestNewPiece() {
        this.makeApiRequest(
            `/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/pieces`,
            'POST',
            { action: 'draw' }
        )
        .then(() => this.retrievePlayerInfoForRoom())
        .catch(error => console.error("Failed to add new piece:", error));
    }

    renderGameboard() {
        const boardContainer = this.applicationState.elementReferences.gameBoardDisplay;
        if (!boardContainer) return;
        boardContainer.innerHTML = '';

        this.makeApiRequest(`/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/dimensions`)
            .then(boardDimensions => {
                const margin = this.clientConfig.boardMarginExtension;
                const minRow = boardDimensions.top - margin;
                const maxRow = boardDimensions.bottom + margin;
                const minCol = boardDimensions.left - margin;
                const maxCol = boardDimensions.right + margin;

                const numRows = maxRow - minRow + 1;
                const numCols = maxCol - minCol + 1;

                boardContainer.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
                boardContainer.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
                boardContainer.style.display = 'grid';

                const gridCells = [];
                for (let r = 0; r < numRows; r++) {
                    for (let c = 0; c < numCols; c++) {
                        const cell = document.createElement('div');
                        cell.classList.add(this.cssDesignations.gridUnit);
                        cell.dataset.gridRow = minRow + r;
                        cell.dataset.gridCol = minCol + c;
                        gridCells.push(cell);
                        boardContainer.appendChild(cell);
                    }
                }

                return this.makeApiRequest(`/games/${this.utility.encodeUrlPart(this.applicationState.roomIdentifier)}/board`)
                    .then(boardState => {
                        boardState.forEach(item => {
                            const actualRow = item.row;
                            const actualCol = item.column;
                            const displayRowIdx = actualRow - minRow;
                            const displayColIdx = actualCol - minCol;
                            const cellIndex = displayRowIdx * numCols + displayColIdx;

                            if (gridCells[cellIndex]) {
                                gridCells[cellIndex].classList.add(this.cssDesignations.activePieceDisplay);
                                gridCells[cellIndex].style.color = this.visualScheme.colorMap.get(item.piece.color);
                                gridCells[cellIndex].innerHTML = this.visualScheme.symbolMap.get(item.piece.shape);
                            }
                        });

                        const firstCell = boardContainer.querySelector(`.${this.cssDesignations.gridUnit}`);
                        if (firstCell) {
                            const cellSize = Math.min(firstCell.offsetHeight, firstCell.offsetWidth);
                            gridCells.forEach(cell => {
                                cell.style.fontSize = `${cellSize}px`;
                                cell.style.lineHeight = `${cellSize}px`;
                            });
                        }

                        if (boardState.length === 0) {
                            const centerIdx = Math.floor(gridCells.length / 2);
                            if (gridCells[centerIdx]) {
                                gridCells[centerIdx].classList.add(this.cssDesignations.droppableZone);
                            }
                        } else {
                            gridCells.forEach((cell, idx) => {
                                if (!cell.classList.contains(this.cssDesignations.activePieceDisplay)) {
                                    const r = parseInt(cell.dataset.gridRow);
                                    const c = parseInt(cell.dataset.gridCol);

                                    const neighbors = [
                                        { dr: 0, dc: 1 }, { dr: 0, dc: -1 },
                                        { dr: 1, dc: 0 }, { dr: -1, dc: 0 }
                                    ];

                                    const isAdjacentToPiece = neighbors.some(offset => {
                                        const neighborRow = r + offset.dr;
                                        const neighborCol = c + offset.dc;

                                        return boardState.some(piece =>
                                            piece.row === neighborRow && piece.column === neighborCol
                                        );
                                    });

                                    if (isAdjacentToPiece) {
                                        cell.classList.add(this.cssDesignations.droppableZone);
                                    }
                                }
                            });
                        }

                        boardContainer.querySelectorAll(`.${this.cssDesignations.droppableZone}`).forEach(droppableCell => {
                            droppableCell.removeEventListener('dragover', this.handleDragOver);
                            droppableCell.removeEventListener('drop', this.handleDrop);
                            droppableCell.addEventListener('dragover', (e) => this.handleDragOver(e));
                            droppableCell.addEventListener('drop', (e) => this.handleDrop(e));
                        });
                    });
            })
            .catch(error => console.error("Failed to render board:", error));
    }

    configureMessageInput(targetChatLogElement) {
        const refs = this.applicationState.elementReferences;
        if (refs.chatInputArea) {
            refs.chatInputArea.style.display = 'block';
            if (refs.chatTextInput) refs.chatTextInput.focus();
        }
    }

    submitChatMessage() {
        const chatInput = this.applicationState.elementReferences.chatTextInput;
        if (!chatInput) return;
        const messageText = chatInput.value.trim();

        if (messageText.length < this.validationRules.messageLength.min || messageText.length > this.validationRules.messageLength.max) {
            if (messageText) {
                alert("Your message text is too long or empty!");
            }
            return;
        }

        const currentRoom = this.applicationState.roomIdentifier;
        const chatResource = currentRoom ? `/games/${this.utility.encodeUrlPart(currentRoom)}/chat` : '/chat';

        this.makeApiRequest(chatResource, 'POST', {
            input: messageText,
            name: this.applicationState.playerAlias
        })
        .then(() => {
            chatInput.value = '';
            this.refreshMessageLog(this.applicationState.elementReferences.chatHistoryLog, chatResource);
        })
        .catch(error => console.error("Failed to send chat message:", error));
    }

    refreshMessageLog(targetElement, chatPath) {
        if (!targetElement) return;
        let lastKnownId = this.applicationState.lastFetchedChatIds.get(chatPath);
        const queryParams = lastKnownId ? `?lastid=${lastKnownId}` : '';

        this.makeApiRequest(`${chatPath}${queryParams}`)
            .then(chatEntries => {
                if (!chatEntries || chatEntries.length === 0) {
                    return;
                }

                chatEntries.forEach(entry => {
                    const messageWrapper = document.createElement('div');
                    const senderSpan = document.createElement('span');
                    senderSpan.classList.add(entry.name === this.applicationState.playerAlias ? 'self-message' : 'other-message');
                    senderSpan.textContent = this.utility.escapeHtmlEntities(entry.name);
                    messageWrapper.appendChild(senderSpan);
                    messageWrapper.innerHTML += `: ${this.utility.escapeHtmlEntities(entry.input)}`;
                    targetElement.prepend(messageWrapper);
                });

                this.applicationState.lastFetchedChatIds.set(chatPath, chatEntries[chatEntries.length - 1].id);
            })
            .catch(error => console.error("Failed to refresh chat log:", error));
    }

    retrieveGameList() {
        this.makeApiRequest('/games')
            .then(gameList => this.displayGameList(gameList))
            .catch(error => console.error("Failed to retrieve game list:", error));
    }

    displayGameList(games) {
        const gameTable = this.applicationState.elementReferences.gameListingTable;
        if (!gameTable) return;
        gameTable.innerHTML = '';

        const tableHeader = gameTable.createTHead();
        const headerRow = tableHeader.insertRow();
        ['Game Room', 'Players', ''].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        const tableBody = gameTable.createTBody();
        if (this.applicationState.elementReferences.noGamesMessage) {
            if (games.length === 0) {
                this.applicationState.elementReferences.noGamesMessage.style.display = 'block';
            } else {
                this.applicationState.elementReferences.noGamesMessage.style.display = 'none';
            }
        }

        games.forEach(game => {
            const row = tableBody.insertRow();
            const nameCell = row.insertCell();
            nameCell.textContent = this.utility.escapeHtmlEntities(game.name);

            const playersCell = row.insertCell();
            playersCell.textContent = game.players;

            const actionCell = row.insertCell();
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join';
            joinButton.addEventListener('click', () => this.joinGameRoom(game.name));
            actionCell.appendChild(joinButton);
        });
    }

    joinGameRoom(gameName) {
        this.utility.setPersistentValue("game", gameName);
        this.applicationState.roomIdentifier = gameName;
        this.clearAllIntervals();
        this.transitionToMainView();
    }

    processGameExit() {
        this.utility.setPersistentValue("game", "", -1);
        this.applicationState.roomIdentifier = null;
        this.applicationState.playerHasActiveTurn = null;
        this.clearAllIntervals();
        this.transitionToMainView();
    }

    clearAllIntervals() {
        Object.values(this.applicationState.activeIntervalIds).forEach(id => {
            if (id) clearInterval(id);
        });
        this.applicationState.activeIntervalIds = {
            turnCountdown: null,
            chatRefresh: null,
            playerListRefresh: null,
            gameListRefresh: null
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameClient();
});