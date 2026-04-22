"use strict";

// Define constants for bill denominations to improve readability and maintainability.
const YEN_10000_BILL_VALUE = 10000;
const YEN_5000_BILL_VALUE = 5000;
const YEN_1000_BILL_VALUE = 1000;

/**
 * Processes financial data to determine if a target sum can be achieved
 * with a specified total number of bills, using specific denominations.
 *
 * @param {string} rawInputString - The raw input string, typically from stdin,
 *                                  containing the total bill count and the target amount
 *                                  on the first line, separated by a space.
 */
const calculateBillCombination = (rawInputString) => {
    // Prepare the input: trim whitespace and split into lines.
    const inputLines = rawInputString.trim().split("\n");

    // Extract the parameters from the first line of input.
    const [totalBillCountStr, targetAmountStr] = inputLines[0].split(" ");

    // Convert string parameters to numbers. Using Number() for explicit conversion.
    const requiredTotalBills = Number(totalBillCountStr);
    const desiredTargetAmount = Number(targetAmountStr);

    // --- Type III: Input Validation and Early Exit Conditions ---

    // Validate if parsed numbers are valid and non-negative.
    if (
        isNaN(requiredTotalBills) || isNaN(desiredTargetAmount) ||
        requiredTotalBills < 0 || desiredTargetAmount < 0
    ) {
        console.log("-1 -1 -1"); // Invalid input format or values.
        return;
    }

    // Quick check: All bill denominations are multiples of 1000.
    // If the target amount is not a multiple of 1000, no solution is possible.
    if (desiredTargetAmount % YEN_1000_BILL_VALUE !== 0) {
        console.log("-1 -1 -1");
        return;
    }

    // Define variables to store the counts of each bill type if a solution is found.
    let countOfTenThousands = -1;
    let countOfFiveThousands = -1;
    let countOfOneThousands = -1;
    let wasSolutionDiscovered = false; // Flag to track if a valid combination is found.

    // --- Type III: Optimized Loop Structure ---
    // The original triple nested loop iterated up to N for each variable.
    // This optimized approach calculates the third variable directly, reducing complexity.

    // Iterate through possible counts for 10,000 yen bills (let's call this 'x').
    // The count 'x' cannot exceed the total allowed bills, nor can its value exceed the target amount.
    for (let x = 0; x <= requiredTotalBills; ++x) {
        // If the value accumulated from 10,000 yen bills alone exceeds the target,
        // further increments of 'x' will also exceed it, so we can break early.
        if (x * YEN_10000_BILL_VALUE > desiredTargetAmount) {
            break;
        }

        // Calculate the remaining amount and remaining bill slots after accounting for 'x' 10k bills.
        const remainingAmountAfterX = desiredTargetAmount - (x * YEN_10000_BILL_VALUE);
        const remainingBillSlotsAfterX = requiredTotalBills - x;

        // Iterate through possible counts for 5,000 yen bills (let's call this 'y').
        // 'y' cannot exceed the remaining bill slots, nor can its value exceed the remaining amount.
        for (let y = 0; y <= remainingBillSlotsAfterX; ++y) {
            // Similar early break condition for 'y'.
            if (y * YEN_5000_BILL_VALUE > remainingAmountAfterX) {
                break;
            }

            // Calculate the remaining amount and remaining bill slots after accounting for 'y' 5k bills.
            const remainingAmountAfterY = remainingAmountAfterX - (y * YEN_5000_BILL_VALUE);
            const remainingBillSlotsAfterY = remainingBillSlotsAfterX - y;

            // --- Type III: Direct Calculation of the Third Variable ---
            // At this point, the number of 1,000 yen bills (let's call this 'z')
            // must satisfy two conditions simultaneously:
            // 1. Its total value must equal `remainingAmountAfterY`.
            // 2. Its total count must equal `remainingBillSlotsAfterY`.

            // Check if the remaining amount is perfectly divisible by 1000.
            if (remainingAmountAfterY % YEN_1000_BILL_VALUE === 0) {
                const potentialZ = remainingAmountAfterY / YEN_1000_BILL_VALUE;

                // If the calculated count 'potentialZ' is non-negative AND
                // it exactly fills the remaining bill slots, we've found a solution.
                if (potentialZ >= 0 && potentialZ === remainingBillSlotsAfterY) {
                    countOfTenThousands = x;
                    countOfFiveThousands = y;
                    countOfOneThousands = potentialZ;
                    wasSolutionDiscovered = true;
                    break; // Exit the inner 'y' loop, as a solution is found.
                }
            }
        }

        if (wasSolutionDiscovered) {
            break; // Exit the outer 'x' loop if a solution was found in the inner loop.
        }
    }

    // Output the result based on whether a solution was found.
    if (wasSolutionDiscovered) {
        console.log(`${countOfTenThousands} ${countOfFiveThousands} ${countOfOneThousands}`);
    } else {
        // If no combination was found after exhaustive search.
        const NO_SOLUTION_VALUE = -1;
        console.log(`${NO_SOLUTION_VALUE} ${NO_SOLUTION_VALUE} ${NO_SOLUTION_VALUE}`);
    }
};

// --- Type III: Encapsulate input reading and execution ---
/**
 * Main execution function to read input from standard input and
 * pass it to the bill combination calculation logic.
 */
const entryPoint = () => {
    // Using 'fs' module to read synchronous input from '/dev/stdin'.
    const fileSystemModule = require('fs');
    const standardInputPath = '/dev/stdin';
    const utf8Encoding = 'utf8';

    const inputDataContent = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
    calculateBillCombination(inputDataContent);
};

// Initiate the program execution.
entryPoint();