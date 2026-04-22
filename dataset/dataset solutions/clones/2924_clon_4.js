function processInputString(textBlob) {
    const lineContent = textBlob.trim().split('\n');
    let currentLinePointer = 0;

    const retrieveNextNumber = () => {
        const value = parseInt(lineContent[currentLinePointer].split(' ')[0], 10);
        currentLinePointer++;
        return value;
    };

    const retrieveNumberList = () => {
        const list = lineContent[currentLinePointer].split(' ').map(Number);
        currentLinePointer++;
        return list;
    };

    return { retrieveNextNumber, retrieveNumberList };
}

const dataSupplier = processInputString(require("fs").readFileSync("/dev/stdin","utf8"));

function computeOptimalPairSum() {
    const arraySize = dataSupplier.retrieveNextNumber();
    const valueArray = dataSupplier.retrieveNumberList();

    const halfSize = arraySize >>> 1; // Integer division by 2, equivalent to n >> 1

    // Generate possible stride values [1, 2, ..., halfSize - 1]
    const possibleStrides = Array.from({ length: halfSize - 1 }, (_, idx) => idx + 1);

    // Map each stride to its maximum sum, then find the overall maximum
    const finalResult = possibleStrides.map(currentStride => {
        let currentStrideSum = 0;
        const visitedIndicesForStride = new Set();
        let hasHalted = false; // Flag to simulate the 'break' in the original inner loop

        // Generate potential starting 'j' values for this stride
        // Start from currentStride, increment by currentStride, up to arraySize - 2
        const potentialOffsets = [];
        for (let currentOffset = currentStride; currentOffset <= arraySize - 2; currentOffset += currentStride) {
            potentialOffsets.push(currentOffset);
        }

        // Process the offsets for the current stride
        for (const offset of potentialOffsets) {
            if (hasHalted) break; // If a halt condition was met in a previous iteration for this stride, stop

            const symmetricOffset = arraySize - offset - 1;

            // Check break conditions:
            // 1. If 'offset' or its 'symmetricOffset' has already been visited in this stride.
            // 2. If 'offset' is the middle element (i.e., offset === symmetricOffset).
            if (visitedIndicesForStride.has(offset) || visitedIndicesForStride.has(symmetricOffset) || offset === symmetricOffset) {
                hasHalted = true; // Set flag to halt further processing for this stride
                break; // Exit the current for...of loop
            }

            // Add values from the pair to the current sum for this stride
            currentStrideSum += valueArray[offset] + valueArray[symmetricOffset];

            // Mark indices as visited for the current stride
            visitedIndicesForStride.add(offset);
            visitedIndicesForStride.add(symmetricOffset);
        }
        return currentStrideSum; // Return the accumulated sum for this stride (up to the point of halt or completion)
    }).reduce((max, current) => Math.max(max, current), 0); // Find the overall maximum among all stride sums

    return finalResult;
}

console.log(computeOptimalPairSum());