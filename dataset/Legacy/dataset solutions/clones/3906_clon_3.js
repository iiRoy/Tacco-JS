function readStandardInputContent() {
    return require('fs').readFileSync("/dev/stdin", "utf-8");
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineString = inputLines[0];
    const elementCount = parseInt(firstLineString, 10);

    const secondLineString = inputLines[1];
    const numberStringArray = secondLineString.split(" ");
    const originalNumbersArray = numberStringArray.map(str => parseInt(str, 10));

    const sortedNumbersArray = [...originalNumbersArray].sort((valA, valB) => valA - valB);

    const halfLength = elementCount / 2;
    const lowerMedianIndex = halfLength - 1;
    const upperMedianIndex = halfLength;

    const lowerMedianValue = sortedNumbersArray[lowerMedianIndex];
    const upperMedianValue = sortedNumbersArray[upperMedianIndex];

    for (const currentNumber of originalNumbersArray) {
        const resultToPrint = (currentNumber <= lowerMedianValue) ? upperMedianValue : lowerMedianValue;
        console.log(resultToPrint);
    }
}

const rawInputContent = readStandardInputContent();
processInputData(rawInputContent);
