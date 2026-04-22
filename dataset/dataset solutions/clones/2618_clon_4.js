class BinaryIndexedTree {
    constructor(dimension) {
        this.dataArray = new Array(dimension + 1).fill(0);
        this.maximumIndex = dimension;
    }

    adjustValue(index, quantity) {
        for (let k = index; k <= this.maximumIndex; k += k & -k) {
            this.dataArray[k] += quantity;
        }
    }

    getPrefixSum(index) {
        let currentSum = 0;
        for (let k = index; k > 0; k -= k & -k) {
            currentSum += this.dataArray[k];
        }
        return currentSum;
    }
}

function processData(incomingText) {
    const PRIME_MODULUS = 1000000007;
    const HALF_MODULUS_INV = 500000004;

    const lines = incomingText.split("\n");
    const parameters = lines[0].split(" ").map(Number);
    const valueCount = parameters[0];
    const repetitionFactor = parameters[1];
    const numericSequence = lines[1].split(" ").map(Number);

    const distinctValues = Array.from(new Set(numericSequence));
    distinctValues.sort((a, b) => a - b);
    const valueToRankMap = new Map();
    distinctValues.forEach((val, idx) => valueToRankMap.set(val, idx + 1));

    const compressedSequence = numericSequence.map(val => valueToRankMap.get(val));
    const maxRank = distinctValues.length;

    let summationOne = 0; 
    let summationTwo = 0; 

    const treeForS1 = new BinaryIndexedTree(maxRank);
    for (let currentElementIdx = valueCount - 1; currentElementIdx >= 0; --currentElementIdx) {
        const currentRank = compressedSequence[currentElementIdx];
        summationOne = (summationOne + treeForS1.getPrefixSum(currentRank - 1)) % PRIME_MODULUS;
        treeForS1.adjustValue(currentRank, 1);
    }

    for (let currentElementIdx = 0; currentElementIdx < valueCount; ++currentElementIdx) {
        const currentRank = compressedSequence[currentElementIdx];
        summationTwo = (summationTwo + currentRank - 1) % PRIME_MODULUS;
    }
    
    let intermediateResultOne = (summationOne * repetitionFactor) % PRIME_MODULUS;
    
    let intermediateResultTwoFactor = (repetitionFactor * (repetitionFactor - 1)) % PRIME_MODULUS;
    intermediateResultTwoFactor = (intermediateResultTwoFactor * HALF_MODULUS_INV) % PRIME_MODULUS;
    let intermediateResultTwo = (summationTwo * intermediateResultTwoFactor) % PRIME_MODULUS;

    let finalAccumulation = (intermediateResultOne + intermediateResultTwo) % PRIME_MODULUS;

    console.log(finalAccumulation);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));