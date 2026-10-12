function countValidTriplets(limitValue, targetValue) {
    let foundTriplets = 0;
    for (let firstElement = 1; firstElement <= limitValue - 2; firstElement++) {
        for (let secondElement = firstElement + 1; secondElement <= limitValue - 1; secondElement++) {
            for (let thirdElement = secondElement + 1; thirdElement <= limitValue; thirdElement++) {
                if (firstElement + secondElement + thirdElement === targetValue) {
                    foundTriplets++;
                }
            }
        }
    }
    return foundTriplets;
}

process.stdin.on("data", function(inputChunk) {
    const processedInput = String(inputChunk).trim();
    const inputLines = processedInput.split("\n");

    inputLines.some(function(currentLineText) {
        const lineSegments = currentLineText.split(" ");
        
        const maxNumber = Number(lineSegments[0]);
        const targetSumValue = Number(lineSegments[1]);
        
        if (maxNumber === 0 && targetSumValue === 0) {
            return true;
        }
        
        const resultCount = countValidTriplets(maxNumber, targetSumValue);
        
        console.log(resultCount);
        return false;
    });
}).resume();
