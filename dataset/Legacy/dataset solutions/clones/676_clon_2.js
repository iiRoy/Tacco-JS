// This file contains a set of functions designed to calculate various counts
// based on input numerical values, followed by a main processing loop.

/**
 * Calculates a count based on a specific strategy for combining items.
 * It prioritizes forming groups of one of each item, then groups of three of individual items.
 * @param {number} valX - The initial quantity of item X.
 * @param {number} valY - The initial quantity of item Y.
 * @param {number} valZ - The initial quantity of item Z.
 * @returns {number} The total count achieved by this strategy.
 */
function processStageOne(valX, valY, valZ) {
    let totalCount = 0; // Initialize the counter for this stage's operations.

    // Loop indefinitely until no more operations can be performed.
    while (true) {
        const previousCount = totalCount; // Store the count before attempting any new combinations.

        // Attempt to form a group consisting of one of each item.
        if (valX >= 1 && valY >= 1 && valZ >= 1) {
            valX--; // Decrement item X.
            valY--; // Decrement item Y.
            valZ--; // Decrement item Z.
            totalCount++; // Increment the total count for forming this group.
        }

        // Attempt to form a group of three item X's.
        if (valX >= 3) {
            valX -= 3; // Decrement item X by three.
            totalCount++; // Increment the total count.
        }

        // Attempt to form a group of three item Y's.
        if (valY >= 3) {
            valY -= 3; // Decrement item Y by three.
            totalCount++; // Increment the total count.
        }

        // Attempt to form a group of three item Z's.
        if (valZ >= 3) {
            valZ -= 3; // Decrement item Z by three.
            totalCount++; // Increment the total count.
        }

        // If no new groups were formed in this iteration, break the loop.
        if (previousCount === totalCount) {
            break;
        }
    }
    return totalCount; // Return the final accumulated count for this strategy.
}

/**
 * Calculates a count using a slightly different strategy, including a duplicate check for one-of-each.
 * @param {number} valX - The initial quantity of item X.
 * @param {number} valY - The initial quantity of item Y.
 * @param {number} valZ - The initial quantity of item Z.
 * @returns {number} The total count achieved by this strategy.
 */
function processStageTwo(valX, valY, valZ) {
    let totalCount = 0; // Initialize the counter.

    // Use an infinite loop construct.
    for (;;) {
        const previousCount = totalCount; // Capture the count before this iteration's processing.

        // First attempt to form a group of one of each item.
        if (valX >= 1 && valY >= 1 && valZ >= 1) {
            valX--;
            valY--;
            valZ--;
            totalCount++;
        }

        // Second, identical attempt to form a group of one of each item.
        // This is a characteristic of the original algorithm.
        if (valX >= 1 && valY >= 1 && valZ >= 1) {
            valX--;
            valY--;
            valZ--;
            totalCount++;
        }

        // Attempt to form a group of three item X's.
        if (valX >= 3) {
            valX -= 3;
            totalCount++;
        }

        // Attempt to form a group of three item Y's.
        if (valY >= 3) {
            valY -= 3;
            totalCount++;
        }

        // Attempt to form a group of three item Z's.
        if (valZ >= 3) {
            valZ -= 3;
            totalCount++;
        }

        // If no count was added in this pass, it means no more combinations are possible.
        if (previousCount === totalCount) {
            break;
        }
    }
    return totalCount; // Return the final count.
}

/**
 * Calculates a count using a third distinct strategy, prioritizing groups of three.
 * @param {number} valX - The initial quantity of item X.
 * @param {number} valY - The initial quantity of item Y.
 * @param {number} valZ - The initial quantity of item Z.
 * @returns {number} The total count achieved by this strategy.
 */
function processStageThree(valX, valY, valZ) {
    let totalCount = 0; // Initialize the count for this strategy.

    // Loop until no further operations can be performed.
    while (true) {
        const previousCount = totalCount; // Record the count at the start of the iteration.

        // Prioritize forming groups of three for item X.
        if (valX >= 3) {
            valX -= 3;
            totalCount++;
        }

        // Prioritize forming groups of three for item Y.
        if (valY >= 3) {
            valY -= 3;
            totalCount++;
        }

        // Prioritize forming groups of three for item Z.
        if (valZ >= 3) {
            valZ -= 3;
            totalCount++;
        }

        // After checking for groups of three, attempt to form a group of one of each item.
        if (valX >= 1 && valY >= 1 && valZ >= 1) {
            valX--;
            valY--;
            valZ--;
            totalCount++;
        }

        // If the count did not change, exit the loop.
        if (previousCount === totalCount) {
            break;
        }
    }
    return totalCount; // Return the final count for this strategy.
}

// Main program execution begins here.
// It reads input from stdin, processes it line by line, and outputs results.

// Read the entire standard input as a string, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
let lineBuffer = rawData.trim().split("\n");

// Process each line from the input buffer.
while (true) {
    // Retrieve the next line from the beginning of the array.
    const currentLine = lineBuffer.shift();

    // Check for the specific termination string "0 0 0 0 0 0".
    if (currentLine === "0 0 0 0 0 0") {
        break; // Exit the processing loop if the termination string is found.
    }

    // Split the current line by spaces and convert each part to a number.
    const parsedValues = currentLine.split(" ").map(Number);

    // Combine specific elements from the parsed input to form initial quantities.
    let valX = parsedValues[0] + parsedValues[3];
    let valY = parsedValues[1] + parsedValues[4];
    let valZ = parsedValues[2] + parsedValues[5];

    let totalCount = 0; // Initialize the overall count for the current input set.

    // Calculate the number of full groups of three for each item.
    // Math.floor is used for integer division.
    let groupX = Math.floor(valX / 3);
    let groupY = Math.floor(valY / 3);
    let groupZ = Math.floor(valZ / 3);

    // Adjust remaining quantities if a group of three was formed.
    // This logic effectively "borrows" from the remainder to ensure a group of 3 is counted,
    // then adds 3 back to the remainder for subsequent processing.
    if (groupX >= 1) {
        groupX--; // Decrement the group count as it's being "re-evaluated"
        valX = (valX % 3) + 3; // Update valX to its remainder plus 3
    }
    if (groupY >= 1) {
        groupY--; // Decrement the group count
        valY = (valY % 3) + 3; // Update valY to its remainder plus 3
    }
    if (groupZ >= 1) {
        groupZ--; // Decrement the group count
        valZ = (valZ % 3) + 3; // Update valZ to its remainder plus 3
    }

    // Add the initially calculated groups of three to the total count.
    totalCount += groupX + groupY + groupZ;

    // Determine the maximum additional count achievable from the remaining items
    // by trying all three defined processing strategies.
    const maxAdditionalCount = Math.max(
        processStageOne(valX, valY, valZ),
        processStageTwo(valX, valY, valZ),
        processStageThree(valX, valY, valZ)
    );

    // Add this maximum additional count to the overall total.
    totalCount += maxAdditionalCount;

    // Print the final calculated total count for the current input line.
    console.log(totalCount);
}
