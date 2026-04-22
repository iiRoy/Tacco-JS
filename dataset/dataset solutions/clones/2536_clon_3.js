const InputParser = (() => {
    const convertStringToNumberOrString = (valStr) => {
        const parsedNum = Number(valStr);
        return !isNaN(parsedNum) ? parsedNum : valStr;
    };

    const parseLineToTypedArray = (lineStr) => {
        if (!lineStr || lineStr.trim() === '') {
            return [];
        }
        return lineStr.split(" ").map(convertStringToNumberOrString);
    };

    class LineReader {
        #processedLines;

        constructor(sourceText) {
            if (typeof sourceText !== 'string') {
                console.error("Input must be a string. Initializing with empty data.");
                this.#processedLines = [];
                return;
            }
            this.#processedLines = sourceText.trim().split("\n");
        }

        fetchRawLineContent(lineIndex) {
            if (lineIndex < 0 || lineIndex >= this.#processedLines.length) {
                return undefined;
            }
            return this.#processedLines[lineIndex];
        }

        extractTypedArrayFromLine(lineIndex) {
            const rawLine = this.fetchRawLineContent(lineIndex);
            return rawLine !== undefined ? parseLineToTypedArray(rawLine) : [];
        }

        fetchLinesAsTypedValues(startIndex, count) {
            const endIndex = (count !== undefined && count > 0) ? startIndex + count : undefined;

            if (startIndex < 0 || startIndex >= this.#processedLines.length) {
                return [];
            }
            return this.#processedLines.slice(startIndex, endIndex).map(convertStringToNumberOrString);
        }

        extractMultiTypedArraysFromRange(startIndex, count) {
            const endIndex = (count !== undefined && count > 0) ? startIndex + count : undefined;

            if (startIndex < 0 || startIndex >= this.#processedLines.length) {
                return [];
            }
            return this.#processedLines.slice(startIndex, endIndex).map(parseLineToTypedArray);
        }
    }

    const createReaderInstance = (textData) => {
        return new LineReader(textData);
    };

    return createReaderInstance;
})();

const inputDataProcessor = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processSolution());

function processSolution() {
    const configurationLine = inputDataProcessor.extractTypedArrayFromLine(0);

    if (configurationLine.length < 2) {
        console.error("Invalid input format: configuration line expects at least two numbers.");
        return -1;
    }

    const totalElements = configurationLine[0];
    const totalOperations = configurationLine[1];

    const operationalDetails = inputDataProcessor.extractMultiTypedArraysFromRange(1, undefined);

    const operationConfigurations = [];

    if (operationalDetails.length < totalOperations * 2) {
        console.error("Insufficient operational details provided for the given totalOperations.");
        return -1;
    }

    for (let opIdx = 0; opIdx < totalOperations; opIdx++) {
        const costLineIndex = opIdx * 2;
        const itemsLineIndex = opIdx * 2 + 1;

        const currentCost = operationalDetails[costLineIndex][0];
        const itemsToSet = operationalDetails[itemsLineIndex];

        if (typeof currentCost !== 'number' || currentCost <= 0) {
            console.error(`Invalid cost found at operation ${opIdx}`);
            return -1;
        }

        const itemBitmask = itemsToSet.reduce((accumulator, itemNumber) => {
            if (typeof itemNumber !== 'number' || itemNumber < 1 || itemNumber > totalElements) {
                console.error(`Invalid item number ${itemNumber} found in operation ${opIdx}.`);
                throw new Error("Invalid item number encountered during processing.");
            }
            return accumulator | (1 << (itemNumber - 1));
        }, 0);

        operationConfigurations.push({
            costValue: currentCost,
            itemBitmask: itemBitmask,
        });
    }

    const minCostToReachState = new Array(1 << totalElements).fill(Infinity);
    minCostToReachState[0] = 0;

    const maxStateMask = 1 << totalElements;
    for (let currentStateMask = 0; currentStateMask < maxStateMask; currentStateMask++) {
        if (minCostToReachState[currentStateMask] === Infinity) {
            continue;
        }

        for (let opIndex = 0; opIndex < totalOperations; opIndex++) {
            const currentOperation = operationConfigurations[opIndex];
            const nextStateMask = currentStateMask | currentOperation.itemBitmask;
            const candidateCost = minCostToReachState[currentStateMask] + currentOperation.costValue;

            minCostToReachState[nextStateMask] = Math.min(minCostToReachState[nextStateMask], candidateCost);
        }
    }

    const finalTargetState = (1 << totalElements) - 1;
    const overallMinCost = minCostToReachState[finalTargetState];

    return overallMinCost === Infinity ? -1 : overallMinCost;
}