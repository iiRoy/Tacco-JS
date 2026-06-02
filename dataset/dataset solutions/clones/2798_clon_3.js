var INPUT_PARSER = (function() {
    function createParser(inputString) {
        return new InputReader(inputString);
    }

    class InputReader {
        constructor(rawInput) {
            this.lineBuffer = rawInput.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readToken(returnAsString) {
            const lines = this.lineBuffer;
            const lineIdx = this.currentLineIndex;
            let tokenValue;

            if (typeof lines[lineIdx] === "string") {
                lines[lineIdx] = lines[lineIdx].split(" ").reverse();
            }

            tokenValue = lines[lineIdx].pop();

            if (!lines[lineIdx].length) {
                this.currentLineIndex++;
            }

            return returnAsString ? tokenValue : Number(tokenValue);
        }

        readLine(returnAsString) {
            const lineContent = this.lineBuffer[this.currentLineIndex++];
            const tokens = lineContent.split(" ");

            if (returnAsString) {
                return tokens;
            } else {
                return tokens.map(val => Number(val));
            }
        }

        readMatrix(numRows, returnAsString) {
            const matrixRows = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;

            const parsedMatrix = matrixRows.map(row => row.split(" "));

            if (returnAsString) {
                return parsedMatrix;
            } else {
                return parsedMatrix.map(row => row.map(val => Number(val)));
            }
        }

        readLines(numLines, returnAsString) {
            const rawLines = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;

            if (returnAsString) {
                return rawLines;
            } else {
                return rawLines.map(val => Number(val));
            }
        }
    }

    return createParser;
})();

var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = Array.prototype.slice.call(arguments, 1);
    let dimCount = dimensions.length;
    let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return initialValue;})`;

    while (--dimCount >= 0) {
        arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

console.log(main());

function main() {
    const inputSequence = inputData.readToken(true);

    let hasAdjacentSameDigits = false;
    const maxCheckIndex = Math.min(inputSequence.length - 1, 3);

    for (let i = 0; i < maxCheckIndex; i++) {
        if (inputSequence[i] === inputSequence[i + 1]) {
            hasAdjacentSameDigits = true;
            break;
        }
    }

    return hasAdjacentSameDigits ? "Bad" : "Good";
}
