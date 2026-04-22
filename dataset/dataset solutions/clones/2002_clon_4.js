class NumericalEntity {
    #internalValue;

    constructor(input) {
        if (typeof input === 'bigint') {
            this.#internalValue = input;
        } else if (typeof input === 'number') {
            this.#internalValue = BigInt(input);
        } else if (typeof input === 'string') {
            this.#internalValue = BigInt(input);
        } else if (input instanceof NumericalEntity) {
            this.#internalValue = input.#internalValue;
        } else {
            this.#internalValue = 0n;
        }
    }

    plus(operand) {
        return new NumericalEntity(this.#internalValue + new NumericalEntity(operand).#internalValue);
    }

    times(operand) {
        return new NumericalEntity(this.#internalValue * new NumericalEntity(operand).#internalValue);
    }

    dividedBy(operand) {
        const otherVal = new NumericalEntity(operand).#internalValue;
        if (otherVal === 0n) {
            throw new Error("Division by zero.");
        }
        return new NumericalEntity(this.#internalValue / otherVal);
    }

    isLargerThan(operand) {
        return this.#internalValue > new NumericalEntity(operand).#internalValue;
    }

    toStandardNumber() {
        return Number(this.#internalValue);
    }

    asString() {
        return this.#internalValue.toString();
    }
}

const createNumberInstance = (val) => new NumericalEntity(val);

function evaluateInputScenario(dataPayload) {
    const contentLines = dataPayload.split(/\r?\n/).filter(line => line.trim() !== '');
    
    const firstLineComponents = contentLines[0].match(/-?\d+/g);
    const controlFactor = parseInt(firstLineComponents[1], 10);

    const secondLineComponents = contentLines[1].match(/-?\d+/g);
    let rawNumericSequence = secondLineComponents.map(s => parseInt(s, 10));

    for (let i = 0; i < rawNumericSequence.length - 1; i++) {
        let currentMaxIndex = i;
        for (let j = i + 1; j < rawNumericSequence.length; j++) {
            if (rawNumericSequence[j] > rawNumericSequence[currentMaxIndex]) {
                currentMaxIndex = j;
            }
        }
        if (currentMaxIndex !== i) {
            let tempSwap = rawNumericSequence[i];
            rawNumericSequence[i] = rawNumericSequence[currentMaxIndex];
            rawNumericSequence[currentMaxIndex] = tempSwap;
        }
    }

    const overallSummation = rawNumericSequence.reduce((acc, current) => {
        return acc.plus(current);
    }, createNumberInstance(0));

    let tailSummation = createNumberInstance(0);
    let iterationIndex = controlFactor - 1;
    while (iterationIndex < rawNumericSequence.length) {
        tailSummation = tailSummation.plus(rawNumericSequence[iterationIndex]);
        iterationIndex++;
    }

    const multiplierConstant = createNumberInstance(4);
    const calculatedDivisor = multiplierConstant.times(controlFactor);
    const comparisonThreshold = overallSummation.dividedBy(calculatedDivisor);

    const finalOutcome = comparisonThreshold.isLargerThan(tailSummation) ? 'No' : 'Yes';
    
    console.log(finalOutcome);
}

evaluateInputScenario(require('fs').readFileSync('/dev/stdin', 'utf8'));