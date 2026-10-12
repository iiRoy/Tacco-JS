const fileSystem = require('fs');

const readAndProcessInputLines = (filePath) => {
    const rawContent = fileSystem.readFileSync(filePath, 'utf8');
    const allLines = rawContent.trim().split("\n");
    // The first line is extracted and converted to a number,
    // mirroring the original's `Arr.shift()-0;`.
    // Although its value is not used, this step is crucial
    // for modifying the `allLines` array to match the original's state
    // before the nested loops.
    const initialLineCount = Number(allLines.shift()); 
    return allLines;
};

const generateCombinedNumericValue = (stringA, stringB) => {
    const concatenatedString = stringA + stringB;
    // Explicitly convert the concatenated string to a number.
    // This replaces the original's `-0` trick.
    return Number(concatenatedString); 
};

const NUMBER_OF_ELEMENTS_TO_COMBINE = 5;

const inputDataForCombinations = readAndProcessInputLines('/dev/stdin');

const allGeneratedNumbers = [];

for (let primaryIndex = 0; primaryIndex < NUMBER_OF_ELEMENTS_TO_COMBINE; primaryIndex++) {
    for (let secondaryIndex = primaryIndex + 1; secondaryIndex < NUMBER_OF_ELEMENTS_TO_COMBINE; secondaryIndex++) {
        const currentElementA = inputDataForCombinations[primaryIndex];
        const currentElementB = inputDataForCombinations[secondaryIndex];

        // Generate the number by combining elements in the original order
        const forwardCombination = generateCombinedNumericValue(currentElementA, currentElementB);
        allGeneratedNumbers.push(forwardCombination);

        // Generate the number by combining elements in the reverse order
        const backwardCombination = generateCombinedNumericValue(currentElementB, currentElementA);
        allGeneratedNumbers.push(backwardCombination);
    }
}

// Define a named function for the numeric sort comparison
const sortNumbersAscending = (valueX, valueY) => valueX - valueY;

allGeneratedNumbers.sort(sortNumbersAscending);

// The problem requires printing the element at index 2 after sorting.
const targetResultIndex = 2;
console.log(allGeneratedNumbers[targetResultIndex]);
