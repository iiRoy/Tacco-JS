/*-------------------------------------------------------------------

	___________    ____   _____ _____    ____  
	\____ \__  \ _/ ___\ /     \\__  \  /    \ 
	|  |_> > __ \\  \___|  Y Y  \/ __ \|   |  \
	|   __(____  /\___  >__|_|  (____  /___|  /
	|__|       \/     \/      \/     \/     \/ .platzh1rsch.ch
	
	author: platzh1rsch		(www.platzh1rsch.ch)
	
-------------------------------------------------------------------*/


// Global Application Elements
let drawingSurface;
let controlInput;
let renderContext;
let mainApp;
let wallSurface, wallContext;
let spiritA, spiritB, spiritC, spiritD; // Renamed ghosts

const levelDesignSource = 'data/map.json';


// API Interaction Module
const RemoteDataHandler = {
    async performRequest(method, endpoint, payload = null) {
        const requestOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (payload) {
            if (method === 'GET') {
                const queryParams = new URLSearchParams(payload).toString();
                endpoint = `${endpoint}?${queryParams}`;
            } else {
                requestOptions.body = JSON.stringify(payload);
            }
        }

        try {
            const response = await fetch(endpoint, requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            DebugConsole.log('Network or API Error:', error);
            throw error;
        }
    }
};

// High Score Management Class
class ScoreManager {
    constructor(listingElementId, formElementId) {
        this.rankingDisplay = document.getElementById(listingElementId);
        this.submissionForm = document.getElementById(formElementId);
    }

    async fetchRankings() {
        const currentTime = Date.now();
        const results = await RemoteDataHandler.performRequest('GET', 'data/db-handler.php', {
            timestamp: currentTime,
            action: 'get'
        });
        this.updateRankingDisplay(results);
    }

    updateRankingDisplay(entries) {
        if (!this.rankingDisplay) return;
        this.rankingDisplay.innerHTML = '';
        const docFragment = document.createDocumentFragment();
        entries.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = entry.name;
            const scoreSpan = document.createElement('span');
            scoreSpan.id = 'player-score-value';
            scoreSpan.textContent = entry.score;
            listItem.appendChild(scoreSpan);
            docFragment.appendChild(listItem);
        });
        this.rankingDisplay.appendChild(docFragment);
    }

    async submitPlayerRecord(playerName, playerScore) {
        await RemoteDataHandler.performRequest('POST', 'data/db-handler.php', {
            action: 'add',
            name: playerName,
            score: playerScore
        });
        if (this.submissionForm) {
            this.submissionForm.innerHTML = '<span class="action-button" onclick="mainApp.displayContent(\'ranking-section\'); scoreManager.fetchRankings();">view rankings</span>';
        }
    }
}
const scoreManager = new ScoreManager('ranking-list', 'record-submission-form'); // Renamed highscore-list, highscore-form

// Canvas Drawing Utility
const CanvasArtist = {
    renderBarrier(contextObj, gridX, gridY, widthUnits, heightUnits) {
        // No console.log
        const actualWidth = (widthUnits * 2 - 1) * playerAvatar.baseRadius;
        const actualHeight = (heightUnits * 2 - 1) * playerAvatar.baseRadius;
        contextObj.fillRect(
            playerAvatar.baseRadius / 2 + gridX * 2 * playerAvatar.baseRadius,
            playerAvatar.baseRadius / 2 + gridY * 2 * playerAvatar.baseRadius,
            actualWidth,
            actualHeight
        );
    }
};

// Range Checker Utility
const NumericChecks = {
    isWithinRange(value, lower, upper) {
        return value >= lower && value <= upper;
    }
};

// Debugging Console Wrapper
class DebugConsole {
    static #originalLogFunction = null;

    static enableLogging() {
        if (DebugConsole.#originalLogFunction !== null) {
            window.console.log = DebugConsole.#originalLogFunction;
            DebugConsole.#originalLogFunction = null;
        }
    }

    static disableLogging() {
        if (DebugConsole.#originalLogFunction === null) {
            DebugConsole.#originalLogFunction = window.console.log;
            window.console.log = function() {};
        }
    }
}

