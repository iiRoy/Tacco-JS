const nodeFs = require('fs');

const rawInputContent = nodeFs.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputContent.trim().split('\n').filter(line => line.length > 0);

// The first line indicates the total count of elements, but it's not
// directly utilized in subsequent logic after parsing the main array.
processedInputLines.shift(); // Consumes the 'n' value.

const initialNumberSequence = processedInputLines.shift().split(' ').map(Number);

const sortedReferenceSequence = initialNumberSequence.slice().sort((valX, valY) => valX - valY);

const totalExplicitSwaps = parseInt(processedInputLines.shift(), 10);

const swapInstructionPairs = processedInputLines.map(line =>
    line.split(' ').map(indexStr => parseInt(indexStr, 10) - 1)
);

// Introduce a preliminary "no-op" swap at index [0, 0]. This facilitates checking
// the initial state of the sequence as 'operation 0' within the main loop.
swapInstructionPairs.unshift([0, 0]);

const currentDisplacedElements = new Map();
const expectedDisplacedElements = new Map();

for (let idx = 0; idx < initialNumberSequence.length; idx++) {
    if (initialNumberSequence[idx] !== sortedReferenceSequence[idx]) {
        currentDisplacedElements.set(idx, initialNumberSequence[idx]);
        expectedDisplacedElements.set(idx, sortedReferenceSequence[idx]);
    }
}

// Early exit condition: If the initial sequence is already perfectly sorted,
// there are no displaced elements, so output 0 (meaning 0 operations needed).
if (currentDisplacedElements.size === 0) {
    console.log(0);
    return;
}

// Generate a canonical string representation of the target (fully sorted) state.
// This is done by extracting values from `expectedDisplacedElements`, sorting them
// (to ensure consistent order for comparison), and then joining them with commas.
const canonicalTargetStateString = Array.from(expectedDisplacedElements.values())
                                        .sort((vA, vB) => vA - vB)
                                        .join(',');

let targetStateReached = false;
let completionOperationIndex = -1;

/**
 * Helper function to simulate a swap operation on a Map that tracks displaced elements.
 * This function ensures that only truly displaced elements (i.e., those with a non-undefined value)
 * remain in the map. If an element becomes sorted (effectively takes an undefined value),
 * it is removed from the map.
 *
 * @param {Map<number, number>} dataMap - The Map containing index-value pairs of displaced elements.
 * @param {number} indexA - The first index involved in the swap.
 * @param {number} indexB - The second index involved in the swap.
 */
function applyDisplacedValueSwap(dataMap, indexA, indexB) {
    // Retrieve the values currently associated with indexA and indexB.
    // If an index is not in the map, `get()` returns `undefined`,
    // signifying that the element at that position is currently sorted.
    const valueAtA = dataMap.get(indexA);
    const valueAtB = dataMap.get(indexB);

    // Update the state for indexA: it now receives the value from indexB.
    if (valueAtB !== undefined) {
        dataMap.set(indexA, valueAtB);
    } else {
        dataMap.delete(indexA);
    }

    // Update the state for indexB: it now receives the original value from indexA.
    if (valueAtA !== undefined) {
        dataMap.set(indexB, valueAtA);
    } else {
        dataMap.delete(indexB);
    }
}

// Iterate through each operation, starting from the initial state (index 0) up to
// and including all explicit swap operations.
for (let opCounter = 0; opCounter <= totalExplicitSwaps; opCounter++) {
    const [swapIndex1, swapIndex2] = swapInstructionPairs[opCounter];

    applyDisplacedValueSwap(currentDisplacedElements, swapIndex1, swapIndex2);

    // Check if the current state represents a fully sorted array (no displaced elements).
    if (currentDisplacedElements.size === 0) {
        targetStateReached = true;
        completionOperationIndex = opCounter;
        break;
    }

    // If not fully sorted, generate a canonical string representation of the current
    // displaced elements for comparison with the target state.
    const currentDisplacedStateString = Array.from(currentDisplacedElements.values())
                                              .sort((vX, vY) => vX - vY)
                                              .join(',');

    // Compare the current state string with the canonical target state string.
    if (currentDisplacedStateString === canonicalTargetStateString) {
        targetStateReached = true;
        completionOperationIndex = opCounter;
        break;
    }
}

// Output the result based on whether the target state was reached.
if (targetStateReached) {
    console.log(completionOperationIndex);
} else {
    console.log(-1);
}