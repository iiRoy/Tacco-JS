const DataStreamHandler = (function() {
    class DataInputSource {
        #sourceTextLines;
        #currentLinePointer;
        #currentLineTokenStack;

        constructor(rawInputContent) {
            this.#sourceTextLines = rawInputContent.trim().split('\n');
            this.#currentLinePointer = 0;
            this.#currentLineTokenStack = [];
        }

        #refillTokenStack() {
            while (this.#currentLineTokenStack.length === 0 && this.#currentLinePointer < this.#sourceTextLines.length) {
                const activeLine = this.#sourceTextLines[this.#currentLinePointer];
                const tokens = activeLine.split(' ');
                for (let i = tokens.length - 1; i >= 0; i--) {
                    this.#currentLineTokenStack.push(tokens[i]);
                }
                this.#currentLinePointer++;
            }
            if (this.#currentLineTokenStack.length === 0) {
                throw new Error("Input exhaustion: No more tokens available for single value extraction.");
            }
        }

        obtainSingleValue(returnAsString = false) {
            this.#refillTokenStack();
            const extractedToken = this.#currentLineTokenStack.pop();
            return returnAsString ? extractedToken : Number(extractedToken);
        }

        retrieveLineItems(returnAsStrings = false) {
            if (this.#currentLinePointer >= this.#sourceTextLines.length) {
                throw new Error("Input exhaustion: No more lines available for full line retrieval.");
            }
            this.#currentLineTokenStack = [];
            const lineContent = this.#sourceTextLines[this.#currentLinePointer++];
            const parts = lineContent.split(' ');
            return returnAsStrings ? parts : parts.map(Number);
        }

        extractMatrixRows(rowCount, returnAsStrings = false) {
            const collectedRows = [];
            for (let i = 0; i < rowCount; i++) {
                collectedRows.push(this.retrieveLineItems(returnAsStrings));
            }
            return collectedRows;
        }

        fetchIndividualLines(itemCount, returnAsStrings = false) {
            const collectedItems = [];
            for (let i = 0; i < itemCount; i++) {
                if (this.#currentLinePointer >= this.#sourceTextLines.length) {
                    throw new Error("Input exhaustion: No more lines available for individual line item retrieval.");
                }
                const lineValue = this.#sourceTextLines[this.#currentLinePointer++];
                collectedItems.push(returnAsStrings ? lineValue.trim() : Number(lineValue.trim()));
            }
            return collectedItems;
        }
    }
    return function(initialContent) {
        return new DataInputSource(initialContent);
    };
})();

const inputReader = DataStreamHandler(require("fs").readFileSync("/dev/stdin","utf8"));

const computeSolution = () => {
    const totalPathExtent = inputReader.obtainSingleValue();
    const segmentCapacity = inputReader.obtainSingleValue();
    const pathLayout = inputReader.obtainSingleValue(true);

    const zeroMarkedPositions = Array.from({length: totalPathExtent}, (_, position) => position)
                                  .filter(position => pathLayout[position] === '0')
                                  .reverse();

    const determineOptimalJumps = (currentBoundary, remainingZeroPoints, maximumReach, collectedJumps) => {
        if (remainingZeroPoints.length === 0) {
            return collectedJumps;
        }

        const immediateTarget = remainingZeroPoints[0];

        if (currentBoundary - immediateTarget > maximumReach) {
            return null;
        }

        let bestTargetIndex = 0;
        while (bestTargetIndex + 1 < remainingZeroPoints.length &&
               currentBoundary - remainingZeroPoints[bestTargetIndex + 1] <= maximumReach) {
            bestTargetIndex++;
        }

        const chosenLandingPoint = remainingZeroPoints[bestTargetIndex];
        const currentJumpDistance = currentBoundary - chosenLandingPoint;

        const subsequentZeroPoints = remainingZeroPoints.slice(bestTargetIndex + 1);
        const resultSequence = determineOptimalJumps(chosenLandingPoint, subsequentZeroPoints, maximumReach, collectedJumps.concat(currentJumpDistance));

        return resultSequence;
    };

    const finalJumpSequence = determineOptimalJumps(totalPathExtent, zeroMarkedPositions, segmentCapacity, []);

    if (finalJumpSequence === null) {
        return -1;
    } else {
        return finalJumpSequence.reverse().join(' ');
    }
};

console.log(computeSolution());