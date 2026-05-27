class FenwickTree {
    constructor(treeCapacity) {
        this.treeData = new Array(treeCapacity + 1).fill(0);
        this.treeSize = treeCapacity;
    }

    updateValue(elementIndex, deltaAmount) {
        for (; elementIndex <= this.treeSize; elementIndex += elementIndex & -elementIndex) {
            this.treeData[elementIndex] += deltaAmount;
        }
    }

    querySum(elementIndex) {
        let accumulatedSum = 0;
        for (; elementIndex > 0; elementIndex -= elementIndex & -elementIndex) {
            accumulatedSum += this.treeData[elementIndex];
        }
        return accumulatedSum;
    }
}

function processInput(rawText) {
    const lines = rawText.split("\n");
    const firstLineParts = lines[0].split(" ");
    const arrayLength = parseInt(firstLineParts[0]);
    const repeatCount = parseInt(firstLineParts[1]);
    const sourceArray = lines[1].split(" ").map(valStr => parseInt(valStr));

    const uniqueSortedValues = [...new Set(sourceArray)].sort((a, b) => a - b);
    const valueToCoordinateMap = new Map();
    uniqueSortedValues.forEach((val, index) => valueToCoordinateMap.set(val, index + 1));
    const compressedValues = sourceArray.map(val => valueToCoordinateMap.get(val));
    const maxCoordinate = uniqueSortedValues.length;

    const modulus = Math.pow(10, 9) + 7;

    let inversionsWithinBlock = 0;
    const ftForWithin = new FenwickTree(maxCoordinate);
    for (let idx = 0; idx < arrayLength; idx++) {
        const currentCompressedVal = compressedValues[idx];
        const greaterCount = ftForWithin.querySum(maxCoordinate) - ftForWithin.querySum(currentCompressedVal);
        inversionsWithinBlock = (inversionsWithinBlock + greaterCount) % modulus;
        ftForWithin.updateValue(currentCompressedVal, 1);
    }

    let inversionsBetweenBlocks = 0;
    const ftForBetween = new FenwickTree(maxCoordinate);
    for (const val of compressedValues) {
        ftForBetween.updateValue(val, 1);
    }
    for (let idx = 0; idx < arrayLength; idx++) {
        const currentCompressedVal = compressedValues[idx];
        const smallerCount = ftForBetween.querySum(currentCompressedVal - 1);
        inversionsBetweenBlocks = (inversionsBetweenBlocks + smallerCount) % modulus;
    }

    const bigModulus = BigInt(modulus);

    const term1 = (BigInt(repeatCount) * BigInt(inversionsWithinBlock)) % bigModulus;

    const numBlockPairs = (BigInt(repeatCount) * BigInt(repeatCount - 1) / BigInt(2)) % bigModulus;
    const term2 = (numBlockPairs * BigInt(inversionsBetweenBlocks)) % bigModulus;

    const totalInversions = (term1 + term2) % bigModulus;

    console.log(Number(totalInversions));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
