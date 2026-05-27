const fs = require('fs');
const inputContent = fs.readFileSync('/dev/stdin', 'utf8');
const dataLines = inputContent.trim().split('\n');

let currentLinePointer = 0;

function computeOptimalCost(
    coeffA, coeffB, coeffC, coeffD, coeffE,
    initialQuantityNA, initialQuantityNB, initialQuantityNC
) {
    let calculationResult1, calculationResult2;

    // First calculation path (equivalent to original A)
    const currentRemainder = initialQuantityNC % coeffD;
    calculationResult1 =
        initialQuantityNA * coeffA +
        initialQuantityNB * coeffB +
        Math.floor(initialQuantityNC / coeffD) * coeffD * coeffE +
        currentRemainder * coeffC;

    // Second calculation path (equivalent to original B)
    if (initialQuantityNC >= coeffD) {
        calculationResult2 =
            initialQuantityNA * coeffA +
            initialQuantityNB * coeffB +
            initialQuantityNC * coeffE;
    } else {
        // Divergent implementation for the 'else' branch
        // Original: imperative loop to decrement quantities (while(husoku--))
        // New: declarative calculation using Math.max to determine adjusted quantities
        const requiredAdjustment = coeffD - initialQuantityNC;

        const adjustedQuantityNB = Math.max(0, initialQuantityNB - requiredAdjustment);
        const remainingAdjustmentForNA = Math.max(0, requiredAdjustment - initialQuantityNB);
        const adjustedQuantityNA = Math.max(0, initialQuantityNA - remainingAdjustmentForNA);

        calculationResult2 =
            adjustedQuantityNA * coeffA +
            adjustedQuantityNB * coeffB +
            coeffD * coeffE;
    }

    console.log(Math.min(calculationResult1, calculationResult2));
}

while (true) {
    const firstPartString = dataLines[currentLinePointer++];
    if (firstPartString === '0 0 0 0 0') {
        break;
    }
    const secondPartString = dataLines[currentLinePointer++];

    const combinedNumericInputs = (firstPartString + ' ' + secondPartString)
        .split(' ')
        .map(Number);

    computeOptimalCost(...combinedNumericInputs);
}