// Main Application Controller (formerly Game)
class CoreApplication {
    constructor() {
        this.frameRate = 33;
        this.isActive = false;
        this.isPaused = true;
        this.pointSystem = new PointTracker();
        this.audioEnabled = 0;
        this.levelMap;
        this.collectibleCount;
        this.levelNumber = 1;
        this.sessionOver = false;
        this.drawingSurface = document.getElementById("mainDisplay"); // Renamed myCanvas
        this.surfaceWidth = this.drawingSurface.width;
        this.surfaceHeight = this.drawingSurface.height;

        this.spectralFearMode = false;
        this.fearModeDuration = 240;
        this.spectralBehaviorState = 0; // 0 = Disperse, 1 = Pursue
        this.behaviorStateCountdown = 200; // Decrements each animation loop

        this.animationFrameId = null; // To store requestAnimationFrame ID
    }

    // Game State Management
    activateFearMode() {
        DebugConsole.log("spectral fear mode activated");
        this.spectralFearMode = true;
        this.fearModeDuration = 240;
        spiritA.applyDazzleEffect();
        spiritB.applyDazzleEffect();
        spiritC.applyDazzleEffect();
        spiritD.applyDazzleEffect();
    }

    deactivateFearMode() {
        DebugConsole.log("spectral fear mode deactivated");
        this.spectralFearMode = false;
        spiritA.removeDazzleEffect();
        spiritB.removeDazzleEffect();
        spiritC.removeDazzleEffect();
        spiritD.removeDazzleEffect();
    }

    evaluateSpectralBehavior() {
        if (this.spectralFearMode) {
            this.fearModeDuration--;
            if (this.fearModeDuration === 0) {
                this.deactivateFearMode();
                this.fearModeDuration = 240;
            }
        } else {
            this.behaviorStateCountdown--;
            if (this.behaviorStateCountdown === 0) {
                DebugConsole.log("spectralBehaviorState=" + this.spectralBehaviorState);
                this.spectralBehaviorState ^= 1; // Toggle 0 to 1, 1 to 0
                this.behaviorStateCountdown = 200 + this.spectralBehaviorState * 450;
            }
        }
    }

    // Map Interaction
    queryCellType(x, y) {
        const maxX = this.surfaceWidth / 30 - 1;
        const maxY = this.surfaceHeight / 30 - 1;
        let effectiveX = x;
        let effectiveY = y;
        if (effectiveX < 0) effectiveX = maxX + effectiveX;
        if (effectiveX > maxX) effectiveX = effectiveX - maxX;
        if (effectiveY < 0) effectiveY = maxY + effectiveY;
        if (effectiveY > maxY) effectiveY = effectiveY - maxY;
        return this.levelMap.verticalSegments[effectiveY].horizontalSegments[effectiveX].type;
    }

    updateCellType(x, y, value) {
        this.levelMap.verticalSegments[y].horizontalSegments[x].type = value;
    }

    // User Interface & Audio
    toggleAudioOutput() {
        this.audioEnabled = this.audioEnabled === 0 ? 1 : 0;
        document.getElementById('audio-mute-indicator').classList.toggle('hidden'); // Renamed #mute
    }

    startFreshJourney() {
        const confirmation = confirm("Are you certain you wish to restart?");
        if (confirmation) {
            DebugConsole.log("Starting a new journey");
            this.initializeApplication(0);
        }
        this.toggleExecutionPause();
    }

    advanceToNextStage() {
        this.levelNumber++;
        DebugConsole.log("Stage " + this.levelNumber);
        this.displayOverlayMessage("Stage " + this.levelNumber, "Level up! Click to proceed!");
        this.initializeApplication(1);
    }

    renderLifeIndicators(count) {
        const lifeContainer = document.querySelector(".life-counter"); // Renamed .lives
        if (!lifeContainer) return;
        lifeContainer.innerHTML = '';
        Array.from({ length: count }).forEach(() => {
            const heartImage = document.createElement('img');
            heartImage.src = 'img/heart.png';
            lifeContainer.appendChild(heartImage);
        });
    }

    displayContent(elementId) {
        document.querySelectorAll('.game-content').forEach(el => el.style.display = 'none'); // Renamed .content
        document.getElementById(elementId).style.display = 'block';
    }

