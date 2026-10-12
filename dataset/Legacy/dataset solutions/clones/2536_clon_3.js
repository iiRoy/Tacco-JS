const InputParser = (function () {
    function stringToTypedValue(valStr) {
        const parsedNum = +valStr;
        return (parsedNum === parsedNum) ? parsedNum : valStr;
    }

    function stringToArrayOfTypedValues(lineStr) {
        return lineStr.split(" ").map(stringToTypedValue);
    }

    class ParserInstance {
        constructor(rawString) {
            this._lines = rawString.trim().split("\n");
        }

        getLineValue(lineNumber) {
            return this._lines[lineNumber];
        }

        getLineAsArray(lineNumber) {
            return stringToArrayOfTypedValues(this._lines[lineNumber]);
        }

        getSlicedValues(startIndex, limitCount) {
            const endIndex = (limitCount === undefined || limitCount === null) ? undefined : startIndex + (+limitCount);
            return this._lines.slice(startIndex, endIndex).map(stringToTypedValue);
        }

        getSlicedArrays(startIndex, limitCount) {
            const endIndex = (limitCount === undefined || limitCount === null) ? undefined : startIndex + (+limitCount);
            return this._lines.slice(startIndex, endIndex).map(stringToArrayOfTypedValues);
        }
    }

    function createParser(inputString) {
        return new ParserInstance(inputString);
    }

    return createParser;
})();

const inputData = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

const calculateBitmask = (numbers) => {
    return numbers.reduce((accumulator, currentBit) => {
        return accumulator | (1 << (currentBit - 1));
    }, 0);
};

function solveProblem() {
    const firstLineData = inputData.getLineAsArray(0);
    const numItems = firstLineData[0];
    const numKeys = firstLineData[1];

    const keyInfoRaw = inputData.getSlicedArrays(1);
    const processedKeys = [];

    // The 'ans' variable and its calculation loop were dead code in the original,
    // as its value was never used. It has been removed as non-essential.

    for (let keyIdx = 0; keyIdx < numKeys; keyIdx++) {
        const rawInfoIndexA = keyIdx * 2;
        const rawInfoIndexC = keyIdx * 2 + 1;

        processedKeys.push({
            a: keyInfoRaw[rawInfoIndexA][0],
            c: calculateBitmask(keyInfoRaw[rawInfoIndexC])
        });
    }

    const totalMaskSize = 1 << numItems;
    const minCosts = Array.from({ length: totalMaskSize }, () => Infinity);
    minCosts[0] = 0;

    for (let currentMask = 0; currentMask < totalMaskSize; currentMask++) {
        for (let keyIndex = 0; keyIndex < numKeys; keyIndex++) {
            const { a: keyCost, c: keyBitmask } = processedKeys[keyIndex];
            const nextMask = currentMask | keyBitmask;
            const currentTotalCost = minCosts[currentMask] + keyCost;
            minCosts[nextMask] = Math.min(minCosts[nextMask], currentTotalCost);
        }
    }

    const finalTargetMask = totalMaskSize - 1;
    return minCosts[finalTargetMask] === Infinity ? -1 : minCosts[finalTargetMask];
}

console.log(solveProblem());
