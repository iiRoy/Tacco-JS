var blockGame = blockGame || {};
blockGame.Playfield = blockGame.Playfield || {};

// Constants for the game grid dimensions.
blockGame.Playfield.GRID_COLUMNS = 10;
blockGame.Playfield.GRID_ROWS = 22; // Includes 2 hidden rows at the top for spawning.

// Determines if a specific cell on the game grid is occupied by a block or is out of bounds.
blockGame.Playfield.checkCellOccupancy = function(columnCoordinate, rowCoordinate) {
    // Basic type validation for coordinates.
    if (typeof columnCoordinate !== 'number' || typeof rowCoordinate !== 'number') {
        console.error("Invalid coordinate types provided to checkCellOccupancy. Expected numbers.");
        return true; // Treat as blocked on invalid input to prevent errors.
    }

    const playfieldWidth = blockGame.Playfield.GRID_COLUMNS;
    const playfieldHeight = blockGame.Playfield.GRID_ROWS;

    // Check if the coordinates are outside the main grid boundaries.
    const isOutOfBounds = (
        columnCoordinate < 0 || columnCoordinate >= playfieldWidth ||
        rowCoordinate < 0 || rowCoordinate >= playfieldHeight
    );
    if (isOutOfBounds) {
        return true;
    }

    // Calculate the linear index for the 1D block array.
    const blockLinearIndex = rowCoordinate * playfieldWidth + columnCoordinate;
    
    // Check if the block at this index is marked as occupied.
    // Assuming `blockGame.gameBlocks` is a global array of block objects.
    const targetBlock = blockGame.gameBlocks[blockLinearIndex];
    if (targetBlock && targetBlock.isOccupied) {
        return true;
    }

    // If no blocking conditions are met, the cell is clear.
    return false;
};

// Evaluates if a given falling piece (geoblock) can move to its proposed new position.
blockGame.Playfield.canPieceFit = function(currentGeoblock) {
    let pieceBlockIndex; // Iterator for the sub-blocks of the piece.
    const BLOCK_PIXEL_UNIT = 20; // Each grid unit corresponds to 20 pixels.

    // Assume the move is valid until proven otherwise.
    let isMoveFeasible = true;

    // Iterate through each of the four individual blocks that make up the geoblock.
    for (pieceBlockIndex = 0; pieceBlockIndex < 4; ++pieceBlockIndex) {
        // Get the relative pixel offset of the current sub-block from the piece's origin.
        const relativeBlockOffset = blockGame.ShapeManager.BLOCK_FORMS[currentGeoblock.shapeType][currentGeoblock.orientationIndex][pieceBlockIndex];
        
        // Calculate the absolute grid coordinates for the sub-block.
        // Convert pixel coordinates (from Piece.PATTERNS and tetromino.x/y) to grid coordinates.
        const absoluteGridX = Math.floor(relativeBlockOffset[0] / BLOCK_PIXEL_UNIT) + Math.floor(currentGeoblock.posX / BLOCK_PIXEL_UNIT);
        const absoluteGridY = Math.floor(relativeBlockOffset[1] / BLOCK_PIXEL_UNIT) + Math.floor(currentGeoblock.posY / BLOCK_PIXEL_UNIT);

        // If any part of the geoblock would collide with an occupied cell or go out of bounds,
        // then the entire movement is invalid.
        if (blockGame.Playfield.checkCellOccupancy(absoluteGridX, absoluteGridY)) {
            isMoveFeasible = false; // Collision detected, movement is not permitted.
            break; // No need to check further sub-blocks.
        }
    }

    // Return 1 for a valid move, 0 for an invalid move (mimicking original integer return).
    return isMoveFeasible ? 1 : 0;
};

