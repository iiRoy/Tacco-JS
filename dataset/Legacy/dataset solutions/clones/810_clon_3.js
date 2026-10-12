var consoleOutput = console.log;

function parseLineOfNumbers(lineString) {
    return lineString.split(" ").map(Number);
}

if (typeof process !== "undefined") {
    let rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputData += chunk;
    });
    process.stdin.on('end', () => {
        processInputAndRunMain(rawInputData);
    });
}

function processInputAndRunMain(fullInputString) {
    let allInputLines = fullInputString.split("\n");

    const overallTestCaseCountLine = allInputLines.shift();

    const lastLineElement = allInputLines.pop();

    executeCoreLogic(allInputLines);
}

function executeCoreLogic(processedInputLines) {
    const firstDatasetConfigLine = processedInputLines.shift();

    const numericInputLines = processedInputLines.map(parseLineOfNumbers);

    const problemSets = [];
    let currentLineCursor = 0;

    while (currentLineCursor + 1 < numericInputLines.length) {
        const datasetConfig = numericInputLines[currentLineCursor++];
        const sequenceData = numericInputLines[currentLineCursor++];
        
        problemSets.push([datasetConfig, sequenceData]);
    }

    problemSets.forEach((datasetEntry) => {
        const powerValue = datasetEntry[0][1];

        const sequenceNumbers = datasetEntry[1];
        const differences = [];

        for (let i = 1; i < sequenceNumbers.length; i++) {
            differences.push(sequenceNumbers[i] - sequenceNumbers[i - 1]);
        }

        differences.sort((a, b) => b - a);

        const relevantDifferences = differences.slice(powerValue - 1);

        const totalSum = relevantDifferences.reduce((accumulator, currentDifference) => accumulator + currentDifference, 0);

        consoleOutput(totalSum);
    });
}
