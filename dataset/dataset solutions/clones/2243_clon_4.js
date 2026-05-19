"use strict";

class InputReader {
    constructor(sourceText) {
        this.sourceLines = sourceText.trim().split("\n");
        this.currentLinePointer = 0;
    }

    extractToken(convertToNumber = false) {
        if (this.currentLinePointer >= this.sourceLines.length) {
            throw new Error("End of input reached.");
        }

        if (typeof this.sourceLines[this.currentLinePointer] === "string") {
            this.sourceLines[this.currentLinePointer] = this.sourceLines[this.currentLinePointer].split(" ").reverse();
        }

        const extracted = this.sourceLines[this.currentLinePointer].pop();

        if (this.sourceLines[this.currentLinePointer].length === 0) {
            this.currentLinePointer++;
        }

        return convertToNumber ? +extracted : extracted;
    }
}

const acquireInput = (function() {
    function factory(text) {
        const readerInstance = new InputReader(text);
        return {
            getValue: (asNum) => readerInstance.extractToken(asNum)
        };
    }
    return factory;
})();

const inputData = acquireInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function processSequence() {
    const totalLength = inputData.getValue(true);
    const initialFillCount = inputData.getValue(true);
    const primaryFillValue = inputData.getValue(true);

    const resultantSequence = Array.from({ length: totalLength }, (_, index) => {
        if (index < initialFillCount) {
            return primaryFillValue;
        } else {
            return (primaryFillValue <= totalLength) ? (primaryFillValue + 1) : 1;
        }
    });

    return resultantSequence.join(" ");
}

const finalOutput = processSequence();
if (finalOutput !== undefined) {
    console.log(finalOutput);
}
