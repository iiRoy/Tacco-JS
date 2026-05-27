var inputLines = [];
var ioModule = require('readline');

var inputReader = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

inputReader.on('close', function () {
    const parseNthNumber = (inputString, index) => {
        const parts = inputString.split(" ");
        return Number(parts[index]);
    };

    const arraySize = parseNthNumber(inputLines[0], 0);
    const modulusValue = parseNthNumber(inputLines[0], 1);

    const dataArray = inputLines[1].split(" ").map(valStr => Number(valStr));

    const prefixSumsModM = [0];
    
    for (let idx = 0; idx < arraySize; idx++) {
        const previousSum = prefixSumsModM[idx];
        const currentElement = dataArray[idx];
        const newSum = (previousSum + currentElement) % modulusValue;
        prefixSumsModM.push(newSum);
    }

    let totalPairs = 0;
    const remainderCounts = {};
    
    for (let idx = 0; idx < prefixSumsModM.length; idx++) {
        const currentRemainder = prefixSumsModM[idx];
        
        const existingCount = remainderCounts[currentRemainder] || 0;
        
        totalPairs += existingCount;
        remainderCounts[currentRemainder] = existingCount + 1;
    }

    console.log(totalPairs);
});
