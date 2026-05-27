class InputParser {
    constructor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    _extractAndParseValue(returnAsString) {
        let lineContent = this.sourceLines[this.currentLineIndex];
        if (typeof lineContent === "string") {
            this.sourceLines[this.currentLineIndex] = lineContent.split(" ").reverse();
        }
        let extractedValue = this.sourceLines[this.currentLineIndex].pop();
        if (!this.sourceLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }
        return returnAsString ? extractedValue : +extractedValue;
    }

    readAtom(asString = false) {
        return this._extractAndParseValue(asString);
    }

    readLine(asStrings = false) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const values = lineContent.split(" ");
        return asStrings ? values : values.map(val => +val);
    }

    readMatrix(numRows, asStrings = false) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        return asStrings ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(val => +val));
    }

    readRows(numRows, asStrings = false) {
        const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        return asStrings ? rows : rows.map(val => +val);
    }
}

const createInputReader = (sourceString) => new InputParser(sourceString);

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(main());

function calculateProbabilities(numCoins, coinProbabilities) {
    if (numCoins === 0) {
        return [1]; // Probability of 0 heads is 1 for 0 coins
    }

    // currentProbabilities[k] will store P(k heads after 'current' coinIndex coins)
    let currentProbabilities = [1 - coinProbabilities[0], coinProbabilities[0]];

    for (let coinIndex = 1; coinIndex < numCoins; coinIndex++) {
        const currentCoinSuccessProb = coinProbabilities[coinIndex];
        const currentCoinFailureProb = 1 - currentCoinSuccessProb;

        // Calculate P(coinIndex + 1 heads after coinIndex + 1 coins)
        // This is P(coinIndex heads after coinIndex coins) * P(success on current coin)
        // This implicitly extends the array to accommodate the new maximum number of heads
        currentProbabilities[coinIndex + 1] = currentProbabilities[coinIndex] * currentCoinSuccessProb;

        // Update probabilities for 1 to coinIndex heads
        // Iterate downwards to use values from the previous iteration before they are overwritten
        for (let headCount = coinIndex; headCount > 0; headCount--) {
            currentProbabilities[headCount] =
                currentProbabilities[headCount - 1] * currentCoinSuccessProb +
                currentProbabilities[headCount] * currentCoinFailureProb;
        }

        // Update probability for 0 heads
        // This is P(0 heads after coinIndex coins) * P(failure on current coin)
        currentProbabilities[0] = currentProbabilities[0] * currentCoinFailureProb;
    }
    return currentProbabilities;
}

function main() {
    const numCoins = inputReader.readAtom();
    const coinProbabilities = inputReader.readLine();

    if (numCoins === 0) {
        return 0;
    }

    const finalProbabilities = calculateProbabilities(numCoins, coinProbabilities);

    let totalProbability = 0;
    const minHeadsForSuccess = Math.ceil((numCoins + 1) / 2);

    for (let headCount = minHeadsForSuccess; headCount <= numCoins; headCount++) {
        totalProbability += finalProbabilities[headCount];
    }

    return totalProbability;
}
