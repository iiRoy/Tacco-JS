(function() {
    const rawTextualInput = require("node:fs").readFileSync("/dev/stdin", "utf-8");
    let currentSegment = "";
    const collectedValues = [];
    const separatorSymbol = ' ';
    const baseRadix = 10;

    for (let charPointer = 0; charPointer < rawTextualInput.length; charPointer++) {
        const currentCharacter = rawTextualInput[charPointer];

        if (currentCharacter === separatorSymbol) {
            if (currentSegment.length > 0) {
                collectedValues.push(Number(currentSegment));
                currentSegment = "";
            }
        } else {
            currentSegment += currentCharacter;
        }
    }

    if (currentSegment.length > 0) {
        collectedValues.push(Number(currentSegment));
    }

    const firstOperand = collectedValues[0];
    const secondOperand = collectedValues[1];

    const finalCalculationResult = firstOperand + secondOperand;

    console.log(finalCalculationResult);
})();