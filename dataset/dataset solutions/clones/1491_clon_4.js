const DURATION_MODULUS = 998244353;
const MAX_DIGIT_COUNT = 200005;

let tenMultipliers = new Array(MAX_DIGIT_COUNT);
let cumulativeTenMultipliers = new Array(MAX_DIGIT_COUNT);
let nineReciprocal;

function computeModularPower(baseVal, exponentVal) {
    let outcome = 1;
    baseVal %= DURATION_MODULUS;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) outcome = (outcome * baseVal) % DURATION_MODULUS;
        baseVal = (baseVal * baseVal) % DURATION_MODULUS;
        exponentVal = Math.floor(exponentVal / 2);
    }
    return outcome;
}

function establishGlobalConstants() {
    tenMultipliers[0] = 1;
    for (let k = 1; k < MAX_DIGIT_COUNT; k++) {
        tenMultipliers[k] = (tenMultipliers[k - 1] * 10) % DURATION_MODULUS;
    }

    nineReciprocal = computeModularPower(9, DURATION_MODULUS - 2);

    cumulativeTenMultipliers[0] = 1;
    for (let k = 1; k < MAX_DIGIT_COUNT; k++) {
        cumulativeTenMultipliers[k] = (cumulativeTenMultipliers[k - 1] + tenMultipliers[k]) % DURATION_MODULUS;
    }
}

class SegmentUnit {
    constructor() {
        this.aggregatedValue = 0;
        this.deferredDigit = null;
    }
}

class NumericalSequenceStructure {
    constructor(totalQuantity) {
        this.totalQuantity = totalQuantity;
        this.segmentElements = new Array(4 * totalQuantity);
        for(let i=0; i < 4 * totalQuantity; ++i) {
            this.segmentElements[i] = new SegmentUnit();
        }
        this.constructInitialState(1, 0, totalQuantity - 1);
    }

    constructInitialState(nodeIndex, rangeStart, rangeEnd) {
        if (rangeStart === rangeEnd) {
            this.segmentElements[nodeIndex].aggregatedValue = (1 * tenMultipliers[this.totalQuantity - 1 - rangeStart]) % DURATION_MODULUS;
        } else {
            const midPoint = Math.floor((rangeStart + rangeEnd) / 2);
            this.constructInitialState(nodeIndex * 2, rangeStart, midPoint);
            this.constructInitialState(nodeIndex * 2 + 1, midPoint + 1, rangeEnd);
            this.segmentElements[nodeIndex].aggregatedValue = (this.segmentElements[nodeIndex * 2].aggregatedValue + this.segmentElements[nodeIndex * 2 + 1].aggregatedValue) % DURATION_MODULUS;
        }
    }

    propagateDeferredAction(nodeIndex, rangeStart, rangeEnd) {
        const currentUnit = this.segmentElements[nodeIndex];
        if (currentUnit.deferredDigit !== null) {
            const digitValue = currentUnit.deferredDigit;
            const midPoint = Math.floor((rangeStart + rangeEnd) / 2);

            const leftChild = this.segmentElements[nodeIndex * 2];
            leftChild.deferredDigit = digitValue;
            leftChild.aggregatedValue = (digitValue * tenMultipliers[this.totalQuantity - 1 - midPoint]) % DURATION_MODULUS;
            leftChild.aggregatedValue = (leftChild.aggregatedValue * cumulativeTenMultipliers[midPoint - rangeStart]) % DURATION_MODULUS;

            const rightChild = this.segmentElements[nodeIndex * 2 + 1];
            rightChild.deferredDigit = digitValue;
            rightChild.aggregatedValue = (digitValue * tenMultipliers[this.totalQuantity - 1 - rangeEnd]) % DURATION_MODULUS;
            rightChild.aggregatedValue = (rightChild.aggregatedValue * cumulativeTenMultipliers[rangeEnd - (midPoint + 1)]) % DURATION_MODULUS;

            currentUnit.deferredDigit = null;
        }
    }

    applyRangeModification(nodeIndex, currentRangeStart, currentRangeEnd, targetRangeStart, targetRangeEnd, newDigitValue) {
        const currentUnit = this.segmentElements[nodeIndex];

        if (currentRangeStart > targetRangeEnd || currentRangeEnd < targetRangeStart) {
            return;
        }

        if (targetRangeStart <= currentRangeStart && currentRangeEnd <= targetRangeEnd) {
            currentUnit.deferredDigit = newDigitValue;
            currentUnit.aggregatedValue = (newDigitValue * tenMultipliers[this.totalQuantity - 1 - currentRangeEnd]) % DURATION_MODULUS;
            currentUnit.aggregatedValue = (currentUnit.aggregatedValue * cumulativeTenMultipliers[currentRangeEnd - currentRangeStart]) % DURATION_MODULUS;
            return;
        }

        this.propagateDeferredAction(nodeIndex, currentRangeStart, currentRangeEnd);

        const midPoint = Math.floor((currentRangeStart + currentRangeEnd) / 2);
        this.applyRangeModification(nodeIndex * 2, currentRangeStart, midPoint, targetRangeStart, targetRangeEnd, newDigitValue);
        this.applyRangeModification(nodeIndex * 2 + 1, midPoint + 1, currentRangeEnd, targetRangeStart, targetRangeEnd, newDigitValue);

        currentUnit.aggregatedValue = (this.segmentElements[nodeIndex * 2].aggregatedValue + this.segmentElements[nodeIndex * 2 + 1].aggregatedValue) % DURATION_MODULUS;
    }

    retrieveOverallValue() {
        return this.segmentElements[1].aggregatedValue;
    }
}

(async () => {
    const streamReader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let collectedInputLines = [];
    streamReader.on('line', (lineContent) => {
        collectedInputLines.push(lineContent);
    });

    streamReader.on('close', () => {
        establishGlobalConstants();

        const [totalLength, numOperations] = collectedInputLines[0].split(' ').map(Number);
        const operationSpecifications = collectedInputLines.slice(1, numOperations + 1).map(lineContent => lineContent.split(' ').map(Number));

        const sequenceHandler = new NumericalSequenceStructure(totalLength);
        const computationResults = [];

        for (const specEntry of operationSpecifications) {
            const [l_base_one, r_base_one, newDigit] = specEntry;
            const zeroBasedStart = l_base_one - 1;
            const zeroBasedEnd = r_base_one - 1;
            sequenceHandler.applyRangeModification(1, 0, totalLength - 1, zeroBasedStart, zeroBasedEnd, newDigit);
            computationResults.push(sequenceHandler.retrieveOverallValue());
        }

        process.stdout.write(computationResults.join('\n'));
    });
})();