class BigValueContainer {
    constructor(internalNumericalRepresentation) {
        if (typeof internalNumericalRepresentation !== 'bigint') {
            throw new Error("Initialization requires a BigInt.");
        }
        this.numericData = internalNumericalRepresentation;
    }

    static parseString(inputString) {
        try {
            return new BigValueContainer(BigInt(inputString));
        } catch (error) {
            throw new Error(`Invalid numeric string: ${inputString}`);
        }
    }

    static fromStandardNumber(stdNum) {
        return new BigValueContainer(BigInt(stdNum));
    }

    addOther(otherContainer) {
        return new BigValueContainer(this.numericData + otherContainer.numericData);
    }

    compareWith(otherContainer) {
        if (this.numericData < otherContainer.numericData) return -1;
        if (this.numericData > otherContainer.numericData) return 1;
        return 0;
    }

    convertToString() {
        return this.numericData.toString();
    }

    isEqualTo(otherContainer) {
        return this.numericData === otherContainer.numericData;
    }
}

class IndexSumTriplet {
    constructor(firstIndex, secondIndex, thirdIndex, totalSumValue) {
        this.idxOne = firstIndex;
        this.idxTwo = secondIndex;
        this.idxThree = thirdIndex;
        this.currentTotal = totalSumValue; // An instance of BigValueContainer
    }

    isLargerThan(anotherTriplet) {
        return this.currentTotal.compareWith(anotherTriplet.currentTotal) > 0;
    }

    generateKey() {
        return `${this.idxOne},${this.idxTwo},${this.idxThree}`;
    }
}

class TopOrderQueue {
    constructor() {
        this.heapContent = [];
    }

    addEntry(entryElement) {
        this.heapContent.push(entryElement);
        this._heapifyUpward(this.heapContent.length - 1);
    }

    extractMax() {
        if (this.checkEmpty()) return undefined;
        const largestElement = this.heapContent[0];
        const lastElement = this.heapContent.pop();
        if (!this.checkEmpty()) {
            this.heapContent[0] = lastElement;
            this._heapifyDownward(0);
        }
        return largestElement;
    }

    checkEmpty() {
        return this.heapContent.length === 0;
    }

    _heapifyUpward(currentPosition) {
        while (currentPosition > 0) {
            const parentPosition = Math.floor((currentPosition - 1) / 2);
            if (this.heapContent[currentPosition].isLargerThan(this.heapContent[parentPosition])) {
                [this.heapContent[currentPosition], this.heapContent[parentPosition]] = [this.heapContent[parentPosition], this.heapContent[currentPosition]];
                currentPosition = parentPosition;
            } else {
                break;
            }
        }
    }

    _heapifyDownward(currentPosition) {
        const lastIndex = this.heapContent.length - 1;
        while (true) {
            const leftChildPosition = 2 * currentPosition + 1;
            const rightChildPosition = 2 * currentPosition + 2;
            let dominantChildPosition = currentPosition;

            if (leftChildPosition <= lastIndex && this.heapContent[leftChildPosition].isLargerThan(this.heapContent[dominantChildPosition])) {
                dominantChildPosition = leftChildPosition;
            }
            if (rightChildPosition <= lastIndex && this.heapContent[rightChildPosition].isLargerThan(this.heapContent[dominantChildPosition])) {
                dominantChildPosition = rightChildPosition;
            }

            if (dominantChildPosition !== currentPosition) {
                [this.heapContent[currentPosition], this.heapContent[dominantChildPosition]] = [this.heapContent[dominantChildPosition], this.heapContent[currentPosition]];
                currentPosition = dominantChildPosition;
            } else {
                break;
            }
        }
    }
}

function calculateTopSums(rawInputText) {
    const inputLines = rawInputText.trim().split('\n');
    
    const [dimX, dimY, dimZ, maxCount] = inputLines[0].split(' ').map(Number);

    const ingredientX = inputLines[1].split(' ').map(BigValueContainer.parseString);
    const ingredientY = inputLines[2].split(' ').map(BigValueContainer.parseString);
    const ingredientZ = inputLines[3].split(' ').map(BigValueContainer.parseString);

    ingredientX.sort((valA, valB) => valB.compareWith(valA));
    ingredientY.sort((valA, valB) => valB.compareWith(valA));
    ingredientZ.sort((valA, valB) => valB.compareWith(valA));

    const finalResults = [];
    const visitedStates = new Set();

    const explorationQueue = new TopOrderQueue();

    const initialCombinedSum = ingredientX[0].addOther(ingredientY[0]).addOther(ingredientZ[0]);
    const initialCombination = new IndexSumTriplet(0, 0, 0, initialCombinedSum);

    explorationQueue.addEntry(initialCombination);
    visitedStates.add(initialCombination.generateKey());

    for (let currentIteration = 0; currentIteration < maxCount; currentIteration++) {
        if (explorationQueue.checkEmpty()) break;

        const currentBestCombination = explorationQueue.extractMax();
        finalResults.push(currentBestCombination.currentTotal.convertToString());

        const { idxOne, idxTwo, idxThree } = currentBestCombination;

        if (idxOne + 1 < dimX) {
            const nextIdxOne = idxOne + 1;
            const newTotalSum = ingredientX[nextIdxOne].addOther(ingredientY[idxTwo]).addOther(ingredientZ[idxThree]);
            const newCombination = new IndexSumTriplet(nextIdxOne, idxTwo, idxThree, newTotalSum);
            const comboKey = newCombination.generateKey();
            if (!visitedStates.has(comboKey)) {
                explorationQueue.addEntry(newCombination);
                visitedStates.add(comboKey);
            }
        }

        if (idxTwo + 1 < dimY) {
            const nextIdxTwo = idxTwo + 1;
            const newTotalSum = ingredientX[idxOne].addOther(ingredientY[nextIdxTwo]).addOther(ingredientZ[idxThree]);
            const newCombination = new IndexSumTriplet(idxOne, nextIdxTwo, idxThree, newTotalSum);
            const comboKey = newCombination.generateKey();
            if (!visitedStates.has(comboKey)) {
                explorationQueue.addEntry(newCombination);
                visitedStates.add(comboKey);
            }
        }

        if (idxThree + 1 < dimZ) {
            const nextIdxThree = idxThree + 1;
            const newTotalSum = ingredientX[idxOne].addOther(ingredientY[idxTwo]).addOther(ingredientZ[nextIdxThree]);
            const newCombination = new IndexSumTriplet(idxOne, idxTwo, nextIdxThree, newTotalSum);
            const comboKey = newCombination.generateKey();
            if (!visitedStates.has(comboKey)) {
                explorationQueue.addEntry(newCombination);
                visitedStates.add(comboKey);
            }
        }
    }

    return finalResults.join('\n');
}

(function mainExecutionBlock() {
    const fileSystemModule = require('fs');
    const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const outputContent = calculateTopSums(inputContent);
    console.log(outputContent);
})();