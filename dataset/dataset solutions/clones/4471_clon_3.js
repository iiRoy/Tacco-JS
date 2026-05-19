function readStandardInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

const numericComparator = (valA, valB) => valA - valB;

function prepareAndSort(inputArray) {
    const parsedNumbers = inputArray.map(elementStr => parseInt(elementStr, 10));
    const sortedNumbers = parsedNumbers.sort(numericComparator);
    return sortedNumbers;
}

function computeSumOfLargest(arrSorted, arrayLength, numElementsToSum) {
    const sliceStartIdx = arrayLength - numElementsToSum + 1;
    const sliceEndIdx = arrayLength + 1;

    const elementsToSum = arrSorted.slice(sliceStartIdx, sliceEndIdx);

    const totalSum = elementsToSum.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
    }, 0);

    return totalSum;
}

function processInput(rawData) {
    const lines = rawData.split("\n");

    const firstLineParts = lines[0].split(" ");
    const secondLineParts = lines[1].split(" ");

    const N_VALUE_INDEX = 1;
    const K_VALUE_INDEX = 2;

    const arrayLength = parseInt(firstLineParts[N_VALUE_INDEX], 10);
    const numElementsToSum = parseInt(firstLineParts[K_VALUE_INDEX], 10);

    const sortedNumericData = prepareAndSort(secondLineParts);

    const finalCalculatedSum = computeSumOfLargest(sortedNumericData, arrayLength, numElementsToSum);

    console.log(finalCalculatedSum);
}

processInput(readStandardInput());