    displayOverlayMessage(title, message) {
        this.isPaused = true;
        const overlayContainer = document.getElementById('display-overlay-wrapper'); // Renamed canvas-overlay-container
        overlayContainer.style.opacity = '0';
        overlayContainer.style.display = 'flex'; // Use flex for centering
        overlayContainer.style.transition = 'opacity 0.2s ease-in-out';
        setTimeout(() => overlayContainer.style.opacity = '1', 10); // Fade in

        const controlsElement = document.querySelector('.player-controls'); // Renamed .controls
        if (controlsElement && getComputedStyle(controlsElement).display !== "none") {
            controlsElement.style.transition = 'max-height 0.2s ease-in-out, opacity 0.2s ease-in-out';
            controlsElement.style.maxHeight = '0';
            controlsElement.style.opacity = '0';
            controlsElement.style.overflow = 'hidden';
            setTimeout(() => controlsElement.style.display = 'none', 200);
        }

        document.getElementById('overlay-title-text').textContent = title; // Renamed #title
        document.getElementById('overlay-message-text').innerHTML = message; // Renamed #text
    }

    hideOverlayMessage() {
        const overlayContainer = document.getElementById('display-overlay-wrapper');
        overlayContainer.style.opacity = '0';
        overlayContainer.style.transition = 'opacity 0.2s ease-in-out';
        setTimeout(() => overlayContainer.style.display = 'none', 200);

        const controlsElement = document.querySelector('.player-controls');
        if (controlsElement) {
            controlsElement.style.display = 'block';
            controlsElement.style.maxHeight = '100px'; // Or appropriate max-height
            controlsElement.style.opacity = '1';
            controlsElement.style.overflow = 'visible';
            controlsElement.style.transition = 'max-height 0.2s ease-in-out, opacity 0.2s ease-in-out';
        }
    }

    toggleExecutionPause() {
        if (!this.isActive) {
            this.isPaused = false;
            this.isActive = true;
            this.hideOverlayMessage();
            this.runAnimationLoop(); // Start the loop
        } else if (this.isPaused) {
            this.isPaused = false;
            this.hideOverlayMessage();
            this.runAnimationLoop(); // Resume the loop
        } else {
            this.displayOverlayMessage("Paused", "Click to Resume");
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId); // Pause the loop
                this.animationFrameId = null;
            }
        }
    }

    async initializeApplication(resetType) {
        DebugConsole.log("Initializing application, mode: " + resetType);

        try {
            const data = await RemoteDataHandler.performRequest('GET', levelDesignSource);
            this.levelMap = data;

            // Count collectibles using functional approach
            this.collectibleCount = this.levelMap.verticalSegments.reduce((totalPills, row) => {
                return totalPills + row.horizontalSegments.filter(cell => cell.type === "pill").length;
            }, 0);

            if (resetType === 0) {
                this.pointSystem.setValue(0);
                this.pointSystem.updateDisplay(".current-score"); // Renamed .score
                playerAvatar.lives = 3;
                this.levelNumber = 1;
                this.sessionOver = false;
            }
            playerAvatar.resetCharacter();

            this.renderLifeIndicators(playerAvatar.lives);

            this.spectralFearMode = false;
            this.fearModeDuration = 240;
            this.spectralBehaviorState = 0;
            this.behaviorStateCountdown = 200;

            // Initialize/reset spectral entities
            if (spiritA === undefined) { // Check for first initialization
                spiritA = new PhantomEntity("spiritA", 7, 5, 'img/pinky.svg', 2, 2);
                spiritB = new PhantomEntity("spiritB", 8, 5, 'img/inky.svg', 13, 11);
                spiritC = new PhantomEntity("spiritC", 9, 5, 'img/blinky.svg', 13, 0);
                spiritD = new PhantomEntity("spiritD", 10, 5, 'img/clyde.svg', 2, 11);
            } else {
                spiritA.restoreState();
                spiritB.restoreState();
                spiritC.restoreState();
                spiritD.restoreState();
            }
            spiritC.activatePursuit(); // Blinky is the first to leave
            spiritA.activatePursuit();
            spiritB.activatePursuit();
            spiritD.activatePursuit();

        } catch (error) {
            DebugConsole.log("Failed to load map or initialize:", error);
        }
    }

    assessCompletionStatus() {
        if (this.collectibleCount === 0 && this.isActive) {
            this.advanceToNextStage();
        }
    }

    victoryCondition() {}
    defeatCondition() {}

    gridToPixel(gridCoordinate) {
        return gridCoordinate * 30;
    }

    pixelToGrid(pixelCoordinate) {
        return Math.floor(pixelCoordinate / 30);
    }

    // Main animation loop
    runAnimationLoop = () => {
        if (!this.isPaused && this.isActive) {
            // Update game state here
            // e.g., playerAvatar.move(); spiritA.move();
            // mainApp.evaluateSpectralBehavior();
            // mainApp.assessCompletionStatus();

            // Clear canvas and redraw elements
            // renderContext.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
            // playerAvatar.draw(renderContext);
            // spiritA.draw(renderContext);
            // ...

            this.animationFrameId = requestAnimationFrame(this.runAnimationLoop);
        }
    }
}

