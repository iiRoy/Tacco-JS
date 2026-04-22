const moduloConstant = 1000000007;

const addMod = (val1, val2) => (val1 + val2) % moduloConstant;
const multiplyMod = (val1, val2) => (val1 * val2) % moduloConstant;

class BinaryPositionTree {
    constructor(sizeLimit) {
        this.storage = new Array(sizeLimit + 1).fill(0);
        this.maximumSize = sizeLimit;
    }

    // Increments value at a 0-indexed position
    incrementValue(position, amount) {
        for (let currentPosition = position + 1; currentPosition <= this.maximumSize; currentPosition += currentPosition & -currentPosition) {
            this.storage[currentPosition] += amount;
        }
    }

    // Fetches sum up to a 0-indexed position (inclusive)
    retrieveSum(position) {
        let accumulatedSum = 0;
        for (let currentPosition = position + 1; currentPosition > 0; currentPosition -= currentPosition & -currentPosition) {
            accumulatedSum += this.storage[currentPosition];
        }
        return accumulatedSum;
    }
}

function processInputData(inputStringContent) {
    inputStringContent = inputStringContent.trim();

    const textLines = inputStringContent.split('\n');
    const parameters = textLines[0].split(' ').map(Number);
    const itemQuantity = parameters[0]; // N
    const repetitionFactor = parameters[1]; // K

    const originalNumbers = textLines[1].split(' ').map(Number); // arrA

    // Coordinate compression
    const distinctSorted = [...new Set(originalNumbers)].sort((a, b) => a - b);
    const rankMapping = new Map();
    distinctSorted.forEach((value, index) => rankMapping.set(value, index));
    const rankedNumbers = originalNumbers.map(value => rankMapping.get(value));

    const highestRank = distinctSorted.length;

    // Calculate counts for elements smaller than current and appearing after it (arrIkou)
    const subsequentSmallerCounts = new Array(itemQuantity).fill(0);
    const treeForSubsequent = new BinaryPositionTree(highestRank);
    for (let i = itemQuantity - 1; i >= 0; --i) {
        const currentRankValue = rankedNumbers[i];
        subsequentSmallerCounts[i] = treeForSubsequent.retrieveSum(currentRankValue - 1);
        treeForSubsequent.incrementValue(currentRankValue, 1);
    }

    // Calculate total counts for elements smaller than current (arrZentai)
    const overallSmallerCounts = new Array(itemQuantity).fill(0);
    const treeForAll = new BinaryPositionTree(highestRank);
    for (let i = 0; i < itemQuantity; ++i) {
        treeForAll.incrementValue(rankedNumbers[i], 1);
    }
    for (let i = 0; i < itemQuantity; ++i) {
        const currentRankValue = rankedNumbers[i];
        overallSmallerCounts[i] = treeForAll.retrieveSum(currentRankValue - 1);
    }

    let finalAccumulatedResult = 0;

    const modularRepetitionFactor = repetitionFactor % moduloConstant;
    const modularCombinationFactor = Math.floor(repetitionFactor * (repetitionFactor - 1) / 2) % moduloConstant;

    for (let i = 0; i < itemQuantity; ++i) {
        let elementContribution = 0;

        const componentOne = multiplyMod(subsequentSmallerCounts[i], modularRepetitionFactor);
        elementContribution = addMod(elementContribution, componentOne);

        const componentTwo = multiplyMod(overallSmallerCounts[i], modularCombinationFactor);
        elementContribution = addMod(elementContribution, componentTwo);
        
        finalAccumulatedResult = addMod(finalAccumulatedResult, elementContribution);
    }

    console.log(finalAccumulatedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));