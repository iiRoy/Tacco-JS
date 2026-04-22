blockGame.GameArea.defineNamespace = function() {};

blockGame.GameArea.COLUMNS = 10; // Number of grid units horizontally
blockGame.GameArea.ROWS = 22; // Total grid units vertically, including hidden rows

blockGame.GameArea.isOccupied = function(colPos, rowPos) {
	// Determines if a specific cell in the game grid is already taken
	if (
		colPos < 0 || colPos >= blockGame.GameArea.COLUMNS ||
		rowPos < 0 || rowPos >= blockGame.GameArea.ROWS ||
		blockGame.cells[rowPos * blockGame.GameArea.COLUMNS + colPos].isFilled
	) {
		return true; // The cell is out of bounds or contains a block
	} else {
		return false; // The cell is empty and within the playable area
	}
};

blockGame.GameArea.validatePosition = function(fallingShape) {
	let segmentCoord, idx, currX, currY; // Declare variables for loop and coordinates

	for (idx = 0; idx < 4; idx++) {
		// Iterate through each block segment of the falling shape
		segmentCoord = blockGame.ShapeUnit.FORMS[fallingShape.design][fallingShape.orientation][idx];
		currX = segmentCoord[0] / 20 + fallingShape.posX / 20; // Calculate absolute column position
		currY = segmentCoord[1] / 20 + fallingShape.posY / 20; // Calculate absolute row position

		if (blockGame.GameArea.isOccupied(currX, currY)) {
			return 0; // Collision detected, move is not valid
		}
	}
	return 1; // No collisions, the move is permissible
};

/*
 * The following section contains a commented-out function.
 * It was likely used for basic board drawing but is currently inactive.
 *
 * blockGame.GameArea.renderBoundary = function(renderContext, offscreenBuffer, bufferContext) {
 *   bufferContext.beginPath();
 *   bufferContext.strokeStyle = "red";
 *   bufferContext.strokeRect(0, 0, 200, 400); // Draw a rectangle for the game area
 *   bufferContext.closePath();
 *   renderContext.drawImage(offscreenBuffer, 0, 0); // Copy the buffer to the main canvas
 * };
 */

blockGame.GameArea.removeCompleteLines = function(renderContext, offscreenBuffer, bufferContext, currentBlock) {
	let lineIndex, columnIdx, lineShift, upcomingLevel; // Variables for row/column iteration and level calculation
	upcomingLevel = 1; // Initial value for the next difficulty level
	let completedLines = 0; // Counter for full lines cleared in this operation

	for (lineIndex = blockGame.GameArea.ROWS - 1; lineIndex >= 0; ) {
		// Start from the bottom row and move upwards
		for (columnIdx = 0; columnIdx < blockGame.GameArea.COLUMNS; ++columnIdx) {
			// Check each cell in the current row
			if (!(blockGame.cells[lineIndex * blockGame.GameArea.COLUMNS + columnIdx].isFilled)) {
				break; // Row is not completely filled, move to the next row
			}
		}

		if (columnIdx === blockGame.GameArea.COLUMNS) {
			// If the inner loop completed, the row is full
			blockGame.GameScore.currentScore += blockGame.GameDifficulty.difficultyLevel * [40, 100, 300, 1200][completedLines];
			completedLines++; // Increment the count of cleared lines

			for (lineShift = lineIndex - 1; lineShift >= 0; lineShift--) {
				// Move all rows above down by one
				for (columnIdx = 0; columnIdx < blockGame.GameArea.COLUMNS; ++columnIdx) {
					// Copy block status and color from the row above to the current row
					blockGame.cells[(lineShift + 1) * blockGame.GameArea.COLUMNS + columnIdx].isFilled = blockGame.cells[lineShift * blockGame.GameArea.COLUMNS + columnIdx].isFilled;
					blockGame.cells[(lineShift + 1) * blockGame.GameArea.COLUMNS + columnIdx].color = blockGame.cells[lineShift * blockGame.GameArea.COLUMNS + columnIdx].color;
				}
			}
			// Clear the very top row after shifting
			for (columnIdx = 0; columnIdx <= blockGame.GameArea.COLUMNS; columnIdx++) {
				blockGame.cells[columnIdx].isFilled = false; // Ensure the top row is empty
			}

			blockGame.ShapeUnit.refreshDisplay(renderContext, offscreenBuffer, bufferContext); // Redraw the game grid
			blockGame.GameArea.refreshScoreDisplay(); // Update the score display
		} else {
			lineIndex--; // Move to the next row above
		}
	}

	blockGame.ClearedLines.totalCount = blockGame.ClearedLines.totalCount + completedLines; // Accumulate total lines cleared
	upcomingLevel = 1 + Math.floor(blockGame.ClearedLines.totalCount / 4); // Calculate new level based on cleared lines
	blockGame.GameDifficulty.difficultyLevel = upcomingLevel; // Set the new game difficulty level
	blockGame.GameArea.refreshLevelDisplay(); // Update the level display
	blockGame.GameArea.adjustGameSpeed(); // Recalculate and apply game speed
};

