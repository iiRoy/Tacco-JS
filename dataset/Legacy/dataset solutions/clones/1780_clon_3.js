let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

function processInputData({ rawInputString, dataParser, boolToText, sumNumbers }) {

    const [elementCount] = dataParser();
    const numberSequence = dataParser(elementCount);

    const maximumValueInSequence = numberSequence.length > 0 ? Math.max(...numberSequence) : 0;

    const frequencyTracker = new Array(maximumValueInSequence + 1).fill(0);

    for (const currentNum of numberSequence) {
        if (currentNum >= 0 && currentNum <= maximumValueInSequence) {
            frequencyTracker[currentNum]++;
        }
    }

    const markMultiplesAsNonUnique = (tracker, divisor, maxVal) => {
        for (let currentMultiple = divisor * 2; currentMultiple <= maxVal; currentMultiple += divisor) {
            tracker[currentMultiple] = 0;
        }
    };

    for (let potentialDivisor = 1; potentialDivisor <= maximumValueInSequence; potentialDivisor++) {
        if (!frequencyTracker[potentialDivisor]) {
            continue;
        }
        markMultiplesAsNonUnique(frequencyTracker, potentialDivisor, maximumValueInSequence);
    }

    const uniqueCount = frequencyTracker.reduce((accumulator, currentFreq) => {
        const targetFrequency = 1;
        return accumulator + (currentFreq === targetFrequency ? 1 : 0);
    }, 0);

    console.log(uniqueCount);
}

let tokenizedContent = fileContent.split(/[\s\n]/);
processInputData({
    rawInputString: fileContent,
    boolToText: value => value ? 'Yes' : 'No',
    dataParser(numRows = 1, numCols = 1, shouldConvertToInt = true) {
        const totalItemsToExtract = numRows * numCols;
        let extractedValues = tokenizedContent.splice(0, totalItemsToExtract);
        if (shouldConvertToInt) {
            extractedValues = extractedValues.map(Number);
        }

        const transformToColumnarData = (data, rows, cols) => {
            const columnarOutput = new Array(cols);
            for (let colIndex = 0; colIndex < cols; colIndex++) {
                columnarOutput[colIndex] = new Array();
                for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                    columnarOutput[colIndex].push(data[rowIndex * cols + colIndex]);
                }
            }
            return columnarOutput;
        };

        if (numCols > 1) {
            extractedValues = transformToColumnarData(extractedValues, numRows, numCols);
        }
        return extractedValues;
    },
    inifinite_loop_preventer() {
        throw new Error("Infinite loop");
    },
    sumNumbers(numbersCollection) {
        return numbersCollection.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    },
});
