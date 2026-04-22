class QuantitativeAnalyzer {
    constructor(dataContent) {
        this.rawSource = dataContent;
        this.processedFigures = [];
        this.finalAccumulation = 0;
    }

    // Step 1: Disassemble the raw input into a numerical sequence
    disassembleContent() {
        const segments = this.rawSource.trim().split(/\s+/).filter(Boolean);
        // Discard the initial segment, convert remaining to numbers
        this.processedFigures = segments.slice(1).map(Number);
        return this; // Allow method chaining
    }

    // Step 2: Locate the most prominent value and modify its first instance
    locateAndModifyPeak() {
        if (this.processedFigures.length === 0) {
            return this;
        }

        let dominantValue = -Infinity;
        let dominantPosition = -1;

        // Iterate to discover the highest number and its first appearance
        for (let idx = 0; idx < this.processedFigures.length; idx++) {
            if (this.processedFigures[idx] > dominantValue) {
                dominantValue = this.processedFigures[idx];
                dominantPosition = idx;
            }
        }

        // Apply the modification if a dominant value was found
        if (dominantPosition !== -1) {
            this.processedFigures[dominantPosition] /= 2;
        }
        return this;
    }

    // Step 3: Compute the aggregate of all modified numerical elements
    computeAggregate() {
        this.finalAccumulation = this.processedFigures.reduce((currentSum, element) => currentSum + element, 0);
        return this;
    }

    // Step 4: Deliver the calculated outcome
    getOutcome() {
        return this.finalAccumulation;
    }
}

// Entry point for execution
const suppliedSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const analyzerInstance = new QuantitativeAnalyzer(suppliedSource);
const ultimateResult = analyzerInstance
    .disassembleContent()
    .locateAndModifyPeak()
    .computeAggregate()
    .getOutcome();

console.log(ultimateResult);