blockGame.GameArea.displayUpcomingShape = function() {
	let initialX, initialY; // Store current position of the next block temporarily
	let segmentCoord, count; // Variables for iterating through block segments
	let colorArray = []; // Not used in this version but kept for structure

	previewCanvasContext.clearRect(0, 0, 80, 80); // Clear the preview area

	blockGame.ShapeUnit.initializeShape(nextBlockPiece); // Prepare the next block piece for display
	initialX = nextBlockPiece.posX; // Save original X
	initialY = nextBlockPiece.posY; // Save original Y

	nextBlockPiece.posX = 0; // Position for preview
	nextBlockPiece.posY = 0; // Position for preview

	previewCanvasContext.fillStyle = "black"; // Background color for preview

	for (count = 0; count < 4; count++) {
		// Loop through each segment of the upcoming shape
		segmentCoord = blockGame.ShapeUnit.FORMS[nextBlockPiece.design][nextBlockPiece.orientation][count];
		previewCanvasContext.fillRect(segmentCoord[0] + nextBlockPiece.posX, segmentCoord[1] + nextBlockPiece.posY, 20, 20); // Draw a placeholder rectangle

		previewCanvasContext.drawImage(
			tileImage,
			blockGame.ShapeUnit.COLOR_MAP[nextBlockPiece.design][0],
			blockGame.ShapeUnit.COLOR_MAP[nextBlockPiece.design][1],
			20,
			20,
			segmentCoord[0] + nextBlockPiece.posX,
			segmentCoord[1] + nextBlockPiece.posY,
			20,
			20
		); // Draw the actual block segment with its texture
	}
	nextBlockPiece.posX = initialX; // Restore original X
	nextBlockPiece.posY = initialY; // Restore original Y
};

blockGame.GameArea.checkGameOverCondition = function() {
	let columnCheck; // Iterator for columns
	for (columnCheck = 0; columnCheck < blockGame.GameArea.COLUMNS && blockGame.GameState.isFinished === false; columnCheck++) {
		// Check the very top row for occupied cells
		if (blockGame.GameArea.isOccupied(columnCheck, 0)) {
			clearInterval(blockGame.GameTimer.intervalID); // Stop the game interval
			// Save current game score and other stats
			blockGame.GameScore.recordedScores.push(blockGame.GameScore.currentScore);
			blockGame.PersistentData.saveData(); // Persist game data
			blockGame.PersistentData.displayRecords(); // Update score list display

			gameEndMessage.textContent = "GAME OVER"; // Display game over message
			document.onkeypress = function(eventObject) {
				// Change event type to onkeypress
				let keyIdentifier;

				if (eventObject === null) {
					keyIdentifier = window.event.keyCode;
				} else {
					keyIdentifier = eventObject.keyCode;
				}
				if (keyIdentifier === 82) {
					blockGame.GameControl.resetGame(); // Allow restart on 'R' key press
				}
			};
			blockGame.GameState.isFinished = true; // Set game state to finished
		}
	}
};

