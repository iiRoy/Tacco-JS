/*
 *  _________________    __    _______  _______    __      
 *  \____  \\_  __  \  /  \  /  _____/ \_  __  \  /  \     
 *   |   |  \/  | \_/ /    \_\  \___   |  | \/ / /    \    
 *   |   |  /|  |    /  Y Y  \\___  \  |  |   | /  Y Y  \   
 *   |______/ |__|   \____|__//____  /  |__|   | \____|__/  
 *                                 \/                       
 *   Project: Phantom Chase Engine
 *   Author: CodeCrafter
 *   Version: 1.1.0
 *   Date: 2023-10-27
 *
 *   This script manages the core game logic for a maze-runner style game.
 *   It handles game state, player and enemy movement, scoring, and UI updates.
 */

// Core application state containers
let gameSurface; // Main drawing canvas element
let playerInputDevice; // Controls for player movement
let drawingContext; // 2D rendering context
let gameSession; // Main game logic orchestrator
let wallSurface, wallContext; // Dedicated canvas for static maze elements
let ghostOne, ghostTwo, ghostThree, ghostFour; // Enemy entities (Pinky, Inky, Blinky, Clyde counterparts)

const mapDataPath = 'data/map.json'; // Path to the maze configuration file


/* --- Remote Data Handling Utilities --- */

/**
 * Initiates retrieval of high scores after a short delay.
 */
function fetchTopScoresDelayed() {
    setTimeout(executeScoreRetrieval, 50); // Slightly increased delay for smoother UX
}

/**
 * Executes an AJAX request to retrieve high scores.
 */
function executeScoreRetrieval() {
    // Generate a unique timestamp to prevent caching.
    const currentTimestamp = Date.now();
    
    // Using jQuery for AJAX, but could be replaced with fetch API.
    $.ajax({
        dataType: "json",
        method: "GET", // Changed 'type' to 'method' for clarity
        url: "data/db-handler.php",
        data: {
            requestTime: currentTimestamp, // Renamed 'timestamp' to 'requestTime'
            operation: 'query' // Renamed 'action' to 'operation'
        },
        success: function(responsePayload) { // Renamed 'msg' to 'responsePayload'
            const scoreListElement = $("#highscore-list");
            scoreListElement.empty(); // Cleared using empty() for efficiency
            
            // Validate responsePayload before iterating
            if (!Array.isArray(responsePayload)) {
                console.error("Invalid highscore data received:", responsePayload);
                scoreListElement.append("<li>Error loading scores.</li>");
                return;
            }

            // Iterate and append list items
            for (let k = 0; k < responsePayload.length; k++) { // Renamed loop variable 'i' to 'k'
                const entry = responsePayload[k];
                const listItem = $("<li>");
                listItem.text(entry['name']); // Use text() for name for security
                const scoreSpan = $("<span class='score-value'>"); // Added class, renamed id
                scoreSpan.text(entry['score']);
                listItem.append(scoreSpan);
                scoreListElement.append(listItem);
            }
        },
        error: function(xhr, status, error) { // Added comprehensive error handler
            console.error("AJAX error fetching scores:", status, error);
            $("#highscore-list").html("<li>Failed to load highscores. Please try again.</li>");
        }
    });
}

/**
 * Adds a new high score entry to the database.
 * @param {string} playerName - The name of the player.
 * @param {number} finalScore - The score achieved.
 */
function submitNewScore(playerName, finalScore) { // Renamed ajax_add, n, s
    $.ajax({
        type: "POST",
        url: "data/db-handler.php",
        data: {
            operation: 'insert', // Renamed 'action'
            player: playerName, // Renamed 'name'
            scoreValue: finalScore // Renamed 'score'
        },
        error: function(xhr, status, error) { // Added error handler
            console.error("AJAX error submitting score:", status, error);
        }
    });
}

/**
 * Handles the submission of a new high score from the form.
 */
