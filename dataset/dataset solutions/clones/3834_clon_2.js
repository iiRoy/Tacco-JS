// This section simulates input reading for environments like Node.js
// where 'readline' might not be globally available or requires specific setup.
// In a competitive programming context, 'readline' functions are often provided.
const inputLines = [
    "5 3",
    "1 2 3 4 5",
    "1 2",
    "3 4",
    "2 5"
];
let currentLineIndex = 0;

/**
 * Reads a single line from the simulated input.
 * @returns {string|null} The next line of input, or null if no more lines.
 */
function getLine() {
    if (currentLineIndex < inputLines.length) {
        return inputLines[currentLineIndex++];
    }
    return null;
}

/**
 * Reads all remaining lines from the simulated input.
 * @returns {string[]} An array of remaining input lines.
 */
function getAllLines() {
    const remainingLines = inputLines.slice(currentLineIndex);
    currentLineIndex = inputLines.length;
    return remainingLines;
}

// --- Start of Type II Clone ---

// Obtain the total number of nodes and the count of connections from the initial input line.
let [numNodes, numEdges] = getLine().trim().split(' ').map(Number);

// Retrieve the array of desired values for each node from the subsequent input line.
let targetValues = getLine().trim().split(' ').map(Number);

// Parse all following input lines, each representing a connection between two nodes.
let inputPairs = getAllLines().map(line => line.trim().split(' ').map(Number));

// Initialize an array to store the connectivity groups (sets) for each node.
// Each node is initially considered its own distinct group.
let collections = new Array(numNodes + 1).fill(null);
for (let k = 1; k <= numNodes; k++) {
    collections[k] = new Set([k]);
}

// Iterate through each specified connection to merge node groups.
// This process effectively builds connected components using a union-find-like approach.
inputPairs.forEach(([firstVal, secondVal]) => {
    // Create a new set by combining all elements from the groups of the two connected nodes.
    let combinedSet = new Set([...collections[firstVal], ...collections[secondVal]]);

    // Update all nodes that are part of this newly formed combined group
    // to reference this single, unified set object.
    combinedSet.forEach(idx => {
        collections[idx] = combinedSet;
    });
});

// Prepare an array to store the final assessment results for each node.
let finalOutcomes = new Array(numNodes + 1).fill(null);

// Evaluate each node to determine if its target value is present within its connected component.
for (let k = 1; k <= numNodes; k++) {
    // This conditional check is structurally preserved from the original code,
    // though in this specific loop, 'finalOutcomes[k]' will always be 'null'
    // on the first encounter of 'k'.
    if (finalOutcomes[k] !== null) {
        continue;
    }

    // Assign 1 if the target value for the current node is found in its group, otherwise 0.
    finalOutcomes[k] = collections[k].has(targetValues[k - 1]) ? 1 : 0;
}

// Explicitly set the value at index 0 to 0, as it's typically unused in 1-indexed problems.
finalOutcomes[0] = 0;

// Compute and display the total sum of all successful matches.
console.log(finalOutcomes.reduce((accumulator, currentValue) => accumulator + currentValue, 0));

// --- End of Type II Clone ---