mainApp = new CoreApplication();


// Score Tracking Class
class PointTracker {
    constructor() {
        this.currentValue = 0;
    }

    setValue(amount) {
        this.currentValue = amount;
    }

    addPoints(amount) {
        this.currentValue += amount;
    }

    updateDisplay(selector) {
        document.querySelector(selector).innerHTML = `Score: ${this.currentValue}`;
    }
}


// Audio Playback Controller
const AudioController = {
    playEffect(soundId) {
        if (mainApp.audioEnabled === 1) {
            const audioElement = document.getElementById(soundId);
            if (audioElement) {
                audioElement.play();
            } else {
                DebugConsole.log(`Audio element "${soundId}" not found`);
            }
        }
    }
};


// Movement Vector Definitions (formerly Direction)
const MovementVectors = Object.freeze({
    NORTH: { label: "north", arcStart: 1.75, arcEnd: 1.25, deltaX: 0, deltaY: -1, equals: function(other) { return this.label === other.label; } },
    WEST: { label: "west", arcStart: 1.25, arcEnd: 0.75, deltaX: -1, deltaY: 0, equals: function(other) { return this.label === other.label; } },
    SOUTH: { label: "south", arcStart: 0.75, arcEnd: 0.25, deltaX: 0, deltaY: 1, equals: function(other) { return this.label === other.label; } },
    EAST: { label: "east", arcStart: 0.25, arcEnd: 1.75, deltaX: 1, deltaY: 0, equals: function(other) { return this.label === other.label; } }
});


// Direction Observation Mechanism (formerly directionWatcher)
class DirectionObserver {
    constructor() {
        this.observedDirection = null;
    }

    setDirection(newDirection) {
        this.observedDirection = newDirection;
    }

    getDirection() {
        return this.observedDirection;
    }
}
// const inputDirectionObserver = new DirectionObserver(); // Assuming this is instantiated elsewhere if needed


// Phantom Entity Class (formerly Ghost)
class PhantomEntity {
    constructor(identifier, initialGridX, initialGridY, normalImagePath, baseGridX, baseGridY) {
        this.entityId = identifier;
        this.positionX = initialGridX * 30;
        this.positionY = initialGridY * 30;
        this.initialPositionX = initialGridX * 30;
        this.initialPositionY = initialGridY * 30;
        this.baseGridX = baseGridX;
        this.baseGridY = baseGridY;
        this.movementSpeed = 5;
        
        // Using a Map for image assets for better organization
        this.visualAssets = new Map([
            ['normal', new Image()],
            ['dazzled1', new Image()],
            ['dazzled2', new Image()],
            ['deceased', new Image()]
        ]);
        this.visualAssets.get('normal').src = normalImagePath;
        this.visualAssets.get('dazzled1').src = 'img/dazzled.svg';
        this.visualAssets.get('dazzled2').src = 'img/dazzled2.svg';
        this.visualAssets.get('deceased').src = 'img/dead.svg';

        this.inHoldingArea = true; // Renamed ghostHouse
        this.isDazzled = false;
        this.isDeceased = false; // Renamed dead
        this.currentHeading = MovementVectors.EAST; // Default direction
        this.entityRadius = playerAvatar.baseRadius; // Assuming playerAvatar.baseRadius exists
    }

