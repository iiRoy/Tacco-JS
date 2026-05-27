"use strict";
var createInputReader = (function() {
    class InputParser {
        constructor(inputStr) {
            this._inputLines = inputStr.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readItem(asString) {
            let currentLineContent = this._inputLines[this._currentLineIndex];
            
            if (typeof currentLineContent === "string") {
                this._inputLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
            }
            
            let lineItems = this._inputLines[this._currentLineIndex];
            let extractedValue = lineItems.pop();

            if (!lineItems.length) {
                this._currentLineIndex++;
            }
            
            return asString ? extractedValue : +extractedValue;
        }

        readLine(asString) {
            let lineContent = this._inputLines[this._currentLineIndex++];
            let items = lineContent.split(" ");
            return asString ? items : items.map(val => +val);
        }

        readMatrix(count, asString) {
            let matrixRows = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += count);
            let parsedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
            return asString ? parsedMatrix : parsedMatrix.map(row => row.map(item => +item));
        }

        readList(count, asString) {
            let listItems = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += count);
            return asString ? listItems : listItems.map(item => +item);
        }
    }
    return function(inputStr) { return new InputParser(inputStr); };
})();
var createMultiDimArray = function(initialValue) {
    var dimensions = arguments,
        dimCount = dimensions.length,
        arrayCreationCode = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationCode = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationCode + ")";
    }
    return eval(arrayCreationCode);
};

var inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());
function processMainLogic() {
    const totalLength = inputReader.readItem();
    const maxJumpDistance = inputReader.readItem();
    const inputString = inputReader.readItem(true);

    const zeroIndices = [];
    for (let currentIdx = totalLength - 1; currentIdx >= 0; currentIdx--) {
        if (inputString.charAt(currentIdx) === "0") {
            zeroIndices.push(currentIdx);
        }
    }

    const jumpDistances = [];
    let currentPosition = totalLength;
    const numZeroIndices = zeroIndices.length;

    for (let zeroIdxCursor = 0; zeroIdxCursor < numZeroIndices; zeroIdxCursor++) {
        const currentTargetZero = zeroIndices[zeroIdxCursor];

        if (currentPosition - currentTargetZero > maxJumpDistance) {
            return -1;
        }

        while (zeroIdxCursor < numZeroIndices - 1) {
            const nextPossibleZero = zeroIndices[zeroIdxCursor + 1];
            if (currentPosition - nextPossibleZero <= maxJumpDistance) {
                zeroIdxCursor++;
            } else {
                break;
            }
        }
        
        const chosenZeroPosition = zeroIndices[zeroIdxCursor];
        const calculatedJump = currentPosition - chosenZeroPosition;
        
        jumpDistances.push(calculatedJump);
        currentPosition = chosenZeroPosition;
    }
    
    return jumpDistances.reverse().join(" ");
}
