const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLineBuffer = rawInputData.trim().split("\n");

/**
 * Processes a set of eight numeric parameters to calculate and log the minimum of two cost options.
 * @param {number} pA - Parameter A
 * @param {number} pB - Parameter B
 * @param {number} pC - Parameter C
 * @param {number} pD - Parameter D
 * @param {number} pE - Parameter E
 * @param {number} nA - Number of item A
 * @param {number} nB - Number of item B
 * @param {number} nC - Number of item C
 */
function processParameterSet(pA, pB, pC, pD, pE, nA, nB, nC) {
    // Calculate the base cost based on full units of C and their cost E
    const initialBaseCost = Math.floor(nC / pD) * pD * pE;
    const remainingUnitsC = nC % pD;

    /**
     * Calculates cost option A.
     * @param {number} currentBase - The initial base cost.
     * @param {number} remUnits - Remaining units of C.
     * @param {number} unitCostC - Cost per unit of C.
     * @param {number} countA - Number of item A.
     * @param {number} costA - Cost per item A.
     * @param {number} countB - Number of item B.
     * @param {number} costB - Cost per item B.
     * @returns {number} The total cost for option A.
     */
    function calculateOptionACost(currentBase, remUnits, unitCostC, countA, costA, countB, costB) {
        let totalCostA = currentBase;
        totalCostA += remUnits * unitCostC;
        const additionalCostFromItems = countA * costA + countB * costB;
        totalCostA += additionalCostFromItems;
        return totalCostA;
    }

    /**
     * Calculates cost option B.
     * This function handles two distinct calculation paths based on the initial base cost.
     * @param {number} initialVal - The initial base cost (Math.floor(nC / pD) * pD * pE).
     * @param {number} remUnits - Remaining units of C.
     * @param {number} unitDivisorD - Divisor D.
     * @param {number} unitCostE - Cost per unit E.
     * @param {number} countA - Number of item A (original).
     * @param {number} costA - Cost per item A.
     * @param {number} countB - Number of item B (original).
     * @param {number} costB - Cost per item B.
     * @param {number} countC - Number of item C (original).
     * @returns {number} The total cost for option B.
     */
    function calculateOptionBCost(initialVal, remUnits, unitDivisorD, unitCostE, countA, costA, countB, costB, countC) {
        if (initialVal === 0) {
            let currentCountA = countA; // Local mutable copy
            let currentCountB = countB; // Local mutable copy
            let costBResult = initialVal;

            const deficitUnits = (remUnits === 0) ? 0 : unitDivisorD - remUnits;
            
            if (deficitUnits > 0) {
                costBResult += unitCostE * unitDivisorD;
            }

            let unitsToAdjust = deficitUnits;
            while (unitsToAdjust > 0) {
                if (currentCountB > 0) {
                    currentCountB--;
                } else if (currentCountA > 0) {
                    currentCountA--;
                }
                unitsToAdjust--;
            }
            costBResult += currentCountA * costA + currentCountB * costB;
            return costBResult;
        } else {
            // This path is taken when initialVal is not 0.
            // It calculates a direct sum of costs for all items using their original counts.
            return countA * costA + countB * costB + countC * unitCostE;
        }
    }

    const costOptionA = calculateOptionACost(initialBaseCost, remainingUnitsC, pC, nA, pA, nB, pB);
    const costOptionB = calculateOptionBCost(initialBaseCost, remainingUnitsC, pD, pE, nA, pA, nB, pB, nC);

    console.log(Math.min(costOptionA, costOptionB));
}

// Main processing loop
while (true) {
    const currentInputLineSegment = inputLineBuffer.shift();
    if (currentInputLineSegment === "0 0 0 0 0") {
        break;
    }

    const nextInputLineSegment = inputLineBuffer.shift();
    const combinedParameterString = currentInputLineSegment + " " + nextInputLineSegment;
    const numericParameters = combinedParameterString.split(" ").map(Number);

    // Call the main processing function with the parsed parameters
    processParameterSet(...numericParameters);
}
