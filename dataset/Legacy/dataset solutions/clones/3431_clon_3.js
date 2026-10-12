function checkDigitPresence(valueToExamine) {
    const digitsFoundSet = new Set();
    let temporaryValue = valueToExamine;
    while (temporaryValue > 0) {
        const currentDigit = temporaryValue % 10;
        if (currentDigit === 3 || currentDigit === 5 || currentDigit === 7) {
            digitsFoundSet.add(currentDigit);
        }
        temporaryValue = Math.floor(temporaryValue / 10);
    }
    return digitsFoundSet.has(3) && digitsFoundSet.has(5) && digitsFoundSet.has(7);
}

function calculateCount(recursionDepth, currentNumberCandidate, upperLimit) {
    if (currentNumberCandidate > upperLimit) {
        return 0;
    }

    let branchAccumulator = 0;

    if (checkDigitPresence(currentNumberCandidate)) {
        branchAccumulator = 1;
    }

    const nextDepthLevel = recursionDepth + 1;
    const powerOfTenMultiplier = Math.pow(10, recursionDepth);

    branchAccumulator += calculateCount(nextDepthLevel, powerOfTenMultiplier * 3 + currentNumberCandidate, upperLimit);
    branchAccumulator += calculateCount(nextDepthLevel, powerOfTenMultiplier * 5 + currentNumberCandidate, upperLimit);
    branchAccumulator += calculateCount(nextDepthLevel, powerOfTenMultiplier * 7 + currentNumberCandidate, upperLimit);

    return branchAccumulator;
}

function processMain(inputStringData) {
    const parsedUpperLimit = parseInt(inputStringData);
    let finalTotalCount = 0;

    finalTotalCount += calculateCount(1, 3, parsedUpperLimit);
    finalTotalCount += calculateCount(1, 5, parsedUpperLimit);
    finalTotalCount += calculateCount(1, 7, parsedUpperLimit);

    console.log(finalTotalCount);
}

processMain(require("fs").readFileSync("/dev/stdin", "utf8"));
