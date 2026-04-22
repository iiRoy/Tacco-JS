const fileSystem = require('fs');

let allInputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');
let currentLinePointer = 0;

const parsePositiveIntegerSafe = (inputString) => {
    const numericValue = Number(inputString);
    if (!Number.isInteger(numericValue) || numericValue < 0) {
        return 0;
    }
    return numericValue;
};

const multiplyStringNumbers = (numStrA, numStrB) => {
    let longerNum = numStrA;
    let shorterNum = numStrB;

    if (numStrA.length < numStrB.length) {
        [longerNum, shorterNum] = [shorterNum, longerNum];
    }

    const lenLonger = longerNum.length;
    const lenShorter = shorterNum.length;

    const productDigitsBuffer = new Array(lenLonger + lenShorter).fill(0);

    for (let i = lenLonger - 1; i >= 0; i--) {
        let currentMultiplicationCarry = 0;
        const digitFromLonger = Number(longerNum[i]);

        for (let j = lenShorter - 1; j >= 0; j--) {
            const digitFromShorter = Number(shorterNum[j]);

            let intermediateResult = digitFromLonger * digitFromShorter +
                                     productDigitsBuffer[i + j + 1] +
                                     currentMultiplicationCarry;

            productDigitsBuffer[i + j + 1] = intermediateResult % 10;
            currentMultiplicationCarry = Math.floor(intermediateResult / 10);
        }
        productDigitsBuffer[i] += currentMultiplicationCarry;
    }

    let firstSignificantDigitIndex = 0;
    while (firstSignificantDigitIndex < productDigitsBuffer.length - 1 &&
           productDigitsBuffer[firstSignificantDigitIndex] === 0) {
        firstSignificantDigitIndex++;
    }

    return productDigitsBuffer.slice(firstSignificantDigitIndex).join('');
};

while (currentLinePointer < allInputLines.length) {
    const currentRawLine = allInputLines[currentLinePointer].trim();
    currentLinePointer++;

    if (currentRawLine === '') {
        continue;
    }

    let currentBatchSize = parsePositiveIntegerSafe(currentRawLine);
    if (currentBatchSize === 0) {
        break;
    }

    const eligibleEntryIdentifiers = new Set();
    const MINIMUM_PRODUCT_DIGITS = 7;

    for (let entryIteration = 0; entryIteration < currentBatchSize; entryIteration++) {
        if (currentLinePointer >= allInputLines.length) {
            console.error("Warning: Input ended unexpectedly before processing all batch entries.");
            break;
        }

        const entryDetails = allInputLines[currentLinePointer].trim().split(' ');
        currentLinePointer++;

        if (entryDetails.length < 3) {
            console.warn(`Skipping malformed entry: "${entryDetails.join(' ')}" - Expected 3 parts.`);
            continue;
        }

        const primaryIdentifier = entryDetails[0];
        const firstNumericString = entryDetails[1];
        const secondNumericString = entryDetails[2];

        if (!/^\d+$/.test(firstNumericString) || !/^\d+$/.test(secondNumericString)) {
             console.warn(`Skipping entry due to non-numeric parts: "${firstNumericString}", "${secondNumericString}"`);
             continue;
        }

        const productResultString = multiplyStringNumbers(firstNumericString, secondNumericString);

        if (productResultString.length >= MINIMUM_PRODUCT_DIGITS) {
            eligibleEntryIdentifiers.add(primaryIdentifier);
        }
    }

    if (eligibleEntryIdentifiers.size === 0) {
        console.log("NA");
    } else {
        const sortedUniqueIdentifiers = Array.from(eligibleEntryIdentifiers).sort();
        for (const identifier of sortedUniqueIdentifiers) {
            console.log(identifier);
        }
    }
}