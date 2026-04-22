class DataStreamer {
    constructor(sourceData) {
        this.lineQueue = sourceData.trim().split("\n");
        this.currentLinePointer = 0;
        this.currentLineTokens = [];
    }

    _ensureTokens() {
        while (this.currentLineTokens.length === 0 && this.currentLinePointer < this.lineQueue.length) {
            this.currentLineTokens = this.lineQueue[this.currentLinePointer].split(" ").reverse();
            this.currentLinePointer++;
        }
    }

    obtainSingleNumeric() {
        this._ensureTokens();
        if (this.currentLineTokens.length > 0) {
            return Number(this.currentLineTokens.pop());
        }
        return NaN;
    }

    obtainMatrix(rowCount) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.currentLinePointer < this.lineQueue.length) {
                const line = this.lineQueue[this.currentLinePointer++];
                resultMatrix.push(line.split(" ").map(Number));
            } else {
                break;
            }
        }
        return resultMatrix;
    }
}

const prepareDataProcessor = (inputContent) => new DataStreamer(inputContent);

const computeOptimalValue = (dataProcessor) => {
    const totalComponentCount = dataProcessor.obtainSingleNumeric();
    const batchCapacity = dataProcessor.obtainSingleNumeric();
    const rawComponentList = dataProcessor.obtainMatrix(totalComponentCount);

    let baseAccumulatedCost = 0;
    const processedComponentList = rawComponentList.map(componentRow => {
        const [initialQuantity, primaryCostRate, secondaryCostRate] = componentRow;
        const currentComponentCost = initialQuantity * primaryCostRate;
        baseAccumulatedCost += currentComponentCost;
        const derivedAdjustment = (batchCapacity - initialQuantity) * secondaryCostRate;
        return { initialQuantity, primaryCostRate, secondaryCostRate, derivedAdjustment };
    });

    processedComponentList.sort((compA, compB) => compB.derivedAdjustment - compA.derivedAdjustment);

    const assessOutcomeRecursive = (targetThreshold, itemsCount, capacitySize, components, initialSum) => {
        const simulateLoop = (componentIndex, currentCapacityLeft, currentSumValue) => {
            if (componentIndex >= itemsCount || currentCapacityLeft <= 0 || currentSumValue <= 0) {
                return currentSumValue;
            }

            const currentComponent = components[componentIndex];

            if (capacitySize <= currentCapacityLeft) {
                const updatedSum = currentSumValue - (currentComponent.initialQuantity * currentComponent.primaryCostRate + currentComponent.derivedAdjustment);
                const updatedCapacity = currentCapacityLeft - capacitySize;
                return simulateLoop(componentIndex + 1, updatedCapacity, updatedSum);
            } else {
                let lastInnerLoopCalculatedValue = currentSumValue;
                let finalIndexFromInnerLoop = componentIndex;

                for (let innerLoopCurrentIdx = componentIndex; innerLoopCurrentIdx < itemsCount && currentSumValue > 0; innerLoopCurrentIdx++) {
                    finalIndexFromInnerLoop = innerLoopCurrentIdx + 1;

                    let tempInnerIterationValue = currentSumValue;

                    if (currentCapacityLeft < components[innerLoopCurrentIdx].initialQuantity) {
                        tempInnerIterationValue -= components[innerLoopCurrentIdx].primaryCostRate * currentCapacityLeft;
                    } else {
                        tempInnerIterationValue -= (components[innerLoopCurrentIdx].initialQuantity * components[innerLoopCurrentIdx].primaryCostRate + (currentCapacityLeft - components[innerLoopCurrentIdx].initialQuantity) * components[innerLoopCurrentIdx].secondaryCostRate);
                    }
                    lastInnerLoopCalculatedValue = tempInnerIterationValue;
                }
                
                return simulateLoop(finalIndexFromInnerLoop, currentCapacityLeft, lastInnerLoopCalculatedValue);
            }
        };
        return simulateLoop(0, targetThreshold, initialSum);
    };

    let optimalUpperbound = totalComponentCount * batchCapacity;
    let suboptimalLowerbound = -1;

    const locateBreakpoint = (lowValue, highValue) => {
        if (highValue - lowValue <= 1) {
            return highValue;
        }
        const midValue = Math.floor((lowValue + highValue) / 2);
        const scenarioOutcome = assessOutcomeRecursive(midValue, totalComponentCount, batchCapacity, processedComponentList, baseAccumulatedCost);

        if (scenarioOutcome > 0) {
            return locateBreakpoint(midValue, highValue);
        } else {
            return locateBreakpoint(lowValue, midValue);
        }
    };

    return locateBreakpoint(suboptimalLowerbound, optimalUpperbound);
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataInputProcessor = prepareDataProcessor(inputData);
const solutionValue = computeOptimalValue(dataInputProcessor);
console.log(solutionValue);