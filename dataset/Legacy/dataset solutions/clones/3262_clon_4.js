const process = require("process");
const fileSystem = require("fs");

class MaxPriorityQueue {
    constructor() {
        this.heapElements = [];
    }

    size() {
        return this.heapElements.length;
    }

    insert(priorityValue, dataPayload) {
        this.heapElements.push({ priority: priorityValue, value: dataPayload });
        this.ascendElement();
    }

    extractMax() {
        const currentSize = this.size();
        if (currentSize === 0) return null;
        if (currentSize === 1) return this.heapElements.pop().value;

        const maxPayload = this.heapElements[0].value;
        this.heapElements[0] = this.heapElements.pop();
        this.descendElement();
        return maxPayload;
    }

    ascendElement() {
        let currentIdx = this.size() - 1;
        const currentElement = this.heapElements[currentIdx];
        while (currentIdx > 0) {
            let parentIdx = Math.floor((currentIdx - 1) / 2);
            let parentElement = this.heapElements[parentIdx];

            if (currentElement.priority <= parentElement.priority) break;

            this.heapElements[parentIdx] = currentElement;
            this.heapElements[currentIdx] = parentElement;
            currentIdx = parentIdx;
        }
    }

    descendElement() {
        let currentIdx = 0;
        const totalLength = this.size();
        const currentElement = this.heapElements[0];

        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let leftChildData, rightChildData;
            let swapTargetIdx = null;

            if (leftChildIdx < totalLength) {
                leftChildData = this.heapElements[leftChildIdx];
                if (leftChildData.priority > currentElement.priority) {
                    swapTargetIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < totalLength) {
                rightChildData = this.heapElements[rightChildIdx];
                if (
                    (swapTargetIdx === null && rightChildData.priority > currentElement.priority) ||
                    (swapTargetIdx !== null && rightChildData.priority > leftChildData.priority)
                ) {
                    swapTargetIdx = rightChildIdx;
                }
            }

            if (swapTargetIdx === null) break;

            this.heapElements[currentIdx] = this.heapElements[swapTargetIdx];
            this.heapElements[swapTargetIdx] = currentElement;
            currentIdx = swapTargetIdx;
        }
    }
}

class SolutionProcessor {
    execute() {
        const allInputLines = fileSystem.readFileSync("/dev/stdin", "utf8").split('\n');
        let currentLinePointer = 0;

        const [totalItems, initialSelectionCount] = allInputLines[currentLinePointer++].split(' ').map(Number);
        const itemData = [];
        for (let i = 0; i < totalItems; i++) {
            itemData.push(allInputLines[currentLinePointer++].split(' ').map(Number));
        }

        itemData.sort((a, b) => b[1] - a[1]); // Sort by value in descending order

        const initialSelectedItems = itemData.slice(0, initialSelectionCount);

        const typeFrequencyMap = new Map();
        let currentSumOfValues = 0;
        const uniqueTypeSet = new Set();

        for (const item of initialSelectedItems) {
            const itemType = item[0];
            const itemValue = item[1];
            typeFrequencyMap.set(itemType, (typeFrequencyMap.get(itemType) || 0) + 1);
            uniqueTypeSet.add(itemType);
            currentSumOfValues += itemValue;
        }

        const calculatedScores = [];
        calculatedScores[uniqueTypeSet.size] = currentSumOfValues + uniqueTypeSet.size * uniqueTypeSet.size;

        const replaceableItemQueue = new MaxPriorityQueue();

        for (const item of initialSelectedItems) {
            if (typeFrequencyMap.get(item[0]) > 1) {
                replaceableItemQueue.insert(item[1], item);
            }
        }

        let dataItemIndex = initialSelectionCount;

        while (replaceableItemQueue.size() > 0 && dataItemIndex < totalItems) {
            let itemToConsiderForReplacement = replaceableItemQueue.extractMax();

            // Skip items whose type is no longer duplicated
            while (itemToConsiderForReplacement && typeFrequencyMap.get(itemToConsiderForReplacement[0]) < 2) {
                if (replaceableItemQueue.size() === 0) {
                    itemToConsiderForReplacement = null;
                    break;
                }
                itemToConsiderForReplacement = replaceableItemQueue.extractMax();
            }
            if (!itemToConsiderForReplacement) {
                break;
            }

            typeFrequencyMap.set(itemToConsiderForReplacement[0], typeFrequencyMap.get(itemToConsiderForReplacement[0]) - 1);

            let replacementFound = false;
            while (dataItemIndex < totalItems) {
                const potentialNewItem = itemData[dataItemIndex];
                dataItemIndex++;

                if (!typeFrequencyMap.has(potentialNewItem[0])) {
                    typeFrequencyMap.set(potentialNewItem[0], 1);
                    uniqueTypeSet.add(potentialNewItem[0]);

                    const previousKindCount = uniqueTypeSet.size - 1;
                    const previousSum = calculatedScores[previousKindCount] - previousKindCount * previousKindCount;
                    currentSumOfValues = previousSum + potentialNewItem[1] - itemToConsiderForReplacement[1];

                    calculatedScores[uniqueTypeSet.size] = currentSumOfValues + uniqueTypeSet.size * uniqueTypeSet.size;

                    replaceableItemQueue.insert(potentialNewItem[1], potentialNewItem);

                    replacementFound = true;
                    break;
                }
            }
        }

        let overallMaxScore = 0;
        for (let i = 0; i < calculatedScores.length; i++) {
            if (calculatedScores[i] !== undefined) {
                overallMaxScore = Math.max(overallMaxScore, calculatedScores[i]);
            }
        }
        console.log(overallMaxScore);
    }
}

(new SolutionProcessor()).execute();
