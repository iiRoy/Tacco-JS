var InputParser = (function () {
    function createParser(sourceString) {
        return new ParserInstance(sourceString);
    }

    function ParserInstance(sourceString) {
        this.inputLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    const convertToNumber = (val) => Number(val);

    ParserInstance.prototype.readAtom = function (parseAsNumber) {
        let currentLineArray = this.inputLines[this.currentLineIndex];
        if (typeof currentLineArray === "string") {
            this.inputLines[this.currentLineIndex] = currentLineArray.split(" ").reverse();
            currentLineArray = this.inputLines[this.currentLineIndex];
        }

        let extractedAtom = currentLineArray.pop();

        if (!currentLineArray.length) {
            this.currentLineIndex++;
        }

        return parseAsNumber ? convertToNumber(extractedAtom) : extractedAtom;
    };

    ParserInstance.prototype.readLine = function (parseAsNumber) {
        let lineContent = this.inputLines[this.currentLineIndex++].split(" ");
        return parseAsNumber ? lineContent.map(convertToNumber) : lineContent;
    };

    ParserInstance.prototype.readMatrix = function (numRows, parseAsNumber) {
        const matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows);
        const splitRows = matrixRows.map(row => row.split(" "));
        return parseAsNumber ? splitRows.map(row => row.map(convertToNumber)) : splitRows;
    };

    ParserInstance.prototype.readRows = function (numRows, parseAsNumber) {
        const rawRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows);
        return parseAsNumber ? rawRows.map(convertToNumber) : rawRows;
    };

    return createParser;
})();

function createMultiDimArray(initialValue) {
    const dimensions = arguments;
    let dimCount = dimensions.length;
    const lastDimensionIndex = --dimCount;

    let arrayCreationString = "Array(dimensions[" + lastDimensionIndex + "]).fill(0).map(x=>{return " + initialValue + ";})";

    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }

    return eval(arrayCreationString);
}

const getMaximum = (val1, val2) => Math.max(val1, val2);
const getMinimum = (val1, val2) => Math.min(val1, val2);

var inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
    const ALPHABET_SIZE = 26;
    const CHAR_CODE_OFFSET_A = 97;

    var inputString = inputReader.readAtom(false);
    var stringLength = inputString.length;
    var minMaxConsecutive = stringLength;

    for (let charIndex = 0; charIndex < ALPHABET_SIZE; charIndex++) {
        let maxConsecutiveForChar = 0;
        let currentConsecutive = 0;

        for (let strPos = 0; strPos < stringLength; strPos++) {
            const currentCharacter = inputString[strPos];
            const currentCharacterCode = currentCharacter.charCodeAt();
            const relativeCharCode = currentCharacterCode - CHAR_CODE_OFFSET_A;

            if (relativeCharCode === charIndex) {
                maxConsecutiveForChar = getMaximum(maxConsecutiveForChar, currentConsecutive);
                currentConsecutive = 0;
            } else {
                currentConsecutive++;
            }
        }
        maxConsecutiveForChar = getMaximum(maxConsecutiveForChar, currentConsecutive);

        minMaxConsecutive = getMinimum(minMaxConsecutive, maxConsecutiveForChar);
    }

    return minMaxConsecutive;
}
