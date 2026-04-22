let inputBuffer = [];
let totalMatches, numAvailableDigits;
let matchCostsPerDigit;
let memoizedMaxNumbers;

const inputHandler = require('readline');

const ioInterface = inputHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', (currentLineData) => {
    inputBuffer.push(currentLineData);
});

ioInterface.on('close', () => {
    const digitMatchstickCounts = [
        6, // Cost for digit 0
        2, // Cost for digit 1
        5, // Cost for digit 2
        5, // Cost for digit 3
        4, // Cost for digit 4
        5, // Cost for digit 5
        6, // Cost for digit 6
        3, // Cost for digit 7
        7, // Cost for digit 8
        6  // Cost for digit 9
    ];

    const mainParams = inputBuffer[0].split(" ");
    totalMatches = parseInt(mainParams[0], 10);
    numAvailableDigits = parseInt(mainParams[1], 10);

    matchCostsPerDigit = [];

    const availableDigitStrings = inputBuffer[1].split(" ");

    for (let i = 0; i < numAvailableDigits; i++) {
        const currentDigitValue = parseInt(availableDigitStrings[i], 10);
        if (currentDigitValue >= 0 && currentDigitValue <= 9) {
            matchCostsPerDigit.push({
                digitValue: currentDigitValue,
                requiredMatches: digitMatchstickCounts[currentDigitValue],
            });
        }
    }

    matchCostsPerDigit.sort((a, b) => {
        if (a.digitValue !== b.digitValue) {
            return b.digitValue - a.digitValue; // Sort digits in descending order (e.g., 9, 8, ...)
        }
        return a.requiredMatches - b.requiredMatches; // Secondary sort: fewer matches first (less impactful)
    });

    memoizedMaxNumbers = new Array(totalMatches + 1).fill('');

    for (let currentBudget = 1; currentBudget <= totalMatches; currentBudget++) {
        for (let digitIdx = 0; digitIdx < numAvailableDigits; digitIdx++) {
            const digitInfo = matchCostsPerDigit[digitIdx];
            const costOfCurrentDigit = digitInfo.requiredMatches;
            const valueOfCurrentDigit = digitInfo.digitValue;

            const remainingBudget = currentBudget - costOfCurrentDigit;

            if (remainingBudget < 0) {
                continue;
            }

            if (remainingBudget > 0 && memoizedMaxNumbers[remainingBudget] === '') {
                continue;
            }

            const potentialResult = memoizedMaxNumbers[remainingBudget] + String(valueOfCurrentDigit);
            const currentBestForBudget = memoizedMaxNumbers[currentBudget];

            const currentBestLength = currentBestForBudget.length;
            const potentialLength = potentialResult.length;

            let shouldUpdate = false;
            if (potentialLength > currentBestLength) {
                shouldUpdate = true;
            } else if (potentialLength === currentBestLength) {
                if (potentialResult > currentBestForBudget) {
                    shouldUpdate = true;
                }
            }
            
            if (shouldUpdate) {
                memoizedMaxNumbers[currentBudget] = potentialResult;
            }
        }
    }

    process.stdout.write(memoizedMaxNumbers[totalMatches] + '\n');
});