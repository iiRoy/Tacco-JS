var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = fileContent.trim().split("\n");

const TERMINATION_SIGNAL = "0 0 0 0 0";

function calculateMinCost(valA, valB, valC, valD, valE, numA, numB, numC) {
    let totalCostOption1;
    let totalCostOption2;

    // --- Calculation for Option 1 ---
    // This option considers the remainder (numC % valD) separately with valC
    // and the full blocks (Math.floor(numC / valD) * valD) with valE.
    const remainder = numC % valD;
    const fullBlocksCount = Math.floor(numC / valD);
    const costFromFullBlocks = fullBlocksCount * valD * valE; // Equivalent to (numC - remainder) * valE
    const costFromRemainder = remainder * valC;

    totalCostOption1 = numA * valA + numB * valB + costFromFullBlocks + costFromRemainder;

    // --- Calculation for Option 2 ---
    // This option either uses valE for all numC items if numC >= valD,
    // or adjusts numA and numB to make up for a deficit to reach valD.
    if (numC >= valD) {
        // If numC is sufficient, simply use valE for all numC items.
        totalCostOption2 = numA * valA + numB * valB + numC * valE;
    } else {
        // If numC is less than valD, we need to "borrow" items from numA and numB
        // to reach the minimum quantity valD, then apply valE.
        let currentNumA = numA; // Use temporary variables to avoid modifying original parameters
        let currentNumB = numB;

        // The number of items needed to reach valD
        const itemsToAdjust = valD - numC; // Since numC < valD, remainder is numC. So valD - remainder is valD - numC.

        let adjustmentCounter = itemsToAdjust;

        // Prioritize adjusting currentNumB first
        if (currentNumB >= adjustmentCounter) {
            currentNumB -= adjustmentCounter;
            adjustmentCounter = 0; // All adjustments handled by currentNumB
        } else {
            // currentNumB is not enough, use all of it and reduce adjustmentCounter
            adjustmentCounter -= currentNumB;
            currentNumB = 0;
        }

        // If adjustments are still needed, apply them to currentNumA
        if (adjustmentCounter > 0) {
            currentNumA = Math.max(0, currentNumA - adjustmentCounter); // Ensure currentNumA doesn't go below zero
        }

        // Calculate cost with adjusted numA, numB, and valD items at valE
        totalCostOption2 = currentNumA * valA + currentNumB * valB + valD * valE;
    }

    return Math.min(totalCostOption1, totalCostOption2);
}

while (true) {
    var firstSegment = lineSegments.shift();

    if (firstSegment === TERMINATION_SIGNAL) {
        break;
    }

    var secondSegment = lineSegments.shift();
    var combinedSegments = firstSegment + " " + secondSegment;
    var stringValues = combinedSegments.split(" ");
    var numericValues = stringValues.map(Number);

    // Destructure the array into individual parameters for improved readability
    const [valA, valB, valC, valD, valE, numA, numB, numC] = numericValues;

    const result = calculateMinCost(valA, valB, valC, valD, valE, numA, numB, numC);
    console.log(result);
}
