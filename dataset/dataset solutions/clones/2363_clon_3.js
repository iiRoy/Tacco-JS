"use strict";

const InputReaderFactory = (function() {
    // Renamed 'g' to 'InputReader' and converted to a class for structural modification.
    class InputReader {
        constructor(sourceString) {
            // Renamed '_s' to 'linesData' and 's' to 'sourceString'.
            this.linesData = sourceString.trim().split("\n");
            // Renamed '_y' to 'currentLineIndex'.
            this.currentLineIndex = 0;
        }

        // Renamed 'a' to 'getAtom' and 'f' to 'returnAsString'.
        getAtom(returnAsString) {
            // Renamed 's' to 'currentLine' and 'y' to 'lineIdx'.
            let currentLine = this.linesData[this.currentLineIndex];

            // Preserve the original behavior of splitting and reversing in place.
            if (typeof currentLine === "string") {
                this.linesData[this.currentLineIndex] = currentLine.split(" ").reverse();
                currentLine = this.linesData[this.currentLineIndex]; // Update reference to the modified array.
            }

            // Renamed 'r' to 'atomValue'.
            const atomValue = currentLine.pop();

            // Preserve the original behavior of advancing line index if the current line is exhausted.
            if (!currentLine.length) {
                this.currentLineIndex++;
            }

            // Preserve type conversion.
            return returnAsString ? atomValue : +atomValue;
        }

        // Renamed 'l' to 'getLine' and 'f' to 'returnAsString'.
        getLine(returnAsString) {
            // Renamed 's' to 'lineParts' and 'a' to 'value'.
            const lineContent = this.linesData[this.currentLineIndex++];
            const lineParts = lineContent.split(" ");
            // Preserve type conversion.
            return returnAsString ? lineParts : lineParts.map(value => +value);
        }

        // Renamed 'm' to 'getMatrix', 'n' to 'numLines', and 'f' to 'returnAsString'.
        getMatrix(numLines, returnAsString) {
            // Renamed 'r' to 'resultLines' and 'a' to 'line'.
            const resultLines = this.linesData.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;
            // Preserve type conversion and nested mapping.
            if (returnAsString) {
                return resultLines.map(line => line.split(" "));
            } else {
                return resultLines.map(line => line.split(" ").map(value => +value));
            }
        }

        // Renamed 'r' to 'getRawLines', 'n' to 'numLines', and 'f' to 'returnAsString'.
        getRawLines(numLines, returnAsString) {
            // Renamed 'r' to 'resultLines' and 'a' to 'value'.
            const resultLines = this.linesData.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;
            // Preserve type conversion.
            return returnAsString ? resultLines : resultLines.map(value => +value);
        }
    }

    // Renamed 'f' to 'createReaderInstance' and 's' to 'sourceString'.
    function createReaderInstance(sourceString) {
        return new InputReader(sourceString);
    }
    return createReaderInstance; // The factory returns this function.
})();

// Renamed 'o' to 'inputProcessor'.
const inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Renamed 'xArray' to 'createMultiDimArray', 'v' to 'initialValue'.
function createMultiDimArray(initialValue) {
    // Renamed 'a' to 'dimensions', 'l' to 'dimCount', 'r' to 'arrayConstructionString'.
    const dimensions = arguments;
    let dimCount = dimensions.length;
    let arrayConstructionString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return ${initialValue};})`;
    while (--dimCount) {
        arrayConstructionString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayConstructionString})`;
    }
    return eval(arrayConstructionString);
}

console.log(main());

function main() {
    // The original code reads a line into 'n', then immediately overwrites 'n' with the next line.
    // This means the result of the first 'o.l()' call is effectively discarded.
    // To make this behavior explicit and introduce a structural change, we read it into a dedicated variable.
    const firstLineDiscarded = inputProcessor.getLine();

    // Now, read the line that is actually used in the logic.
    // Renamed 'n' to 'currentLineData' for clarity.
    const currentLineData = inputProcessor.getLine();

    // Introduce a helper variable for the specific value we are comparing against.
    const requiredValue = 1;

    // Introduce a helper variable for the element at the specific index.
    const valueAtIndexOne = currentLineData[1];

    // Replace the ternary operator with an explicit if-else block for structural modification.
    if (valueAtIndexOne === requiredValue) {
        return 1;
    } else {
        return 0;
    }
}
