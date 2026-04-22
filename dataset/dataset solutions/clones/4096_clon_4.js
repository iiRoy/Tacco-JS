class DataStreamHandler {
    #inputLines;
    #currentLineIndex;

    constructor(fullInputText) {
        this.#inputLines = fullInputText.trim().split('\n');
        this.#currentLineIndex = 0;
    }

    takeLastToken(returnAsText = false) {
        if (this.#currentLineIndex >= this.#inputLines.length) {
            return undefined;
        }
        let currentLineContent = this.#inputLines[this.#currentLineIndex];
        if (typeof currentLineContent === 'string') {
            this.#inputLines[this.#currentLineIndex] = currentLineContent.split(' ').reverse();
            currentLineContent = this.#inputLines[this.#currentLineIndex];
        }
        let extractedValue = currentLineContent.pop();
        if (currentLineContent.length === 0) {
            this.#currentLineIndex++;
        }
        return returnAsText ? extractedValue : Number(extractedValue);
    }

    takeEntireLine(returnAsText = false) {
        if (this.#currentLineIndex >= this.#inputLines.length) {
            return [];
        }
        let lineData = this.#inputLines[this.#currentLineIndex++];
        let tokens = String(lineData).split(' ');
        return returnAsText ? tokens : tokens.map(Number);
    }

    takeMatrix(numRows, returnAsText = false) {
        let collectedRows = [];
        for (let i = 0; i < numRows; i++) {
            if (this.#currentLineIndex >= this.#inputLines.length) break;
            let lineData = this.#inputLines[this.#currentLineIndex++];
            collectedRows.push(
                returnAsText ? String(lineData).split(' ') : String(lineData).split(' ').map(Number)
            );
        }
        return collectedRows;
    }

    takeBlock(numRows, returnAsText = false) {
        let collected = [];
        for (let i = 0; i < numRows; i++) {
            if (this.#currentLineIndex >= this.#inputLines.length) break;
            let lineData = this.#inputLines[this.#currentLineIndex++];
            collected.push(returnAsText ? String(lineData) : Number(lineData));
        }
        return collected;
    }
}

var dataSource = new DataStreamHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateRange());

function calculateRange() {
    const startOffset = dataSource.takeLastToken() - 1;
    const numberSequence = dataSource.takeEntireLine();

    if (numberSequence[startOffset] !== 2) {
        return -1;
    }

    const recursiveSolver = (currentIdx, minimumVal, maximumVal) => {
        if (currentIdx < 0) {
            return `${minimumVal} ${maximumVal}`;
        }

        const currentArrayElement = numberSequence[currentIdx];

        if (currentArrayElement > maximumVal) {
            return -1;
        }

        const updatedMinimum = currentArrayElement * Math.ceil(minimumVal / currentArrayElement);
        const updatedMaximum = Math.max(
            (currentArrayElement * Math.ceil(maximumVal / currentArrayElement)),
            updatedMinimum + currentArrayElement
        ) - 1;

        return recursiveSolver(currentIdx - 1, updatedMinimum, updatedMaximum);
    };

    return recursiveSolver(startOffset - 1, 2, 3);
}