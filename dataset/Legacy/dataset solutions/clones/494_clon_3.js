const MAX_PENALTY_SCORE = 5000;
const INITIAL_VALUE = 0;
const START_PROBABILITY = 1;
const SCORE_ADJUST_EFFECT = 1;
const PENALTY_INCREASE_EFFECT = 2;
const PENALTY_DECREASE_EFFECT = 3;

const parseLineOfNumbers = (lineString) => {
    return lineString.split(" ").map(Number);
};

const initializeProbabilityMatrix = (rows, cols, initialVal) => {
    const matrix = [];
    for (let r = INITIAL_VALUE; r <= rows; r++) {
        matrix[r] = [];
        for (let c = INITIAL_VALUE; c <= cols; c++) {
            matrix[r][c] = initialVal;
        }
    }
    return matrix;
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

let currentLineIndex = INITIAL_VALUE;

while (true) {
    const currentGameParameters = parseLineOfNumbers(inputLines[currentLineIndex++]);

    if (currentGameParameters.every(param => param === INITIAL_VALUE)) {
        break;
    }

    const [numPlayers, targetScore, numSpecialSquares] = currentGameParameters;

    const playerMoveValues = parseLineOfNumbers(inputLines[currentLineIndex++]);

    const specialSquareEffects = [];
    for (let s = INITIAL_VALUE; s < numSpecialSquares; s++) {
        const squareEffectData = parseLineOfNumbers(inputLines[currentLineIndex++]);
        const squarePosition = squareEffectData[INITIAL_VALUE];
        const effectType = squareEffectData[1];
        const effectValue = squareEffectData[2];
        specialSquareEffects[squarePosition] = [effectType, effectValue];
    }

    const probabilityDistribution = initializeProbabilityMatrix(targetScore, MAX_PENALTY_SCORE, INITIAL_VALUE);

    probabilityDistribution[INITIAL_VALUE][INITIAL_VALUE] = START_PROBABILITY;

    for (let currentScoreLevel = INITIAL_VALUE; currentScoreLevel < targetScore; currentScoreLevel++) {
        for (let currentPenaltyLevel = INITIAL_VALUE; currentPenaltyLevel <= MAX_PENALTY_SCORE; currentPenaltyLevel++) {
            const currentCellProbability = probabilityDistribution[currentScoreLevel][currentPenaltyLevel];

            if (currentCellProbability === INITIAL_VALUE) {
                continue;
            }

            const probabilityPerPlayerMove = currentCellProbability / numPlayers;

            for (let playerMoveIdx = INITIAL_VALUE; playerMoveIdx < numPlayers; playerMoveIdx++) {
                const moveAmount = playerMoveValues[playerMoveIdx];
                const potentialNextScoreLevel = Math.min(targetScore, currentScoreLevel + moveAmount);

                const effectDetails = specialSquareEffects[potentialNextScoreLevel];

                if (effectDetails !== undefined) {
                    const effectKind = effectDetails[INITIAL_VALUE];
                    const effectAmount = effectDetails[1];

                    let finalScoreForUpdate = potentialNextScoreLevel;
                    let finalPenaltyForUpdate = currentPenaltyLevel;

                    switch (effectKind) {
                        case SCORE_ADJUST_EFFECT:
                            finalScoreForUpdate = Math.min(targetScore, potentialNextScoreLevel + effectAmount);
                            break;
                        case PENALTY_INCREASE_EFFECT:
                            finalPenaltyForUpdate = Math.min(MAX_PENALTY_SCORE, currentPenaltyLevel + effectAmount);
                            break;
                        case PENALTY_DECREASE_EFFECT:
                            // This matches the original's unusual behavior of Math.min(0, k-a)
                            // which can result in negative indices if k-a is negative.
                            finalPenaltyForUpdate = Math.min(INITIAL_VALUE, currentPenaltyLevel - effectAmount);
                            break;
                    }
                    probabilityDistribution[finalScoreForUpdate][finalPenaltyForUpdate] += probabilityPerPlayerMove;

                } else {
                    probabilityDistribution[potentialNextScoreLevel][currentPenaltyLevel] += probabilityPerPlayerMove;
                }
            }
        }
    }

    let totalExpectedPenalty = INITIAL_VALUE;
    for (let penaltyLevel = INITIAL_VALUE; penaltyLevel <= MAX_PENALTY_SCORE; penaltyLevel++) {
        totalExpectedPenalty += penaltyLevel * probabilityDistribution[targetScore][penaltyLevel];
    }

    console.log(Math.floor(totalExpectedPenalty));
}
