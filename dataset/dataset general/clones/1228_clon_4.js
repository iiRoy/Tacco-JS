class BrainyAdvisor {
    constructor(unitCollection, gameEnvironment) {
        this.unitData = unitCollection.catalog;
        this.unitEvaluations = unitCollection.positionalValues;
        this.environmentSettings = gameEnvironment;
        this.historicalRecords = {};
        this.currentMaxDepth = 0;
        this.processedNodesCount = 0;
        this.activeIterationDepth = 0;
    }

    consult(sequenceOfMoves) {
        let openingBookCandidates = this.historicalRecords.opening || this.environmentSettings.openingBook;
        if (openingBookCandidates && openingBookCandidates.length) {
            let currentSequenceLength = sequenceOfMoves.length;
            let filteredCandidates = [];
            for (let k = 0; k < openingBookCandidates.length; k++) {
                if (openingBookCandidates[k].startsWith(sequenceOfMoves)) {
                    filteredCandidates.push(openingBookCandidates[k]);
                }
            }

            if (filteredCandidates.length) {
                let chosenIndex = Math.floor(Math.random() * filteredCandidates.length);
                this.historicalRecords.opening = filteredCandidates;
                let selectedOpening = filteredCandidates[chosenIndex];
                return selectedOpening.substring(currentSequenceLength, currentSequenceLength + 4).split("");
            } else {
                this.historicalRecords.opening = [];
            }
        }

        let operationStartTime = new Date().getTime();
        this.currentMaxDepth = this.environmentSettings.initialSearchDepth;
        this.processedNodesCount = 0;
        this.historicalRecords.searchCache = {};

        let boardSnapshot = this.environmentSettings.currentBoardState.map(row => [...row]);
        let optimalResult = this.executeMinimaxAlphaBeta(-99999, 99999, this.currentMaxDepth, boardSnapshot, this.environmentSettings.playerSide);

        if (!optimalResult || optimalResult.evaluation === -8888) {
            this.currentMaxDepth = 2;
            boardSnapshot = this.environmentSettings.currentBoardState.map(row => [...row]);
            optimalResult = this.executeMinimaxAlphaBeta(-99999, 99999, this.currentMaxDepth, boardSnapshot, this.environmentSettings.playerSide);
        }

        if (optimalResult && optimalResult.evaluation !== -8888) {
            return [optimalResult.originX, optimalResult.originY, optimalResult.destinationX, optimalResult.destinationY];
        } else {
            return false;
        }
    }

    incrementalDepthSearch(boardConfiguration, playingSide) {
        let timeConstraint = 100;
        let minimumDepth = 1;
        let maximumDepth = 8;
        let bestFoundMove = null;
        let totalSearchStart = new Date().getTime();

        for (let currentDepth = minimumDepth; currentDepth <= maximumDepth; currentDepth++) {
            let iterationStart = new Date().getTime();
            this.currentMaxDepth = currentDepth;
            this.activeIterationDepth = currentDepth;
            let outcome = this.executeMinimaxAlphaBeta(-99999, 99999, this.currentMaxDepth, boardConfiguration.map(row => [...row]), playingSide);
            if (outcome) {
                bestFoundMove = outcome;
            }
            if (iterationStart - totalSearchStart > timeConstraint) {
                return bestFoundMove;
            }
        }
        return bestFoundMove;
    }

    gatherPlayerUnits(boardLayout, playerAffiliation) {
        let unitsPresent = [];
        for (let rowIterator = 0; rowIterator < boardLayout.length; rowIterator++) {
            for (let colIterator = 0; colIterator < boardLayout[rowIterator].length; colIterator++) {
                let unitIdOnSquare = boardLayout[rowIterator][colIterator];
                if (unitIdOnSquare) {
                    let unitProperties = this.unitData[unitIdOnSquare];
                    if (unitProperties && unitProperties.owner === playerAffiliation) {
                        unitProperties.positionX = colIterator;
                        unitProperties.positionY = rowIterator;
                        unitsPresent.push(unitProperties);
                    }
                }
            }
        }
        return unitsPresent;
    }

    calculateAllLegalMoves(boardState, currentTurnSide) {
        let currentPlayersUnits = this.gatherPlayerUnits(boardState, currentTurnSide);
        let allValidActions = [];
        let disallowedMove = this.environmentSettings.lastFoulMove;

        for (let unitIndex = 0; unitIndex < currentPlayersUnits.length; unitIndex++) {
            let currentUnit = currentPlayersUnits[unitIndex];
            let potentialMoves = currentUnit.movementLogic(boardState, currentUnit.positionX, currentUnit.positionY, this.unitData);

            for (let moveIndex = 0; moveIndex < potentialMoves.length; moveIndex++) {
                let targetColumn = potentialMoves[moveIndex][0];
                let targetRow = potentialMoves[moveIndex][1];

                if (disallowedMove && currentUnit.positionX === disallowedMove[0] && currentUnit.positionY === disallowedMove[1] &&
                    targetColumn === disallowedMove[2] && targetRow === disallowedMove[3]) {
                    continue;
                }
                allValidActions.push([currentUnit.positionX, currentUnit.positionY, targetColumn, targetRow, currentUnit.identifier]);
            }
        }
        return allValidActions;
    }

    executeMinimaxAlphaBeta(lowerBound, upperBound, remainingLevels, gameBoard, currentPlayer) {
        if (remainingLevels === 0) {
            return { evaluation: this.evaluateBoard(gameBoard, currentPlayer) };
        }

        let legalMoves = this.calculateAllLegalMoves(gameBoard, currentPlayer);

        let bestActionForRoot = null;
        
        for (let moveIterator = 0; moveIterator < legalMoves.length; moveIterator++) {
            let chosenMove = legalMoves[moveIterator];
            let pieceIdentifier = chosenMove[4];
            let startCol = chosenMove[0];
            let startRow = chosenMove[1];
            let endCol = chosenMove[2];
            let endRow = chosenMove[3];

            let capturedPieceIdentifier = gameBoard[endRow][endCol] || "";
            gameBoard[endRow][endCol] = pieceIdentifier;
            gameBoard[startRow][startCol] = "";

            let movedUnit = this.unitData[pieceIdentifier];
            let originalUnitCol = movedUnit.positionX;
            let originalUnitRow = movedUnit.positionY;
            movedUnit.positionX = endCol;
            movedUnit.positionY = endRow;

            if (capturedPieceIdentifier && this.unitData[capturedPieceIdentifier].isKing && this.unitData[capturedPieceIdentifier].owner !== currentPlayer) {
                movedUnit.positionX = originalUnitCol;
                movedUnit.positionY = originalUnitRow;
                gameBoard[startRow][startCol] = pieceIdentifier;
                gameBoard[endRow][endCol] = capturedPieceIdentifier;

                return {
                    identifier: pieceIdentifier,
                    originX: startCol,
                    originY: startRow,
                    destinationX: endCol,
                    destinationY: endRow,
                    evaluation: 8888
                };
            } else {
                let opponentResult = this.executeMinimaxAlphaBeta(-upperBound, -lowerBound, remainingLevels - 1, gameBoard, -currentPlayer);
                let currentMoveEvaluation = -opponentResult.evaluation;

                movedUnit.positionX = originalUnitCol;
                movedUnit.positionY = originalUnitRow;
                gameBoard[startRow][startCol] = pieceIdentifier;
                gameBoard[endRow][endCol] = capturedPieceIdentifier;

                if (currentMoveEvaluation >= upperBound) {
                    return {
                        identifier: pieceIdentifier,
                        originX: startCol,
                        originY: startRow,
                        destinationX: endCol,
                        destinationY: endRow,
                        evaluation: upperBound
                    };
                }
                if (currentMoveEvaluation > lowerBound) {
                    lowerBound = currentMoveEvaluation;
                    if (this.currentMaxDepth === remainingLevels) {
                        bestActionForRoot = {
                            identifier: pieceIdentifier,
                            originX: startCol,
                            originY: startRow,
                            destinationX: endCol,
                            destinationY: endRow,
                            evaluation: lowerBound
                        };
                    }
                }
            }
        }

        if (this.currentMaxDepth === remainingLevels) {
            return bestActionForRoot || false;
        }
        return { evaluation: lowerBound };
    }

    evaluateBoard(boardConfiguration, perspectiveOfPlayer) {
        let totalScore = 0;
        for (let r = 0; r < boardConfiguration.length; r++) {
            for (let c = 0; c < boardConfiguration[r].length; c++) {
                let unitId = boardConfiguration[r][c];
                if (unitId) {
                    let unitDetails = this.unitData[unitId];
                    let valueAtPosition = this.unitEvaluations[unitDetails.type][r][c];
                    totalScore += valueAtPosition * unitDetails.owner;
                }
            }
        }
        this.processedNodesCount++;
        return totalScore * perspectiveOfPlayer;
    }
}