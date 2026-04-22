const tallySetBits = (val) => {
    let count = 0;
    let tempValue = val;
    while (tempValue > 0) {
        tempValue &= (tempValue - 1);
        count++;
    }
    return count;
};

const acquisitionModule = (function() {
    function createAcquirer(dataPayload) {
        return new DataAcquirer(dataPayload);
    }

    function DataAcquirer(sourceText) {
        this.rawLines = sourceText.trim().split('\n');
        this.lineCursor = 0;
        this.tokenBufferForLine = [];
    }

    DataAcquirer.prototype.retrieveNextNumericalToken = function() {
        if (this.tokenBufferForLine.length === 0) {
            if (this.lineCursor >= this.rawLines.length) {
                throw new Error("Input exhaustion.");
            }
            this.tokenBufferForLine = this.rawLines[this.lineCursor].split(' ');
            this.lineCursor++;
        }
        return parseInt(this.tokenBufferForLine.shift(), 10);
    };

    return createAcquirer;
})();

function executePathFinding() {
    const totalDimensions = inputProcessor.retrieveNextNumericalToken();
    const originPoint = inputProcessor.retrieveNextNumericalToken();
    const destinationPoint = inputProcessor.retrieveNextNumericalToken();

    const originBitSum = tallySetBits(originPoint);
    const destinationBitSum = tallySetBits(destinationPoint);

    if ((originBitSum + destinationBitSum) % 2 !== 0) {
        console.log("NO");
        return;
    }

    const finalPathArray = new Array(1 << totalDimensions);

    const recursiveSegmentBuilder = (currentStartNode, currentEndNode, currentLockedBits, currentArrayIndexOffset) => {
        if (currentStartNode === currentEndNode) {
            finalPathArray[currentArrayIndexOffset] = currentStartNode;
            return;
        }

        const bitDifferences = currentStartNode ^ currentEndNode;
        let nextLockedBits = currentLockedBits;

        let selectedSharedBitIndex = -1;
        let selectedVariedBitIndex = -1;

        const allBitsMask = (1 << totalDimensions) - 1; 
        
        const effectiveDifferingBits = bitDifferences & (~currentLockedBits) & allBitsMask;
        const effectiveCommonBits = (~bitDifferences) & (~currentLockedBits) & allBitsMask;

        // Using bit manipulation to find the lowest set bit index (LSB)
        // This replaces the iterative loop in the original's `f` function for `u` and `v` flags.
        if (effectiveCommonBits !== 0) {
            selectedSharedBitIndex = Math.log2(effectiveCommonBits & -effectiveCommonBits);
        }
        if (effectiveDifferingBits !== 0) {
            selectedVariedBitIndex = Math.log2(effectiveDifferingBits & -effectiveDifferingBits);
        }

        let tempPathMiddleA = currentStartNode;
        let tempPathMiddleB = currentStartNode;

        // Apply bit flips based on selected dimensions, mimicking original `u` and `v` logic
        if (selectedSharedBitIndex !== -1) {
            const sharedBitModifier = 1 << selectedSharedBitIndex;
            tempPathMiddleA ^= sharedBitModifier;
            tempPathMiddleB ^= sharedBitModifier;
        }
        if (selectedVariedBitIndex !== -1) {
            const variedBitModifier = 1 << selectedVariedBitIndex;
            tempPathMiddleB ^= variedBitModifier;
            nextLockedBits |= variedBitModifier;
        }

        const countOfLockedBits = tallySetBits(nextLockedBits);
        const subdivisionOffset = (1 << (totalDimensions - countOfLockedBits - 1));

        recursiveSegmentBuilder(currentStartNode, tempPathMiddleA, nextLockedBits, currentArrayIndexOffset);
        recursiveSegmentBuilder(tempPathMiddleB, currentEndNode, nextLockedBits, currentArrayIndexOffset + subdivisionOffset);
    };

    console.log("YES");
    recursiveSegmentBuilder(originPoint, destinationPoint, 0, 0);
    console.log(finalPathArray.join(" "));
}

const inputProcessor = acquisitionModule(require("fs").readFileSync("/dev/stdin", "utf8"));
executePathFinding();