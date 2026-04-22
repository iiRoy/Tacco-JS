'use strict';

const parseGameData = (rawData) => {
    const dataParts = rawData.split(/\s+/);
    const [dimH, dimW, numTurns, initialR, initialC] = dataParts.slice(0, 5).map(Number);
    const playerActionSequence = dataParts[5];
    const predatorActionSequence = dataParts[6];
    return {
        fieldHeight: dimH,
        fieldWidth: dimW,
        totalActions: numTurns,
        startCoordR: initialR,
        startCoordC: initialC,
        playerMovesStr: playerActionSequence,
        predatorMovesStr: predatorActionSequence
    };
};

const advancePlayerPosition = (currentSpatialBounds, playerCommand) => {
    let { minXCoord, maxXCoord, minYCoord, maxYCoord } = currentSpatialBounds;

    if (playerCommand === 'L') minXCoord--;
    else if (playerCommand === 'R') maxXCoord++;
    else if (playerCommand === 'U') minYCoord--;
    else if (playerCommand === 'D') maxYCoord++;

    return { minXCoord, maxXCoord, minYCoord, maxYCoord };
};

const verifyEscapeCondition = (potentialBounds, widthLimit, heightLimit) => {
    if (potentialBounds.minXCoord < 1 || potentialBounds.maxXCoord > widthLimit ||
        potentialBounds.minYCoord < 1 || potentialBounds.maxYCoord > heightLimit) {
        return true;
    }
    return false;
};

const applyPredatorConstraint = (currentSpatialBounds, predatorCommand, widthLimit, heightLimit) => {
    let { minXCoord, maxXCoord, minYCoord, maxYCoord } = currentSpatialBounds;

    if (predatorCommand === 'R') minXCoord++;
    else if (predatorCommand === 'L') maxXCoord--;
    else if (predatorCommand === 'D') minYCoord++;
    else if (predatorCommand === 'U') maxYCoord--;

    minXCoord = Math.min(minXCoord, widthLimit);
    maxXCoord = Math.max(maxXCoord, 1);
    minYCoord = Math.min(minYCoord, heightLimit);
    maxYCoord = Math.max(maxYCoord, 1);

    return { minXCoord, maxXCoord, minYCoord, maxYCoord };
};

function GameSolver(inputString) {
    const gameParameters = parseGameData(inputString);

    const initialRegion = {
        minXCoord: gameParameters.startCoordC,
        maxXCoord: gameParameters.startCoordC,
        minYCoord: gameParameters.startCoordR,
        maxYCoord: gameParameters.startCoordR,
        isEscaped: false
    };

    const actionIndices = Array.from({ length: gameParameters.totalActions }, (_, idx) => idx);

    const simulationResult = actionIndices.reduce((currentState, stepIdx) => {
        if (currentState.isEscaped) {
            return currentState;
        }

        const playerMoveKey = gameParameters.playerMovesStr[stepIdx];
        const postPlayerMoveRegion = advancePlayerPosition(currentState, playerMoveKey);

        if (verifyEscapeCondition(postPlayerMoveRegion, gameParameters.fieldWidth, gameParameters.fieldHeight)) {
            return { ...currentState, isEscaped: true };
        }

        const predatorMoveKey = gameParameters.predatorMovesStr[stepIdx];
        const postPredatorConstraintRegion = applyPredatorConstraint(
            postPlayerMoveRegion,
            predatorMoveKey,
            gameParameters.fieldWidth,
            gameParameters.fieldHeight
        );

        return {
            minXCoord: postPredatorConstraintRegion.minXCoord,
            maxXCoord: postPredatorConstraintRegion.maxXCoord,
            minYCoord: postPredatorConstraintRegion.minYCoord,
            maxYCoord: postPredatorConstraintRegion.maxYCoord,
            isEscaped: false
        };
    }, initialRegion);

    console.log(simulationResult.isEscaped ? 'NO' : 'YES');
}

GameSolver(require('fs').readFileSync('/dev/stdin', 'utf8'));