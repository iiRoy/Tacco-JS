class DataStreamProcessor {
    constructor(inputSource) {
        this.lineSegments = inputSource.trim().split('\n');
        this.currentSegmentIndex = 0;
        this.pendingTokens = [];
    }

    retrieveValue() {
        if (this.pendingTokens.length === 0) {
            if (this.currentSegmentIndex >= this.lineSegments.length) {
                throw new Error("No more data segments.");
            }
            this.pendingTokens = this.lineSegments[this.currentSegmentIndex].split(' ');
            this.currentSegmentIndex++;
        }
        return Number(this.pendingTokens.shift());
    }

    acquireMatrix(rowCount) {
        const collectedRows = [];
        for (let r = 0; r < rowCount; r++) {
            if (this.currentSegmentIndex >= this.lineSegments.length) {
                throw new Error("Insufficient segments for matrix.");
            }
            collectedRows.push(this.lineSegments[this.currentSegmentIndex].split(' ').map(Number));
            this.currentSegmentIndex++;
        }
        this.pendingTokens = [];
        return collectedRows;
    }
}

function createMultiDimensionalArray(initialFiller, ...dimensions) {
    const buildRecursively = (currentDims) => {
        if (currentDims.length === 0) {
            return typeof initialFiller === 'object' && initialFiller !== null
                   ? JSON.parse(JSON.stringify(initialFiller))
                   : initialFiller;
        }
        const currentSize = currentDims[0];
        const remainingDims = currentDims.slice(1);
        const result = new Array(currentSize);
        for (let i = 0; i < currentSize; i++) {
            result[i] = buildRecursively(remainingDims);
        }
        return result;
    };
    return buildRecursively(dimensions);
}

function executeCalculation() {
    const inputReader = new DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const dimensionCount = inputReader.retrieveValue();
    const thresholdValue = inputReader.retrieveValue();
    const itemDataList = inputReader.acquireMatrix(dimensionCount);

    let totalInitialValue = 0;
    const processedItems = itemDataList.map(itemRow => {
        const firstDim = itemRow[0];
        const secondDim = itemRow[1];
        const thirdDim = itemRow[2];

        const productVal = firstDim * secondDim;
        const adjustedVal = (thresholdValue - firstDim) * thirdDim;
        const sumAdjustedProduct = adjustedVal + productVal;

        totalInitialValue += productVal;

        return {
            dim1: firstDim,
            dim2: secondDim,
            dim3: thirdDim,
            adjusted: adjustedVal,
            product: productVal,
            sumAdjProd: sumAdjustedProduct
        };
    });

    processedItems.sort((itemA, itemB) => itemB.sumAdjProd - itemA.sumAdjProd);

    let upperBoundary = dimensionCount * thresholdValue;
    let lowerBoundary = -1;

    while (upperBoundary - lowerBoundary > 1) {
        const midPoint = Math.floor((upperBoundary + lowerBoundary) / 2);
        let currentAccumulatedValue = totalInitialValue;
        let remainingCapacity = midPoint;
        const moduloRemainder = midPoint % thresholdValue;

        let maxSubValue = 0;
        let maxSubValueIdx = 0;

        processedItems.forEach((item, currentIdx) => {
            let tempSubValue;
            if (moduloRemainder < item.dim1) {
                tempSubValue = item.dim2 * moduloRemainder;
            } else {
                tempSubValue = item.product + (moduloRemainder - item.dim1) * item.dim3;
            }
            if (tempSubValue > maxSubValue) {
                maxSubValue = tempSubValue;
                maxSubValueIdx = currentIdx;
            }
        });

        for (let currentIdx = 0; currentIdx < dimensionCount && remainingCapacity > 0 && currentAccumulatedValue > 0; currentIdx++) {
            const currentItem = processedItems[currentIdx];

            if (thresholdValue <= remainingCapacity) {
                currentAccumulatedValue -= currentItem.sumAdjProd;
                remainingCapacity -= thresholdValue;
            } else {
                if (currentIdx <= maxSubValueIdx) {
                    currentAccumulatedValue -= maxSubValue;
                    remainingCapacity = 0;
                } else {
                    let tempComparisonValue = currentAccumulatedValue;
                    tempComparisonValue += processedItems[maxSubValueIdx].sumAdjProd - currentItem.sumAdjProd - maxSubValue;

                    if (tempComparisonValue <= 0) {
                        currentAccumulatedValue = tempComparisonValue;
                        continue;
                    }

                    let innerLoopCurrentIdx = currentIdx;
                    let lastCalculatedInnerValue = currentAccumulatedValue;

                    while (innerLoopCurrentIdx < dimensionCount && currentAccumulatedValue > 0) {
                        const innerItem = processedItems[innerLoopCurrentIdx];
                        let iterationValue = currentAccumulatedValue;

                        if (remainingCapacity < innerItem.dim1) {
                            iterationValue -= innerItem.dim2 * remainingCapacity;
                        } else {
                            iterationValue -= innerItem.product + (remainingCapacity - innerItem.dim1) * innerItem.dim3;
                        }
                        lastCalculatedInnerValue = iterationValue;
                        innerLoopCurrentIdx++;
                        if (currentAccumulatedValue <= 0) break;
                    }
                    currentAccumulatedValue = lastCalculatedInnerValue;
                    remainingCapacity = 0;
                    currentIdx = innerLoopCurrentIdx - 1;
                }
            }
        }

        if (currentAccumulatedValue > 0) {
            lowerBoundary = midPoint;
        } else {
            upperBoundary = midPoint;
        }
    }
    return upperBoundary;
}

console.log(executeCalculation());