// Scans the playfield for completed rows, clears them, and shifts blocks downwards.
blockGame.Playfield.processCompletedRows = function(renderSurface, backBufferCanvas, backBufferContext, activeGeoblock) {
    let scanRowIndex, scanColumnIndex, copySourceRowIndex; // Loop iterators.
    let currentCompletedRowCount = 0; // Tracks consecutive cleared rows.
    let calculatedNextLevel; // For updating the game level.

    // Iterate from the bottom of the grid upwards to find full rows.
    // The loop variable `scanRowIndex` is controlled internally to handle shifted rows.
    for (scanRowIndex = blockGame.Playfield.GRID_ROWS - 1; scanRowIndex >= 0; ) {
        let isCurrentRowFull = true;
        // Check each column in the current row to see if it's completely filled.
        for (scanColumnIndex = 0; scanColumnIndex < blockGame.Playfield.GRID_COLUMNS; ++scanColumnIndex) {
            const blockReference = blockGame.gameBlocks[scanRowIndex * blockGame.Playfield.GRID_COLUMNS + scanColumnIndex];
            // If any block in the row is not occupied, the row is not full.
            if (!blockReference || !blockReference.isOccupied) {
                isCurrentRowFull = false;
                break; // No need to check further columns in this row.
            }
        }

        // If the current row is found to be completely filled:
        if (isCurrentRowFull) {
            currentCompletedRowCount++; // Increment the count of cleared rows.

            // Update the player's score based on the number of rows cleared simultaneously.
            const scoreValues = [40, 100, 300, 1200]; // Score for clearing 1, 2, 3, 4 rows.
            const scoreIndex = Math.min(currentCompletedRowCount - 1, scoreValues.length - 1);
            blockGame.gameStats.currentScore += blockGame.gameStats.currentLevel * scoreValues[scoreIndex];

            // Shift all rows above the cleared row downwards by one position.
            for (copySourceRowIndex = scanRowIndex - 1; copySourceRowIndex >= 0; copySourceRowIndex--) {
                for (scanColumnIndex = 0; scanColumnIndex < blockGame.Playfield.GRID_COLUMNS; ++scanColumnIndex) {
                    const destinationBlockIdx = (copySourceRowIndex + 1) * blockGame.Playfield.GRID_COLUMNS + scanColumnIndex;
                    const sourceBlockIdx = copySourceRowIndex * blockGame.Playfield.GRID_COLUMNS + scanColumnIndex;
                    
                    // Copy block properties from the row above to the current row.
                    const sourceBlock = blockGame.gameBlocks[sourceBlockIdx];
                    const destinationBlock = blockGame.gameBlocks[destinationBlockIdx];

                    if (sourceBlock && destinationBlock) { // Ensure blocks exist before copying
                        destinationBlock.isOccupied = sourceBlock.isOccupied;
                        destinationBlock.blockColor = sourceBlock.blockColor;
                    }
                }
            }
            
            // Explicitly clear the very top row (index 0) after shifting, as it's now empty.
            for (scanColumnIndex = 0; scanColumnIndex < blockGame.Playfield.GRID_COLUMNS; ++scanColumnIndex) {
                const topRowBlock = blockGame.gameBlocks[scanColumnIndex]; // Blocks in row 0.
                if (topRowBlock) {
                    topRowBlock.isOccupied = false;
                    topRowBlock.blockColor = 'transparent'; // Reset to an empty state color.
                }
            }
            
            // Redraw the game display to reflect the cleared rows and shifted blocks.
            blockGame.ShapeManager.refreshDisplay(renderSurface, backBufferCanvas, backBufferContext);
            blockGame.Playfield.updateScoreDisplay(); // Update the score on the UI.
            // The `scanRowIndex` does not decrement here because the current row (which was cleared)
            // now contains the blocks from the row above it, and needs to be re-checked.
        } else {
            // If the row was not full, move to the next row upwards to scan.
            scanRowIndex--;
        }
    }

    // Update the total lines cleared and recalculate the game level.
    blockGame.gameStats.totalLinesCleared += currentCompletedRowCount;
    calculatedNextLevel = 1 + Math.floor(blockGame.gameStats.totalLinesCleared / 4);
    blockGame.gameStats.currentLevel = calculatedNextLevel;

    // Refresh UI for level and adjust game speed based on the new level.
    blockGame.Playfield.updateLevelDisplay();
    blockGame.Playfield.adjustGameSpeed();
};

