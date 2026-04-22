"use strict";
const fileSystemInterface = require("fs");

class SourceDataProcessor {
    constructor(sourceText) {
        this.dataElements = sourceText.split(/ |\n/);
        this.elementPointer = 0;
    }

    pullNextInteger() {
        return parseInt(this.dataElements[this.elementPointer++], 10);
    }

    pullNextBigInteger() {
        return BigInt(this.dataElements[this.elementPointer++]);
    }
}

class AdvancedMathematicalOperations {
    static get PRIME_NUMBER() { return 1000000007; }
    static get ONE_BIGINT() { return 1n; }
    static get ZERO_BIGINT() { return 0n; }
    static get TWO_BIGINT() { return 2n; }

    static calculateCommonDivisor(valueA, valueB) {
        valueA = valueA < AdvancedMathematicalOperations.ZERO_BIGINT ? -valueA : valueA;
        valueB = valueB < AdvancedMathematicalOperations.ZERO_BIGINT ? -valueB : valueB;
        while (valueB !== AdvancedMathematicalOperations.ZERO_BIGINT) {
            const tempValue = valueB;
            valueB = valueA % valueB;
            valueA = tempValue;
        }
        return valueA;
    }

    static addModulo(operandA, operandB) {
        return (operandA + operandB) % AdvancedMathematicalOperations.PRIME_NUMBER;
    }

    static subtractModulo(operandA, operandB) {
        return (operandA - operandB + AdvancedMathematicalOperations.PRIME_NUMBER) % AdvancedMathematicalOperations.PRIME_NUMBER;
    }

    static multiplyModulo(...terms) {
        let currentProduct = AdvancedMathematicalOperations.ONE_BIGINT;
        for (const term of terms) {
            currentProduct = (currentProduct * term) % BigInt(AdvancedMathematicalOperations.PRIME_NUMBER);
        }
        return currentProduct;
    }

    static exponentiateModulo(baseValue, powerValue) {
        let resultValue = AdvancedMathematicalOperations.ONE_BIGINT;
        let currentBase = baseValue % BigInt(AdvancedMathematicalOperations.PRIME_NUMBER);
        while (powerValue > AdvancedMathematicalOperations.ZERO_BIGINT) {
            if (powerValue % AdvancedMathematicalOperations.TWO_BIGINT === AdvancedMathematicalOperations.ONE_BIGINT) {
                resultValue = AdvancedMathematicalOperations.multiplyModulo(resultValue, currentBase);
            }
            currentBase = AdvancedMathematicalOperations.multiplyModulo(currentBase, currentBase);
            powerValue /= AdvancedMathematicalOperations.TWO_BIGINT;
        }
        return resultValue;
    }

    static formStandardizedKey(coordinateX, coordinateY) {
        if (coordinateX === AdvancedMathematicalOperations.ZERO_BIGINT && coordinateY === AdvancedMathematicalOperations.ZERO_BIGINT) return "0:0"; 
        if (coordinateX === AdvancedMathematicalOperations.ZERO_BIGINT) return "0:1"; 
        if (coordinateY === AdvancedMathematicalOperations.ZERO_BIGINT) return "1:0"; 

        const commonDivisor = AdvancedMathematicalOperations.calculateCommonDivisor(coordinateX, coordinateY);
        let normalizedX = coordinateX / commonDivisor;
        let normalizedY = coordinateY / commonDivisor;

        if (normalizedX < AdvancedMathematicalOperations.ZERO_BIGINT || (normalizedX === AdvancedMathematicalOperations.ZERO_BIGINT && normalizedY < AdvancedMathematicalOperations.ZERO_BIGINT)) {
            normalizedX = -normalizedX;
            normalizedY = -normalizedY;
        }
        return `${normalizedX}:${normalizedY}`;
    }

    static ensurePositiveResult(value) {
        return (Number(value) % AdvancedMathematicalOperations.PRIME_NUMBER + AdvancedMathematicalOperations.PRIME_NUMBER) % AdvancedMathematicalOperations.PRIME_NUMBER;
    }
}

