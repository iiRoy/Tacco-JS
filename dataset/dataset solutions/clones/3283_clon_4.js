const documentContent = require("fs").readFileSync("/dev/stdin", "utf8");

const parsedLines = documentContent.trim().split('\n').map(segment => segment.split(' ').map(Number));

const [elementCount] = parsedLines[0];
const [lowerBoundary, upperBoundary] = parsedLines[1];
const numericalValues = parsedLines[2];

const categorizedTally = numericalValues.reduce((acc, currentVal) => {
    if (currentVal <= lowerBoundary) {
        acc.groupOne++;
    } else if (currentVal <= upperBoundary) {
        acc.groupTwo++;
    } else {
        acc.groupThree++;
    }
    return acc;
}, { groupOne: 0, groupTwo: 0, groupThree: 0 });

console.log(Math.min(categorizedTally.groupOne, categorizedTally.groupTwo, categorizedTally.groupThree));