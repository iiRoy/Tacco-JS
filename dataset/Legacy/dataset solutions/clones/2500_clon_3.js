function findInsertionPoint(sortedArr, lowIdx, highIdx, targetVal) {
    let currentLow = lowIdx;
    let currentHigh = highIdx;
    let midIdx;

    while (currentHigh - currentLow > 1) {
        midIdx = Math.floor((currentLow + currentHigh) / 2);
        if (sortedArr[midIdx] < targetVal) {
            currentLow = midIdx;
        } else {
            currentHigh = midIdx;
        }
    }
    return sortedArr[currentLow] < targetVal ? currentHigh : currentLow;
}

function numericComparator(valA, valB) {
    return valA - valB;
}

function processInput(inputString) {
    const inputLines = inputString.split("\n");

    const arrayLength = Number(inputLines[0]);
    const numArray = inputLines[1].split(" ").map(Number);

    let totalTriplets = 0;

    numArray.sort(numericComparator);

    const minElementsForTriplet = 3;
    const maxIdxI = arrayLength - 2;
    const maxIdxJ = arrayLength - 1;

    if (arrayLength < minElementsForTriplet) {
        console.log(0);
        return;
    }

    for (let idxI = 0; idxI < maxIdxI; ++idxI) {
        const sideA = numArray[idxI];

        for (let idxJ = idxI + 1; idxJ < maxIdxJ; ++idxJ) {
            const sideB = numArray[idxJ];

            const searchRangeStart = idxJ + 1;
            const requiredSum = sideA + sideB;

            const lastValidSideCIndex = findInsertionPoint(numArray, searchRangeStart, arrayLength, requiredSum) - 1;

            totalTriplets += (lastValidSideCIndex - idxJ);
        }
    }

    console.log(totalTriplets);
}

(function() {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin";
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");
    processInput(rawInputData);
})();