function handleScoreSubmission() { // Renamed addHighscore
    const inputField = $("input[type=text]");
    const submittedName = inputField.val();
    const currentScore = gameSession.scoreTracker.currentPoints; // Renamed game.score.score
    
    if (submittedName && submittedName.trim() !== "") { // Added input validation
        submitNewScore(submittedName, currentScore);
        // Update the form display
        $("#highscore-form").html('<button class="action-btn" onclick="gameSession.displaySection(\'highscore-content\');fetchTopScoresDelayed();">View All Scores</button>'); // Changed to button, renamed function, added class
    } else {
        alert("Please enter your name to submit your score!"); // User feedback for invalid input
    }
}

/**
 * Draws a rectangular wall segment on the provided context.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {number} gridUnitX - X-coordinate in grid units.
 * @param {number} gridUnitY - Y-coordinate in grid units.
 * @param {number} blockWidth - Width in grid units.
 * @param {number} blockHeight - Height in grid units.
 */
function renderMazeSegment(ctx, gridUnitX, gridUnitY, blockWidth, blockHeight) { // Renamed buildWall, context, gridX, gridY, width, height
    // console.log("Rendering Maze Segment"); // Removed original console.log
    
    // Assuming a standard grid cell size derived from the player entity's radius (e.g., pacman.radius = 15)
    const cellDimension = 15; 
    
    // Calculate actual pixel dimensions based on the logic: (blockWidth * 2 - 1) * cellDimension
    const pixelWidth = (blockWidth * 2 - 1) * cellDimension; 
    const pixelHeight = (blockHeight * 2 - 1) * cellDimension; 
    
    // Calculate starting pixel position: cellDimension / 2 + gridUnitX * 2 * cellDimension
    const startPixelX = cellDimension / 2 + gridUnitX * 2 * cellDimension; 
    const startPixelY = cellDimension / 2 + gridUnitY * 2 * cellDimension; 
    
    ctx.fillRect(startPixelX, startPixelY, pixelWidth, pixelHeight);
}

/**
 * Checks if a value falls within a specified range (inclusive).
 * @param {number} val - The value to check.
 * @param {number} lowerBound - The minimum allowed value.
 * @param {number} upperBound - The maximum allowed value.
 * @returns {boolean} True if the value is within the range, false otherwise.
 */
const isWithinRange = (val, lowerBound, upperBound) => val >= lowerBound && val <= upperBound; // Renamed between, converted to arrow function


// Enhanced Logging Utility (self-executing anonymous function for singleton pattern)
const enhancedLog = (function() { // Renamed logger
    let originalConsoleLog = null; // Renamed oldConsoleLog
    const publicInterface = {}; // Renamed pub

    /**
     * Re-enables console logging if it was previously disabled.
     */
    publicInterface.activateLogging = function() { // Renamed enableLogger
        if (originalConsoleLog === null) { 
            return; // Nothing to enable if not disabled
        }
        window.console.log = originalConsoleLog; // Restore original log function
        originalConsoleLog = null; // Reset reference
    };

    /**
     * Disables console logging, storing the original function.
     */
    publicInterface.deactivateLogging = function() { // Renamed disableLogger
        if (originalConsoleLog !== null) { 
            return; // Already disabled
        }
        originalConsoleLog = console.log;
        window.console.log = function() {}; // Replace with an empty function
    };

    return publicInterface;
})();

