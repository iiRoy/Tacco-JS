function* combinationGenerator(targetValue) {
    for (let zAxis = 0; zAxis <= 100; zAxis++) {
        const zCubedResult = zAxis * zAxis * zAxis;
        for (let yAxis = 0; yAxis <= 1000; yAxis++) {
            const ySquaredResult = yAxis * yAxis;
            const xCoordinate = targetValue - zCubedResult + ySquaredResult;
            if (xCoordinate < 0) {
                break;
            }
            yield zAxis + yAxis + xCoordinate;
        }
    }
}

const processInputSequence = (sourceData) => {
    const parsedLines = sourceData.trim().split("\n");
    const collectedResults = [];
    let currentPosition = 0;

    const processNextEntry = () => {
        if (currentPosition >= parsedLines.length) {
            return;
        }

        const currentNumericValue = Number(parsedLines[currentPosition]);
        currentPosition++;

        if (currentNumericValue === 0) {
            return;
        }

        let lowestSumEncountered = Infinity;
        for (const potentialSum of combinationGenerator(currentNumericValue)) {
            if (potentialSum < lowestSumEncountered) {
                lowestSumEncountered = potentialSum;
            }
        }
        collectedResults.push(lowestSumEncountered);

        processNextEntry();
    };

    processNextEntry();
    return collectedResults;
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalCalculations = processInputSequence(fileContent);
finalCalculations.forEach(outputValue => console.log(outputValue));
