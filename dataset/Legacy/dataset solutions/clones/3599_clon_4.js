class FenwickTree {
    constructor(size) {
        this.tree = new Array(size + 1).fill(0);
        this.size = size;
    }

    update(index, value) {
        for (; index <= this.size; index += index & -index) {
            this.tree[index] += value;
        }
    }

    query(index) {
        let sum = 0;
        for (; index > 0; index -= index & -index) {
            sum += this.tree[index];
        }
        return sum;
    }
}

function countInversions(dataArray) {
    if (dataArray.length === 0) return 0;

    const uniqueSortedValues = [...new Set(dataArray)].sort((a, b) => a - b);
    const valueToRankMap = new Map();
    uniqueSortedValues.forEach((val, idx) => valueToRankMap.set(val, idx + 1));

    const maximumRank = uniqueSortedValues.length;
    const bitStructure = new FenwickTree(maximumRank);
    let totalInversions = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const currentElementRank = valueToRankMap.get(dataArray[i]);
        totalInversions += bitStructure.query(maximumRank) - bitStructure.query(currentElementRank);
        bitStructure.update(currentElementRank, 1);
    }

    return totalInversions;
}

class InputReader {
    constructor(sourceString) {
        this.lineBuffer = sourceString.split('\n');
        this.currentLineWords = [];
        this.currentWordCursor = 0;
        this.lineCursor = 0;
    }

    fetchAtom(returnAsString) {
        if (this.currentWordCursor === 0) {
            if (this.lineCursor >= this.lineBuffer.length) {
                return undefined;
            }
            const currentLineContent = this.lineBuffer[this.lineCursor];
            this.currentLineWords = currentLineContent.split(' ');
            this.currentWordCursor = this.currentLineWords.length;
        }

        this.currentWordCursor--;
        const extractedWord = this.currentLineWords[this.currentWordCursor];

        if (this.currentWordCursor === 0) {
            this.lineCursor++;
            this.currentLineWords = [];
        }

        return returnAsString ? extractedWord : Number(extractedWord);
    }

    obtainLine(returnAsString) {
        if (this.lineCursor >= this.lineBuffer.length) {
            return undefined;
        }
        const lineContent = this.lineBuffer[this.lineCursor];
        this.lineCursor++;
        this.currentLineWords = [];
        this.currentWordCursor = 0;

        const wordsInLine = lineContent.split(' ');
        return returnAsString ? wordsInLine : wordsInLine.map(Number);
    }

    acquireMultipleLines(count, returnAsString) {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            collectedLines.push(this.obtainLine(returnAsString));
        }
        return collectedLines;
    }
}

const inputSource = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function processMain() {
    const elementCount = inputSource.fetchAtom();
    const dataElements = inputSource.obtainLine();

    if (elementCount <= 2) {
        return Math.max(...dataElements);
    }

    const targetInversionCount = Math.floor(elementCount * (elementCount + 1) / 4 + 1);

    let lowerBound = 2;
    let upperBound = 1e9 + 1;

    while (lowerBound < upperBound) {
        const midValue = Math.floor((lowerBound + upperBound) / 2);

        const transformedArray = dataElements.reduce((accumulator, currentElement) => {
            const lastValue = accumulator[accumulator.length - 1];
            accumulator.push(lastValue + (currentElement < midValue ? -1 : 1));
            return accumulator;
        }, [0]);

        const currentInversions = countInversions(transformedArray);

        if (currentInversions < targetInversionCount) {
            lowerBound = midValue + 1;
        } else {
            upperBound = midValue;
        }
    }

    return lowerBound - 1;
}

console.log(processMain());
