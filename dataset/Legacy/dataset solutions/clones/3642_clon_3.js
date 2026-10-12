String.prototype.padWithZeros = function(padLength, padChar) {
    const targetStr = this;
    const actualPadChar = typeof padChar === 'undefined' ? '0' : padChar;

    const requiredTotalLength = actualPadChar.length * padLength;

    if (targetStr.length > requiredTotalLength) {
        throw new Error(`String length error: "${targetStr}".length = ${targetStr.length} exceeds maximum padded length of ${requiredTotalLength}.`);
    }
    return (actualPadChar.repeat(padLength) + targetStr).slice(-requiredTotalLength);
};

function solveProblem(rawData) {
    let inputLines = rawData.split("\n");

    const dimensionsAndGoalStr = inputLines.shift();
    const dimensionsAndGoal = dimensionsAndGoalStr.split(" ").map(val => parseInt(val, 10));

    const numProblems = dimensionsAndGoal[0];
    const targetScore = dimensionsAndGoal[1] / 100;

    const problemPoints = [];
    const bonusScores = [];

    for (let i = 0; i < numProblems; i++) {
        const problemConfigLine = inputLines.shift();
        const problemConfig = problemConfigLine.split(" ").map(val => parseInt(val, 10));
        problemPoints.push(problemConfig[0]);
        bonusScores.push(problemConfig[1] / 100);
    }

    const numCombinations = Math.pow(2, numProblems);

    const candidateSolutions = [];

    for (let i = 0; i < numCombinations; i++) {
        const currentSelection = i.toString(2).padWithZeros(numProblems);

        let currentScore = 0;
        let problemsSolved = 0;

        for (let problemIndex = 0; problemIndex < numProblems; problemIndex++) {
            if (currentSelection[problemIndex] === "1") {
                problemsSolved += problemPoints[problemIndex];
                const problemValue = problemPoints[problemIndex] * (problemIndex + 1);
                currentScore += problemValue + bonusScores[problemIndex];
            }
        }

        if (currentScore >= targetScore) {
            candidateSolutions.push(problemsSolved);
            continue;
        }

        for (let problemIndex = 0; problemIndex < numProblems; problemIndex++) {
            if (currentSelection[problemIndex] === "1") {
                continue;
            }

            const remainingScoreNeeded = targetScore - currentScore;
            const pointsPerProblemType = problemIndex + 1;

            const additionalProblemsNeeded = Math.floor(remainingScoreNeeded / pointsPerProblemType);

            if (additionalProblemsNeeded >= problemPoints[problemIndex]) {
                continue;
            }
            candidateSolutions.push(problemsSolved + additionalProblemsNeeded);
        }
    }

    if (candidateSolutions.length === 0) {
        return Infinity;
    }
    return Math.min(...candidateSolutions);
}

((inputData, resultValue, resultType) => {
    if (typeof require !== "undefined") {
        console.log(solveProblem(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        const processedInput = inputData.split("\n").slice(1, -1).join("\n");

        try {
            resultValue = solveProblem(processedInput);
        } catch (error) {
            resultValue = error.stack || error.message;
        }
        resultType = typeof resultValue;

        if (resultType !== "string") {
            resultValue = JSON.stringify(resultValue);
        }

        $("<form>").append([
            [10, processedInput], 0, [1, resultType], 0, [10, resultValue]
        ].map(item => $(item ? "<textarea>" : "<br>", item && {
            rows: item[0],
            cols: 40,
            text: item[1]
        }))).appendTo("body");
    }
})(
    `
2 700
3 500
5 800
`
);