// Main Game Orchestration Object ("Engine Core")
function GameEngine() { // Renamed Game
    this.frameRateMs = 33; // Game update interval in milliseconds, renamed refreshRate
    this.isActive = false; // Is game running? renamed running
    this.isPaused = true; // Is game paused? renamed pause
    this.scoreTracker = new ScoreManager(); // Score handling instance, renamed score
    this.audioEnabled = 0; // Sound effects toggle (0=off, 1=on), renamed soundfx
    this.levelMap = null; // Current maze configuration, renamed map
    this.collectibleCount = 0; // Total number of pills/collectibles, renamed pillCount
    this.adversaries = []; // Array of ghost entities, renamed monsters
    this.currentLevel = 1; // Current game level, renamed level
    this.isGameOver = false; // Game over state, renamed gameOver

    // Canvas elements and dimensions
    this.mainCanvas = document.getElementById("myCanvas"); // Direct DOM access
    if (!this.mainCanvas) {
        console.error("Main canvas 'myCanvas' not found!");
        // Consider throwing an error or halting execution gracefully
        return; 
    }
    this.canvasWidth = this.mainCanvas.width; // Renamed width
    this.canvasHeight = this.mainCanvas.height; // Renamed height

    // Ghost behavior states
    this.phantomsFrightened = false; // Are ghosts in frightened mode? renamed ghostFrightened
    this.frightenedCountdown = 240; // Timer for frightened mode, renamed ghostFrightenedTimer
    this.phantomStrategy = 0; // 0 = Scatter, 1 = Chase, renamed ghostMode
    this.strategyCountdown = 200; // Timer for current ghost strategy, renamed ghostModeTimer
    
    // Additional state for game progression (was previously part of pacman)
    this.playerLives = 3; // Initial player lives

    /* --- Game Logic Functions --- */

    /**
     * Initiates the frightened state for all ghosts.
     */
    this.beginFrightenedMode = function() { // Renamed startGhostFrightened
        // console.log("phantoms frightened"); // Removed log
        this.phantomsFrightened = true;
        this.frightenedCountdown = 240;
        // Apply dazzle effect to all adversaries
        this.adversaries.forEach(phantom => phantom.applyDazzle()); // Using forEach for cleaner iteration
    };

    /**
     * Ends the frightened state for all ghosts.
     */
    this.endFrightenedMode = function() { // Renamed endGhostFrightened
        // console.log("phantoms frightened end"); // Removed log
        this.phantomsFrightened = false;
        // Remove dazzle effect from all adversaries
        this.adversaries.forEach(phantom => phantom.removeDazzle());
    };

    /**
     * Manages the ghost mode transitions (frightened, scatter, chase).
     */
    this.managePhantomBehavior = function() { // Renamed checkGhostMode
        if (this.phantomsFrightened) {
            this.frightenedCountdown--;
            if (this.frightenedCountdown <= 0) { // Changed to <= 0 for robustness
                this.endFrightenedMode();
                this.frightenedCountdown = 240; // Reset timer
                // Ghost direction reversal is now handled by individual ghost AI
            }
        } else {
            this.strategyCountdown--;
            if (this.strategyCountdown <= 0) { // Changed to <= 0
                this.phantomStrategy = 1 - this.phantomStrategy; // Toggles between 0 and 1 (equivalent to ^= 1)
                // console.log(`phantomStrategy=${this.phantomStrategy}`); // Removed log
                // Adjust timer based on new strategy (Scatter: 200, Chase: 200 + 450 = 650)
                this.strategyCountdown = (this.phantomStrategy === 0) ? 200 : 650; 
                // Ghost direction reversal is now handled by individual ghost AI
            }
        }
    };

    /**
     * Retrieves the type of content at a specific grid coordinate.
     * Handles wrapping around the map edges.
     * @param {number} xCoord - X-coordinate in grid units.
     * @param {number} yCoord - Y-coordinate in grid units.
     * @returns {string} The type of content at the given grid position.
     */
    this.getGridCellType = function(xCoord, yCoord) { // Renamed getMapContent
        const cellGridSize = 30; // Assuming grid cell is 30x30 pixels
        const maxGridX = Math.floor(this.canvasWidth / cellGridSize) - 1; 
        const maxGridY = Math.floor(this.canvasHeight / cellGridSize) - 1;

        // Apply toroidal wrapping (map edges connect)
        let adjustedX = (xCoord % (maxGridX + 1) + (maxGridX + 1)) % (maxGridX + 1);
        let adjustedY = (yCoord % (maxGridY + 1) + (maxGridY + 1)) % (maxGridY + 1);

        // Guard against invalid map structure
        if (!this.levelMap || !this.levelMap.posY || !this.levelMap.posY[adjustedY] || !this.levelMap.posY[adjustedY].posX) {
            console.warn(`Invalid map access at (${xCoord}, ${yCoord}) which mapped to (${adjustedX}, ${adjustedY}).`);
            return "empty"; // Default to empty if map data is malformed
        }

        return this.levelMap.posY[adjustedY].posX[adjustedX].type;
    };

    /**
     * Sets the type of content at a specific grid coordinate.
     * @param {number} xCoord - X-coordinate in grid units.
     * @param {number} yCoord - Y-coordinate in grid units.
     * @param {string} value - The new type to set.
     */
    this.setGridCellType = function(xCoord, yCoord, value) { // Renamed setMapContent
        // Add bounds check for safety and robustness
        if (this.levelMap && this.levelMap.posY[yCoord] && this.levelMap.posY[yCoord].posX[xCoord]) {
            this.levelMap.posY[yCoord].posX[xCoord].type = value;
        } else {
            console.warn(`Attempted to set out-of-bounds or invalid grid cell: (${xCoord}, ${yCoord})`);
        }
    };

    /**
     * Toggles the sound effects on or off.
     */
    this.toggleAudio = function() { // Renamed toggleSound
        this.audioEnabled = 1 - this.audioEnabled; // Toggles between 0 and 1
        $('#mute').toggle(); // Still using jQuery for simplicity here for UI
    };

    /**
     * Resets game elements (not fully implemented in original, so keeping minimal).
     */
    this.resetGameElements = function() { /* Placeholder for full reset logic */ }; // Renamed reset

    /**
     * Starts a new game session after confirmation.
     */
    this.startNewGame = function() { // Renamed newGame
        const userConfirms = confirm("Are you certain you wish to restart the current game?");
        if (userConfirms) {
            // console.log("Initiating new game"); // Removed log
            this.initializeSession(0); // 0 indicates a fresh start
        }
        this.togglePauseState(); // Resume game if paused, or pause if running
    };

    /**
     * Advances to the next game level.
     */
    this.advanceLevel = function() { // Renamed nextLevel
        this.currentLevel++;
        // console.log(`Advancing to Level ${this.currentLevel}`); // Removed log
        this.displayMessage(`Level ${this.currentLevel}`, "Level Up! Click to continue your adventure!"); // Renamed showMessage
        this.initializeSession(1); // 1 indicates level transition
    };

    /**
     * Draws player lives as heart icons.
     * @param {number} lifeCount - Number of lives to display.
     */
    this.drawLifeIndicators = function(lifeCount) { // Renamed drawHearts
        let lifeHtml = "";
        for (let i = 0; i < lifeCount; i++) {
            lifeHtml += " <img src='img/heart.png' alt='life icon'>"; // Added alt attribute for accessibility
        }
        $(".lives").html(`Lives: ${lifeHtml}`); // Using template literal for cleaner string concatenation
    };

    /**
     * Displays a specific content section and hides others.
     * @param {string} sectionId - The ID of the section to display.
     */
    this.displaySection = function(sectionId) { // Renamed showContent
        $('.content').hide();
        $(`#${sectionId}`).show();
    };

    /**
     * Shows an overlay message with a title and text.
     * @param {string} titleText - The title of the message.
     * @param {string} bodyHtml - The HTML content of the message body.
     */
    this.displayMessage = function(titleText, bodyHtml) { // Renamed showMessage
        this.isPaused = true;
        const overlayContainer = $('#canvas-overlay-container');
        overlayContainer.fadeIn(250); // Slightly adjusted fade duration

        const controlsElement = $('.controls');
        if (controlsElement.is(":visible")) { // Check visibility with .is(":visible")
            controlsElement.slideToggle(250); // Adjusted slide duration
        }
        $('#canvas-overlay-content #title').text(titleText);
        $('#canvas-overlay-content #text').html(bodyHtml);
    };

    /**
     * Hides the overlay message and restores controls.
     */
    this.hideMessage = function() { // Renamed closeMessage
        $('#canvas-overlay-container').fadeOut(250);
        $('.controls').slideToggle(250);
    };

    /**
     * Toggles the game's pause state.
     */
    this.togglePauseState = function() { // Renamed pauseResume
        if (!this.isActive) { // If game isn't running yet (initial start)
            this.isPaused = false;
            this.isActive = true;
            this.hideMessage();
            animationLoop(); // Assuming animationLoop is a global function
        } else if (this.isPaused) { // If currently paused, resume
            this.isPaused = false;
            this.hideMessage();
        } else { // If currently active and not paused, pause
            this.displayMessage("Game Paused", "Click to Resume Gameplay");
            this.isPaused = true; // Explicitly set pause state
        }
    };

    /**
     * Initializes a new game session or transitions between levels.
     * @param {number} sessionState - 0 for new game, 1 for level advance.
     */
    this.initializeSession = function(sessionState) { // Renamed init
        // console.log(`Initializing game session, state: ${sessionState}`); // Removed log

        // Fetch Level Map data synchronously for initial setup
        $.ajax({
            url: mapDataPath,
            async: false, 
            beforeSend: function(xhr) {
                if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
            },
            dataType: "json",
            success: function(data) {
                gameSession.levelMap = data; // Assign to gameSession instance
            },
            error: function(xhr, status, error) { // Added robust error handling
                console.error("Failed to load map data:", status, error);
                gameSession.isGameOver = true; 
                gameSession.displayMessage("Error!", "Could not load maze data. Game cannot start.");
            }
        });

        let currentPillCount = 0;
        // Count collectibles on the map using modern array iteration
        if (this.levelMap && Array.isArray(this.levelMap.posY)) { 
            this.levelMap.posY.forEach(row => { 
                if (row && Array.isArray(row.posX)) {
                    row.posX.forEach(cell => {
                        if (cell && cell.type === "pill") {
                            currentPillCount++;
                        }
                    });
                }
            });
        }
        this.collectibleCount = currentPillCount;

        if (sessionState === 0) { // New game start
            this.scoreTracker.setPoints(0);
            this.scoreTracker.updateDisplay(".score");
            playerCharacter.livesRemaining = 3; // Reset player lives
            this.currentLevel = 1;
            this.isGameOver = false;
        }
        
        playerCharacter.resetPosition(); // Reset player position (assuming playerCharacter exists)

        this.drawLifeIndicators(playerCharacter.livesRemaining);

        // Reset ghost states
        this.phantomsFrightened = false;
        this.frightenedCountdown = 240;
        this.phantomStrategy = 0; // Scatter mode
        this.strategyCountdown = 200;

        // Initialize or reset ghost entities
        if (!ghostOne) { // Check if ghosts are already initialized (first game load)
            ghostOne = new Specter("Ghosty", 7, 5, 'img/pinky.svg', 2, 2); // Renamed Inky, Pinky, Blinky, Clyde to Ghosty, Spooky, Shadow, Sneaky
            ghostTwo = new Specter("Spooky", 8, 5, 'img/inky.svg', 13, 11);
            ghostThree = new Specter("Shadow", 9, 5, 'img/blinky.svg', 13, 0);
            ghostFour = new Specter("Sneaky", 10, 5, 'img/clyde.svg', 2, 11);
            this.adversaries = [ghostOne, ghostTwo, ghostThree, ghostFour]; // Populate adversaries array
        } else {
            // console.log("Resetting existing phantoms"); // Removed log
            this.adversaries.forEach(phantom => phantom.resetState()); // Reset all existing phantoms
        }

        // Staggered starts for ghosts from the ghost house
        ghostThree.commenceMovement(); // Shadow (Blinky) starts first
        setTimeout(() => ghostTwo.commenceMovement(), 1000); // Spooky (Inky) starts after 1s
        setTimeout(() => ghostOne.commenceMovement(), 2000); // Ghosty (Pinky) starts after 2s
        setTimeout(() => ghostFour.commenceMovement(), 3000); // Sneaky (Clyde) starts after 3s
    };

    /**
     * Checks for game-winning condition (all pills collected).
     */
    this.checkForWinCondition = function() { // Renamed check
        if (this.collectibleCount === 0 && this.isActive) {
            this.advanceLevel();
        }
    };

    /** Placeholder for game win logic. */
    this.gameWinLogic = function() { /* Logic for winning the game */ }; // Renamed win
    /** Placeholder for game over logic. */
    this.handleGameOver = function() { /* Logic for game over */ }; // Renamed gameover

    /**
     * Converts a grid position to a pixel position.
     * @param {number} gridPos - Position in grid units.
     * @returns {number} Position in pixels.
     */
    this.convertToPixel = (gridPos) => gridPos * 30; // Renamed toPixelPos, converted to arrow function

    /**
     * Converts a pixel position to a grid position (fractional).
     * @param {number} pixelPos - Position in pixels.
     * @returns {number} Fractional grid position.
     */
    this.convertToGridFraction = (pixelPos) => (pixelPos % 30) / 30; // Renamed toGridPos, converted to arrow function
}

