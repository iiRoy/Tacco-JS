function findMaxAfterRemoval(sourceArray, removalIndex) {
    let workingArray = sourceArray.slice();
    workingArray.splice(removalIndex, 1);
    workingArray.sort((valA, valB) => valB - valA);
    return workingArray[0];
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const itemCount = parseInt(inputLines[0], 10);

    const originalNumbers = [];
    for (let idx = 0; idx < itemCount; idx++) {
        const currentNumber = parseInt(inputLines[idx + 1], 10);
        originalNumbers.push(currentNumber);
    }

    for (let idx = 0; idx < itemCount; idx++) {
        const maximumValue = findMaxAfterRemoval(originalNumbers, idx);
        console.log(maximumValue);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
