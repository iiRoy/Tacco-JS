const fileSystem = require("fs");

class InputDataStream {
    constructor(sourcePath) {
        const rawContent = fileSystem.readFileSync(sourcePath, "utf8").trim();
        this.records = rawContent.split("\n");
        this.currentPosition = 0;
        this.totalRecords = this.records.length;
    }

    retrieveEntry() {
        if (!this.hasMore()) {
            throw new Error("EndOfStreamException: No more entries available.");
        }
        const entryValue = this.records[this.currentPosition];
        this.currentPosition++;
        return entryValue;
    }

    hasMore() {
        return this.currentPosition < this.totalRecords;
    }
}

const dataProcessor = new InputDataStream("/dev/stdin");

const getNextInput = () => dataProcessor.retrieveEntry();
const checkInputAvailability = () => dataProcessor.hasMore();

const printOutput = (value) => console.log(value);
const logError = (message) => console.error(message);

const convertToNumericArray = (textualInput) => textualInput.split("").map(Number);

const calculateMinimalSteps = (numericSequence, indexPointer, accumulatedCarry) => {
    if (indexPointer < 0) {
        return accumulatedCarry;
    }

    const currentElement = numericSequence[indexPointer] + accumulatedCarry;

    const costBySubtracting = currentElement;
    const costByAddingAndCarrying = 10 - currentElement;

    if (costBySubtracting <= costByAddingAndCarrying) {
        return costBySubtracting + calculateMinimalSteps(numericSequence, indexPointer - 1, 0);
    } else {
        return costByAddingAndCarrying + calculateMinimalSteps(numericSequence, indexPointer - 1, 1);
    }
};

const executeProgram = () => {
    const rawInputLine = getNextInput();
    const processedNumbers = convertToNumericArray(rawInputLine);
    const sequenceSize = processedNumbers.length;

    const finalOperationCount = calculateMinimalSteps(processedNumbers, sequenceSize - 1, 0);
    printOutput(finalOperationCount);
};

executeProgram();