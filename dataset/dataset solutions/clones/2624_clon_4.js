class InputSource {
    #lines;
    #lineIndex = 0;
    #currentLineTokens = [];
    #currentTokenIndex = 0;

    constructor(sourceContent) {
        this.#lines = sourceContent.trim().split("\n");
    }

    fetchToken(asString = false) {
        if (this.#currentTokenIndex >= this.#currentLineTokens.length) {
            if (this.#lineIndex >= this.#lines.length) {
                return undefined;
            }
            this.#currentLineTokens = this.#lines[this.#lineIndex++].split(" ").reverse();
            this.#currentTokenIndex = 0;
        }
        const token = this.#currentLineTokens[this.#currentTokenIndex++];
        return asString ? token : Number(token);
    }

    fetchLine(asStrings = false) {
        if (this.#lineIndex >= this.#lines.length) {
            return undefined;
        }
        const lineTokens = this.#lines[this.#lineIndex++].split(" ");
        return asStrings ? lineTokens : lineTokens.map(Number);
    }

    fetchMatrix(count, asStrings = false) {
        if (this.#lineIndex + count > this.#lines.length) {
            return undefined;
        }
        const matrixData = this.#lines.slice(this.#lineIndex, this.#lineIndex + count).map(line => line.split(" "));
        this.#lineIndex += count;
        return asStrings ? matrixData : matrixData.map(row => row.map(Number));
    }

    fetchRaw(count, asNumbers = false) {
        if (this.#lineIndex + count > this.#lines.length) {
            return undefined;
        }
        const rawData = this.#lines.slice(this.#lineIndex, this.#lineIndex + count);
        this.#lineIndex += count;
        return asNumbers ? rawData.map(Number) : rawData;
    }
}

const acquireInput = (sourceContent) => {
    const processor = new InputSource(sourceContent);
    return {
        grabToken: (asStr) => processor.fetchToken(asStr),
        grabLine: (asStrs) => processor.fetchLine(asStrs),
        grabMatrix: (num, asStrs) => processor.fetchMatrix(num, asStrs),
        grabRaw: (num, asNums) => processor.fetchRaw(num, asNums)
    };
};

const inputReader = acquireInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function processData() {
    const dimension = inputReader.grabToken();

    if (dimension <= 1) {
        return "";
    }

    const outputLines = Array.from({ length: dimension - 1 }, (_, rowIdx) => {
        return Array.from({ length: dimension - 1 - rowIdx }, (_, colOffset) => {
            const colIdx = colOffset + rowIdx + 1;
            const xorVal = rowIdx ^ colIdx;
            return Math.log2(xorVal & -xorVal) + 1;
        }).join(" ");
    }).join("\n");

    return outputLines;
}

console.log(processData());
