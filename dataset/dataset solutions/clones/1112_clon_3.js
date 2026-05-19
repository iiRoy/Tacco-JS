const fileSystemModule = require('fs');

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const trimmedInputContent = rawInputData.trim();
const allKeysArray = trimmedInputContent.split(/[ |\n]/).slice(1);

const formattedNodeStrings = allKeysArray.map((currentKey, zeroBasedIndex, keysCollection) => {
    // The original code uses a pre-increment operator (++i) which makes the index 1-based
    // for all subsequent calculations and display within the map iteration.
    const nodeNumberOneBased = zeroBasedIndex + 1;

    let nodeOutputFragment = `node ${nodeNumberOneBased}: key = ${currentKey}, `;

    // Logic for determining and appending parent key information
    const isNotRootNode = zeroBasedIndex > 0;
    if (isNotRootNode) {
        // Parent's 1-based index is Math.floor(current_node_1_based_index / 2)
        // Parent's 0-based index is (parent_1_based_index - 1)
        const parentOneBasedIndex = Math.floor(nodeNumberOneBased / 2);
        const parentZeroBasedIndex = parentOneBasedIndex - 1;
        nodeOutputFragment += `parent key = ${keysCollection[parentZeroBasedIndex]}, `;
    }

    // Logic for determining and appending left child key information
    // Left child's 1-based index is (2 * current_node_1_based_index)
    const potentialLeftChildOneBasedIndex = 2 * nodeNumberOneBased;
    const hasLeftChild = potentialLeftChildOneBasedIndex <= keysCollection.length;
    if (hasLeftChild) {
        // Left child's 0-based index is (left_child_1_based_index - 1)
        const leftChildZeroBasedIndex = potentialLeftChildOneBasedIndex - 1;
        nodeOutputFragment += `left key = ${keysCollection[leftChildZeroBasedIndex]}, `;
    }

    // Logic for determining and appending right child key information
    // Right child's 0-based index is (2 * current_node_1_based_index)
    const potentialRightChildZeroBasedIndex = 2 * nodeNumberOneBased;
    const hasRightChild = potentialRightChildZeroBasedIndex < keysCollection.length;
    if (hasRightChild) {
        nodeOutputFragment += `right key = ${keysCollection[potentialRightChildZeroBasedIndex]}, `;
    }

    return nodeOutputFragment;
});

console.log(formattedNodeStrings.join('\n'));
