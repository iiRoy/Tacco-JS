process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedInput = '';
process.stdin.on('data', function(chunk) {
    accumulatedInput += chunk;
});

process.stdin.on('end', function() {
    const parsedLines = accumulatedInput.split(/\r?\n/);
    processInputData(parsedLines);
});

function parseInitialData(inputLines) {
    const arraySize = parseInt(inputLines[0], 10);
    const rawNumbersString = inputLines[1].split(' ');

    const numbersArray = rawNumbersString.map(numStr => parseInt(numStr, 10));

    return { arraySize, numbersArray };
}

function processInputData(lines) {
    const { arraySize, numbersArray } = parseInitialData(lines);

    const finalResult = calculateCombinations(0, numbersArray);
    console.log(finalResult);

    return 0;
}

const COMBINATION_FACTOR = 3;

function calculateCombinations(startIndex, dataArray) {
    if (startIndex >= dataArray.length) {
        return 0;
    }

    const elementsAfterCurrent = dataArray.length - (startIndex + 1);
    const combinationsForCurrent = Math.pow(COMBINATION_FACTOR, elementsAfterCurrent);

    const combinationsForRemaining = calculateCombinations(startIndex + 1, dataArray);

    let currentLevelResult = 0;

    const isCurrentElementEven = (dataArray[startIndex] % 2 === 0);

    if (isCurrentElementEven) {
        const twoTimesRemaining = 2 * combinationsForRemaining;
        currentLevelResult = combinationsForCurrent + twoTimesRemaining;
    } else {
        const twoTimesCurrent = 2 * combinationsForCurrent;
        currentLevelResult = twoTimesCurrent + combinationsForRemaining;
    }

    return currentLevelResult;
}
