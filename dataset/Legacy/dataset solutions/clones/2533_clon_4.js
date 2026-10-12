class InputProcessor {
    #lineData;

    static #convertValue(inputString) {
        const numericValue = Number(inputString);
        return Number.isNaN(numericValue) ? inputString : numericValue;
    }

    static #processLineIntoArray(lineContent) {
        return lineContent.split(" ").map(InputProcessor.#convertValue);
    }

    constructor(rawInputContent) {
        this.#lineData = rawInputContent.trim().split("\n");
    }

    fetchLine(lineNumber) {
        return this.#lineData[lineNumber];
    }

    fetchLineAsParsedArray(lineNumber) {
        return InputProcessor.#processLineIntoArray(this.#lineData[lineNumber]);
    }

    extractLines(startIdx, countLimit) {
        const endIdx = countLimit !== undefined ? startIdx + countLimit : undefined;
        return this.#lineData.slice(startIdx, endIdx).map(InputProcessor.#convertValue);
    }

    extractLinesAsParsedArrays(startIdx, countLimit) {
        const endIdx = countLimit !== undefined ? startIdx + countLimit : undefined;
        return this.#lineData.slice(startIdx, endIdx).map(InputProcessor.#processLineIntoArray);
    }
}

console.log(processInputAndSolve());

function processInputAndSolve() {
    const inputHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const [totalItems, totalPairs] = inputHandler.fetchLineAsParsedArray(0);

    const requiredBitmask = (1 << (totalItems + 1)) - 2;

    const rawItemDetails = inputHandler.extractLinesAsParsedArrays(1, totalPairs * 2);

    const structuredItems = [];
    for (let itemIndex = 0; itemIndex < totalPairs * 2; itemIndex += 2) {
        structuredItems.push({
            costValue: rawItemDetails[itemIndex][0],
            featureMask: rawItemDetails[itemIndex + 1].reduce((accumulator, currentBit) => accumulator | (1 << currentBit), 0)
        });
    }

    const resultingCosts = findCombinationsIterative(requiredBitmask, structuredItems);

    if (resultingCosts.length === 0) {
        return -1;
    }

    return Math.min(...resultingCosts);
}

function findCombinationsIterative(targetMask, availableOptions) {
    const collectedSolutions = [];
    const searchFrontier = [];

    searchFrontier.push({
        currentCost: 0,
        currentMask: 0,
        optionsForThisLevel: availableOptions,
        nextOptionIndex: 0
    });

    while (searchFrontier.length > 0) {
        const { currentCost, currentMask, optionsForThisLevel, nextOptionIndex } = searchFrontier.pop();

        if (nextOptionIndex < optionsForThisLevel.length) {
            searchFrontier.push({
                currentCost,
                currentMask,
                optionsForThisLevel,
                nextOptionIndex: nextOptionIndex + 1
            });

            const selectedOption = optionsForThisLevel[nextOptionIndex];
            const newAccumulatedCost = currentCost + selectedOption.costValue;
            const newAccumulatedMask = currentMask | selectedOption.featureMask;

            if (newAccumulatedMask === targetMask) {
                collectedSolutions.push(newAccumulatedCost);
            }

            searchFrontier.push({
                currentCost: newAccumulatedCost,
                currentMask: newAccumulatedMask,
                optionsForThisLevel: optionsForThisLevel.slice(1),
                nextOptionIndex: 0
            });
        }
    }
    return collectedSolutions;
}
