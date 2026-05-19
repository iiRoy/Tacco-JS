const InputReader = (function () {
    function createReader(sourceString) {
        return new ReaderInstance(sourceString);
    }

    function ReaderInstance(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    ReaderInstance.prototype.readSingleValue = function (asString) {
        let lines = this.sourceLines;
        let lineIdx = this.currentLineIndex;
        let resultValue;

        if (typeof lines[lineIdx] === "string") {
            lines[lineIdx] = lines[lineIdx].split(" ").reverse();
        }

        resultValue = lines[lineIdx].pop();

        if (!lines[lineIdx].length) {
            this.currentLineIndex++;
        }

        return asString ? resultValue : +resultValue;
    };

    ReaderInstance.prototype.readLineValues = function (asStrings) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const values = lineContent.split(" ");
        return asStrings ? values : values.map(val => +val);
    };

    ReaderInstance.prototype.readMatrixData = function (numRows, asStrings) {
        const startIdx = this.currentLineIndex;
        const endIdx = this.currentLineIndex + numRows;
        const matrixRows = this.sourceLines.slice(startIdx, endIdx).map(line => line.split(" "));
        this.currentLineIndex = endIdx;

        return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
    };

    ReaderInstance.prototype.readRawLines = function (numLines, asStrings) {
        const startIdx = this.currentLineIndex;
        const endIdx = this.currentLineIndex + numLines;
        const rawLines = this.sourceLines.slice(startIdx, endIdx);
        this.currentLineIndex = endIdx;

        return asStrings ? rawLines : rawLines.map(line => +line);
    };

    return createReader;
})();

const inputDataParser = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(initialValue) {
    let args = arguments;
    let argCount = args.length;
    let arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

console.log(solveProblem());

function solveProblem() {
    const numItems = inputDataParser.readSingleValue();
    const targetValue = inputDataParser.readSingleValue();
    const itemDetails = inputDataParser.readMatrixData(numItems);

    let initialSum = 0;

    const calculateItemCosts = (itemRow, capacity) => {
        const itemBase = itemRow[0];
        const itemRate1 = itemRow[1];
        const itemRate2 = itemRow[2];

        const baseCost = itemBase * itemRate1;
        const additionalCost = (capacity - itemBase) * itemRate2;
        return { baseCost, additionalCost, totalCost: baseCost + additionalCost };
    };

    for (let idx = 0; idx < numItems; idx++) {
        const currentItem = itemDetails[idx];
        const { baseCost, additionalCost, totalCost } = calculateItemCosts(currentItem, targetValue);

        initialSum += baseCost;
        currentItem.push(additionalCost, baseCost, totalCost);
    }

    itemDetails.sort((itemA, itemB) => itemB[5] - itemA[5]);

    let upperBound = numItems * targetValue;
    let lowerBound = -1;

    while (upperBound - lowerBound > 1) {
        const midPoint = Math.floor((upperBound + lowerBound) / 2);
        let currentSum = initialSum;
        let remainingCapacity = midPoint;

        for (let idx = 0; idx < numItems && remainingCapacity > 0 && currentSum > 0; idx++) {
            const currentItem = itemDetails[idx];
            const itemBase = currentItem[0];
            const itemRate1 = currentItem[1];
            const itemRate2 = currentItem[2];
            const itemAdditionalCost = currentItem[4];
            const itemTotalCost = currentItem[5];

            if (targetValue <= remainingCapacity) {
                currentSum -= itemTotalCost;
                remainingCapacity -= targetValue;
            } else {
                let tempSum = currentSum;
                for (/* idx continues from outer loop */ ; idx < numItems && tempSum > 0; idx++) {
                    tempSum = currentSum;

                    const innerItem = itemDetails[idx];
                    const innerItemBase = innerItem[0];
                    const innerItemRate1 = innerItem[1];
                    const innerItemRate2 = innerItem[2];
                    const innerItemAdditionalCost = innerItem[4];

                    if (remainingCapacity < innerItemBase) {
                        tempSum -= innerItemRate1 * remainingCapacity;
                    } else {
                        tempSum -= innerItemAdditionalCost + (remainingCapacity - innerItemBase) * innerItemRate2;
                    }
                }
                currentSum = tempSum;
                remainingCapacity = 0;
            }
        }

        if (currentSum > 0) {
            lowerBound = midPoint;
        } else {
            upperBound = midPoint;
        }
    }
    return upperBound;
}
