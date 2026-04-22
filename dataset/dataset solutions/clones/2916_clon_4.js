const dataFetcher = (() => {
    let textLines = [];
    let lineCursor = 0;
    let currentLineSegments = [];

    const initializeReader = (sourceText) => {
        textLines = sourceText.trim().split('\n');
        lineCursor = 0;
        currentLineSegments = [];
    };

    const obtainNumericValue = () => {
        while (currentLineSegments.length === 0) {
            if (lineCursor >= textLines.length) {
                throw new Error("Data source exhausted: attempted to read beyond available input.");
            }
            const activeLine = textLines[lineCursor].trim();
            currentLineSegments = activeLine.split(' ').filter(part => part !== '').reverse();
            lineCursor++;
        }
        return Number(currentLineSegments.pop());
    };

    const obtainNumericArray = () => {
        if (lineCursor >= textLines.length) {
            throw new Error("Data source exhausted: attempted to read beyond available input.");
        }
        const activeLine = textLines[lineCursor].trim();
        lineCursor++;
        return activeLine.split(' ').filter(part => part !== '').map(Number);
    };

    return (inputLocation) => {
        initializeReader(require("fs").readFileSync(inputLocation, "utf8"));
        return {
            getNumeric: obtainNumericValue,
            getArray: obtainNumericArray,
        };
    };
})();

const computeMaximumValue = () => {
    const inputHandler = dataFetcher("/dev/stdin");

    const totalItems = inputHandler.getNumeric();
    const actionBudget = inputHandler.getNumeric();
    const itemSequence = inputHandler.getArray();

    let overallMax = 0;

    // Generate all possible (left_count, right_count) combinations
    const combinationSet = [];
    Array.from({ length: totalItems + 1 }).forEach((_, leftCount) => {
        Array.from({ length: totalItems - leftCount + 1 }).forEach((__, rightCount) => {
            combinationSet.push({ left: leftCount, right: rightCount });
        });
    });

    overallMax = combinationSet.reduce((currentGlobalMax, { left: currentLeftCount, right: currentRightCount }) => {
        const totalSelectedItems = currentLeftCount + currentRightCount;

        // Filter out invalid combinations based on problem constraints
        if (totalSelectedItems > actionBudget || totalSelectedItems >= totalItems) {
            return currentGlobalMax;
        }

        let currentAccumulatedSum = 0;
        const negativeElementsFound = [];

        // Process elements taken from the left end
        itemSequence.slice(0, currentLeftCount).forEach(element => {
            currentAccumulatedSum += element;
            if (element < 0) {
                negativeElementsFound.push(element);
            }
        });

        // Process elements taken from the right end
        itemSequence.slice(totalItems - currentRightCount, totalItems).forEach(element => {
            currentAccumulatedSum += element;
            if (element < 0) {
                negativeElementsFound.push(element);
            }
        });

        // Sort negative elements to easily discard the smallest ones
        negativeElementsFound.sort((valA, valB) => valA - valB);

        // Discard smallest negative elements within the remaining budget
        const discardAllowance = actionBudget - totalSelectedItems;
        Array.from({ length: Math.min(discardAllowance, negativeElementsFound.length) }).forEach((_, discardIndex) => {
            currentAccumulatedSum -= negativeElementsFound[discardIndex];
        });

        return Math.max(currentGlobalMax, currentAccumulatedSum);
    }, 0);

    return overallMax;
};

console.log(computeMaximumValue());