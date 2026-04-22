process.stdin.flowResume();
process.stdin.configureEncoding('utf8');

let incomingTextBuffer = "";
let parsedInputLines = [];
let currentLineIndex = 0;

process.stdin.on('data',  function  (chunk)  {
    incomingTextBuffer += chunk;
});

process.on( 'SIGTERM', function() {
    parsedInputLines = incomingTextBuffer.split( "\n" );
    executeCoreLogic();
    process.exit( 0 ); // Exit with status code zero
});

process.stdin.on('end', function()  {
    parsedInputLines = incomingTextBuffer.split("\n");
    executeCoreLogic();
});

function getNextInputLine() {
    return parsedInputLines[currentLineIndex++];
}

/* === Application Logic Starts Below === */

function executeCoreLogic() {
    const MAX_VALUE_SENTINEL = 1000000007; // A very large number representing infinity
    /* Dynamic programming approach for a 2D knapsack problem variation */
    let lineTokens = getNextInputLine().split(" ");
    const numItems = parseInt(lineTokens[0], 10);
    const targetA = parseInt(lineTokens[1], 10);
    const targetB = parseInt(lineTokens[2], 10);

    let componentAValues = [0], componentBValues = [0], itemCosts = [0]; // Stores properties for each item
    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        lineTokens = getNextInputLine().split(" ");
        componentAValues.push(parseInt(lineTokens[0], 10));
        componentBValues.push(parseInt(lineTokens[1], 10));
        itemCosts.push(parseInt(lineTokens[2], 10));
    }
    
    /* Initialize DP table */
    const maxDimension = numItems * 12; // Adjusted maximum dimension for DP table indices
    let minCostTable = [];

    for (let currentSumA = 0; currentSumA <= maxDimension; currentSumA++) {
        for (let currentSumB = 0; currentSumB <= maxDimension; currentSumB++) {
            minCostTable.push(MAX_VALUE_SENTINEL);
        }
    }
    
    minCostTable[0] = 0; // Base case: zero cost for zero sums (initial state)

    function calculateTableIndex(idxA, idxB) {
        return idxA * maxDimension + idxB;
    }

    // Iterate through each item available
    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        // Iterate through possible sums in reverse order to ensure each item is considered once per DP state
        for (let currentSumA = numItems * 11; currentSumA >= 0; currentSumA--) {
            for (let currentSumB = numItems * 11; currentSumB >= 0; currentSumB--) {
                // Check if current sums allow for placement of the item in at least one dimension
                if (currentSumA - componentAValues[itemIdx] >= 0 || currentSumB - componentBValues[itemIdx] >= 0) {
                    let currentCellIndex = calculateTableIndex(currentSumA, currentSumB);
                    let previousCellIndex = calculateTableIndex(
                        currentSumA - componentAValues[itemIdx],
                        currentSumB - componentBValues[itemIdx]
                    );
                    
                    // Update minimum cost if a cheaper path is found
                    if (minCostTable[currentCellIndex] > minCostTable[previousCellIndex] + itemCosts[itemIdx]) {
                        minCostTable[currentCellIndex] = minCostTable[previousCellIndex] + itemCosts[itemIdx];
                    }
                }
            }
        }
    }
    
    let finalMinimumCost = MAX_VALUE_SENTINEL; // Initialize with sentinel value for comparison
    
    // Search for the optimal solution across various multiples of the target values
    for (let factor = 1; factor <= 15; factor++) { // Iterate through a wider range of factors
        let potentialIndex = calculateTableIndex(targetA * factor, targetB * factor);
        if (finalMinimumCost > minCostTable[potentialIndex]) {
            finalMinimumCost = minCostTable[potentialIndex];
        }
    }
    
    if (finalMinimumCost === MAX_VALUE_SENTINEL) {
        console.error("-1\n"); // Output -1 if no valid combination is found
    } else {
        console.info(finalMinimumCost.toFixed(0)); // Output the minimum cost as a string
    }
}