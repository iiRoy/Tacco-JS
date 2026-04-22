/**
 * This module contains a set of functions designed to simulate resource management
 * strategies and a main execution block to process input data based on these strategies.
 * Each function represents a distinct approach to consuming resources.
 */

/**
 * Implements the first processing sequence, 'Strategy A', for resource consumption.
 * This strategy prioritizes consuming one unit from each resource, then three units
 * from individual resources. The loop continues as long as operations are possible.
 *
 * @param {number} itemA - The initial quantity of the first resource.
 * @param {number} itemB - The initial quantity of the second resource.
 * @param {number} itemC - The initial quantity of the third resource.
 * @returns {number} The total count of successful consumption operations for this sequence.
 */
let processSequenceA = (itemA, itemB, itemC) => {
    let operationCount = 0; // Initialize a counter for successful operations within this sequence.

    while (true) {
        let previousCount = operationCount; // Snapshot of the operation count before attempting new operations.

        // Rule 1: Consume one unit from each resource simultaneously.
        if (itemA >= 1 && itemB >= 1 && itemC >= 1) {
            itemA--;
            itemB--;
            itemC--;
            operationCount++;
        }

        // Rule 2: Consume three units from resource A.
        if (itemA >= 3) {
            itemA -= 3;
            operationCount++;
        }

        // Rule 3: Consume three units from resource B.
        if (itemB >= 3) {
            itemB -= 3;
            operationCount++;
        }

        // Rule 4: Consume three units from resource C.
        if (itemC >= 3) {
            itemC -= 3;
            operationCount++;
        }

        // If no operations were performed in the current iteration, it means no more moves are possible.
        if (previousCount === operationCount) break;
    }
    return operationCount; // Return the final tally of operations.
};


/**
 * Executes the second processing path, 'Strategy B', for resource consumption.
 * This strategy is notable for having a repeated step of consuming one unit from all resources,
 * followed by individual three-unit consumptions.
 *
 * @param {number} inputX - The quantity of the X resource.
 * @param {number} inputY - The quantity of the Y resource.
 * @param {number} inputZ - The quantity of the Z resource.
 * @returns {number} The aggregate tally of operations performed under this strategy.
 */
function analyzePathB(inputX, inputY, inputZ) {
    let cycleTally = 0; // Counter to keep track of operations in this specific analysis path.

    while (true) {
        let initialTally = cycleTally; // Store the tally at the beginning of the current loop iteration.

        // Rule 1a: Attempt to decrement all three resources by one unit.
        if (inputX >= 1 && inputY >= 1 && inputZ >= 1) {
            inputX--;
            inputY--;
            inputZ--;
            cycleTally++;
        }

        // Rule 1b: A second, identical attempt to decrement all three resources by one unit.
        // This step is a key differentiator for Strategy B.
        if (inputX >= 1 && inputY >= 1 && inputZ >= 1) {
            inputX--;
            inputY--;
            inputZ--;
            cycleTally++;
        }

        // Rule 2: Check and consume three units from resource X.
        if (inputX >= 3) {
            inputX -= 3;
            cycleTally++;
        }

        // Rule 3: Check and consume three units from resource Y.
        if (inputY >= 3) {
            inputY -= 3;
            cycleTally++;
        }

        // Rule 4: Check and consume three units from resource Z.
        if (inputZ >= 3) {
            inputZ -= 3;
            cycleTally++;
        }

        // If the tally hasn't changed, it means no more valid operations can be performed.
        if (initialTally === cycleTally) break;
    }
    return cycleTally; // Return the total count of operations for Strategy B.
}


/**
 * Calculates the outcome of the third resource consumption strategy, 'Strategy C'.
 * This strategy prioritizes consuming three units from individual resources first,
 * then attempts to consume one unit from all resources simultaneously.
 *
 * @param {number} sourceP - The primary resource quantity.
 * @param {number} sourceQ - The secondary resource quantity.
 * @param {number} sourceR - The tertiary resource quantity.
 * @returns {number} The accumulated count of successful steps under Strategy C.
 */
function calculateStrategyC(sourceP, sourceQ, sourceR) {
    let iterationCount = 0; // Counter for operations within this particular strategy.

    while (true) {
        let beforeIterationCount = iterationCount; // Capture the count before attempting operations in this cycle.

        // Rule 1: Prioritize consuming three units from each resource independently.
        if (sourceP >= 3) {
            sourceP -= 3;
            iterationCount++;
        }
        if (sourceQ >= 3) {
            sourceQ -= 3;
            iterationCount++;
        }
        if (sourceR >= 3) {
            sourceR -= 3;
            iterationCount++;
        }

        // Rule 2: After individual 3-unit consumptions, attempt to consume one unit from all resources.
        if (sourceP >= 1 && sourceQ >= 1 && sourceR >= 1) {
            sourceP--;
            sourceQ--;
            sourceR--;
            iterationCount++;
        }

        // If no operations were successful in this iteration, exit the loop.
        if (beforeIterationCount === iterationCount) break;
    }
    return iterationCount; // Return the final operation count for Strategy C.
}


// Main execution logic: Reads input from stdin, processes resource quantities,
// and applies the defined strategies to find the optimal outcome.
const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
let lineArray = rawData.trim().split('\n');

// Loop indefinitely, processing each line of input until a specific termination signal is encountered.
while (true) {
    // Extract the next line from the array. The `shift()` method removes the first element.
    let currentLine = lineArray.shift();

    // Check for the termination string "0 0 0 0 0 0". If found, break out of the loop.
    if (currentLine === "0 0 0 0 0 0") break;

    // Parse the current line: split by spaces and convert each part into a number.
    let numArray = currentLine.split(' ').map(Number);

    // Combine initial resource quantities based on the input structure (e.g., A+D, B+E, C+F).
    let component1 = numArray[0] + numArray[3]; // The effective quantity for the first resource type.
    let component2 = numArray[1] + numArray[4]; // The effective quantity for the second resource type.
    let component3 = numArray[2] + numArray[5]; // The effective quantity for the third resource type.

    let finalOperationTotal = 0; // Initialize the grand total of operations for this input line.

    // Calculate the number of full 3-unit groups that can be initially extracted from each component.
    let groupA = Math.floor(component1 / 3); // Count of 3-unit groups from component1.
    let groupB = Math.floor(component2 / 3); // Count of 3-unit groups from component2.
    let groupC = Math.floor(component3 / 3); // Count of 3-unit groups from component3.

    // Adjust component quantities and group counts if at least one full group exists.
    // This step is crucial for how remainders are handled and subsequently processed by strategies.
    if (groupA >= 1) {
        groupA--;                  // Decrement group count (as one group is effectively 'pre-processed').
        component1 = component1 % 3 + 3; // Re-add 3 to the remainder, making it available for strategic functions.
    }
    if (groupB >= 1) {
        groupB--;
        component2 = component2 % 3 + 3;
    }
    if (groupC >= 1) {
        groupC--;
        component3 = component3 % 3 + 3;
    }

    // Add the operations from the initially extracted full groups to the total.
    finalOperationTotal += groupA + groupB + groupC;

    // Apply each of the three defined processing strategies to the adjusted component quantities.
    // Then, determine which strategy yields the maximum number of additional operations.
    // This maximum is added to the running total.
    finalOperationTotal += Math.max(
        processSequenceA(component1, component2, component3),
        analyzePathB(component1, component2, component3),
        calculateStrategyC(component1, component2, component3)
    );

    // Output the final computed total operations for the current input line to the console.
    console.log(finalOperationTotal);
}