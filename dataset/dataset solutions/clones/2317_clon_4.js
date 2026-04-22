class NumericProcessor {
    constructor(sourcePath) {
        this.source = sourcePath;
        this.values = [];
    }

    #acquireContent() {
        return require("node:fs").readFileSync(this.source, "utf8");
    }

    #extractOperands() {
        const rawText = this.#acquireContent();
        const lineSegments = rawText.split('\n');
        
        let collectedNumbers = [];
        for (const segment of lineSegments) {
            if (segment.trim() !== '') {
                collectedNumbers.push(Number(segment));
            }
            if (collectedNumbers.length === 2) {
                break;
            }
        }
        this.values = collectedNumbers;
    }

    #computeDifference() {
        if (this.values.length < 2) {
            throw new Error("Insufficient numeric operands for calculation.");
        }
        const operandSum = this.values[0] + this.values[1];
        const baseValue = 6;
        return baseValue - operandSum;
    }

    processAndOutput() {
        this.#extractOperands();
        const finalOutcome = this.#computeDifference();
        process.stdout.write(finalOutcome.toString() + '\n');
    }
}

const calculatorInstance = new NumericProcessor("/dev/stdin");
calculatorInstance.processAndOutput();