blockGame.GameArea.refreshScoreDisplay = function() {
	scoreDisplayElement.textContent = blockGame.GameScore.currentScore; // Update the score text
};

blockGame.GameArea.refreshLevelDisplay = function() {
	levelDisplayElement.textContent = blockGame.GameDifficulty.difficultyLevel; // Update the level text
};

blockGame.GameArea.adjustGameSpeed = function() {
	let speedIncrement = 100; // Base speed adjustment value
	let temporaryValue = 0; // Unused temporary variable, kept for structure

	if (blockGame.GameDifficulty.difficultyLevel >= 5) {
		speedIncrement = 10; // Faster increment for higher levels
		blockGame.GameSpeed.currentSpeedMs = 200 - (blockGame.GameDifficulty.difficultyLevel - 4) * speedIncrement;
	} else {
		blockGame.GameSpeed.currentSpeedMs = 800 - (blockGame.GameDifficulty.difficultyLevel - 1) * speedIncrement;
	}
	speedDisplayElement.textContent = blockGame.GameSpeed.currentSpeedMs; // Display current game speed
	clearInterval(blockGame.GameTimer.intervalID); // Clear existing interval
	// Set new interval with updated speed. Note: variables inside string are evaluated in global scope.
	blockGame.GameTimer.intervalID = setInterval("blockGame.ShapeUnit.advanceBlock(renderContext, offscreenBuffer, bufferContext, currentBlock)", blockGame.GameSpeed.currentSpeedMs);
};

blockGame.GameArea.pauseExecution = function(milliseconds) {
	let targetTime = new Date(); // Get current time
	targetTime.setTime(targetTime.getTime() + milliseconds); // Calculate target end time
	while (new Date().getTime() < targetTime.getTime()) {
		blockGame.GameArea.handleKeyInput(); // Busy-wait loop, processing key input during pause
	}
};

blockGame.GameArea.handleKeyInput = function() {
	document.onkeypress = function(eventObject) {
		// Event handler for key presses
		let keyIdentifier; // Variable to store the key code

		if (eventObject === null) {
			keyIdentifier = window.event.keyCode; // For IE compatibility
		} else {
			keyIdentifier = eventObject.keyCode; // Standard event object
		}

		switch (keyIdentifier) {
			// Left arrow key
			case 37:
				if (!blockGame.MovementRestrictions.isLocked) {
					blockGame.ShapeUnit.alterPosition(renderContext, offscreenBuffer, bufferContext, currentBlock, -20, 0);
				}
				break;
			// Up arrow key
			case 38:
				if (!blockGame.MovementRestrictions.isLocked) {
					blockGame.ShapeUnit.rotateShape(renderContext, offscreenBuffer, bufferContext, currentBlock);
				}
				break;
			// Right arrow key
			case 39:
				if (!blockGame.MovementRestrictions.isLocked) {
					blockGame.ShapeUnit.alterPosition(renderContext, offscreenBuffer, bufferContext, currentBlock, 20, 0);
				}
				break;
			// Down arrow key
			case 40:
				if (!blockGame.MovementRestrictions.isLocked) {
					blockGame.ShapeUnit.alterPosition(renderContext, offscreenBuffer, bufferContext, currentBlock, 0, 20);
				}
				break;
			// Spacebar
			case 32:
				blockGame.ShapeUnit.dropInstantly(renderContext, offscreenBuffer, bufferContext, currentBlock);
				break;
			// 'P' key for pause
			case 80:
				blockGame.GameControl.pauseGame();
				break;
			// 'R' key for restart
			case 82:
				blockGame.GameControl.resetGame();
				break;
			default:
				break; // Do nothing for other keys
		}
	};
};