// Renders the next incoming geoblock in a dedicated preview area.
blockGame.Playfield.displayNextGeoblock = function() {
    let tempBlockX, tempBlockY; // Temporary storage for the geoblock's actual position.
    let blockPartOffset, drawLoopIndex; // Loop variables for drawing sub-blocks.
    const previewAreaWidth = 80;
    const previewAreaHeight = 80;
    const blockDisplaySize = 20; // Each block is drawn as 20x20 pixels.

    // Ensure the preview context is available.
    if (typeof previewCanvasContext === 'undefined') {
        console.error("Preview canvas context (previewCanvasContext) is not defined for displayNextGeoblock.");
        return;
    }
    
    // Clear the entire preview canvas to draw the new block.
    previewCanvasContext.clearRect(0, 0, previewAreaWidth, previewAreaHeight);
    
    // Initialize the next geoblock's properties (shape, rotation).
    // `blockGame.nextGeoblock` is assumed to be a global object for the next piece.
    blockGame.ShapeManager.initializeNewPiece(blockGame.nextGeoblock);

    // Save the geoblock's actual game coordinates, then temporarily move it to (0,0) for preview.
    tempBlockX = blockGame.nextGeoblock.posX;
    tempBlockY = blockGame.nextGeoblock.posY;
    blockGame.nextGeoblock.posX = 0;
    blockGame.nextGeoblock.posY = 0;

    // Set a fill style for fallback drawing.
    previewCanvasContext.fillStyle = "#333333"; // A dark gray color.

    // Iterate through the four sub-blocks of the next geoblock to draw them.
    for (drawLoopIndex = 0; drawLoopIndex < 4; ++drawLoopIndex) {
        // Retrieve the relative pixel offset for the current sub-block from its pattern.
        blockPartOffset = blockGame.ShapeManager.BLOCK_FORMS[blockGame.nextGeoblock.shapeType][blockGame.nextGeoblock.orientationIndex][drawLoopIndex];
        
        // Attempt to draw the block using an image sprite if `blockImageSprite` is available and loaded.
        if (typeof blockImageSprite !== 'undefined' && blockImageSprite.complete) {
            const spriteSourceX = blockGame.ShapeManager.COLOR_SPRITE_OFFSETS[blockGame.nextGeoblock.shapeType][0];
            const spriteSourceY = blockGame.ShapeManager.COLOR_SPRITE_OFFSETS[blockGame.nextGeoblock.shapeType][1];
            
            previewCanvasContext.drawImage(
                blockImageSprite,
                spriteSourceX, spriteSourceY, // Source X, Y on the sprite sheet.
                blockDisplaySize, blockDisplaySize, // Source Width, Height.
                blockPartOffset[0] + blockGame.nextGeoblock.posX, // Destination X on preview canvas.
                blockPartOffset[1] + blockGame.nextGeoblock.posY, // Destination Y on preview canvas.
                blockDisplaySize, blockDisplaySize // Destination Width, Height.
            );
        } else {
            // Fallback: draw a solid filled rectangle if the image sprite is not available.
            previewCanvasContext.fillRect(
                blockPartOffset[0] + blockGame.nextGeoblock.posX,
                blockPartOffset[1] + blockGame.nextGeoblock.posY,
                blockDisplaySize,
                blockDisplaySize
            );
        }
    }

    // Restore the geoblock's original game coordinates after preview rendering.
    blockGame.nextGeoblock.posX = tempBlockX;
    blockGame.nextGeoblock.posY = tempBlockY;
};

