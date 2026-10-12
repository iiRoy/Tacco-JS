'use strict'

const processInputData = (rawData) => {
    const lineSegments = rawData.trim().split("\n");
    const terminatorPosition = lineSegments.indexOf("0 0");
    const problemStatements = lineSegments.slice(0, terminatorPosition);

    const solutionCounts = [];

    for (let statementIndex = 0; statementIndex < problemStatements.length; statementIndex++) {
        const statementLine = problemStatements[statementIndex];
        const parsedValues = statementLine.split(" ").map(str => parseInt(str, 10));
        const rangeMaximum = parsedValues[0];
        const targetValue = parsedValues[1];

        let currentProblemCount = 0;

        for (let firstElement = 1; firstElement <= rangeMaximum; firstElement++) {
            for (let secondElement = firstElement + 1; secondElement <= rangeMaximum; secondElement++) {
                for (let thirdElement = secondElement + 1; thirdElement <= rangeMaximum; thirdElement++) {
                    if (firstElement + secondElement + thirdElement === targetValue) {
                        currentProblemCount++;
                    }
                }
            }
        }
        solutionCounts.push(currentProblemCount);
    }

    console.log(solutionCounts.join("\n"));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
