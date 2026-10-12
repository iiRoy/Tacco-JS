function calculateSumStringLength(firstNumberString, secondNumberString) {
    const parsedFirstNumber = Number(firstNumberString);
    const parsedSecondNumber = Number(secondNumberString);
    const computedTotal = parsedFirstNumber + parsedSecondNumber;
    const totalAsString = computedTotal.toString();
    return totalAsString.length;
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    for (const currentLineContent of inputLines) {
        const lineSegments = currentLineContent.split(" ");
        const resultLength = calculateSumStringLength(lineSegments[0], lineSegments[1]);
        console.log(resultLength);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
