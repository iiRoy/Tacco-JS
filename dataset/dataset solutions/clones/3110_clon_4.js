class InputSource {
    constructor() {
        this.records = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.currentPosition = 0;
    }

    retrieveNextLine() {
        if (this.currentPosition >= this.records.length) {
            throw new Error("End of input stream reached.");
        }
        return this.records[this.currentPosition++];
    }
}

const parseData = {
    numeric: (value) => parseInt(value, 10),
    numericSequence: (value) => value.split(" ").map(Number),
    stringSequence: (value) => value.split(" "),
    characterSequence: (value) => value.split(""),
};

const mainProcessingUnit = () => {
    const inputHandler = new InputSource();

    const totalItemCount = parseData.numeric(inputHandler.retrieveNextLine());
    let workingSequence = parseData.numericSequence(inputHandler.retrieveNextLine());

    // Initial validation: Check if any element exceeds its 1-indexed position
    const failsInitialConstraint = workingSequence.some((itemValue, itemIndex) => itemValue > itemIndex + 1);

    if (failsInitialConstraint) {
        console.log("-1");
        return;
    }

    let resultingOrder = [];

    // Core logic: Extract elements in a specific order
    while (workingSequence.length > 0) {
        let matchingPrefixLength = 0;
        // Determine the length of the longest prefix where workingSequence[k] == k + 1
        while (matchingPrefixLength < workingSequence.length && workingSequence[matchingPrefixLength] === matchingPrefixLength + 1) {
            matchingPrefixLength++;
        }

        // The element to be extracted is the last one in this matching prefix
        // (matchingPrefixLength - 1) gives the 0-indexed position
        // This element is added to the front of the resulting order
        const extractedElement = workingSequence[matchingPrefixLength - 1];
        resultingOrder.unshift(extractedElement);

        // Create a new sequence by filtering out the extracted element
        // This avoids in-place modification like splice, aligning with functional style
        workingSequence = workingSequence.filter((_, idx) => idx !== matchingPrefixLength - 1);
    }

    console.log(resultingOrder.join("\n"));
};

// Execute the primary function
(() => {
    mainProcessingUnit();
})();