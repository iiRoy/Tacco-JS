(function(){
var gameEngine;

// This module encapsulates the core game logic and display management.
var TapChallengeApp = arc.Class.create(arc.Game, {
    gridRows: 5,
    gridCols: 5,
    topPadding: 10,
    leftPadding: 10,
    spacing: 4, // Space between number tiles

    // Constructor equivalent for the game application.
    setupGame: function(initParams) {
        // Initialize internal state variables for game progression.
        this.nextTarget = 1;
        this.tileCollection = []; // Stores references to the interactive number tiles.
        this.sequenceValues = []; // Holds the shuffled sequence of numbers.
        this.gameClock = new arc.Timer(); // Manages game time.
        this.gameActive = false; // Flag to indicate if the game is currently running.
        this.totalTiles = this.gridRows * this.gridCols; // Total number of tiles on the board.

        // Setup the display for elapsed time.
        this.timeDisplay = new arc.display.TextField();
        this.timeDisplay.setX(160);
        this.timeDisplay.setY(350);
        this.timeDisplay.setAlign(arc.display.Align.CENTER);
        this.timeDisplay.setFont("Arial", 32, true);
        this.timeDisplay.setColor(0xFFA500); // Orange color for time display.
        this.addChild(this.timeDisplay); // Add to the display list.

        // Create and configure the initial game overlay / start screen.
        this.startOverlay = new GameStartOverlay();
        this.startOverlay.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this.handleOverlayTap, this));

        // Populate the game board with numeric tiles.
        for (let idx = 0; idx < this.totalTiles; idx++) {
            let currentTile = new NumericTile();
            let rowIdx = Math.floor(idx / this.gridCols);
            let colIdx = idx % this.gridRows; // Corrected from original for row/col logic

            // Position each tile based on grid layout and spacing.
            let tilePosX = this.leftPadding + colIdx * (NumericTile.tileWidth + this.spacing);
            let tilePosY = this.topPadding + rowIdx * (NumericTile.tileHeight + this.spacing);
            currentTile.setX(tilePosX);
            currentTile.setY(tilePosY);

            // Attach event listener for tile clicks.
            currentTile.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this.processTileClick, this));

            this.addChild(currentTile); // Add tile to the game display.
            this.tileCollection.push(currentTile); // Store tile reference.
            this.sequenceValues.push(idx + 1); // Populate initial ordered sequence.
        }
        this.addChild(this.startOverlay); // Ensure the overlay is on top.
    },

    // Initiates a new round of the game.
    beginRound: function() {
        if (this.gameActive) {
            console.warn("Attempted to start an already active game.");
            return;
        }

        this.nextTarget = 1; // Reset the target number to find.
        this.gameClock.start(); // Begin timing the game.
        this.gameActive = true; // Set game state to active.

        // Perform a Fisher-Yates shuffle on the sequence of numbers.
        let tempSequence = [...this.sequenceValues]; // Create a copy to shuffle
        for (let i = tempSequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tempSequence[i], tempSequence[j]] = [tempSequence[j], tempSequence[i]]; // Swap elements
        }
        this.sequenceValues = tempSequence; // Update the main sequence.

        // Assign shuffled numbers to buttons and ensure they are active.
        for (let i = 0; i < this.tileCollection.length; i++) {
            let tileRef = this.tileCollection[i];
            tileRef.assignValue(this.sequenceValues[i]);
            tileRef.setActiveState(true); // Make all tiles clickable initially.
        }
    },

    // Event handler for the start overlay being tapped.
    handleOverlayTap: function(event) {
        // Only proceed if the game isn't already running.
        if (!this.gameActive) {
            this.removeChild(this.startOverlay); // Remove the overlay from view.
            // Introduce a slight delay for better UX before game starts.
            setTimeout(() => this.beginRound(), 200);
        }
    },

    // Event handler for when a numeric tile is clicked.
    processTileClick: function(event) {
        let clickedTile = event.target;
        // Basic validation: ensure a tile and its value exist, and game is active.
        if (!clickedTile || typeof clickedTile.retrieveValue !== 'function' || !this.gameActive) {
            return;
        }

        const tileValue = clickedTile.retrieveValue();

        // Check if the clicked tile matches the currently expected number.
        if (tileValue === this.nextTarget) {
            clickedTile.setActiveState(false); // Deactivate the clicked tile.
            this.nextTarget++; // Increment the target number.

            // If all numbers have been successfully clicked, the game ends.
            if (this.nextTarget > this.totalTiles) {
                this.gameClock.stop(); // Halt the game timer.
                this.gameActive = false; // Mark game as inactive.
                // Optionally, could display a "Game Over" or "Restart" overlay here.
            }
        } else {
            // Optional: Provide visual feedback for incorrect clicks (e.g., shake or flash).
            // clickedTile.flashError();
        }
    },

    // Lifecycle method called continuously by the game engine.
    refreshDisplay: function() {
        // Only update time display if the game is active.
        if (!this.gameActive && this.gameClock.getElapsed() === 0) {
            this.timeDisplay.setText("--:--"); // Show default if game hasn't started.
            return;
        }

        // Calculate and format elapsed time.
        let rawTimeMillis = this.gameClock.getElapsed();
        let totalSeconds = Math.floor(rawTimeMillis / 1000);
        let seconds = totalSeconds % 60;
        let milliseconds = Math.floor((rawTimeMillis % 1000) / 10); // Two digits

        // Pad with leading zeros for consistent display.
        let formattedSeconds = String(seconds).padStart(2, '0');
        let formattedMilliseconds = String(milliseconds).padStart(2, '0');

        this.timeDisplay.setText(`${formattedSeconds}:${formattedMilliseconds}`);
    }
});


