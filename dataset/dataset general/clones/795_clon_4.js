function createGridOperations(
    gridDimensions,
    cellStatesCollection,
    shapeDefinitionSet,
    scoringMechanism,
    difficultyScale,
    lineCountSystem,
    gamePacingControl,
    loopIntervalManager,
    gameTerminationState,
    movementRestrictionFlag,
    persistenceManager,
    drawingComponent,
    pieceStartRoutine,
    pieceMovementHandler,
    pieceRotationHandler,
    pieceDropHandler,
    gameResetFunction,
    gamePauseFunction,
    mainRenderCanvasContext,
    offscreenDrawingBuffer,
    offscreenBufferCanvasContext,
    activeFallingPiece,
    nextUpcomingPiece,
    previewCanvasContext,
    blockSpriteAsset,
    gameOverMessageElement,
    scoreDisplayElement,
    levelDisplayElement,
    pacingDisplayElement
) {

    const GRID_COLUMN_COUNT = gridDimensions.columns;
    const GRID_ROW_COUNT = gridDimensions.rows;

    const retrieveCellStatus = (rowIndex, colIndex) => {
        if (rowIndex < 0 || rowIndex >= GRID_ROW_COUNT || colIndex < 0 || colIndex >= GRID_COLUMN_COUNT) {
            return { isOccupied: true };
        }
        return cellStatesCollection[rowIndex][colIndex] || { isOccupied: false, color: null };
    };

    const updateCellStatus = (rowIndex, colIndex, statusObject) => {
        if (rowIndex >= 0 && rowIndex < GRID_ROW_COUNT && colIndex >= 0 && colIndex < GRID_COLUMN_COUNT) {
            cellStatesCollection[rowIndex][colIndex] = statusObject;
        }
    };

    const queryCellOccupancy = (columnCoordinate, rowCoordinate) => {
        if (columnCoordinate < 0 || columnCoordinate >= GRID_COLUMN_COUNT || rowCoordinate < 0 || rowCoordinate >= GRID_ROW_COUNT) {
            return true;
        }
        const cellInfo = retrieveCellStatus(rowCoordinate, columnCoordinate);
        return cellInfo.isOccupied;
    };

    const evaluateShapeFit = (currentPiece) => {
        const currentShapeLayout = shapeDefinitionSet.patterns[currentPiece.pattern][currentPiece.rotation];
        
        for (let componentIndex = 0; componentIndex < 4; componentIndex++) {
            const componentOffset = currentShapeLayout[componentIndex];
            const componentGridX = Math.floor(componentOffset[0] / 20) + Math.floor(currentPiece.x / 20);
            const componentGridY = Math.floor(componentOffset[1] / 20) + Math.floor(currentPiece.y / 20);

            if (queryCellOccupancy(componentGridX, componentGridY)) {
                return 0;
            }
        }
        return 1;
    };

    const renderCurrentScore = () => {
        scoreDisplayElement.innerHTML = scoringMechanism.score;
    };

    const showCurrentDifficulty = () => {
        levelDisplayElement.innerHTML = difficultyScale.level;
    };

    const adjustGameSpeedSetting = () => {
        const speedIncrement = 100;
        let calculatedSpeed = 0;

        if (difficultyScale.level >= 5) {
            const difficultyModifier = 10;
            calculatedSpeed = 200 - (difficultyScale.level - 4) * difficultyModifier;
        } else {
            calculatedSpeed = 800 - (difficultyScale.level - 1) * speedIncrement;
        }
        gamePacingControl.num = calculatedSpeed;
        pacingDisplayElement.innerHTML = gamePacingControl.num;

        clearInterval(loopIntervalManager.i);
        loopIntervalManager.i = setInterval(() => pieceMovementHandler(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext, activeFallingPiece), gamePacingControl.num);
    };

    const processCompletedLines = () => {
        let linesRemovedCount = 0;
        const scoreMultipliersByLines = [40, 100, 300, 1200];
        
        let rowsToShift = 0;
        for (let r = GRID_ROW_COUNT - 1; r >= 0; r--) {
            const currentRow = cellStatesCollection[r];
            const isRowFullyOccupied = currentRow.every(cell => cell && cell.isOccupied);
            if (isRowFullyOccupied) {
                rowsToShift++;
            } else if (rowsToShift > 0) {
                for (let c = 0; c < GRID_COLUMN_COUNT; c++) {
                    updateCellStatus(r + rowsToShift, c, retrieveCellStatus(r, c));
                }
            }
        }

        linesRemovedCount = rowsToShift;

        if (linesRemovedCount > 0) {
            scoringMechanism.score += difficultyScale.level * scoreMultipliersByLines[linesRemovedCount - 1];
            lineCountSystem.num += linesRemovedCount;

            for (let r = 0; r < linesRemovedCount; r++) {
                for (let c = 0; c < GRID_COLUMN_COUNT; c++) {
                    updateCellStatus(r, c, { isOccupied: false, color: null });
                }
            }

            // Replicating specific original behavior: clear the first cell of the second row after shifting
            // This corresponds to original `tetris.blocks[tetris.Board.WIDTH]`
            if (linesRemovedCount > 0) {
                 updateCellStatus(1, 0, { isOccupied: false, color: null });
            }

            drawingComponent(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext);
            renderCurrentScore();
        }
        
        const newDifficultyLevel = 1 + Math.floor(lineCountSystem.num / 4);
        if (difficultyScale.level !== newDifficultyLevel) {
            difficultyScale.level = newDifficultyLevel;
            showCurrentDifficulty();
            adjustGameSpeedSetting();
        }
    };

    const displayUpcomingPiece = () => {
        let originalX = nextUpcomingPiece.x;
        let originalY = nextUpcomingPiece.y;

        previewCanvasContext.clearRect(0, 0, 80, 80);

        pieceStartRoutine(nextUpcomingPiece);
        
        nextUpcomingPiece.x = 0;
        nextUpcomingPiece.y = 0;

        previewCanvasContext.fillStyle = "black";
        const pieceLayout = shapeDefinitionSet.patterns[nextUpcomingPiece.pattern][nextUpcomingPiece.rotation];
        const pieceSpriteColors = shapeDefinitionSet.colors[nextUpcomingPiece.pattern];

        for (let segmentIndex = 0; segmentIndex < 4; segmentIndex++) {
            const segmentPosition = pieceLayout[segmentIndex];
            
            previewCanvasContext.drawImage(
                blockSpriteAsset,
                pieceSpriteColors[0], pieceSpriteColors[1],
                20, 20,
                segmentPosition[0] + nextUpcomingPiece.x, segmentPosition[1] + nextUpcomingPiece.y,
                20, 20
            );
        }

        nextUpcomingPiece.x = originalX;
        nextUpcomingPiece.y = originalY;
    };

    const determineGameTermination = () => {
        if (gameTerminationState.end === true) {
            return;
        }

        let topBoundaryOccupied = false;
        for (let col = 0; col < GRID_COLUMN_COUNT; col++) {
            if (queryCellOccupancy(col, 0)) {
                topBoundaryOccupied = true;
                break;
            }
        }

        if (topBoundaryOccupied) {
            clearInterval(loopIntervalManager.i);
            scoringMechanism.allScores.push(scoringMechanism.score);
            persistenceManager.store();
            persistenceManager.list();

            gameOverMessageElement.innerHTML = "Game Over";
            
            document.onkeydown = (eventObject) => {
                let keyIdentifierCode;
                if (eventObject == null) {
                    keyIdentifierCode = window.event.keyCode;
                } else {
                    keyIdentifierCode = eventObject.keyCode;
                }
                if (keyIdentifierCode === 82) {
                    gameResetFunction();
                }
            };
            gameTerminationState.end = true;
        }
    };

    const performBlockingDelay = (durationMilliseconds) => {
        const initialTime = new Date().getTime();
        const finishTime = initialTime + durationMilliseconds;
        while (new Date().getTime() < finishTime) {
            configureKeyboardInput();
        }
    };

    const configureKeyboardInput = () => {
        const keyActionMapping = {
            37: () => !movementRestrictionFlag.bool && pieceMovementHandler(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext, activeFallingPiece, -20, 0),
            38: () => !movementRestrictionFlag.bool && pieceRotationHandler(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext, activeFallingPiece),
            39: () => !movementRestrictionFlag.bool && pieceMovementHandler(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext, activeFallingPiece, 20, 0),
            40: () => !movementRestrictionFlag.bool && pieceMovementHandler(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext, activeFallingPiece, 0, 20),
            32: () => pieceDropHandler(mainRenderCanvasContext, offscreenDrawingBuffer, offscreenBufferCanvasContext, activeFallingPiece),
            80: () => gamePauseFunction(),
            82: () => gameResetFunction()
        };

        document.onkeydown = (eventObject) => {
            let keyIdentifierCode;
            if (eventObject == null) {
                keyIdentifierCode = window.event.keyCode;
            } else {
                keyIdentifierCode = eventObject.keyCode;
            }
            
            const correspondingAction = keyActionMapping[keyIdentifierCode];
            if (correspondingAction) {
                correspondingAction();
            }
        };
    };

    return {
        arenaWidthUnits: GRID_COLUMN_COUNT,
        arenaHeightUnits: GRID_ROW_COUNT,
        queryCellOccupancy: queryCellOccupancy,
        evaluateShapeFit: evaluateShapeFit,
        processCompletedLines: processCompletedLines,
        displayUpcomingPiece: displayUpcomingPiece,
        determineGameTermination: determineGameTermination,
        renderCurrentScore: renderCurrentScore,
        showCurrentDifficulty: showCurrentDifficulty,
        adjustGameSpeedSetting: adjustGameSpeedSetting,
        performBlockingDelay: performBlockingDelay,
        configureKeyboardInput: configureKeyboardInput
    };
}