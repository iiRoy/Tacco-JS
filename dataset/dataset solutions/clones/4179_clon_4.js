class InputProcessor {
    constructor(sourceText) {
        this.allLines = sourceText.split("\n");
    }

    extractQuantity() {
        const firstLineSegments = this.allLines[0].split(" ");
        return parseInt(firstLineSegments[0], 10);
    }

    extractDataStrings() {
        return this.allLines[1].split(" ");
    }
}

class DataTransformationEngine {
    constructor(elementCount, initialStringValues) {
        this.sequentialValues = Array.from({ length: elementCount }, () => 0);
        this.recordedOperations = [];
        this.sourceStringValues = initialStringValues;
        this.totalElements = elementCount;
    }

    // Main recursive processing method
    // 'currentTraversalIndex' acts as the 'i' from the original code,
    // which can be advanced by the inner logic.
    processNextEntry(currentTraversalIndex) {
        if (currentTraversalIndex >= this.totalElements) {
            return; // Base case: All entries processed
        }

        // Initialize the current element with its parsed value
        this.sequentialValues[currentTraversalIndex] = parseInt(this.sourceStringValues[currentTraversalIndex], 10);

        const precedingIndex = currentTraversalIndex - 1;

        if (currentTraversalIndex > 0) {
            const currentEntryValue = this.sequentialValues[currentTraversalIndex];
            const precedingEntryValue = this.sequentialValues[precedingIndex];

            if (currentEntryValue < precedingEntryValue && currentEntryValue > 0) {
                // Scenario A: Current positive value is less than preceding
                const operationDetail = [precedingIndex, currentTraversalIndex];
                this.recordedOperations.push(operationDetail);
                this.sequentialValues[currentTraversalIndex] += precedingEntryValue;
                this.processNextEntry(currentTraversalIndex + 1); // Advance to the next index
            } else if (currentEntryValue < 0 && currentEntryValue < precedingEntryValue) {
                // Scenario B: Current negative value is less than preceding
                const operationDetail = [precedingIndex, currentTraversalIndex];

                let dynamicTraversalIndex = currentTraversalIndex; // Mimics 'i' incrementing in the inner loop
                let auxiliaryIterationCount = 0; // Mimics 'j'

                // The value being modified, local copy for calculations
                let modifiedValueAtCurrentIndex = this.sequentialValues[currentTraversalIndex];

                // Equivalent to the inner 'for' loop
                while (modifiedValueAtCurrentIndex + precedingEntryValue * auxiliaryIterationCount <= precedingEntryValue) {
                    this.recordedOperations.push(operationDetail);
                    modifiedValueAtCurrentIndex += precedingEntryValue;
                    this.sequentialValues[currentTraversalIndex] = modifiedValueAtCurrentIndex; // Update the actual array
                    dynamicTraversalIndex++; // Crucially, this advances the outer loop's 'i'
                    auxiliaryIterationCount++;
                }

                // One final operation after the loop condition fails
                this.recordedOperations.push(operationDetail);
                modifiedValueAtCurrentIndex += precedingEntryValue;
                this.sequentialValues[currentTraversalIndex] = modifiedValueAtCurrentIndex;

                this.processNextEntry(dynamicTraversalIndex); // Continue processing from the new dynamic index
            } else {
                // No special scenario, proceed to the next element
                this.processNextEntry(currentTraversalIndex + 1);
            }
        } else {
            // First element (index 0), no preceding element for comparison, just move on
            this.processNextEntry(currentTraversalIndex + 1);
        }
    }

    compileResultString() {
        let finalReport = this.recordedOperations.length.toString();
        for (const operationPair of this.recordedOperations) {
            finalReport += "\n" + operationPair[0] + " " + operationPair[1];
        }
        return finalReport;
    }
}

// Orchestrates the data processing
function AnalyzeAndModifyData(rawTextContent) {
    const inputHandler = new InputProcessor(rawTextContent);
    const countOfElements = inputHandler.extractQuantity();
    const initialRawValues = inputHandler.extractDataStrings();

    const processingEngine = new DataTransformationEngine(countOfElements, initialRawValues);
    processingEngine.processNextEntry(0); // Initiate the recursive processing from the start

    console.log(processingEngine.compileResultString());
}

AnalyzeAndModifyData(require("fs").readFileSync("/dev/stdin", "utf8"));