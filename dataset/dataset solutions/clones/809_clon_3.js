var outputLog = console.log;

if (typeof process !== "undefined") {
    let rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (dataChunk) {
        rawData += dataChunk;
    });
    process.stdin.on('end', function () {
        processInputData(rawData);
    });
}

function parseLineOfNumbers(lineStr) {
    const numStrArray = lineStr.split(" ");
    const parsedNumbers = numStrArray.map(function (singleNumStr) {
        return Number(singleNumStr);
    });
    return parsedNumbers;
}

function processInputData(rawData) {
    let inputLines = rawData.split("\n");
    
    if (inputLines.length > 0) {
        inputLines.shift();
    }
    if (inputLines.length > 0) {
        inputLines.pop();
    }
    
    executeLogic(inputLines);
}

function calculateDifferences(numericArray) {
    const differences = [];
    for (let idx = 1; idx < numericArray.length; idx++) {
        differences.push(numericArray[idx] - numericArray[idx - 1]);
    }
    return differences;
}

function executeLogic(inputLines) {
    if (inputLines.length > 0) {
        inputLines.shift();
    }

    let processedLines = inputLines.map(parseLineOfNumbers);

    const dataCollections = [];

    for (let k = 0; k < processedLines.length; k += 2) {
        if (k + 1 < processedLines.length) {
            const currentCollection = [processedLines[k], processedLines[k + 1]];
            dataCollections.push(currentCollection);
        }
    }

    dataCollections.forEach(function (datasetItem) {
        const powerValue = datasetItem[0][1];
        
        let differences = calculateDifferences(datasetItem[1]);

        differences.sort(function (valA, valB) {
            return valB - valA;
        });

        const relevantDifferences = differences.slice(powerValue - 1);

        if (relevantDifferences.length > 0) {
            const totalSum = relevantDifferences.reduce((accumulator, currentDiff) => accumulator + currentDiff);
            outputLog(totalSum);
        } else {
            outputLog(0);
        }
    });
}
