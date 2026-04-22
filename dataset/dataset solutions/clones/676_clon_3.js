function calculateStrategyOne(initialPileA, initialPileB, initialPileC) {
    // Make copies of the initial pile counts to avoid modifying the original inputs
    let currentA = initialPileA;
    let currentB = initialPileB;
    let currentC = initialPileC;

    // Initialize the counter for successful operations
    let totalOperations = 0;

    // Loop indefinitely until no more operations can be performed in an iteration
    for (;;) {
        // Store the operation count from the beginning of this iteration
        const operationsBeforeAttempt = totalOperations;

        // Attempt to perform a (1,1,1) move: take one item from each pile
        if (currentA >= 1 && currentB >= 1 && currentC >= 1) {
            currentA--;
            currentB--;
            currentC--;
            totalOperations++; // Increment count for this successful move
        }

        // Attempt to perform (3,0,0) move: take three items from pile A
        if (currentA >= 3) {
            currentA -= 3;
            totalOperations++;
        }

        // Attempt to perform (0,3,0) move: take three items from pile B
        if (currentB >= 3) {
            currentB -= 3;
            totalOperations++;
        }

        // Attempt to perform (0,0,3) move: take three items from pile C
        if (currentC >= 3) {
            currentC -= 3;
            totalOperations++;
        }

        // If no operations were performed in this iteration, break the loop
        if (operationsBeforeAttempt === totalOperations) {
            break;
        }
    }
    // Return the total number of operations for this strategy
    return totalOperations;
}

// Function to determine maximum operations using strategy two
// This strategy places a higher emphasis on taking one from each pile,
// attempting it twice before considering individual pile threes.
function calculateStrategyTwo(initialPileA, initialPileB, initialPileC) {
    // Input validation: ensure non-negative piles (though context implies this)
    if (initialPileA < 0 || initialPileB < 0 || initialPileC < 0) {
        console.error("Negative pile counts detected in strategy two. Adjusting to zero.");
        initialPileA = Math.max(0, initialPileA);
        initialPileB = Math.max(0, initialPileB);
        initialPileC = Math.max(0, initialPileC);
    }

    let currentA = initialPileA;
    let currentB = initialPileB;
    let currentC = initialPileC;
    let totalOps = 0; // Renamed from totalOperations for variety

    // Continue processing until no progress is made in an iteration
    while (true) {
        const opsAtStart = totalOps; // Renamed from operationsBeforeAttempt

        // First attempt to take one from each pile
        if (currentA >= 1 && currentB >= 1 && currentC >= 1) {
            currentA -= 1;
            currentB -= 1;
            currentC -= 1;
            totalOps++;
        }

        // Second attempt to take one from each pile (this is the key difference from strategy one)
        if (currentA >= 1 && currentB >= 1 && currentC >= 1) {
            currentA -= 1;
            currentB -= 1;
            currentC -= 1;
            totalOps++;
        }

        // Check for groups of three in each pile
        if (currentA >= 3) {
            currentA -= 3;
            totalOps++;
        }
        if (currentB >= 3) {
            currentB -= 3;
            totalOps++;
        }
        if (currentC >= 3) {
            currentC -= 3;
            totalOps++;
        }

        // If no operations occurred, terminate the loop
        if (opsAtStart === totalOps) {
            break;
        }
    }
    return totalOps;
}

// Function to compute maximum operations using strategy three
// This strategy prioritizes taking groups of three from individual piles first,
// then considers taking one from each pile.
function calculateStrategyThree(initialPileA, initialPileB, initialPileC) {
    let currentA = initialPileA;
    let currentB = initialPileB;
    let currentC = initialPileC;
    let operationCounter = 0; // Renamed from totalOps

    // Use a do-while loop for structural variation, ensuring at least one pass
    do {
        const preIterationCount = operationCounter; // Renamed from opsAtStart

        // Prioritize taking three from individual piles
        if (currentA >= 3) {
            currentA -= 3;
            operationCounter++;
        }
        if (currentB >= 3) {
            currentB -= 3;
            operationCounter++;
        }
        if (currentC >= 3) {
            currentC -= 3;
            operationCounter++;
        }

        // Then, attempt to take one from each pile
        if (currentA >= 1 && currentB >= 1 && currentC >= 1) {
            currentA -= 1;
            currentB -= 1;
            currentC -= 1;
            operationCounter++;
        }

        // If no operations were performed in this pass, exit the loop
        if (preIterationCount === operationCounter) {
            break;
        }
    } while (true); // Loop continues indefinitely until an explicit break

    return operationCounter;
}

