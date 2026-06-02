const fileSystem = require("fs");

const inputContent = fileSystem.readFileSync("./test.txt", "utf8").trim();

const analyzeBallSequence = (lineOfBalls) => {
    const numericBallValues = lineOfBalls.trim().split(/\s/).map(Number);

    const requiredBallCountForYes = 10;

    const initialProcessingState = {
        pathValues: [0, 0],
        outcomeStatus: 'CONTINUE',
        processedItems: 0
    };

    const finalProcessingState = numericBallValues.reduce((accumulator, currentBallValue) => {
        if (accumulator.outcomeStatus === 'FAIL') {
            return accumulator;
        }

        const [pathA_lastValue, pathB_lastValue] = accumulator.pathValues;

        const pathValueDifferences = [
            currentBallValue - pathA_lastValue,
            currentBallValue - pathB_lastValue
        ];

        if (pathValueDifferences[0] < 0 && pathValueDifferences[1] < 0) {
            return { ...accumulator, outcomeStatus: 'FAIL' };
        }

        const shouldAssignToPathA = (pathValueDifferences[0] <= pathValueDifferences[1]) && (pathValueDifferences[0] > 0);

        if (shouldAssignToPathA) {
            return {
                pathValues: [currentBallValue, pathB_lastValue],
                outcomeStatus: 'CONTINUE',
                processedItems: accumulator.processedItems + 1
            };
        } else {
            return {
                pathValues: [pathA_lastValue, currentBallValue],
                outcomeStatus: 'CONTINUE',
                processedItems: accumulator.processedItems + 1
            };
        }
    }, initialProcessingState);

    if (finalProcessingState.outcomeStatus === 'FAIL') {
        return "NO";
    } else if (finalProcessingState.processedItems >= requiredBallCountForYes) {
        return "YES";
    } else {
        return null;
    }
};

const allContentLines = inputContent.split(/\n/);

allContentLines.slice(1).map(analyzeBallSequence).forEach(processingResult => {
    if (processingResult !== null) {
        console.log(processingResult);
    }
});