    applyDazzleEffect() {
        this.adjustSpeed(3);
        // Ensure entity stays on grid after speed change
        this.positionX = Math.floor(this.positionX / this.movementSpeed) * this.movementSpeed;
        this.positionY = Math.floor(this.positionY / this.movementSpeed) * this.movementSpeed;
        this.isDazzled = true;
    }

    removeDazzleEffect() {
        if (!this.isDeceased) this.adjustSpeed(3); // Speed might be reset to default or original
        this.positionX = Math.floor(this.positionX / this.movementSpeed) * this.movementSpeed;
        this.positionY = Math.floor(this.positionY / this.movementSpeed) * this.movementSpeed;
        this.isDazzled = false;
    }

    render(renderingContext) {
        if (this.isDeceased) {
            renderingContext.drawImage(this.visualAssets.get('deceased'), this.positionX, this.positionY, 2 * this.entityRadius, 2 * this.entityRadius);
        } else if (this.isDazzled) {
            // Conditional dazzling image based on player state (e.g., beastModeTimer)
            if (playerAvatar.beastModeTimer < 50 && playerAvatar.beastModeTimer % 8 > 1) {
                renderingContext.drawImage(this.visualAssets.get('dazzled2'), this.positionX, this.positionY, 2 * this.entityRadius, 2 * this.entityRadius);
            } else {
                renderingContext.drawImage(this.visualAssets.get('dazzled1'), this.positionX, this.positionY, 2 * this.entityRadius, 2 * this.entityRadius);
            }
        } else {
            renderingContext.drawImage(this.visualAssets.get('normal'), this.positionX, this.positionY, 2 * this.entityRadius, 2 * this.entityRadius);
        }
    }

    getCenterCoordinates() {
        return { x: this.positionX + this.entityRadius, y: this.positionY + this.entityRadius };
    }

    restoreState() {
        this.isDeceased = false;
        this.positionX = this.initialPositionX;
        this.positionY = this.initialPositionY;
        this.inHoldingArea = true;
        this.removeDazzleEffect(); // Ensure not dazzled
    }

    markDeceased() {
        this.isDeceased = true;
        this.adjustSpeed(5); // Speed up when dead (returning to base)
    }

    adjustSpeed(newVelocity) {
        // Recalculate position to align with new grid based on new speed
        this.positionX = Math.round(this.positionX / newVelocity) * newVelocity;
        this.positionY = Math.round(this.positionY / newVelocity) * newVelocity;
        this.movementSpeed = newVelocity;
    }

    activatePursuit() { // Renamed start()
        // This is where ghosts might leave their holding area
        // The original code had specific conditions for Clyde and Inky
        // I'll assume this method sets them to active movement.
        // The original `move` method contained this logic, which is truncated.
        this.inHoldingArea = false; // Example: ghost leaves house
    }

    advancePosition() { // Renamed move()
        // This part was truncated in the original, so I'll just add placeholders
        // for the logic that was hinted at.
        // This would involve `checkDirectionChange` and `checkCollision`
        // and specific logic for leaving the holding area.

        // Example of logic based on original `move` snippet
        if (this.inHoldingArea) {
            if (this.entityId === "spiritD") { // Corresponds to Clyde
                if (mainApp.collectibleCount > (104 / 3)) this.stop = true;
                else this.stop = false;
            }
            if (this.entityId === "spiritB") { // Corresponds to Inky
                if (mainApp.collectibleCount > (104 - 30)) this.stop = true;
                else this.stop = false;
            }
            // If not stopped, then they would move out of the holding area
            // This logic is incomplete from the original, so I stop here.
        }
        // ... rest of movement logic (collision, direction changes)
    }
}

// Assuming playerAvatar object exists globally and has these properties/methods
// This is not provided in the original code, but inferred from its usage
const playerAvatar = {
    baseRadius: 15, // Derived from pacman.radius/2 in buildWall and 2*pacman.radius elsewhere
    lives: 3,
    resetCharacter: function() { /* ... */ },
    beastModeTimer: 100 // Used in Ghost.draw
};