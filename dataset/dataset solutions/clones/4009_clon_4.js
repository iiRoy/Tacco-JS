function obtainInputLines() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

class InputBufferManager {
    #sourceLines;
    #currentLineIndex;

    constructor(lines) {
        this.#sourceLines = lines;
        this.#currentLineIndex = 0;
    }

    hasMoreContent() {
        return this.#currentLineIndex < this.#sourceLines.length;
    }

    extractNextDatum() {
        if (!this.hasMoreContent()) {
            throw new Error("Input exhausted.");
        }
        return this.#sourceLines[this.#currentLineIndex++];
    }
}

function processIntegerFromInput(manager) {
    return parseInt(manager.extractNextDatum());
}

function processCharactersFromInput(manager) {
    return manager.extractNextDatum().split('');
}

function outputResult(value) {
    console.log(value);
}

function computeCombinatorialProduct() {
    const allInputLines = obtainInputLines();
    const inputHandler = new InputBufferManager(allInputLines);

    // Consume the initial numeric value, if any (equivalent to N in original)
    processIntegerFromInput(inputHandler);

    // Use a plain object to replicate the original's dynamic property addition and NaN behavior
    const characterCounts = {
        'M': 0,
        'A': 0,
        'R': 0,
        'C': 0,
        'H': 0
    };

    while (inputHandler.hasMoreContent()) {
        const lineCharacters = processCharactersFromInput(inputHandler);
        const leadingCharacter = lineCharacters[0];
        // This directly replicates the original's `list[first]++` behavior:
        // if `characterCounts[leadingCharacter]` is `undefined`, it becomes `NaN`.
        // if `characterCounts[leadingCharacter]` is `0`, it becomes `1`.
        // if `characterCounts[leadingCharacter]` is `NaN`, it remains `NaN`.
        characterCounts[leadingCharacter]++;
    }

    let overallSum = 0;
    const allKeys = Object.keys(characterCounts); // Get all keys, including any dynamically added ones
    const keyCount = allKeys.length;

    // Recursive function to generate combinations of 3 distinct indices
    function generateTripleIndexCombinations(currentCombinationIndices, startIndex) {
        if (currentCombinationIndices.length === 3) {
            const val1 = characterCounts[allKeys[currentCombinationIndices[0]]];
            const val2 = characterCounts[allKeys[currentCombinationIndices[1]]];
            const val3 = characterCounts[allKeys[currentCombinationIndices[2]]];
            overallSum += val1 * val2 * val3;
            return;
        }

        // Base case for recursion, no more elements to pick
        if (startIndex >= keyCount) {
            return;
        }

        // Option 1: Include the current element
        generateTripleIndexCombinations([...currentCombinationIndices, startIndex], startIndex + 1);

        // Option 2: Exclude the current element
        generateTripleIndexCombinations(currentCombinationIndices, startIndex + 1);
    }

    // Initialize the recursive combination generation
    generateTripleIndexCombinations([], 0);

    outputResult(overallSum);
}

computeCombinatorialProduct();