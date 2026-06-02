class InputReader {
    #sourceLines;
    #currentLineIndex;

    constructor(inputString) {
        this.#sourceLines = inputString.trim().split("\n");
        this.#currentLineIndex = 0;
    }

    #parseToken(token, asString) {
        return asString ? token : +token;
    }

    readNextToken(asString = false) {
        let currentLineTokens = this.#sourceLines[this.#currentLineIndex];

        if (typeof currentLineTokens === "string") {
            this.#sourceLines[this.#currentLineIndex] = currentLineTokens.split(" ").reverse();
            currentLineTokens = this.#sourceLines[this.#currentLineIndex];
        }

        const token = currentLineTokens.pop();

        if (currentLineTokens.length === 0) {
            this.#currentLineIndex++;
        }

        return this.#parseToken(token, asString);
    }

    readLineTokens(asString = false) {
        const line = this.#sourceLines[this.#currentLineIndex++];
        const tokens = line.split(" ");
        return asString ? tokens : tokens.map(token => +token);
    }

    readMatrix(numRows, asString = false) {
        const matrixRows = this.#sourceLines.slice(this.#currentLineIndex, this.#currentLineIndex + numRows);
        this.#currentLineIndex += numRows;
        const parsedMatrix = matrixRows.map(row => row.split(" "));
        return asString ? parsedMatrix : parsedMatrix.map(row => row.map(item => +item));
    }

    readLinesAsNumbers(numLines, asString = false) {
        const lines = this.#sourceLines.slice(this.#currentLineIndex, this.#currentLineIndex + numLines);
        this.#currentLineIndex += numLines;
        return asString ? lines : lines.map(line => +line);
    }
}

const inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argLength = args.length;
    let arrayCreationString = "Array(args[" + --argLength + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

function findLowerBoundIndex(sortedArray, startIndex, endIndex, targetValue) {
    let currentLow = startIndex;
    let currentHigh = endIndex;
    let midPoint;

    while (1 < currentHigh - currentLow) {
        midPoint = Math.floor((currentLow + currentHigh) / 2);
        if (sortedArray[midPoint] < targetValue) {
            currentLow = midPoint;
        } else {
            currentHigh = midPoint;
        }
    }
    return sortedArray[currentLow] < targetValue ? currentHigh : currentLow;
}

function buildElementIndexMap(elementsArray) {
    const indicesMap = {};
    for (let idx = 0; idx < elementsArray.length; idx++) {
        const element = elementsArray[idx];
        if (indicesMap[element]) {
            indicesMap[element].push(idx);
        } else {
            indicesMap[element] = [idx];
        }
    }
    return indicesMap;
}

function generateSequenceSegment(startProcessingIndex, dataArray, elementIndicesMap) {
    const segmentResult = [];
    let currentProcessingIndex = startProcessingIndex;

    while (currentProcessingIndex < dataArray.length) {
        const currentElementValue = dataArray[currentProcessingIndex];
        const elementOccurrences = elementIndicesMap[currentElementValue];

        const nextOccurrenceIndexInMap = findLowerBoundIndex(
            elementOccurrences,
            0,
            elementOccurrences.length,
            currentProcessingIndex + 1
        );

        if (nextOccurrenceIndexInMap !== elementOccurrences.length) {
            currentProcessingIndex = elementOccurrences[nextOccurrenceIndexInMap];
        } else {
            segmentResult.push(currentElementValue);
        }
        currentProcessingIndex++;
    }
    return segmentResult;
}

function processInputData() {
    const totalElements = inputProcessor.readNextToken();
    const iterationCount = inputProcessor.readNextToken();
    const dataArray = inputProcessor.readLineTokens();

    const elementIndicesMap = buildElementIndexMap(dataArray);

    let resultSequence = generateSequenceSegment(0, dataArray, elementIndicesMap);

    if (iterationCount === 1 || resultSequence.length === 0) {
        if (resultSequence.length > 0) {
            console.log(resultSequence.join(" "));
        }
        return;
    }

    const uniqueElementsSet = new Set();
    uniqueElementsSet.add(resultSequence[0]);
    const initialSequence = [, resultSequence[0]];

    let processedSequenceCount = 1;
    let foundNewElementFlag = 0;

    while (processedSequenceCount < iterationCount) {
        const targetElementForIteration = initialSequence[processedSequenceCount];

        const targetElementOccurrences = elementIndicesMap[targetElementForIteration];
        const firstOccurrenceIndexInMap = findLowerBoundIndex(
            targetElementOccurrences,
            0,
            targetElementOccurrences.length,
            0
        );
        const startScanIndex = targetElementOccurrences[firstOccurrenceIndexInMap] + 1;

        let currentIterationResultSequence = [];
        let innerLoopCurrentIndex = startScanIndex;
        foundNewElementFlag = 0;

        while (innerLoopCurrentIndex < totalElements) {
            const innerLoopCurrentValue = dataArray[innerLoopCurrentIndex];
            const innerLoopElementOccurrences = elementIndicesMap[innerLoopCurrentValue];

            const innerLoopNextOccurrenceIndexInMap = findLowerBoundIndex(
                innerLoopElementOccurrences,
                0,
                innerLoopElementOccurrences.length,
                innerLoopCurrentIndex + 1
            );

            if (innerLoopNextOccurrenceIndexInMap !== innerLoopElementOccurrences.length) {
                innerLoopCurrentIndex = innerLoopElementOccurrences[innerLoopNextOccurrenceIndexInMap];
            } else {
                currentIterationResultSequence.push(innerLoopCurrentValue);

                if (foundNewElementFlag) {
                    if (!uniqueElementsSet.has(innerLoopCurrentValue)) {
                        processedSequenceCount++;
                        initialSequence.push(innerLoopCurrentValue);
                    } else {
                        foundNewElementFlag = 0;
                    }
                }

                if (currentIterationResultSequence.length === 1) {
                    uniqueElementsSet.add(innerLoopCurrentValue);
                    initialSequence.push(innerLoopCurrentValue);
                    foundNewElementFlag = 1;
                }
            }
            innerLoopCurrentIndex++;
        }
        resultSequence = currentIterationResultSequence;

        if (resultSequence.length === 0) {
            break;
        }
        processedSequenceCount++;
    }

    if (resultSequence.length === 0) {
        processedSequenceCount++;
    }

    const remainder = iterationCount % processedSequenceCount;
    let finalScanStartIndex;

    if (remainder === 0) {
        // resultSequence already holds the correct value from the last successful iteration.
    } else {
        if (remainder === 1) {
            finalScanStartIndex = 0;
        } else {
            const targetElementForFinalScan = initialSequence[remainder - 1];
            const targetElementOccurrences = elementIndicesMap[targetElementForFinalScan];
            const firstOccurrenceIndexInMap = findLowerBoundIndex(
                targetElementOccurrences,
                0,
                targetElementOccurrences.length,
                0
            );
            finalScanStartIndex = targetElementOccurrences[firstOccurrenceIndexInMap] + 1;
        }
        resultSequence = generateSequenceSegment(finalScanStartIndex, dataArray, elementIndicesMap);
    }

    if (resultSequence.length > 0) {
        console.log(resultSequence.join(" "));
    }
}

processInputData();
