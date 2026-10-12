const InputParserFactory = (() => {
    const convertToNumber = (value) => +value;

    class InputParser {
        constructor(rawInput) {
            this.sourceLines = rawInput.trim().split("\n");
            this.linePointer = 0;
            this.currentLineSegments = [];
        }

        _prepareCurrentLineSegments() {
            if (this.currentLineSegments.length === 0 && this.linePointer < this.sourceLines.length) {
                this.currentLineSegments = this.sourceLines[this.linePointer].split(" ").reverse();
            }
        }

        extractToken(returnAsString = false) {
            this._prepareCurrentLineSegments();
            const extracted = this.currentLineSegments.pop();
            if (this.currentLineSegments.length === 0) {
                this.linePointer++;
            }
            return returnAsString ? extracted : convertToNumber(extracted);
        }

        fetchLineTokens(returnAsStrings = false) {
            if (this.linePointer >= this.sourceLines.length) {
                return [];
            }
            const lineData = this.sourceLines[this.linePointer++];
            const tokens = lineData.split(" ");
            return returnAsStrings ? tokens : tokens.map(convertToNumber);
        }

        fetchMatrix(rowCount, returnAsStrings = false) {
            const collectedRows = [];
            for (let i = 0; i < rowCount; i++) {
                if (this.linePointer >= this.sourceLines.length) break;
                const rowData = this.sourceLines[this.linePointer++];
                const rowTokens = rowData.split(" ");
                collectedRows.push(returnAsStrings ? rowTokens : rowTokens.map(convertToNumber));
            }
            return collectedRows;
        }

        fetchRawLines(rowCount, returnAsStrings = false) {
            const lines = this.sourceLines.slice(this.linePointer, this.linePointer + rowCount);
            this.linePointer += rowCount;
            return returnAsStrings ? lines : lines.map(convertToNumber);
        }
    }

    return (inputString) => new InputParser(inputString);
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processSolution());

function processSolution() {
    const inputString = inputReader.extractToken(true);
    const targetKeyword = "keyence";
    const keywordLength = targetKeyword.length;

    const checkPatternMatch = (str, prefixLength) => {
        const prefix = targetKeyword.slice(0, prefixLength);
        const suffix = targetKeyword.slice(prefixLength);
        const regexPattern = new RegExp(`^${prefix}.*${suffix}$`);
        return regexPattern.test(str);
    };

    for (let splitIndex = 0; splitIndex <= keywordLength; splitIndex++) {
        if (checkPatternMatch(inputString, splitIndex)) {
            return "YES";
        }
    }

    return "NO";
}