// Represents an interactive numeric button on the game grid.
var NumericTile = arc.Class.create(arc.display.DisplayObjectContainer, {
    // Initializes the visual and functional aspects of a numeric tile.
    initTile: function() {
        this.tileValue = 0; // The number displayed on this tile.

        // Background for the active state (clickable).
        this.activeBackground = new arc.display.Shape();
        this.activeBackground.beginFill(0x32CD32); // Lime green.
        this.activeBackground.drawRect(0, 0, NumericTile.tileWidth, NumericTile.tileHeight);
        this.activeBackground.endFill();

        // Background for the inactive state (already clicked).
        this.inactiveBackground = new arc.display.Shape();
        this.inactiveBackground.beginFill(0x808080); // Gray.
        this.inactiveBackground.drawRect(0, 0, NumericTile.tileWidth, NumericTile.tileHeight);
        this.inactiveBackground.endFill();

        // Text field to display the number.
        this.valueLabel = new arc.display.TextField();
        this.valueLabel.setX(NumericTile.tileWidth / 2);
        this.valueLabel.setY(NumericTile.tileHeight / 2);
        this.valueLabel.setAlign(arc.display.Align.CENTER);
        this.valueLabel.setFont("Verdana", 24, true); // Slightly different font.
        this.valueLabel.setColor(0xFFFFFF); // White text.
        
        // Add all components to the tile's display container.
        this.addChild(this.activeBackground);
        this.addChild(this.inactiveBackground);
        this.addChild(this.valueLabel);

        this.setActiveState(true); // Default to active state initially.
    },

    // Sets the numerical value for this tile.
    assignValue: function(numVal) {
        if (typeof numVal !== 'number' || isNaN(numVal)) {
            console.error("Invalid number assigned to tile:", numVal);
            return;
        }
        this.tileValue = numVal;
        this.valueLabel.setText(String(numVal)); // Ensure text is string.
    },

    // Retrieves the numerical value of this tile.
    retrieveValue: function() {
        return this.tileValue;
    },

    // Controls the visual state (active/inactive) of the tile.
    setActiveState: function(enable) {
        // Use a boolean flag to control visibility of backgrounds.
        this.activeBackground.setVisible(enable);
        this.inactiveBackground.setVisible(!enable);
        // Also disable interaction if inactive.
        this.setTouchable(enable);
    }
});
NumericTile.tileWidth = 65; // Slightly larger dimensions.
NumericTile.tileHeight = 65;


// Represents the overlay screen displayed at the start of the game.
var GameStartOverlay = arc.Class.create(arc.display.DisplayObjectContainer, {
    // Sets up the visual elements of the start overlay.
    createOverlay: function() {
        // A semi-transparent dark background covering the entire game area.
        this.dimmingLayer = new arc.display.Shape();
        this.dimmingLayer.beginFill(0x000000, 0.8); // Slightly more opaque.
        this.dimmingLayer.drawRect(0, 0, gameEngine.getWidth(), gameEngine.getHeight());
        this.dimmingLayer.endFill();

        // The main prompt text for starting the game.
        this.promptText = new arc.display.TextField();
        this.promptText.setAlign(arc.display.Align.CENTER);
        this.promptText.setFont("Impact", 36, true); // Different, more impactful font.
        this.promptText.setText("TAP TO BEGIN!");
        this.promptText.setColor(0xFFFF00); // Yellow text.
        // Position text centrally.
        this.promptText.setX(gameEngine.getWidth() / 2);
        this.promptText.setY(gameEngine.getHeight() / 2 - 30); // Offset slightly up.

        // Add a small instruction text.
        this.instructionText = new arc.display.TextField();
        this.instructionText.setAlign(arc.display.Align.CENTER);
        this.instructionText.setFont("Helvetica", 18, false);
        this.instructionText.setText("Find numbers 1 through " + (TapChallengeApp.gridRows * TapChallengeApp.gridCols) + " in order.");
        this.instructionText.setColor(0xFFFFFF);
        this.instructionText.setX(gameEngine.getWidth() / 2);
        this.instructionText.setY(gameEngine.getHeight() / 2 + 20); // Below the main prompt.

        this.addChild(this.dimmingLayer);
        this.addChild(this.promptText);
        this.addChild(this.instructionText);
    }
});


// Entry point: waits for the DOM to be fully loaded before initializing the game engine.
window.addEventListener('DOMContentLoaded', function(e){
    // Initialize the game engine with specific dimensions and target canvas ID.
    gameEngine = new arc.System(320, 416, 'canvas');
    // Set our custom game class as the main game handler.
    gameEngine.setGameClass(TapChallengeApp);
    // Start the game loop.
    gameEngine.start();
}, false);
})();