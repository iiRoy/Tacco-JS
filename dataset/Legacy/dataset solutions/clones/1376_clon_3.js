function readInputData() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent.split(/\n\r?/);
}

function countUniqueTriplets(maxVal, desiredSum) {
    let currentCount = 0;
    for (let valA = 1; valA <= maxVal; valA++) {
        for (let valB = valA + 1; valB <= maxVal; valB++) {
            for (let valC = valB + 1; valC <= maxVal; valC++) {
                const currentTripletSum = valA + valB + valC;
                if (currentTripletSum === desiredSum) {
                    currentCount++;
                }
            }
        }
    }
    return currentCount;
}

function processSingleInputLine(currentLine) {
    const lineSegments = currentLine.split(' ');
    const upperLimit = +lineSegments[0];
    const targetSum = +lineSegments[1];

    if (upperLimit === 0 && targetSum === 0) {
        return false;
    }

    const numberOfMatches = countUniqueTriplets(upperLimit, targetSum);

    return !console.log(numberOfMatches);
}

readInputData().every(processSingleInputLine);