// Checks for game over condition (blocks reaching the very top of the playfield).
blockGame.Playfield.evaluateGameOver = function() {
    let currentColumnToTest;
    const topVisibleGridRow = 0; // The highest visible row index.

    // Iterate through the top row of the grid.
    currentColumnToTest = 0;
    while (currentColumnToTest < blockGame.Playfield.GRID_COLUMNS && !blockGame.gameStatus.isEnded) {
        // If any cell in the top visible row is occupied, the game is over.
        if (blockGame.Playfield.checkCellOccupancy(currentColumnToTest, topVisibleGridRow)) {
            blockGame.gameStatus.isEnded = true; // Set the game end flag.

            // Stop the primary game loop timer.
            clearInterval(blockGame.gameLoopInterval.id);
            blockGame.gameLoopInterval.id = null; // Clear the interval ID.

            // Record the current score and manage local storage.
            blockGame.gameStats.allRecordedScores.push(blockGame.gameStats.currentScore);
            blockGame.dataStorage.saveGameData(); // Persist game data.
            blockGame.dataStorage.renderScoreList(); // Update the high score list on the UI.

            // Display the "Game Over" message.
            if (typeof gameOverDisplayElement !== 'undefined') {
                gameOverDisplayElement.textContent = "GAME OVER!";
                gameOverDisplayElement.style.display = 'block'; // Ensure it's visible.
            } else {
                console.warn("gameOverDisplayElement not found. Game over message not displayed.");
            }

            // Override the global keydown handler to only allow game restart.
            document.onkeydown = function(keyboardInputEvent) {
                const keyPressedCode = keyboardInputEvent ? keyboardInputEvent.keyCode : window.event.keyCode;
                // If 'R' (keyCode 82) is pressed, trigger game restart.
                if (keyPressedCode === 82) {
                    blockGame.coreGame.resetGame();
                }
            };
            break; // Exit the loop as game over is confirmed.
        }
        currentColumnToTest++;
    }
};

// Refreshes the score display element on the user interface.
blockGame.Playfield.updateScoreDisplay = function() {
    // Assuming `gameScoreDisplayElement` is a global DOM element reference.
    if (typeof gameScoreDisplayElement !== 'undefined') {
        gameScoreDisplayElement.textContent = blockGame.gameStats.currentScore.toString();
    } else {
        console.warn("gameScoreDisplayElement not found. Score display could not be updated.");
    }
};

// Refreshes the current level display element on the user interface.
blockGame.Playfield.updateLevelDisplay = function() {
    // Assuming `gameLevelDisplayElement` is a global DOM element reference.
    if (typeof gameLevelDisplayElement !== 'undefined') {
        gameLevelDisplayElement.textContent = blockGame.gameStats.currentLevel.toString();
    } else {
        console.warn("gameLevelDisplayElement not found. Level display could not be updated.");
    }
};

// Adjusts the game's drop speed based on the current level and updates the UI.
blockGame.Playfield.adjustGameSpeed = function() {
    const initialSpeedReductionRate = 100; // Milliseconds reduction per level for early stages.
    const advancedSpeedReductionRate = 10; // More aggressive reduction for higher levels.
    let calculatedDropInterval = 0; // The new interval for piece drops.
    const currentGamingLevel = blockGame.gameStats.currentLevel;

    // Calculate the new drop interval based on the current level.
    if (currentGamingLevel >= 5) {
        // For level 5 and beyond, speed up more significantly.
        calculatedDropInterval = 200 - (currentGamingLevel - 4) * advancedSpeedReductionRate;
        // Ensure the interval doesn't fall below a minimum threshold for playability.
        calculatedDropInterval = Math.max(50, calculatedDropInterval); 
    } else {
        // For earlier levels, speed up at a more gradual pace.
        calculatedDropInterval = 800 - (currentGamingLevel - 1) * initialSpeedReductionRate;
        // Ensure the interval doesn't go below the higher level threshold.
        calculatedDropInterval = Math.max(200, calculatedDropInterval);
    }
    
    // Update the game speed display on the UI.
    if (typeof gameSpeedDisplayElement !== 'undefined') {
        gameSpeedDisplayElement.textContent = calculatedDropInterval.toString();
    } else {
        console.warn("gameSpeedDisplayElement not found. Speed display could not be updated.");
    }

    // Clear the existing game loop interval and set a new one with the updated speed.
    if (blockGame.gameLoopInterval.id) {
        clearInterval(blockGame.gameLoopInterval.id);
    }
    // Use an arrow function to maintain `this` context if needed, or simply call the function.
    blockGame.gameLoopInterval.id = setInterval(() => {
        // Assuming `mainRenderContext`, `mainBackBuffer`, `mainBackBufferContext`, `activeFallingPiece`
        // are globally accessible or properly passed around.
        blockGame.ShapeManager.movePieceDown(
            mainRenderContext,
            mainBackBuffer,
            mainBackBufferContext,
            blockGame.activeFallingPiece
        );
    }, calculatedDropInterval);

    // Store the newly calculated speed.
    blockGame.gameStatus.currentDropSpeed = calculatedDropInterval;
};

