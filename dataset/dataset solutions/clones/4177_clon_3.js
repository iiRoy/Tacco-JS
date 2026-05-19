class InputParser {
    constructor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    _toNumber(str) {
        return Number(str);
    }

    readAtom(returnAsString = false) {
        let lineContent = this.sourceLines[this.currentLineIndex];
        if (typeof lineContent === "string") {
            this.sourceLines[this.currentLineIndex] = lineContent.split(" ").reverse();
            lineContent = this.sourceLines[this.currentLineIndex];
        }
        const extractedAtom = lineContent.pop();
        if (!lineContent.length) {
            this.currentLineIndex++;
        }
        return returnAsString ? extractedAtom : this._toNumber(extractedAtom);
    }

    readLine(returnAsStrings = false) {
        const lineParts = this.sourceLines[this.currentLineIndex++].split(" ");
        return returnAsStrings ? lineParts : lineParts.map(s => this._toNumber(s));
    }

    readMatrix(rowsCount, returnAsStrings = false) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + rowsCount).map(line => line.split(" "));
        this.currentLineIndex += rowsCount;
        return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(s => this._toNumber(s)));
    }

    readRows(rowsCount, returnAsStrings = false) {
        const rawRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + rowsCount);
        this.currentLineIndex += rowsCount;
        return returnAsStrings ? rawRows : rawRows.map(s => this._toNumber(s));
    }
}

const createInputReader = (sourceData) => new InputParser(sourceData);

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function findMaxAbsElementDetails(arr) {
    let currentMaxAbsValue = 0;
    let currentMaxAbsIndex = -1; // 0-based initially, converted to 1-based for return

    for (let i = 0; i < arr.length; i++) {
        if (Math.abs(currentMaxAbsValue) < Math.abs(arr[i])) {
            currentMaxAbsValue = arr[i];
            currentMaxAbsIndex = i + 1; // Store 1-based index
        }
    }
    return { value: currentMaxAbsValue, index: currentMaxAbsIndex };
}

function generateOperations(arrayLength, dataArray, maxAbsValue, maxAbsIndex) {
    const operationsList = [];

    // Helper to add two operations to the list
    const addTwoOps = (op1, op2) => {
        operationsList.push(op1);
        operationsList.push(op2);
    };

    if (maxAbsValue < 0) {
        // Strategy for making all elements non-increasing (negative or zero)
        addTwoOps(`${maxAbsIndex} 1`, `${maxAbsIndex} 1`); // Apply to the element with max abs value

        for (let idx = 1; idx < arrayLength; idx++) {
            const currentElement = dataArray[idx];
            const opTarget = `1 ${idx + 1}`; // Add a[idx] to a[0]
            const opSelf = `1 1`; // Add a[0] to a[0]

            if (currentElement < 0) {
                addTwoOps(opTarget, opSelf);
            } else {
                addTwoOps(opSelf, opTarget);
            }
        }
    } else { // maxAbsValue > 0
        // Strategy for making all elements non-decreasing (positive or zero)
        addTwoOps(`${maxAbsIndex} ${arrayLength}`, `${maxAbsIndex} ${arrayLength}`); // Apply to the element with max abs value

        for (let idx = 0; idx < arrayLength - 1; idx++) {
            const currentElement = dataArray[idx];
            const opTarget = `${arrayLength} ${idx + 1}`; // Add a[idx] to a[n-1]
            const opSelf = `${arrayLength} ${arrayLength}`; // Add a[n-1] to a[n-1]

            if (currentElement < 0) {
                addTwoOps(opSelf, opTarget);
            } else {
                addTwoOps(opTarget, opSelf);
            }
        }
    }
    return operationsList.join("\n");
}


function main() {
    const arrayLength = inputReader.readAtom();
    const dataArray = inputReader.readLine();

    const { value: maxAbsValue, index: maxAbsIndex } = findMaxAbsElementDetails(dataArray);

    if (maxAbsValue === 0) {
        return 0;
    }

    console.log(2 * arrayLength); // This output is critical and must be preserved.
    return generateOperations(arrayLength, dataArray, maxAbsValue, maxAbsIndex);
}

console.log(main());