gameSession = new GameEngine(); // Renamed 'game' to 'gameSession'


// Manages the player's score
function ScoreManager() { // Renamed Score
    this.currentPoints = 0; // Renamed score

    /**
     * Sets the score to a specific value.
     * @param {number} value - The new score value.
     */
    this.setPoints = function(value) { // Renamed set
        this.currentPoints = value;
    };

    /**
     * Adds points to the current score.
     * @param {number} value - The points to add.
     */
    this.addPoints = function(value) { // Renamed add
        this.currentPoints += value;
    };

    /**
     * Updates the score display in the UI.
     * @param {string} selector - jQuery selector for the score display element.
     */
    this.updateDisplay = function(selector) { // Renamed refresh
        $(selector).html(`Current Score: ${this.currentPoints}`); // Changed text, using template literal
    };
}


// Global Sound Playback Utility (using an IIFE for a singleton pattern)
const AudioPlayer = new (function() { // Renamed Sound
    this.playEffect = function(soundId) { // Renamed play, sound
        // Check if game audio is enabled
        if (gameSession.audioEnabled === 1) {
            const audioElement = document.getElementById(soundId);
            if (audioElement instanceof HTMLAudioElement) { // Check if it's an actual audio element
                audioElement.currentTime = 0; // Rewind to start for quick replays
                audioElement.play().catch(e => console.warn(`Audio playback failed for ${soundId}:`, e)); // Added error handling for play() promise
            } else {
                // console.log(`Audio element "${soundId}" not found or not an audio element.`); // Removed log
            }
        }
    };
})();


