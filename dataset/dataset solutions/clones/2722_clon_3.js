class InputParser {
    constructor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    _convertValue(value, asString) {
        return asString ? value : +value;
    }

    readNextValue(asString = false) {
        let currentLineContent = this.sourceLines[this.currentLineIndex];
        if (typeof currentLineContent === "string") {
            this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
        }
        let extractedValue = this.sourceLines[this.currentLineIndex].pop();
        if (!this.sourceLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }
        return this._convertValue(extractedValue, asString);
    }

    readLineValues(asString = false) {
        const line = this.sourceLines[this.currentLineIndex++];
        const values = line.split(" ");
        return asString ? values : values.map(val => +val);
    }

    readMatrix(numRows, asString = false) {
        const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        const parsedRows = rows.map(row => row.split(" "));
        return asString ? parsedRows : parsedRows.map(row => row.map(val => +val));
    }

    readRows(numRows, asString = false) {
        const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        return asString ? rows : rows.map(val => +val);
    }
}

const createInputParser = (sourceString) => new InputParser(sourceString);
const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    return eval(arrayCreationString);
}

function findLowerBoundIndex(sortedData, searchStartIndex, searchEndIndex, targetValue) {
    let lowPointer = searchStartIndex;
    let highPointer = searchEndIndex;
    while (1 < highPointer - lowPointer) {
        let midPointer = Math.floor((lowPointer + highPointer) / 2);
        if (sortedData[midPointer] < targetValue) {
            lowPointer = midPointer;
        } else {
            highPointer = midPointer;
        }
    }
    return sortedData[lowPointer] < targetValue ? highPointer : lowPointer;
}

function outputResult(outputArray) {
    if (outputArray.length > 0) {
        console.log(outputArray.join(" "));
    }
}

processInput();

function processInput() {
    const totalElements = inputReader.readNextValue();
    const targetCount = inputReader.readNextValue();
    const dataArray = inputReader.readLineValues();

    const elementIndicesMap = new Map();
    for (let idx = 0; idx < totalElements; idx++) {
        const element = dataArray[idx];
        if (!elementIndicesMap.has(element)) {
            elementIndicesMap.set(element, []);
        }
        elementIndicesMap.get(element).push(idx);
    }

    const getNextUniqueElementInfo = (startIndex) => {
        for (let currentIdx = startIndex; currentIdx < totalElements; currentIdx++) {
            const currentVal = dataArray[currentIdx];
            const indicesForVal = elementIndicesMap.get(currentVal);

            if (!indicesForVal) {
                continue;
            }

            const nextOccurrenceIdxInMap = findLowerBoundIndex(indicesForVal, 0, indicesForVal.length, currentIdx + 1);

            if (nextOccurrenceIdxInMap !== indicesForVal.length) {
                currentIdx = indicesForVal[nextOccurrenceIdxInMap];
            } else {
                return { value: currentVal, nextSearchIndex: currentIdx + 1 };
            }
        }
        return { value: -1, nextSearchIndex: totalElements };
    };

    const findFirstUniqueElement = (startIndex) => getNextUniqueElementInfo(startIndex).value;

    const generateRemainingSequence = (startIndex) => {
        const sequence = [];
        let currentSearchIndex = startIndex;
        while (currentSearchIndex < totalElements) {
            const { value, nextSearchIndex } = getNextUniqueElementInfo(currentSearchIndex);
            if (value !== -1) {
                sequence.push(value);
                currentSearchIndex = nextSearchIndex;
            } else {
                break;
            }
        }
        return sequence;
    };

    let initialUniqueElement = findFirstUniqueElement(0);

    if (targetCount === 1 || initialUniqueElement === -1) {
        outputResult(generateRemainingSequence(0));
        return;
    }

    const uniqueSequencePrefix = new Array(targetCount + 1);
    uniqueSequencePrefix[1] = initialUniqueElement;

    let lastFoundElementInPrefix = initialUniqueElement;
    let currentPrefixLength = 1;

    for (let count = 2; count <= targetCount; count++) {
        const previousUniqueElement = uniqueSequencePrefix[count - 1];
        const indicesOfPreviousElement = elementIndicesMap.get(previousUniqueElement);
        const firstOccurrenceOfPrevious = indicesOfPreviousElement[0];
        const searchStartAfterPrevious = firstOccurrenceOfPrevious + 1;

        const nextUnique = findFirstUniqueElement(searchStartAfterPrevious);
        if (nextUnique === -1) {
            lastFoundElementInPrefix = -1;
            break;
        }
        uniqueSequencePrefix[count] = nextUnique;
        lastFoundElementInPrefix = nextUnique;
        currentPrefixLength = count;
    }

    let effectivePrefixLength = currentPrefixLength;
    if (lastFoundElementInPrefix === -1) {
        effectivePrefixLength++;
    }

    const remainderCount = targetCount % effectivePrefixLength;

    if (remainderCount === 0) {
        if (lastFoundElementInPrefix === -1) {
            return;
        }
        const lastElementOfPrefix = uniqueSequencePrefix[effectivePrefixLength - 1];
        const indicesOfLastElement = elementIndicesMap.get(lastElementOfPrefix);
        const firstOccurrenceOfLast = indicesOfLastElement[0];
        outputResult(generateRemainingSequence(firstOccurrenceOfLast + 1));
        return;
    }

    let finalSearchStartIndex;
    if (remainderCount === 1) {
        finalSearchStartIndex = 0;
    } else {
        const elementForRemainder = uniqueSequencePrefix[remainderCount - 1];
        const indicesForRemainderElement = elementIndicesMap.get(elementForRemainder);
        const firstOccurrenceOfRemainder = indicesForRemainderElement[0];
        finalSearchStartIndex = firstOccurrenceOfRemainder + 1;
    }
    outputResult(generateRemainingSequence(finalSearchStartIndex));
}
