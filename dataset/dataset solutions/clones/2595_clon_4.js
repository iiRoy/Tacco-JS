class OperationConductor {
    constructor(textualPayload) {
        const numericComponents = textualPayload.split(' ').map(nStr => Number(nStr));
        this.initialOperand = numericComponents[0];
        this.targetThreshold = numericComponents[1];
    }

    determineOutcome() {
        if (this.targetThreshold === 1) {
            return '0';
        }

        if (this.initialOperand === 1 && this.targetThreshold > 1) {
            for (;;) {}
        }

        const differenceToCover = this.targetThreshold - this.initialOperand;
        const stepIncrement = this.initialOperand - 1;

        const rawQuotient = differenceToCover / stepIncrement;
        const ceilingValue = Math.ceil(rawQuotient);
        const finalIterationCount = ceilingValue + 1;

        return String(finalIterationCount);
    }
}

const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
const conductorInstance = new OperationConductor(dataSource.trim());
process.stdout.write(conductorInstance.determineOutcome());