const processSolution = () => {
    const rawInput = fileSystemInterface.readFileSync("/dev/stdin", "utf8");
    const streamParser = new SourceDataProcessor(rawInput);

    const totalObjectCount = streamParser.pullNextInteger();

    let countOfNullVectors = 0;
    let countOfXAxisVectors = 0;
    let countOfYAxisVectors = 0;

    const directionalVectorRegistry = new Map();

    for (let currentCount = 0; currentCount < totalObjectCount; currentCount++) {
        const xComponent = streamParser.pullNextBigInteger();
        const yComponent = streamParser.pullNextBigInteger();

        if (xComponent === AdvancedMathematicalOperations.ZERO_BIGINT && yComponent === AdvancedMathematicalOperations.ZERO_BIGINT) {
            countOfNullVectors++;
        } else if (xComponent === AdvancedMathematicalOperations.ZERO_BIGINT) {
            countOfYAxisVectors++;
        } else if (yComponent === AdvancedMathematicalOperations.ZERO_BIGINT) {
            countOfXAxisVectors++;
        } else {
            const vectorIdentifier = AdvancedMathematicalOperations.formStandardizedKey(xComponent, yComponent);
            directionalVectorRegistry.set(vectorIdentifier, (directionalVectorRegistry.get(vectorIdentifier) || 0) + 1);
        }
    }

    let overallProductAccumulator = AdvancedMathematicalOperations.ONE_BIGINT;
    const visitedIdentifiers = new Set();

    for (const [currentIdentifier, currentGroupSize] of directionalVectorRegistry.entries()) {
        if (visitedIdentifiers.has(currentIdentifier)) {
            continue;
        }

        const [xCoordStr, yCoordStr] = currentIdentifier.split(':');
        const currentXCoord = BigInt(xCoordStr);
        const currentYCoord = BigInt(yCoordStr);

        const orthogonalXCoord = currentYCoord;
        const orthogonalYCoord = -currentXCoord;

        const orthogonalIdentifier = AdvancedMathematicalOperations.formStandardizedKey(orthogonalXCoord, orthogonalYCoord);

        let currentGroupContribution;

        if (currentIdentifier === orthogonalIdentifier) { 
            currentGroupContribution = AdvancedMathematicalOperations.exponentiateModulo(AdvancedMathematicalOperations.TWO_BIGINT, BigInt(currentGroupSize));
        } else {
            const orthogonalGroupSize = directionalVectorRegistry.get(orthogonalIdentifier) || 0;
            const termOne = AdvancedMathematicalOperations.exponentiateModulo(AdvancedMathematicalOperations.TWO_BIGINT, BigInt(currentGroupSize));
            const termTwo = AdvancedMathematicalOperations.exponentiateModulo(AdvancedMathematicalOperations.TWO_BIGINT, BigInt(orthogonalGroupSize));

            currentGroupContribution = AdvancedMathematicalOperations.addModulo(termOne, termTwo);
            currentGroupContribution = AdvancedMathematicalOperations.subtractModulo(currentGroupContribution, AdvancedMathematicalOperations.ONE_BIGINT);
        }

        overallProductAccumulator = AdvancedMathematicalOperations.multiplyModulo(overallProductAccumulator, currentGroupContribution);
        visitedIdentifiers.add(currentIdentifier);
        visitedIdentifiers.add(orthogonalIdentifier);
    }

    let axisVectorCombinations = AdvancedMathematicalOperations.addModulo(
        AdvancedMathematicalOperations.exponentiateModulo(AdvancedMathematicalOperations.TWO_BIGINT, BigInt(countOfYAxisVectors)),
        AdvancedMathematicalOperations.exponentiateModulo(AdvancedMathematicalOperations.TWO_BIGINT, BigInt(countOfXAxisVectors))
    );
    axisVectorCombinations = AdvancedMathematicalOperations.subtractModulo(axisVectorCombinations, AdvancedMathematicalOperations.ONE_BIGINT);

    let finalCalculation = AdvancedMathematicalOperations.multiplyModulo(overallProductAccumulator, axisVectorCombinations);
    finalCalculation = AdvancedMathematicalOperations.subtractModulo(finalCalculation, AdvancedMathematicalOperations.ONE_BIGINT);
    finalCalculation = AdvancedMathematicalOperations.addModulo(finalCalculation, BigInt(countOfNullVectors));

    return AdvancedMathematicalOperations.ensurePositiveResult(finalCalculation);
};

const finalResult = processSolution();
if (finalResult !== undefined) {
    console.log(finalResult);
}