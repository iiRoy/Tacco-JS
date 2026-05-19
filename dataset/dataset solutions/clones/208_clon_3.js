const fileSystemModule = require('fs');
const rawData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInput = rawData.trim();
const lines = processedInput.split("\n");

const totalLinesToProcess = parseInt(lines.shift(), 10);

const convertStringToDigitArray = (digitString) => {
    return digitString.split("").map(Number);
};

const createSortedNumberString = (numberArray, sortDescending) => {
    const mutableArray = [...numberArray];
    if (sortDescending) {
        mutableArray.sort((valA, valB) => valB - valA);
    } else {
        mutableArray.sort((valA, valB) => valA - valB);
    }
    return mutableArray.join("");
};

const BASE_RADIX = 10;

for (let currentIdx = 0; currentIdx < totalLinesToProcess; currentIdx++) {
    const currentLineContent = lines[currentIdx];
    
    const digitsArray = convertStringToDigitArray(currentLineContent);

    const descendingNumberString = createSortedNumberString(digitsArray, true);
    
    const ascendingNumberString = createSortedNumberString(digitsArray, false);

    const valueFromDescending = parseInt(descendingNumberString, BASE_RADIX);
    const valueFromAscending = parseInt(ascendingNumberString, BASE_RADIX);

    const finalDifference = valueFromDescending - valueFromAscending;

    console.log(finalDifference);
}