// Movement Vector Object
function MoveVector(nameStr, angleRad1, angleRad2, deltaX, deltaY) { // Renamed Direction, name, angle1, angle2, dirX, dirY
    this.vectorName = nameStr; // Renamed name
    this.startAngle = angleRad1; // Renamed angle1
    this.endAngle = angleRad2; // Renamed angle2
    this.changeX = deltaX; // Renamed dirX
    this.changeY = deltaY; // Renamed dirY
    
    /**
     * Compares this movement vector to another.
     * @param {MoveVector} otherVector - The other vector to compare with.
     * @returns {boolean} True if vectors are identical, false otherwise.
     */
    this.isEqual = function(otherVector) { // Renamed equals
        // Guard clause for null/undefined or non-object comparison
        if (!otherVector || typeof otherVector !== 'object') return false; 
        
        // Direct property comparison is more efficient than JSON.stringify for simple objects
        return this.vectorName === otherVector.vectorName &&
               this.startAngle === otherVector.startAngle &&
               this.endAngle === otherVector.endAngle &&
               this.changeX === otherVector.changeX &&
               this.changeY === otherVector.changeY;
    };
}

// Predefined Movement Vectors (Constants)
const moveUp = new MoveVector("Upward", 1.75, 1.25, 0, -1); // Renamed 'up'
const moveLeft = new MoveVector("Leftward", 1.25, 0.75, -1, 0); // Renamed 'left'
const moveDown = new MoveVector("Downward", 0.75, 0.25, 0, 1); // Renamed 'down'
const moveRight = new MoveVector("Rightward", 0.25, 1.75, 1, 0); // Renamed 'right'


