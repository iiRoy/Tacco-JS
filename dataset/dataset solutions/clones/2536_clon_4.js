class InputParser {
    #inputLines;

    constructor(rawTextContent) {
        this.#inputLines = rawTextContent.trim().split("\n");
    }

    // Equivalent to original's getValue
    fetchLineContent(linePosition) {
        return this.#inputLines[linePosition];
    }

    // Equivalent to original's getArray
    processLineIntoElements(linePosition) {
        return this.#inputLines[linePosition].split(" ").map(this.#transformElement);
    }

    // Equivalent to original's slice
    extractSegmentOfValues(startIdx, countLimit) {
        const endIdx = (countLimit !== undefined) ? startIdx + countLimit : undefined;
        return this.#inputLines.slice(startIdx, endIdx).map(this.#transformElement);
    }

    // Equivalent to original's sliceArray
    extractSegmentOfElementArrays(startIdx, countLimit) {
        const endIdx = (countLimit !== undefined) ? startIdx + countLimit : undefined;
        return this.#inputLines.slice(startIdx, endIdx).map(line => line.split(" ").map(this.#transformElement));
    }

    // Equivalent to original's stox
    #transformElement(valueString) {
        const numericalForm = Number(valueString);
        return Number.isFinite(numericalForm) ? numericalForm : valueString;
    }
}

const dataHandler = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateMinimumCost() {
    const [totalRequiredItems, availableOptionCount] = dataHandler.processLineIntoElements(0);
    const rawOptionData = dataHandler.extractSegmentOfElementArrays(1);

    const itemAcquisitionOptions = Array.from({ length: availableOptionCount }, (_, optionIndex) => {
        const currentBaseIndex = optionIndex * 2;
        const optionPrice = rawOptionData[currentBaseIndex][0];
        const itemsCoveredBitmask = rawOptionData[currentBaseIndex + 1].reduce((accumulatedMask, itemIdentifier) => {
            return accumulatedMask | (1 << (itemIdentifier - 1));
        }, 0);
        return {
            price: optionPrice,
            coverageMask: itemsCoveredBitmask
        };
    });

    const stateMinimumCosts = Array.from({ length: 1 << totalRequiredItems }, () => Number.POSITIVE_INFINITY);
    stateMinimumCosts[0] = 0;

    for (let currentCoverageState = 0; currentCoverageState < (1 << totalRequiredItems); ++currentCoverageState) {
        if (stateMinimumCosts[currentCoverageState] === Number.POSITIVE_INFINITY) {
            continue;
        }

        for (const option of itemAcquisitionOptions) {
            const nextCoverageState = currentCoverageState | option.coverageMask;
            const costToReachNextState = stateMinimumCosts[currentCoverageState] + option.price;
            
            if (costToReachNextState < stateMinimumCosts[nextCoverageState]) {
                stateMinimumCosts[nextCoverageState] = costToReachNextState;
            }
        }
    }

    const finalTargetState = (1 << totalRequiredItems) - 1;
    return stateMinimumCosts[finalTargetState] === Number.POSITIVE_INFINITY ? -1 : stateMinimumCosts[finalTargetState];
}

console.log(calculateMinimumCost());
