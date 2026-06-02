var InputParserFactory=(function(){
    function createParser(sourceString){
        return new InputParser(sourceString);
    }

    class InputParser {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _popValue(lineArray) {
            const value = lineArray.pop();
            if (!lineArray.length) {
                this._currentLineIndex++;
            }
            return value;
        }

        readAtom(asString) {
            let currentLine = this._sourceLines[this._currentLineIndex];
            if (typeof currentLine === "string") {
                this._sourceLines[this._currentLineIndex] = currentLine.split(" ").reverse();
            }
            const result = this._popValue(this._sourceLines[this._currentLineIndex]);
            return asString ? result : +result;
        }

        readLine(asStrings) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const parts = lineContent.split(" ");
            return asStrings ? parts : parts.map(val => +val);
        }

        readMatrix(rowCount, asStrings) {
            const startIdx = this._currentLineIndex;
            this._currentLineIndex += rowCount;
            const selectedLines = this._sourceLines.slice(startIdx, this._currentLineIndex);
            return asStrings
                ? selectedLines.map(line => line.split(" "))
                : selectedLines.map(line => line.split(" ").map(val => +val));
        }

        readRawLines(rowCount, asStrings) {
            const startIdx = this._currentLineIndex;
            this._currentLineIndex += rowCount;
            const selectedLines = this._sourceLines.slice(startIdx, this._currentLineIndex);
            return asStrings ? selectedLines : selectedLines.map(val => +val);
        }
    }

    return createParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

console.log(solveProblem());

function solveProblem(){
    const totalElements = inputReader.readAtom();
    const maxOperations = inputReader.readAtom();
    const valueArray = inputReader.readLine();

    let maxSum = 0;

    for(let totalTakenCount = 0; totalTakenCount <= maxOperations && totalTakenCount < totalElements; ++totalTakenCount){
        for(let leftTakenCount = 0; leftTakenCount <= totalTakenCount; ++leftTakenCount){
            let currentSum = 0;
            const negativeValuesCollected = [];

            const rightTakenCount = totalTakenCount - leftTakenCount;

            // Process elements from the left side
            for(let leftIdx = 0; leftIdx < leftTakenCount; ++leftIdx){
                const elementValue = valueArray[leftIdx];
                currentSum += elementValue;
                if(elementValue < 0){
                    negativeValuesCollected.push(elementValue);
                }
            }

            // Process elements from the right side
            for(let rightIdx = 0; rightIdx < rightTakenCount; ++rightIdx){
                const elementValue = valueArray[totalElements - 1 - rightIdx];
                currentSum += elementValue;
                if(elementValue < 0){
                    negativeValuesCollected.push(elementValue);
                }
            }

            // Sort negative values to easily discard the smallest ones
            negativeValuesCollected.sort((a, b) => a - b);

            // Determine how many items can be discarded (up to k - totalTakenCount)
            const discardAllowance = maxOperations - totalTakenCount;
            const negativesToDiscard = Math.min(discardAllowance, negativeValuesCollected.length);

            // Discard the smallest negative values to maximize sum
            for(let discardIdx = 0; discardIdx < negativesToDiscard; ++discardIdx){
                currentSum -= negativeValuesCollected[discardIdx];
            }
            
            maxSum = Math.max(maxSum, currentSum);
        }
    }
    return maxSum;
}
