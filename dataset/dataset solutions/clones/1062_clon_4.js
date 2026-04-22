class FenwickTree {
    constructor(sizeOfTree) {
        this.bitArr = new Array(sizeOfTree + 1).fill(0);
        this.bitLimit = sizeOfTree;
    }

    adjust(indexVal, incrementAmount) {
        let currentIdx = indexVal + 1;
        while (currentIdx <= this.bitLimit) {
            this.bitArr[currentIdx] += incrementAmount;
            currentIdx += currentIdx & (-currentIdx);
        }
    }

    retrieveSum(indexVal) {
        let cumulativeSum = 0;
        let currentIdx = indexVal + 1;
        while (currentIdx > 0) {
            cumulativeSum += this.bitArr[currentIdx];
            currentIdx -= currentIdx & (-currentIdx);
        }
        return cumulativeSum;
    }
}

(function processData() {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const contentLines = fileContent.trim().split('\n');

    const arrayLength = Number(contentLines.shift());
    const sourceNumbers = contentLines.shift().split(' ').map(Number);

    const distinctSortedValues = [...new Set(sourceNumbers)].sort((a, b) => a - b);
    const valueRankMap = new Map();
    distinctSortedValues.forEach((val, index) => {
        valueRankMap.set(val, index);
    });

    const rankedSourceNumbers = sourceNumbers.map(num => valueRankMap.get(num));

    const highestRank = distinctSortedValues.length - 1;
    const bitStructure = new FenwickTree(highestRank + 1);

    let totalInversionCount = 0;

    for (let currentRankedValue of rankedSourceNumbers) {
        totalInversionCount += bitStructure.retrieveSum(highestRank) - bitStructure.retrieveSum(currentRankedValue);

        bitStructure.adjust(currentRankedValue, 1);
    }

    console.log(totalInversionCount);
})();