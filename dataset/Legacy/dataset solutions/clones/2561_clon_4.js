let receivedInput = '';

process.stdin.on('data', (dataChunk) => {
    receivedInput += dataChunk.toString();
});

process.stdin.on('end', () => {
    processInputAndCalculate(receivedInput);
});

// A node structure for the binary search tree
class NumericEntry {
    constructor(val) {
        this.valueContainer = val;
        this.occurrenceCount = 1; // Tracks how many times this value appears
        this.smallerChild = null; // Left child in BST
        this.largerChild = null;  // Right child in BST
    }
}

// A binary search tree acting as a min-priority queue
class SortedNumberRegistry {
    constructor() {
        this.topNode = null;
        this.totalElements = 0; // Overall count of all numbers, including duplicates
    }

    // Inserts a number into the registry
    addEntry(num) {
        this.totalElements++;
        if (!this.topNode) {
            this.topNode = new NumericEntry(num);
            return;
        }

        let currentNode = this.topNode;
        while (true) {
            if (num < currentNode.valueContainer) {
                if (!currentNode.smallerChild) {
                    currentNode.smallerChild = new NumericEntry(num);
                    return;
                }
                currentNode = currentNode.smallerChild;
            } else if (num > currentNode.valueContainer) {
                if (!currentNode.largerChild) {
                    currentNode.largerChild = new NumericEntry(num);
                    return;
                }
                currentNode = currentNode.largerChild;
            } else { // num === currentNode.valueContainer
                currentNode.occurrenceCount++;
                return;
            }
        }
    }

    // Retrieves the smallest number without removing it
    findSmallest() {
        if (!this.topNode) return undefined;
        let navigator = this.topNode;
        while (navigator.smallerChild) {
            navigator = navigator.smallerChild;
        }
        return navigator.valueContainer;
    }

    // Removes and returns the smallest number from the registry
    extractSmallest() {
        if (!this.topNode) return undefined;
        this.totalElements--;

        let parentOfSmallest = null;
        let smallestCandidate = this.topNode;
        while (smallestCandidate.smallerChild) {
            parentOfSmallest = smallestCandidate;
            smallestCandidate = smallestCandidate.smallerChild;
        }

        if (smallestCandidate.occurrenceCount > 1) {
            smallestCandidate.occurrenceCount--;
            return smallestCandidate.valueContainer;
        }

        // Smallest node has occurrenceCount 1, so it must be physically removed
        const actualSmallestValue = smallestCandidate.valueContainer;

        if (!parentOfSmallest) { // The root is the smallest
            this.topNode = smallestCandidate.largerChild; // Replace root with its right child (if any)
        } else {
            parentOfSmallest.smallerChild = smallestCandidate.largerChild; // Replace parent's left child with current's right child
        }
        return actualSmallestValue;
    }

    // Helper function for recursively summing all values
    recursivelySum(node) {
        if (!node) return 0;
        let currentSum = 0;
        currentSum += node.valueContainer * node.occurrenceCount;
        currentSum += this.recursivelySum(node.smallerChild);
        currentSum += this.recursivelySum(node.largerChild);
        return currentSum;
    }

    // Calculates the total sum of all numbers in the registry
    calculateAllValuesSum() {
        return this.recursivelySum(this.topNode);
    }

    // Checks if the registry is empty
    isEmpty() {
        return this.totalElements === 0;
    }
}

// Main function to orchestrate the processing and calculations
function processInputAndCalculate(rawData) {
    const dataParts = rawData.trim().split(/\s+/g);
    let currentPartIndex = 0;

    const retrieveNextNumber = () => parseInt(dataParts[currentPartIndex++], 10);

    const initialQuantity = retrieveNextNumber();
    const operationIterations = retrieveNextNumber();

    const collectionOfNumbers = new SortedNumberRegistry();

    // Populate the registry with initial numbers
    for (let counter = 0; counter < initialQuantity; counter++) {
        const numberToInsert = retrieveNextNumber();
        collectionOfNumbers.addEntry(numberToInsert);
    }

    // Perform halving operations
    for (let opCounter = 0; opCounter < operationIterations; opCounter++) {
        const currentSmallest = collectionOfNumbers.findSmallest();
        collectionOfNumbers.extractSmallest();
        collectionOfNumbers.addEntry(Math.floor(currentSmallest / 2));
    }

    // Output the final sum of all remaining numbers
    const finalAccumulatedValue = collectionOfNumbers.calculateAllValuesSum();
    console.log(finalAccumulatedValue);
}