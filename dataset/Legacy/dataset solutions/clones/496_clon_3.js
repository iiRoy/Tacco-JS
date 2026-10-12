const readParsedNumbers = (linesArray) => linesArray.shift().split(" ").map(Number);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

while (true) {
    const currentParams = readParsedNumbers(inputLines);

    if (currentParams[0] === 0 && currentParams[1] === 0 && currentParams[2] === 0) {
        break;
    }

    const numDiceSides = currentParams[0];
    const maxScoreTarget = currentParams[1];
    const numSpecialSquares = currentParams[2];

    const diceOutcomes = readParsedNumbers(inputLines);

    const specialSquareEffects = [];
    for (let k = 0; k < numSpecialSquares; k++) {
        const squareEffectData = readParsedNumbers(inputLines);
        const squareNumber = squareEffectData[0];
        const effectType = squareEffectData[1];
        const effectValue = squareEffectData[2];
        specialSquareEffects[squareNumber] = { type: effectType, value: effectValue };
    }

    const maxPenaltyValue = 5000;

    const probabilityDistribution = Array.from({ length: maxScoreTarget + 1 }, () =>
        Array(maxPenaltyValue + 1).fill(0)
    );

    probabilityDistribution[0][0] = 1;

    for (let currentScore = 0; currentScore < maxScoreTarget; currentScore++) {
        for (let diceRollIndex = 0; diceRollIndex < numDiceSides; diceRollIndex++) {
            const rollValue = diceOutcomes[diceRollIndex];
            let potentialNextScore = currentScore + rollValue;

            const actualNextScore = Math.min(potentialNextScore, maxScoreTarget);

            for (let currentPenalty = 0; currentPenalty <= maxPenaltyValue; currentPenalty++) {
                const currentProbability = probabilityDistribution[currentScore][currentPenalty];

                if (currentProbability === 0) {
                    continue;
                }

                const probPerOutcome = currentProbability / numDiceSides;

                const effectOnNextSquare = specialSquareEffects[actualNextScore];

                if (effectOnNextSquare !== undefined) {
                    const { type: effectType, value: effectValue } = effectOnNextSquare;
                    let finalNextScore = actualNextScore;
                    let finalNextPenalty = currentPenalty;

                    switch (effectType) {
                        case 1:
                            finalNextScore += effectValue;
                            finalNextScore = Math.max(0, Math.min(finalNextScore, maxScoreTarget));
                            break;
                        case 2:
                            finalNextPenalty += effectValue;
                            finalNextPenalty = Math.min(finalNextPenalty, maxPenaltyValue);
                            break;
                        case 3:
                            finalNextPenalty -= effectValue;
                            finalNextPenalty = Math.max(0, finalNextPenalty);
                            break;
                    }
                    probabilityDistribution[finalNextScore][finalNextPenalty] += probPerOutcome;
                } else {
                    probabilityDistribution[actualNextScore][currentPenalty] += probPerOutcome;
                }
            }
        }
    }

    let totalExpectedPenalty = 0;
    for (let penaltyIdx = 0; penaltyIdx <= maxPenaltyValue; penaltyIdx++) {
        totalExpectedPenalty += penaltyIdx * probabilityDistribution[maxScoreTarget][penaltyIdx];
    }

    console.log(Math.floor(totalExpectedPenalty));
}
