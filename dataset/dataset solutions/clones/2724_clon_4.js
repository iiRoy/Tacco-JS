class InputHandler {
    #documentLines;
    #currentLinePosition;
    #currentLineFragments;

    constructor(textData) {
        this.#documentLines = textData.trim().split('\n');
        this.#currentLinePosition = 0;
        this.#currentLineFragments = [];
    }

    // Retrieves a single numerical value
    extractScalar(asLiteral = false) {
        if (this.#currentLineFragments.length === 0) {
            if (this.#currentLinePosition >= this.#documentLines.length) {
                return undefined;
            }
            this.#currentLineFragments = this.#documentLines[this.#currentLinePosition++].split(' ');
        }
        const fragment = this.#currentLineFragments.shift();
        return asLiteral ? fragment : Number(fragment);
    }

    // Retrieves an array of numerical values from a single line
    extractRow(asLiterals = false) {
        if (this.#currentLinePosition >= this.#documentLines.length) {
            return undefined;
        }
        this.#currentLineFragments = []; // Clear buffer as a new line is fully consumed
        const rowData = this.#documentLines[this.#currentLinePosition++].split(' ');
        return asLiterals ? rowData : rowData.map(Number);
    }
}

const findInsertionPoint = (orderedList, startIdx, endIdx, queryValue) => {
    let lowBoundary = startIdx;
    let highBoundary = endIdx;
    let midPoint;

    while (lowBoundary < highBoundary) {
        midPoint = Math.floor((lowBoundary + highBoundary) / 2);
        if (orderedList[midPoint] < queryValue) {
            lowBoundary = midPoint + 1;
        } else {
            highBoundary = midPoint;
        }
    }
    return lowBoundary;
};

const processSegment = (sourceElements, elementIndexMap, startingOffset) => {
    let currentOffset = startingOffset;
    const collectedOutput = [];

    while (currentOffset < sourceElements.length) {
        const currentElement = sourceElements[currentOffset];
        const elementOccurrences = elementIndexMap.get(currentElement);
        const nextOccurrenceOffset = findInsertionPoint(elementOccurrences, 0, elementOccurrences.length, currentOffset + 1);

        if (nextOccurrenceOffset !== elementOccurrences.length) {
            currentOffset = elementOccurrences[nextOccurrenceOffset];
        } else {
            collectedOutput.push(currentElement);
        }
        currentOffset++;
    }
    return collectedOutput;
};

const executeLogic = () => {
    const inputSource = new InputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = inputSource.extractScalar();
    const iterationCount = inputSource.extractScalar();
    const dataSequence = inputSource.extractRow();

    const elementLocations = new Map();
    for (let idx = 0; idx < elementCount; idx++) {
        const value = dataSequence[idx];
        if (!elementLocations.has(value)) {
            elementLocations.set(value, []);
        }
        elementLocations.get(value).push(idx);
    }

    let initialResult = processSegment(dataSequence, elementLocations, 0);

    if (iterationCount === 1 || initialResult.length === 0) {
        if (initialResult.length > 0) {
            console.log(initialResult.join(" "));
        }
        return;
    }

    const uniqueStartValues = [initialResult[0]];
    const seenStartValues = new Set(uniqueStartValues);
    let latestProducedResult = initialResult;
    let uniqueStartValueCounter = 1;

    while (uniqueStartValueCounter < iterationCount) {
        const currentStartItem = uniqueStartValues[uniqueStartValueCounter - 1];
        
        const currentItemOccurrences = elementLocations.get(currentStartItem);
        const initialPointForSegment = findInsertionPoint(currentItemOccurrences, 0, currentItemOccurrences.length, 0);
        const segmentStartOffset = currentItemOccurrences[initialPointForSegment] + 1;

        let currentSegmentResult = processSegment(dataSequence, elementLocations, segmentStartOffset);
        
        if (currentSegmentResult.length === 0) {
            uniqueStartValueCounter++;
            latestProducedResult = [];
            break;
        }

        const nextStartCandidate = currentSegmentResult[0];

        if (seenStartValues.has(nextStartCandidate)) {
            uniqueStartValueCounter++;
            latestProducedResult = currentSegmentResult;
            break;
        } else {
            uniqueStartValues.push(nextStartCandidate);
            seenStartValues.add(nextStartCandidate);
            uniqueStartValueCounter++;
            latestProducedResult = currentSegmentResult;
        }
    }

    let finalOutput;
    const finalModuloIndex = iterationCount % uniqueStartValueCounter;

    if (finalModuloIndex === 0) {
        finalOutput = latestProducedResult;
    } else {
        let finalSegmentStartingOffset;
        if (finalModuloIndex === 1) {
            finalSegmentStartingOffset = 0;
        } else {
            const desiredStartValue = uniqueStartValues[finalModuloIndex - 1];
            const desiredValueOccurrences = elementLocations.get(desiredStartValue);
            const initialIdx = findInsertionPoint(desiredValueOccurrences, 0, desiredValueOccurrences.length, 0);
            finalSegmentStartingOffset = desiredValueOccurrences[initialIdx] + 1;
        }
        finalOutput = processSegment(dataSequence, elementLocations, finalSegmentStartingOffset);
    }

    if (finalOutput.length > 0) {
        console.log(finalOutput.join(" "));
    }
};

executeLogic();