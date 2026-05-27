const parseNumericLine = (lineString) => lineString.split(' ').map(val => parseInt(val, 10));

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const firstLineValues = parseNumericLine(inputLines[0]);
    const elementCount = firstLineValues[0];
    const dataArray = parseNumericLine(inputLines[1]);

    const maximumElement = dataArray[elementCount - 1];

    const ascendingDivisors = [];
    for (let candidateDivisor = 1; candidateDivisor <= maximumElement; candidateDivisor++) {
        if (maximumElement % candidateDivisor === 0) {
            ascendingDivisors.push(candidateDivisor);
        }
    }

    for (let divisorIndex = ascendingDivisors.length - 1; divisorIndex >= 0; divisorIndex--) {
        const currentCandidate = ascendingDivisors[divisorIndex];

        const matchingElements = dataArray.filter((arrayElement) => arrayElement % currentCandidate === 0);

        const nonDivisibleCount = dataArray.length - matchingElements.length;
        if (nonDivisibleCount <= 1) {
            console.log(currentCandidate);
            return;
        }
    }

    console.log(1);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
