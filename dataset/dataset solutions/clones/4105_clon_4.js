'use strict'
function monetaryPuzzle(inputData) {
    const parts = inputData.split(' ').map(Number);
    const totalItems = parts[0];
    const targetAmount = parts[1];

    // The problem can be expressed as:
    // x + y + z = totalItems
    // 10000x + 5000y + 1000z = targetAmount
    // where x, y, z are counts of 10000, 5000, and 1000 yen bills respectively.

    // Substitute y = totalItems - x - z into the second equation:
    // 10000x + 5000(totalItems - x - z) + 1000z = targetAmount
    // 10000x + 5000*totalItems - 5000x - 5000z + 1000z = targetAmount
    // 5000x - 4000z + 5000*totalItems = targetAmount
    // 5000x - 4000z = targetAmount - 5000*totalItems

    // Let 'grandBillsCount' be 'x' (10000 yen bills)
    // Let 'smallBillsCount' be 'z' (1000 yen bills)
    // We iterate 'grandBillsCount' and derive 'smallBillsCount'.
    const transformedTarget = targetAmount - (5000 * totalItems);

    for (let grandBillsCount = 0; grandBillsCount <= totalItems; grandBillsCount++) {
        // From the derived equation: 4000 * smallBillsCount = 5000 * grandBillsCount - transformedTarget
        const numeratorForSmall = (5000 * grandBillsCount) - transformedTarget;

        // Check if smallBillsCount is an integer and non-negative
        if (numeratorForSmall % 4000 === 0) {
            const smallBillsCount = numeratorForSmall / 4000;

            if (smallBillsCount >= 0) {
                // Now calculate 'mediumBillsCount' (5000 yen bills) using the total items constraint
                const mediumBillsCount = totalItems - grandBillsCount - smallBillsCount;

                // Check if mediumBillsCount is also non-negative
                if (mediumBillsCount >= 0) {
                    // We found a valid combination that satisfies both bill count and total value
                    console.log(grandBillsCount, mediumBillsCount, smallBillsCount);
                    return; // Exit after finding the first solution
                }
            }
        }
    }

    // If no solution is found after checking all possibilities
    console.log(-1, -1, -1);
}

monetaryPuzzle(require('fs').readFileSync(0, 'utf8'));