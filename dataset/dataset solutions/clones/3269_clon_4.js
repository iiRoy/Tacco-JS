const createInputProcessor = (function() {
    function InputProcessor(rawContent) {
        this._lines = rawContent.trim().split("\n");
        this._lineIndex = 0;
        this._currentLineTokens = [];
        this._tokenIndex = 0;
    }

    InputProcessor.prototype.extractItem = function(returnAsString) {
        if (this._tokenIndex >= this._currentLineTokens.length) {
            if (this._lineIndex >= this._lines.length) {
                return undefined;
            }
            this._currentLineTokens = this._lines[this._lineIndex].split(" ");
            this._tokenIndex = 0;
        }

        const value = this._currentLineTokens[this._tokenIndex];
        this._tokenIndex++;

        if (this._tokenIndex >= this._currentLineTokens.length) {
            this._lineIndex++;
            this._currentLineTokens = [];
            this._tokenIndex = 0;
        }

        return returnAsString ? value : Number(value);
    };

    InputProcessor.prototype.fetchLine = function(returnAsString) {
        if (this._lineIndex >= this._lines.length) {
            return undefined;
        }
        const lineContent = this._lines[this._lineIndex++];
        const tokens = lineContent.split(" ");
        return returnAsString ? tokens : tokens.map(Number);
    };

    InputProcessor.prototype.retrieveMatrix = function(rowCount, returnAsString) {
        const collectedRows = Array.from({ length: rowCount }, () => {
            if (this._lineIndex >= this._lines.length) {
                return [];
            }
            const lineContent = this._lines[this._lineIndex++];
            return lineContent.split(" ");
        });
        return returnAsString ? collectedRows : collectedRows.map(row => row.map(Number));
    };

    InputProcessor.prototype.obtainVector = function(elementCount, returnAsString) {
        const collectedElements = Array.from({ length: elementCount }, () => {
            if (this._lineIndex >= this._lines.length) {
                return undefined;
            }
            return this._lines[this._lineIndex++];
        });
        return returnAsString ? collectedElements : collectedElements.map(Number);
    };

    return function(inputContent) {
        return new InputProcessor(inputContent);
    };
})();

const dataHandler = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processChallenge());

function processChallenge() {
    const sourceText = dataHandler.extractItem(true);
    const targetPattern = "keyence";

    const isMatchFound = Array.from({ length: targetPattern.length + 1 }, (_, idx) => idx)
        .some(splitPoint => {
            const initialSegment = targetPattern.substring(0, splitPoint);
            const finalSegment = targetPattern.substring(splitPoint);

            if (sourceText.length < initialSegment.length + finalSegment.length) {
                return false;
            }

            return sourceText.startsWith(initialSegment) && sourceText.endsWith(finalSegment);
        });

    return isMatchFound ? "YES" : "NO";
}