// Player Input Direction Handler
function InputDirectionHandler() { // Renamed directionWatcher
    let currentInputDirection = null; // Renamed 'dir'

    /**
     * Sets the current desired input direction.
     * @param {MoveVector} newDirection - The new direction vector.
     */
    this.setDirection = function(newDirection) { // Renamed 'set'
        currentInputDirection = newDirection;
    };

    /**
     * Retrieves the current desired input direction.
     * @returns {MoveVector} The current direction vector.
     */
    this.getDirection = function() { // Renamed 'get'
        return currentInputDirection;
    };
}

// Global instance of the input direction handler (if needed elsewhere)
// const playerInputHandler = new InputDirectionHandler(); // Uncomment if needed as a global


// Specter (Ghost) Entity Definition
function Specter(entityName, initialGridX, initialGridY, entityImageSrc, baseGridX, baseGridY) { // Renamed Ghost, name, gridPosX, gridPosY, image, gridBaseX, gridBaseY
    this.entityId = entityName; // Renamed name
    this.pixelX = initialGridX * 30; // Renamed posX
    this.pixelY = initialGridY * 30; // Renamed posY
    this.initialPixelX = initialGridX * 30; // Renamed startPosX
    this.initialPixelY = initialGridY * 30; // Renamed startPosY
    this.homeGridX = baseGridX; // Renamed gridBaseX
    this.homeGridY = baseGridY; // Renamed gridBaseY
    this.movementSpeed = 5; // Renamed speed
    
    // Complex image data structure re-written and simplified for sprite sheet indexing/paths
    this.spriteSheets = {
        "normal": { // For indexing into a combined ghost sprite sheet if available
            "Ghosty": 0, "Spooky": 1, "Shadow": 2, "Sneaky": 3 
        },
        "frightened": "img/dazzled.svg", // Path for frightened sprite
        "frightened_alt": "img/dazzled2.svg", // Path for blinking frightened sprite
        "defeated": "img/dead.svg" // Path for defeated sprite
    };

    this.mainImage = new Image();
    this.mainImage.src = entityImageSrc; // Renamed image

    this.inGhostHouse = true; // Renamed ghostHouse
    this.isDazzled = false; // Renamed dazzled
    this.isDefeated = false; // Added new state for clarity, derived from 'dead'

    /**
     * Puts the ghost into a dazzled (frightened) state.
     */
    this.applyDazzle = function() { // Renamed dazzle
        this.adjustSpeed(3); // Slower speed when dazzled
        // Ensure pixel alignment with new speed to prevent visual glitches
        this.pixelX = Math.floor(this.pixelX / this.movementSpeed) * this.movementSpeed;
        this.pixelY = Math.floor(this.pixelY / this.movementSpeed) * this.movementSpeed;
        this.isDazzled = true;
    };

    /**
     * Removes the dazzled state from the ghost.
     */
    this.removeDazzle = function() { // Renamed undazzle
        // Only restore speed if not defeated
        if (!this.isDefeated) {
            this.adjustSpeed(5); // Restore original speed
        }
        // Ensure pixel alignment
        this.pixelX = Math.floor(this.pixelX / this.movementSpeed) * this.movementSpeed;
        this.pixelY = Math.floor(this.pixelY / this.movementSpeed) * this.movementSpeed;
        this.isDazzled = false;
    };

    this.dazzleSprite = new Image();
    this.dazzleSprite.src = this.spriteSheets.frightened; // Renamed dazzleImg
    this.dazzleSpriteAlt = new Image();
    this.dazzleSpriteAlt.src = this.spriteSheets.frightened_alt; // Renamed dazzleImg2
    this.defeatedSprite = new Image();
    this.defeatedSprite.src = this.spriteSheets.defeated; // Renamed deadImg

    this.currentDirection = moveRight; // Renamed direction, initialized to a specific direction
    this.entityRadius = 15; // Assuming pacman.radius is 15. Make this a global constant if possible.

    /**
     * Draws the ghost on the canvas context.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     */
    this.renderEntity = function(ctx) { // Renamed draw
        const drawSize = 2 * this.entityRadius; // width and height for drawing

        if (this.isDefeated) {
            ctx.drawImage(this.defeatedSprite, this.pixelX, this.pixelY, drawSize, drawSize);
        } else if (this.isDazzled) {
            // Blink the frightened ghost when its timer is low, using playerCharacter's timer
            // Assuming playerCharacter is a global object with frightModeDuration
            const playerFrightRemaining = gameSession.frightenedCountdown; 
            const shouldBlink = (playerFrightRemaining < 50 && (Math.floor(playerFrightRemaining / 4) % 2 === 0)); // Blink every 4 frames (8 original frames / 2)
            
            if (shouldBlink) {
                ctx.drawImage(this.dazzleSpriteAlt, this.pixelX, this.pixelY, drawSize, drawSize);
            } else {
                ctx.drawImage(this.dazzleSprite, this.pixelX, this.pixelY, drawSize, drawSize);
            }
        } else {
            ctx.drawImage(this.mainImage, this.pixelX, this.pixelY, drawSize, drawSize);
        }
    };

    /**
     * Gets the center X-coordinate of the ghost.
     * @returns {number} Center X-coordinate.
     */
    this.getCenterXCoordinate = function() { // Renamed getCenterX
        return this.pixelX + this.entityRadius;
    };

    /**
     * Gets the center Y-coordinate of the ghost.
     * @returns {number} Center Y-coordinate.
     */
    this.getCenterYCoordinate = function() { // Renamed getCenterY
        return this.pixelY + this.entityRadius;
    };

    /**
     * Resets the ghost to its initial state and position.
     */
    this.resetState = function() { // Renamed reset
        this.isDefeated = false;
        this.pixelX = this.initialPixelX;
        this.pixelY = this.initialPixelY;
        this.inGhostHouse = true;
        this.removeDazzle(); // Ensure dazzle is off and speed is reset
        this.movementSpeed = 5; // Explicitly reset speed to default
        this.currentDirection = moveRight; // Reset direction to default
    };

    /**
     * Marks the ghost as defeated and adjusts its speed.
     */
    this.markAsDefeated = function() { // Renamed die
        this.isDefeated = true;
        this.adjustSpeed(7); // Faster speed when defeated (returning to base)
        this.removeDazzle(); // Ensure it's not dazzled when defeated
    };

    /**
     * Adjusts the ghost's movement speed and re-aligns its position to the grid.
     * @param {number} newSpeed - The new speed value.
     */
    this.adjustSpeed = function(newSpeed) { // Renamed changeSpeed
        // Re-align position to the grid based on new speed
        this.pixelX = Math.round(this.pixelX / newSpeed) * newSpeed;
        this.pixelY = Math.round(this.pixelY / newSpeed) * newSpeed;
        this.movementSpeed = newSpeed;
    };
    
    /**
     * Initiates the ghost's movement out of the ghost house.
     */
    this.commenceMovement = function() {
        if (this.inGhostHouse) { // Only commence if still in house
            this.inGhostHouse = false;
            // Additional logic to guide ghost out of specific house exit could go here.
            // For now, simply setting `inGhostHouse` to false is sufficient.
        }
    };

    /**
     * Handles the ghost's movement logic, including direction changes and collision checks.
     */
    this.updateMovement = function() { // Renamed move
        this.evaluateDirectionChange(); // Renamed checkDirectionChange
        this.detectCollisions(); // Renamed checkCollision

        // Conditional logic for leaving the Ghost House
        if (this.inGhostHouse) {
            let shouldRemainStopped = false;
            const totalInitialPills = 104; // Assuming total number of pills at game start

            // Sneaky (Clyde) doesn't chase until fewer than ~1/3 of pills remain
            if (this.entityId === "Sneaky") {
                shouldRemainStopped = (gameSession.collectibleCount > Math.ceil(totalInitialPills / 3)); 
            }
            // Spooky (Inky) starts after a certain number of pills are eaten (e.g., 30 pills eaten)
            else if (this.entityId === "Spooky") {
                shouldRemainStopped = (gameSession.collectibleCount > (totalInitialPills - 30));
            }
            // Ghosty (Pinky) and Shadow (Blinky) typically leave earlier or immediately.
            // The `commenceMovement` function explicitly sets `inGhostHouse = false`.
            // So, if `shouldRemainStopped` is true for Sneaky/Spooky, they won't leave yet.
            if (shouldRemainStopped) {
                // If the ghost should remain stopped in the house, exit the movement update.
                return; 
            }
            // If `commenceMovement` has been called, `inGhostHouse` is false, and this block is skipped.
        }
        
        // Placeholder for actual movement based on currentDirection and movementSpeed
        // This part was not fully detailed in the provided snippet's `move` function.
        // A complete implementation would involve:
        // this.pixelX += this.currentDirection.changeX * this.movementSpeed;
        // this.pixelY += this.currentDirection.changeY * this.movementSpeed;
        // ... followed by boundary checks and collision resolution.
    };
    
    // Placeholder methods for missing parts of original `Ghost.move` logic
    this.evaluateDirectionChange = function() {
        // This is where pathfinding/AI logic for ghosts would determine their next direction
        // based on game state (scatter, chase, frightened modes), player position, and maze layout.
    };

    this.detectCollisions = function() {
        // This is where collision detection with walls, player, and other game elements would occur.
    };
}