// --- Main Program Execution ---

// Helper function to safely read file content
const readInputData = (filePath) => {
    try {
        // Using 'fs' module to read synchronous file content
        const fileContent = require('fs').readFileSync(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error(`Error reading input file at ${filePath}:`, error.message);
        // Return an empty string or rethrow, depending on desired error handling
        return "";
    }
};

// Main processing logic encapsulated in an anonymous function for scope
(() => {
    // Define the path for standard input
    const standardInputPath = '/dev/stdin';
    // Read raw data from the specified input path
    const rawData = readInputData(standardInputPath);

    // Split the raw data into individual lines, trimming whitespace and filtering out empty lines
    const inputLines = rawData.trim().split("\n").filter(line => line.length > 0);

    let lineIndex = 0; // Use an index to iterate through lines

    // Process each line of input until a termination condition is met
    while (lineIndex < inputLines.length) {
        const currentLine = inputLines[lineIndex++]; // Get current line and advance index

        // Check for the termination signal "0 0 0 0 0 0"
        if (currentLine === "0 0 0 0 0 0") {
            break;
        }

        // Parse the numerical values from the current line
        // Ensure that conversion to Number handles potential non-numeric inputs gracefully
        const parsedValues = currentLine.split(" ").map(val => {
            const num = Number(val);
            if (isNaN(num)) {
                console.warn(`Non-numeric value "${val}" encountered. Defaulting to 0.`);
                return 0;
            }
            return num;
        });

        // Basic validation for the number of expected values (6 in this case)
        if (parsedValues.length !== 6) {
            console.error(`Incorrect number of values on line: "${currentLine}". Expected 6, got ${parsedValues.length}. Skipping.`);
            continue; // Skip to the next line if parsing failed
        }

        // Combine the input values into three main piles (a, b, c)
        // Original: var a=ary[0]+ary[3]; var b=ary[1]+ary[4]; var c=ary[2]+ary[5];
        // Rewritten for clarity and using 'let'
        let pileA = parsedValues[0] + parsedValues[3];
        let pileB = parsedValues[1] + parsedValues[4];
        let pileC = parsedValues[2] + parsedValues[5];

        let finalOperationCount = 0;

        // Calculate initial groups of three that can be taken directly
        // using Math.floor for integer division, equivalent to (x - (x % 3)) / 3
        let initialThreesA = Math.floor(pileA / 3);
        let initialThreesB = Math.floor(pileB / 3);
        let initialThreesC = Math.floor(pileC / 3);

        // This crucial step adjusts the piles for the subsequent strategy functions.
        // If a pile has at least one group of three available (initialThreesX >= 1),
        // we "defer" taking that group for now. Instead, we decrement the initialThreesX
        // count (meaning it's not taken by this initial grouping) and adjust the
        // pile value to its remainder plus 3. This ensures that the pile still
        // contains at least 3 items for the strategy functions to consider taking
        // as a group of 3, or as individual items.
        // Example: if pileA was 5, initialThreesA is 1. After this, initialThreesA becomes 0,
        // and pileA becomes (5 % 3) + 3 = 2 + 3 = 5. The 5 is still available for strategies.
        // Example: if pileA was 6, initialThreesA is 2. After this, initialThreesA becomes 1,
        // and pileA becomes (6 % 3) + 3 = 0 + 3 = 3. One group of 3 is taken by initialThreesA,
        // and the remaining 3 is available for strategies.
        if (initialThreesA >= 1) {
            initialThreesA--;
            pileA = (pileA % 3) + 3;
        }
        if (initialThreesB >= 1) {
            initialThreesB--;
            pileB = (pileB % 3) + 3;
        }
        if (initialThreesC >= 1) {
            initialThreesC--;
            pileC = (pileC % 3) + 3;
        }

        // Accumulate the count from the initial "guaranteed" groups of three
        finalOperationCount += initialThreesA + initialThreesB + initialThreesC;

        // Determine the maximum operations achievable by applying the three different strategies
        // to the *adjusted* pile counts.
        const strategyResults = [
            calculateStrategyOne(pileA, pileB, pileC),
            calculateStrategyTwo(pileA, pileB, pileC),
            calculateStrategyThree(pileA, pileB, pileC)
        ];

        // Add the maximum result from the strategies to the final operation count
        finalOperationCount += Math.max(...strategyResults);

        // Output the computed total
        console.log(finalOperationCount);
    }
})(); // Immediately Invoked Function Expression (IIFE)