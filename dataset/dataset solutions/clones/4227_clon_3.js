function processInputData(rawInputString) {
    // This program calculates the minimum cumulative cost to transform all digits
    // present in a given grid to the digit '1'. It uses a shortest path algorithm
    // (Dijkstra's) to determine the cost of converting one digit to another.

    // --- Input Validation and Parsing ---

    // Ensure the input string is valid and not empty.
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: Provided input string is empty or invalid.");
        return; // Exit if input is bad
    }

    // Split the raw input into individual lines.
    const inputLines = rawInputString.split("\n");

    // Guard clause: Check for minimum required lines (1 for dimensions + 10 for cost matrix).
    const MIN_REQUIRED_LINES = 11;
    if (inputLines.length < MIN_REQUIRED_LINES) {
        console.error(`Error: Insufficient input lines. Expected at least ${MIN_REQUIRED_LINES}, got ${inputLines.length}.`);
        return;
    }

    // Parse the grid dimensions (height and width) from the first line.
    const dimensionStrings = inputLines[0].split(" ");
    const gridHeight = parseInt(dimensionStrings[0], 10);
    const gridWidth = parseInt(dimensionStrings[1], 10);

    // Validate parsed dimensions.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        console.error("Error: Invalid grid dimensions detected. Height and width must be positive integers.");
        return;
    }

    // Initialize a 10x10 matrix to store digit conversion costs.
    // `conversionCosts[fromDigit][toDigit]` holds the cost to change 'fromDigit' to 'toDigit'.
    const conversionCosts = Array.from({ length: 10 }, () => Array(10).fill(0));

    // Populate the conversion cost matrix from input lines (lines 1 to 10).
    for (let rowIdx = 0; rowIdx < 10; ++rowIdx) {
        const costLineParts = inputLines[rowIdx + 1]?.split(" "); // Use optional chaining for safety
        if (!costLineParts || costLineParts.length < 10) {
            console.error(`Error: Incomplete cost matrix row on line ${rowIdx + 1}. Expected 10 values.`);
            return;
        }
        // Convert string parts to numbers for the current cost row.
        conversionCosts[rowIdx] = costLineParts.map(Number);
    }

    // Initialize an array to count the occurrences of each digit (0-9) in the input grid.
    // `digitCounts[d]` will store how many times digit `d` appears in the grid.
    const digitCounts = Array(10).fill(0);

    // Parse the input grid data (starting from line 11) and tally digit occurrences.
    // Grid rows are expected to start from `inputLines[11]` (index 10).
    for (let rowNum = 0; rowNum < gridHeight; ++rowNum) {
        const currentGridLine = inputLines[rowNum + MIN_REQUIRED_LINES -1]; // e.g., for row 0, it's inputLines[10]
        if (!currentGridLine) {
            console.error(`Error: Missing grid data line for row ${rowNum}.`);
            return;
        }
        const cellValueStrings = currentGridLine.split(" ");

        // Validate the number of columns in the current grid row.
        if (cellValueStrings.length !== gridWidth) {
            console.error(`Error: Grid row ${rowNum} has an incorrect number of cells. Expected ${gridWidth}, got ${cellValueStrings.length}.`);
            return;
        }

        // Iterate through each cell in the current row.
        for (const cellString of cellValueStrings) {
            const currentCellDigit = parseInt(cellString, 10);
            // Count valid digits (0-9). The original code implicitly ignored -1, we do so explicitly.
            if (!isNaN(currentCellDigit) && currentCellDigit >= 0 && currentCellDigit <= 9) {
                digitCounts[currentCellDigit]++;
            } else if (!isNaN(currentCellDigit) && currentCellDigit === -1) {
                // Special value -1 represents an unmodifiable wall or empty cell, which we ignore.
            } else {
                console.warn(`Warning: Encountered an invalid or out-of-range digit '${cellString}' in grid. Skipping.`);
            }
        }
    }

    // Note: The original code contained an array 'b' derived from 'c[i][1]' which was never used.
    // This unused fragment has been removed to simplify the code and adhere to Type III requirements.

    // --- Core Logic: Calculate Total Minimum Transformation Cost ---

    let totalMinTransformationCost = 0; // Accumulator for the final answer.

    // Iterate through each possible source digit (0 to 9).
    for (let sourceDigitNode = 0; sourceDigitNode < 10; ++sourceDigitNode) {
        // We need to find the shortest path (minimum cost) to transform `sourceDigitNode` into '1'.
        // This is a single-source shortest path problem, solvable with Dijkstra's algorithm.

        // Initialize distances: `currentMinCosts[d]` stores the minimum cost found so far
        // to transform `sourceDigitNode` to digit `d`. Start with Infinity for all, 0 for source.
        const currentMinCosts = Array(10).fill(Infinity);
        currentMinCosts[sourceDigitNode] = 0;

        // Maintain a set of unvisited nodes (digits).
        const unvisitedNodes = new Set(Array.from({ length: 10 }, (_, i) => i));

        // Dijkstra's Algorithm implementation:
        while (unvisitedNodes.size > 0) {
            let visitingNode = -1;
            let smallestKnownCost = Infinity;

            // Find the unvisited node with the smallest tentative distance (cost).
            for (const nodeCandidate of unvisitedNodes) {
                if (currentMinCosts[nodeCandidate] < smallestKnownCost) {
                    smallestKnownCost = currentMinCosts[nodeCandidate];
                    visitingNode = nodeCandidate;
                }
            }

            // If no reachable unvisited node with finite cost is found, break the loop.
            if (visitingNode === -1 || smallestKnownCost === Infinity) {
                break;
            }

            // Mark the current `visitingNode` as visited.
            unvisitedNodes.delete(visitingNode);

            // Relax edges to all neighbors of the `visitingNode`.
            for (let neighborNode = 0; neighborNode < 10; ++neighborNode) {
                // Only consider neighbors that are still unvisited.
                if (unvisitedNodes.has(neighborNode)) {
                    const potentialNewCost = currentMinCosts[visitingNode] + conversionCosts[visitingNode][neighborNode];
                    // If a shorter path to the neighbor is found, update its cost.
                    if (potentialNewCost < currentMinCosts[neighborNode]) {
                        currentMinCosts[neighborNode] = potentialNewCost;
                    }
                }
            }
        }

        // After Dijkstra's completes, `currentMinCosts[1]` holds the shortest cost
        // to transform `sourceDigitNode` to '1'.
        // Accumulate this cost only if `sourceDigitNode` exists in the grid
        // and is not already '1' (as transforming '1' to '1' costs 0, which is handled by Dijkstra).
        const TARGET_DIGIT = 1;
        if (digitCounts[sourceDigitNode] > 0 && sourceDigitNode !== TARGET_DIGIT) {
            // Add the calculated minimum cost for this source digit,
            // multiplied by its total occurrences in the input grid.
            totalMinTransformationCost += currentMinCosts[TARGET_DIGIT] * digitCounts[sourceDigitNode];
        }
    }

    // --- Output ---
    console.log(totalMinTransformationCost);
}

// --- Standard Node.js Input Handling ---
// This part reads input from standard input and passes it to the main processing function.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processInputData(fileContent);
} catch (readError) {
    console.error("Failed to read input from /dev/stdin:", readError.message);
    // In a production environment, you might want to exit the process with an error code here.
    // process.exit(1);
}