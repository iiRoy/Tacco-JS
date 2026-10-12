let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Helper for managing the infinite loop counter
const createLoopGuard = (maxIterations = 1e5) => {
    let counter = 0;
    return () => {
        counter++;
        if (counter >= maxIterations) {
            throw new Error("Infinite loop");
        }
    };
};

// Helper for parsing input data
const createInputParser = (inputString) => {
    let tokens = inputString.split(/[\s\n]/);

    // Inner helper for type conversion
    const convertValueToType = (value, targetType) => targetType !== String ? targetType(value) : value;

    return (rows = 1, cols = 1, type = Number) => {
        const totalElements = rows * cols;
        let extractedValues = tokens.splice(0, totalElements).map(val => convertValueToType(val, type));

        if (cols > 1) {
            // Refactor: Use Array.from for column-wise restructuring
            extractedValues = Array.from({ length: cols }, (_, colIndex) =>
                Array.from({ length: rows }, (_, rowIndex) =>
                    extractedValues[rowIndex * cols + colIndex]
                )
            );
        }
        return extractedValues;
    };
};

// Helper for formatting the final output based on path tracking
const formatPathResult = (pathTrackerArray) => {
    // Check for unvisited nodes from index 2 onwards
    const relevantNodes = pathTrackerArray.slice(2);
    const unvisitedExists = relevantNodes.some(node => node === 0);
    
    if (unvisitedExists) {
        return 'No';
    }
    console.log('Yes'); // This console.log is part of the required behavior
    return relevantNodes.join('\n');
};

// The main graph processing logic, refactored from original `main`
function processGraph({ parseInputDataFn, loopGuardCallback }) {
    const [nodeCount, edgeCount] = parseInputDataFn(2);
    const [edgeStarts, edgeEnds] = parseInputDataFn(edgeCount, 2);
    
    // Initialize parent tracking array. Node 0 and 1 are special.
    // Using Array.from for initialization for Type III.
    const parentTracker = Array.from({ length: nodeCount + 1 }, () => 0);
    parentTracker[0] = -1; // Sentinel for non-existent node
    parentTracker[1] = -1; // Node 1 is the starting point, has no parent in this context

    const bfsQueue = [1]; // Start BFS from node 1

    // Inner helper function for processing a single edge within the BFS loop
    const handleEdgeTraversal = (idx, currentVertex, currentParentTracker, currentBfsQueue) => {
        let potentialNeighbor = null;
        let connectionSource = null; // Represents the parent for the neighbor

        // Determine if the current edge connects to currentVertex
        if (edgeStarts[idx] === currentVertex) {
            potentialNeighbor = edgeEnds[idx];
            connectionSource = edgeStarts[idx];
        } else if (edgeEnds[idx] === currentVertex) {
            potentialNeighbor = edgeStarts[idx];
            connectionSource = edgeEnds[idx];
        }
        
        // If a neighbor was found and it hasn't been visited yet (parentTracker[neighbor] is 0)
        if (potentialNeighbor !== null && currentParentTracker[potentialNeighbor] === 0) {
            currentParentTracker[potentialNeighbor] = connectionSource; // Set parent
            currentBfsQueue.push(potentialNeighbor); // Add to queue for further traversal
        }
    };

    while(bfsQueue.length > 0) {
        loopGuardCallback(); // Call the provided loop guard function

        const currentVertex = bfsQueue.shift();
        for(let i = 0; i < edgeCount; i++) {
            handleEdgeTraversal(i, currentVertex, parentTracker, bfsQueue); // Use the inner helper
        }
    }

    return formatPathResult(parentTracker); // Use the helper for final output formatting
}

// --- Application Entry Point (IIFE for scope management) ---
(() => {
    // Instantiate necessary utilities
    const loopGuard = createLoopGuard();
    const parseInput = createInputParser(rawData);

    const finalResult = processGraph({
        parseInputDataFn: parseInput,
        loopGuardCallback: loopGuard,
    });

    if (finalResult === undefined) {
        console.warn("result is undefined");
    } else {
        console.log(finalResult);
    }
})();

// --- Unused Utility Functions (kept global as in original) ---

// Function for calculating sum (not used by main logic)
function calculateSum(numbers) {
    return numbers.reduce((acc, cur) => acc + cur, 0);
}

// Function for formatting boolean to 'Yes'/'No' (not used by main logic)
function formatBoolean(value) {
    return value ? 'Yes' : 'No';
}

// Function for logging JSON (not used by main logic)
function outputJson(value) {
    console.log(JSON.stringify(value));
}

// Function for finding maximum value (not used by main logic)
function findMax(numbers, initialValue = null) {
    let currentMax = (initialValue === null) ? numbers[0] : initialValue;
    for(const num of numbers) if(num > currentMax) currentMax = num;
    return currentMax;
}

// Function for finding minimum value (not used by main logic)
function findMin(numbers, initialValue = null) {
    let currentMin = (initialValue === null) ? numbers[0] : initialValue;
    for(const num of numbers) if(num < currentMin) currentMin = num;
    return currentMin;
}

// Prime factorization { prime: exponent } (not used by main logic)
function getPrimeFactors(num) {
    const factors = {};
    for(let i = 2; i * i <= num; i++) {
        if(num % i === 0) {
            num /= i;
            factors[i] = 1;
            while(num % i === 0) {
                num /= i;
                factors[i]++;
            }
        }
    }
    if(num > 1) factors[num] = 1;
    return factors;
}
