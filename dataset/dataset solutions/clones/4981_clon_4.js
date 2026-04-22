function numericCombiner(sourceDigits) {
    const sequenceLength = sourceDigits.length;

    if (sequenceLength === 0) {
        return 0;
    }

    let grandTotal = 0;

    const numSeparators = sequenceLength - 1;
    const totalVariations = 1 << numSeparators;

    for (let currentVariation = 0; currentVariation < totalVariations; currentVariation++) {
        let currentExpressionValue = 0;
        let currentNumberSegment = "";

        currentNumberSegment += sourceDigits[0];

        for (let k = 0; k < numSeparators; k++) {
            if ((currentVariation >> k) & 1) {
                currentExpressionValue += parseInt(currentNumberSegment, 10);
                currentNumberSegment = "";
            }
            currentNumberSegment += sourceDigits[k + 1];
        }

        currentExpressionValue += parseInt(currentNumberSegment, 10);
        grandTotal += currentExpressionValue;
    }

    console.log(grandTotal);
}

function processInputData(incomingData) {
    numericCombiner(incomingData);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));