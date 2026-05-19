const fileSystem = require('fs');

class InputProcessor {
    constructor(rawInputContent) {
        this.inputTokens = rawInputContent.trim().split(/\s+/g);
        this.currentTokenIndex = 0;
    }

    retrieveNextString() {
        if (this.currentTokenIndex >= this.inputTokens.length) {
            throw new Error("End of input reached.");
        }
        return this.inputTokens[this.currentTokenIndex++];
    }

    retrieveNextInteger() {
        return parseInt(this.retrieveNextString(), 10);
    }
}

function performCalculation(inputData) {
    const MODULUS_VALUE = 1000000007n;

    const totalItemCount = inputData.retrieveNextInteger();

    const numericalValues = new Array(totalItemCount);
    for (let i = 0; i < totalItemCount; i++) {
        numericalValues[i] = BigInt(inputData.retrieveNextString());
    }

    const bitwiseOccurrenceCounts = new Array(61).fill(0);

    for (const currentNumericalValue of numericalValues) {
        let temporaryValue = currentNumericalValue;
        let currentBitPosition = 0;
        while (temporaryValue > 0n) {
            if ((temporaryValue & 1n) === 1n) {
                bitwiseOccurrenceCounts[currentBitPosition]++;
            }
            temporaryValue >>= 1n;
            currentBitPosition++;
        }
    }

    let finalAccumulatedSum = 0n;
    let currentFactorOfTwo = 1n;

    for (let bitIndex = 0; bitIndex < bitwiseOccurrenceCounts.length; bitIndex++) {
        const countAtThisBit = BigInt(bitwiseOccurrenceCounts[bitIndex]);
        const totalItemsBigInt = BigInt(totalItemCount);

        const componentTerm = (currentFactorOfTwo * countAtThisBit % MODULUS_VALUE * (totalItemsBigInt - countAtThisBit) % MODULUS_VALUE);

        finalAccumulatedSum = (finalAccumulatedSum + componentTerm) % MODULUS_VALUE;

        currentFactorOfTwo = (currentFactorOfTwo * 2n) % MODULUS_VALUE;
    }

    console.log(finalAccumulatedSum.toString());
}

const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const processor = new InputProcessor(standardInputContent);
performCalculation(processor);
