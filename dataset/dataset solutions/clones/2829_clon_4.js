var inputReader = (function() {
    class DataStream {
        constructor(rawInput) {
            this.lines = rawInput.trim().split("\n");
            this.lineIndex = 0;
            this.currentLineTokens = [];
            this.currentTokenIndex = 0;
        }

        #ensureTokens() {
            if (this.currentTokenIndex >= this.currentLineTokens.length) {
                if (this.lineIndex < this.lines.length) {
                    this.currentLineTokens = this.lines[this.lineIndex].split(" ").reverse();
                    this.currentTokenIndex = 0;
                    this.lineIndex++;
                } else {
                    throw new Error("End of input stream reached.");
                }
            }
        }

        extractToken(asString) {
            this.#ensureTokens();
            let token = this.currentLineTokens[this.currentTokenIndex];
            this.currentTokenIndex++;
            return asString ? token : Number(token);
        }

        extractLine(asStrings) {
            if (this.lineIndex >= this.lines.length) {
                throw new Error("End of input stream reached.");
            }
            const line = this.lines[this.lineIndex];
            this.lineIndex++;
            this.currentLineTokens = []; // Clear tokens for next `extractToken` call
            this.currentTokenIndex = 0;
            const tokens = line.split(" ");
            return asStrings ? tokens : tokens.map(Number);
        }

        extractLines(count, asStrings) {
            const extracted = [];
            for (let i = 0; i < count; i++) {
                if (this.lineIndex >= this.lines.length) {
                    throw new Error("End of input stream reached.");
                }
                const line = this.lines[this.lineIndex];
                this.lineIndex++;
                extracted.push(asStrings ? line : Number(line));
            }
            this.currentLineTokens = [];
            this.currentTokenIndex = 0;
            return extracted;
        }

        extractMatrix(rows, asStrings) {
            const matrix = [];
            for (let i = 0; i < rows; i++) {
                matrix.push(this.extractLine(asStrings));
            }
            return matrix;
        }
    }

    return function(inputString) {
        const stream = new DataStream(inputString);
        return {
            readSingle: stream.extractToken.bind(stream),
            readLineTokens: stream.extractLine.bind(stream),
            readMultiLineTokens: stream.extractMatrix.bind(stream),
            readRawLines: stream.extractLines.bind(stream)
        };
    };
})();

var inputProcessor = inputReader(require("fs").readFileSync("/dev/stdin", "utf8"));
