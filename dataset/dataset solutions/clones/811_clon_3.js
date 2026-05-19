const printOutput = console.log;

if (typeof process !== "undefined") {
    let rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', () => {
        processInputData(rawInputBuffer);
    });
}

function processInputData(fullInputString) {
    let allInputLines = fullInputString.split("\n");
    allInputLines.shift();
    allInputLines.pop();
    executeDataAnalysis(allInputLines);
}

function executeDataAnalysis(processedLines) {
    processedLines.shift();

    const numericLineArrays = processedLines.map(lineStr => {
        const stringNumbers = lineStr.split(" ");
        return stringNumbers.map(Number);
    });

    const groupedDataSets = [];
    let currentLineIndex = 0;

    while (currentLineIndex < numericLineArrays.length - 1) {
        const configLine = numericLineArrays[currentLineIndex];
        const dataLine = numericLineArrays[currentLineIndex + 1];
        groupedDataSets.push([configLine, dataLine]);
        currentLineIndex += 2;
    }

    groupedDataSets.forEach(dataSetEntry => {
        const configDetails = dataSetEntry[0];
        const dataValues = dataSetEntry[1];

        const powerThreshold = configDetails[1];

        const calculatedDifferences = [];
        for (let i = 1; i < dataValues.length; i++) {
            calculatedDifferences.push(dataValues[i] - dataValues[i - 1]);
        }

        calculatedDifferences.sort((a, b) => b - a);

        const numDifferencesToRemove = Math.max(0, powerThreshold - 1);
        calculatedDifferences.splice(0, numDifferencesToRemove);

        if (calculatedDifferences.length > 0) {
            const sumOfRemainingDifferences = calculatedDifferences.reduce((accumulator, currentDifference) => {
                return accumulator + currentDifference;
            });
            printOutput(sumOfRemainingDifferences);
        } else {
            printOutput(0);
        }
    });
}
