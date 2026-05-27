var sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

const computeScore = (numericValues) => {
    const combinedScores = [
        numericValues[0] + numericValues[3],
        numericValues[1] + numericValues[4],
        numericValues[2] + numericValues[5]
    ];

    const initialTally = combinedScores.reduce((accumulator, currentScore) => {
        return accumulator + Math.floor(currentScore / 3);
    }, 0);

    const residualScores = combinedScores.map(currentScore => currentScore % 3);

    const additionalTally = Math.min(...residualScores);

    return initialTally + additionalTally;
};

const lineSegments = sourceText.trim().split("\n");

const results = lineSegments
    .filter(segment => segment !== "0 0 0 0 0 0")
    .map(segment => {
        const numericValues = segment.split(" ").map(Number);
        return computeScore(numericValues);
    });

console.log(results.join("\n"));
