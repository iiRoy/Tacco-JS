"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

const tokenStream = (function* () {
    const tokens = fileContent.split(/ |\n/).filter(t => t !== '');
    let currentTokenIdx = 0;
    while (currentTokenIdx < tokens.length) {
        yield tokens[currentTokenIdx++];
    }
})();

function getNextInteger() { return +tokenStream.next().value; }
function getNextString() { return tokenStream.next().value; }
function getNextBigInt() { return BigInt(tokenStream.next().value); }

function getMultipleValues(count, parseFn = Number) {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(parseFn(tokenStream.next().value));
    }
    return results;
}

function getMatrix(rows, cols, parseFn = Number) {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        matrix.push(getMultipleValues(cols, parseFn));
    }
    return matrix;
}

function generateMultiDimArray(initialVal, ...dimensions) {
    if (dimensions.length === 0) {
        return initialVal;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => generateMultiDimArray(initialVal, ...remainingDimensions));
}

class MinHeapStore {
    constructor() {
        this.heapElements = [];
    }

    insertElement(priority, data) {
        this.heapElements.push([priority, data]);
        let currentPosition = this.heapElements.length - 1;
        while (currentPosition > 0) {
            const parentPosition = (currentPosition - 1) >> 1;
            if (this.heapElements[parentPosition][0] <= this.heapElements[currentPosition][0]) {
                break;
            }
            [this.heapElements[currentPosition], this.heapElements[parentPosition]] =
            [this.heapElements[parentPosition], this.heapElements[currentPosition]];
            currentPosition = parentPosition;
        }
    }

    extractMin() {
        const minElement = this.heapElements[0];
        const lastElement = this.heapElements.pop();
        if (this.heapElements.length === 0) {
            return minElement;
        }

        this.heapElements[0] = lastElement;
        let currentPosition = 0;
        const heapSize = this.heapElements.length;

        while (true) {
            const leftChildPosition = 2 * currentPosition + 1;
            const rightChildPosition = 2 * currentPosition + 2;
            let smallestChildPosition = currentPosition;

            if (leftChildPosition < heapSize && this.heapElements[leftChildPosition][0] < this.heapElements[smallestChildPosition][0]) {
                smallestChildPosition = leftChildPosition;
            }
            if (rightChildPosition < heapSize && this.heapElements[rightChildPosition][0] < this.heapElements[smallestChildPosition][0]) {
                smallestChildPosition = rightChildPosition;
            }

            if (smallestChildPosition === currentPosition) {
                break;
            }

            [this.heapElements[currentPosition], this.heapElements[smallestChildPosition]] =
            [this.heapElements[smallestChildPosition], this.heapElements[currentPosition]];
            currentPosition = smallestChildPosition;
        }
        return minElement;
    }

    get count() {
        return this.heapElements.length;
    }

    get topElement() {
        return this.heapElements[0];
    }
}

const problemOutput = solveProblem();
if (problemOutput !== undefined) console.log(problemOutput);

function solveProblem() {
    const testCaseCount = getNextInteger();
    const primeDivisors = [2n, 3n, 5n];

    const minBigInt = (a, b) => (a < b ? a : b);

    for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
        const targetValue = getNextBigInt();
        const divisionCosts = getMultipleValues(3, BigInt); // a in original

        const baseUnitCost = getNextBigInt(); // d[1] in original
        const smallNumberCosts = new Array(5);
        smallNumberCosts[0] = 0n;
        smallNumberCosts[1] = baseUnitCost;

        // Calculate smallNumberCosts[2]
        smallNumberCosts[2] = minBigInt(baseUnitCost * 2n, divisionCosts[0] + baseUnitCost);

        // Calculate smallNumberCosts[3]
        smallNumberCosts[3] = minBigInt(smallNumberCosts[2] + baseUnitCost, divisionCosts[1] + baseUnitCost);

        // Calculate smallNumberCosts[4]
        const option4_1 = smallNumberCosts[3] + baseUnitCost;
        const option4_2 = smallNumberCosts[2] + divisionCosts[0];
        const option4_3 = baseUnitCost + divisionCosts[2];
        smallNumberCosts[4] = minBigInt(option4_1, minBigInt(option4_2, option4_3));

        const costFrontier = new MinHeapStore();
        costFrontier.insertElement(0n, targetValue);
        const minimumPathCosts = new Map();
        minimumPathCosts.set(targetValue, 0n);

        const processNeighbor = (destinationNumber, transitionCost) => {
            const totalPathCost = currentCost + transitionCost;
            if (!minimumPathCosts.has(destinationNumber) || minimumPathCosts.get(destinationNumber) > totalPathCost) {
                minimumPathCosts.set(destinationNumber, totalPathCost);
                costFrontier.insertElement(totalPathCost, destinationNumber);
            }
        };

        while (true) {
            const [currentCost, currentNumber] = costFrontier.extractMin();

            if (minimumPathCosts.has(currentNumber) && minimumPathCosts.get(currentNumber) < currentCost) {
                continue;
            }

            if (currentNumber === 0n) {
                console.log(currentCost.toString());
                break;
            }

            if (currentNumber < 5n) {
                const costToReachZero = smallNumberCosts[Number(currentNumber)];
                processNeighbor(0n, costToReachZero);
                continue;
            }

            primeDivisors.forEach((divisor, divisorIndex) => {
                const directDivisionCost = divisionCosts[divisorIndex];

                const calculateCostForQuotient = (num, div, targetQuotient) => {
                    const costByAddingRemainder = directDivisionCost + baseUnitCost * (num % div);
                    const costBySubtractingToQuotient = (num - targetQuotient) * baseUnitCost;
                    return minBigInt(costByAddingRemainder, costBySubtractingToQuotient);
                };

                const calculateCostForCeilQuotient = (num, div, targetQuotient) => {
                    const costByAddingToNextMultiple = directDivisionCost + baseUnitCost * (div - (num % div));
                    const costBySubtractingToCeilQuotient = (num - targetQuotient) * baseUnitCost;
                    return minBigInt(costByAddingToNextMultiple, costBySubtractingToCeilQuotient);
                };

                const floorQuotient = currentNumber / divisor; // Integer division
                processNeighbor(floorQuotient, calculateCostForQuotient(currentNumber, divisor, floorQuotient));

                if (currentNumber % divisor !== 0n) {
                    const ceilQuotient = floorQuotient + 1n;
                    processNeighbor(ceilQuotient, calculateCostForCeilQuotient(currentNumber, divisor, ceilQuotient));
                }
            });
        }
    }
}
