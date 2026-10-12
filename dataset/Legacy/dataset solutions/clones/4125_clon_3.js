var InputParserFactory = (function() {
    function createParser(sourceContent) {
        return new InputParser(sourceContent);
    }

    class InputParser {
        constructor(rawSource) {
            this.sourceLines = rawSource.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readNextItem(asString) {
            let currentLineData = this.sourceLines[this.currentLineIndex];
            
            if (typeof currentLineData === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineData.split(" ").reverse();
            }

            let item = this.sourceLines[this.currentLineIndex].pop();

            if (this.sourceLines[this.currentLineIndex].length === 0) {
                this.currentLineIndex++;
            }
            
            return asString ? item : +item;
        }

        readLineAsNumbers(asString) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const splitItems = lineContent.split(" ");
            return asString ? splitItems : splitItems.map(val => +val);
        }

        readMatrix(count, asString) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count;
            const parsedMatrix = matrixRows.map(row => row.split(" "));
            return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
        }

        readRawLines(count, asString) {
            const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count;
            return asString ? rawLines : rawLines.map(val => +val);
        }
    }

    return createParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const MAX_PRIME_CHECK_LIMIT = 100000;
    const numQueries = inputReader.readNextItem();

    const cumulativeSimilarPrimes = generateSimilarPrimeCounts(MAX_PRIME_CHECK_LIMIT);

    const queryResults = [];
    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        const queryRange = inputReader.readLineAsNumbers();
        const lowerBound = queryRange[0];
        const upperBound = queryRange[1];
        
        const countInRange = cumulativeSimilarPrimes[upperBound] - cumulativeSimilarPrimes[lowerBound - 1];
        queryResults.push(countInRange);
    }

    return queryResults.join("\n");
}

function generateSimilarPrimeCounts(limit) {
    const primeFlags = Array(limit + 1).fill(true);
    const similarPrimeCounts = Array(limit + 1).fill(0);

    primeFlags[0] = primeFlags[1] = false;

    for (let currentNum = 2; currentNum <= limit; currentNum++) {
        similarPrimeCounts[currentNum] = similarPrimeCounts[currentNum - 1];

        if (primeFlags[currentNum]) {
            for (let multipleNum = currentNum * 2; multipleNum <= limit; multipleNum += currentNum) {
                primeFlags[multipleNum] = false;
            }

            const halfPlusOne = (currentNum + 1) / 2;
            if (Number.isInteger(halfPlusOne) && primeFlags[halfPlusOne]) {
                similarPrimeCounts[currentNum]++;
            }
        }
    }
    return similarPrimeCounts;
}
