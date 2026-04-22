"use strict";

class InputProcessor {
    constructor(sourcePath) {
        this.dataBuffer = require("fs").readFileSync(sourcePath, "utf8");
        this.tokenArray = this.dataBuffer.split(/ |\n/);
        this.currentTokenPointer = 0;
    }

    retrieveNextInteger() {
        return +this.tokenArray[this.currentTokenPointer++];
    }

    retrieveNextBigInteger() {
        return BigInt(this.tokenArray[this.currentTokenPointer++]);
    }
}

const ArithmeticUtil = {
    greatestCommonDivisor(numA, numB) {
        while (numB !== 0n) {
            const remainder = numA % numB;
            numA = numB;
            numB = remainder;
        }
        return numA;
    },

    globalModulus: 1000000007n,

    modularProduct(operandX, operandY) {
        return (operandX * operandY) % this.globalModulus;
    },

    modularPower(baseVal, exponentVal) {
        if (exponentVal === 0n) return 1n;
        if (exponentVal === 1n) return baseVal % this.globalModulus;
        
        let halfPower = this.modularPower(baseVal, exponentVal / 2n);
        let result = this.modularProduct(halfPower, halfPower);
        
        if (exponentVal % 2n === 1n) {
            result = this.modularProduct(result, baseVal);
        }
        return result;
    },

    ensurePositiveModulo(value) {
        return (value % this.globalModulus + this.globalModulus) % this.globalModulus;
    }
};

function processVectorData() {
    const dataHandler = new InputProcessor("/dev/stdin");
    const numVectors = dataHandler.retrieveNextInteger();

    let xZeroVectors = 0;
    let yZeroVectors = 0;
    let originVectors = 0;

    const vectorTallies = new Map(); // Map<BigInt_X, Map<BigInt_Y, BigInt_Count>>

    let vectorIndex = 0;
    while (vectorIndex < numVectors) {
        let currentX = dataHandler.retrieveNextBigInteger();
        let currentY = dataHandler.retrieveNextBigInteger();

        if (currentX === 0n && currentY === 0n) {
            originVectors++;
            vectorIndex++;
            continue;
        }
        if (currentX === 0n) {
            xZeroVectors++;
            vectorIndex++;
            continue;
        }
        if (currentY === 0n) {
            yZeroVectors++;
            vectorIndex++;
            continue;
        }

        const commonDivisor = ArithmeticUtil.greatestCommonDivisor(currentX, currentY);
        currentX /= commonDivisor;
        currentY /= commonDivisor;

        if (currentX < 0n) {
            currentX = -currentX;
            currentY = -currentY;
        }

        if (!vectorTallies.has(currentX)) {
            vectorTallies.set(currentX, new Map());
        }
        const innerTallies = vectorTallies.get(currentX);
        innerTallies.set(currentY, (innerTallies.get(currentY) || 0n) + 1n);
        vectorIndex++;
    }

    let computationResult = ArithmeticUtil.modularPower(2n, BigInt(xZeroVectors));
    computationResult = ArithmeticUtil.ensurePositiveModulo(computationResult + ArithmeticUtil.modularPower(2n, BigInt(yZeroVectors)) - 1n);

    for (const [firstCoord, innerMap] of vectorTallies.entries()) {
        for (const [secondCoord, currentComponentCount] of innerMap.entries()) {
            if (secondCoord < 0n) {
                const canonicalFirst = -secondCoord;
                const canonicalSecond = firstCoord;
                if (vectorTallies.has(canonicalFirst) && vectorTallies.get(canonicalFirst).has(canonicalSecond)) {
                    continue;
                }
            }
            
            let currentPairContribution = ArithmeticUtil.modularPower(2n, currentComponentCount);
            
            const orthogonalFirst = secondCoord;
            const orthogonalSecond = -firstCoord;
            
            if (vectorTallies.has(orthogonalFirst) && vectorTallies.get(orthogonalFirst).has(orthogonalSecond)) {
                const orthogonalComponentCount = vectorTallies.get(orthogonalFirst).get(orthogonalSecond);
                currentPairContribution = ArithmeticUtil.ensurePositiveModulo(currentPairContribution + (ArithmeticUtil.modularPower(2n, orthogonalComponentCount) - 1n));
            }
            
            computationResult = ArithmeticUtil.modularProduct(computationResult, currentPairContribution);
        }
    }
    
    computationResult = ArithmeticUtil.ensurePositiveModulo(computationResult - 1n + BigInt(originVectors));
    
    return computationResult;
}

const finalOutput = processVectorData();
if (finalOutput !== undefined) {
    console.log(finalOutput.toString());
}