// A blocking delay function. Warning: This will freeze the UI thread in browsers.
// It's included to maintain functional similarity to the original's blocking `sleep`.
blockGame.Playfield.blockingDelay = function(delayDurationMs) {
    const startTimestamp = new Date().getTime();
    const endTimestamp = startTimestamp + delayDurationMs;
    // Loop until the specified duration has passed.
    while (new Date().getTime() < endTimestamp) {
        // The original code called `tetris.Board.key()` inside the sleep.
        // This implies key events were processed during the blocking sleep.
        // Replicating this, though it's still a blocking operation.
        blockGame.InputHandler.processKeyboardInput(); 
    }
};

// Namespace for keyboard input handling.
blockGame.InputHandler = blockGame.InputHandler || {};

// Sets up the global keyboard event listener for game controls.
blockGame.InputHandler.processKeyboardInput = function() {
    document.onkeydown = function(eventPayload) {
        let detectedKeyCode; 
        // Normalize key code retrieval for cross-browser compatibility.
        detectedKeyCode = eventPayload ? eventPayload.keyCode : window.event.keyCode;
        
        // Define key code constants for improved readability and maintainability.
        const KEY_LEFT_ARROW = 37;
        const KEY_UP_ARROW = 38;
        const KEY_RIGHT_ARROW = 39;
        const KEY_DOWN_ARROW = 40;
        const KEY_SPACEBAR = 32;
        const KEY_P_FOR_PAUSE = 80; 
        const KEY_R_FOR_RESTART = 82; 

        // If game movement is currently locked (e.g., during a game over sequence or animation),
        // ignore all control inputs.
        if (blockGame.gameStatus.isMovementLocked) {
            // console.debug(`Input ignored: Movement locked. Key code: ${detectedKeyCode}`);
            return; 
        }

        // Use a switch statement to handle different key presses.
        switch(detectedKeyCode) {
            case KEY_LEFT_ARROW:
                // Move the active falling piece one unit to the left.
                blockGame.ShapeManager.alterPiecePosition(mainRenderContext, mainBackBuffer, mainBackBufferContext, blockGame.activeFallingPiece, -BLOCK_PIXEL_UNIT, 0);
                break;
            case KEY_UP_ARROW:
                // Rotate the active falling piece.
                blockGame.ShapeManager.rotateActivePiece(mainRenderContext, mainBackBuffer, mainBackBufferContext, blockGame.activeFallingPiece);
                break; 
            case KEY_RIGHT_ARROW:
                // Move the active falling piece one unit to the right.
                blockGame.ShapeManager.alterPiecePosition(mainRenderContext, mainBackBuffer, mainBackBufferContext, blockGame.activeFallingPiece, BLOCK_PIXEL_UNIT, 0);
                break; 
            case KEY_DOWN_ARROW:
                // Move the active falling piece one unit down (soft drop).
                blockGame.ShapeManager.alterPiecePosition(mainRenderContext, mainBackBuffer, mainBackBufferContext, blockGame.activeFallingPiece, 0, BLOCK_PIXEL_UNIT);
                break; 
            case KEY_SPACEBAR:
                // Perform a hard drop: instantly move the piece to the lowest possible position.
                blockGame.ShapeManager.hardDropPiece(mainRenderContext, mainBackBuffer, mainBackBufferContext, blockGame.activeFallingPiece);
                break;
            case KEY_P_FOR_PAUSE:
                // Toggle the game's pause state.
                blockGame.coreGame.togglePause();
                break;
            case KEY_R_FOR_RESTART:
                // Restart the game from its initial state.
                blockGame.coreGame.resetGame();
                break;
            default: 
                // Log or ignore any other key presses that are not game controls.
                // console.log(`Non-game control key pressed: ${detectedKeyCode}`);
                break; 
        }
    };
};