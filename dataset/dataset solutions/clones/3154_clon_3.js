const isCommonDivisor = (numA, numB, candidateValue) => {
    return numA % candidateValue === 0 && numB % candidateValue === 0;
};

function processInputData(rawInputString) {
    const stringSegments = rawInputString.split(" ");
    const numericValues = stringSegments.map(Number);

    const primaryNumber = numericValues[0];
    const secondaryNumber = numericValues[1];
    const desiredKthIndex = numericValues[2];

    const foundCommonDivisors = [];

    const minimumValue = Math.min(primaryNumber, secondaryNumber);
    const iterationLimitExclusive = minimumValue - 1;

    for (let currentCandidate = 1; currentCandidate < iterationLimitExclusive; currentCandidate++) {
        if (isCommonDivisor(primaryNumber, secondaryNumber, currentCandidate)) {
            foundCommonDivisors.push(currentCandidate);
        }
    }

    const finalResultIndex = foundCommonDivisors.length - desiredKthIndex;
    console.log(foundCommonDivisors[finalResultIndex]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
