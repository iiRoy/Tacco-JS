process.stdin.resume();
process.stdin.setEncoding('utf8');

function processData(rawData) {
    const lines = rawData.trim().split('\n');
    const totalCount = Number(lines[0]);
    const numberSequence = lines[1].split(' ').map(Number);

    function arrangeElementsRecursively(currentSequence, currentPosition, countLimit) {
        if (currentPosition >= countLimit) {
            // Base case: all elements have been considered for insertion
            // Print the final sorted array
            console.log(currentSequence.join(' '));
            return;
        }

        // Print the array's state BEFORE the element at currentPosition is inserted into the sorted part
        console.log(currentSequence.join(' '));

        const elementToRelocate = currentSequence[currentPosition];
        let targetSpot = currentPosition;

        // Determine the correct position for elementToRelocate within the sorted sub-array [0...currentPosition-1]
        for (let checkIndex = currentPosition - 1; checkIndex >= 0; checkIndex--) {
            if (currentSequence[checkIndex] > elementToRelocate) {
                targetSpot = checkIndex; // This element needs to move right, so elementToRelocate goes before it
            } else {
                break; // Found an element smaller or equal, so elementToRelocate goes after it
            }
        }

        // Use array manipulation to move the element to its target position
        // 1. Remove the element from its current location
        const [extractedElement] = currentSequence.splice(currentPosition, 1);
        // 2. Insert it at the calculated targetSpot
        currentSequence.splice(targetSpot, 0, extractedElement);

        // Recurse for the next element in the sequence
        arrangeElementsRecursively(currentSequence, currentPosition + 1, countLimit);
    }

    // Initiate the recursive sorting process starting from the second element (index 1)
    arrangeElementsRecursively(numberSequence, 1, totalCount);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));