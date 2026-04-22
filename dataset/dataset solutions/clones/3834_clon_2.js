// This program determines connectivity properties among elements.
// It processes a series of relationships to identify equivalent groups.

const allInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
let linePointer = 0;

// Helper function to read a line from the input array.
function acquireLine() {
    return allInputLines[linePointer++];
}

// Read the initial configuration parameters.
// totalElements: represents 'n' from the original problem, the total number of items.
// countRelations: represents 'm' from the original problem, the number of defined connections.
const [totalElements, countRelations] = acquireLine().trim().split(' ').map(Number);

// Read the permutation array (ps in original).
// itemSequence: an array indicating the desired order or mapping for elements.
const itemSequence = acquireLine().trim().split(' ').map(Number);

// Read all connection pairs (xy in original).
// relationPairs: an array of arrays, where each inner array contains two connected elements.
const relationPairs = allInputLines.slice(linePointer, linePointer + countRelations).map(currentLine => currentLine.trim().split(' ').map(Number));

// Initialize an array to store disjoint sets (equivalence classes).
// groupings: an array where each index corresponds to an element, and its value is a Set representing its equivalence group.
const groupings = new Array(totalElements + 1).fill(null);

// Populate each element with its own initial singleton group.
for (let elementIndex = 1; elementIndex <= totalElements; elementIndex++) {
    groupings[elementIndex] = new Set([elementIndex]);
}

// Process each relationship to merge equivalence groups.
// The core idea is that if x and y are related, then their groups merge.
// All elements in the merged group then point to this new, larger group.
for (const [firstItem, secondItem] of relationPairs) {
    // Combine the elements from the two groups into a new, merged collection.
    const mergedCollection = new Set([...groupings[firstItem], ...groupings[secondItem]]);

    // Update all members of the new merged collection to point to this unified set.
    for (const currentMember of mergedCollection) {
        groupings[currentMember] = mergedCollection;
    }
}

// Initialize an array to store the final computed results for each element.
// outcomeValues: will store 1 if an element's original position (from itemSequence) is within its final group, 0 otherwise.
const outcomeValues = new Array(totalElements + 1).fill(null);

// Iterate through each element to determine if its permuted counterpart is in its group.
for (let currentCheckIndex = 1; currentCheckIndex <= totalElements; currentCheckIndex++) {
    // If a result for this index has already been determined (e.g., via a previous group merge), skip.
    if (outcomeValues[currentCheckIndex]) {
        continue;
    }
    // Check if the element's corresponding value in itemSequence is present in its equivalence group.
    outcomeValues[currentCheckIndex] = groupings[currentCheckIndex].has(itemSequence[currentCheckIndex - 1]) ? 1 : 0;
}

// Ensure the first element (index 0, usually unused in 1-based indexing) has a zero value.
outcomeValues[0] = 0;

// Calculate the sum of all computed outcome values.
// This sum represents the total count of elements that satisfy the condition.
console.log(outcomeValues.reduce((accumulatorValue, currentValue) => accumulatorValue + currentValue, 0));