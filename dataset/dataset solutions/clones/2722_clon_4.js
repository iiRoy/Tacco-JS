const createInputHandler = (dataSource) => {
    const allLines = dataSource.trim().split("\n");
    let lineCursor = 0;

    let activeLineWords = [];
    let activeWordPointer = 0;

    // Prepares the words for the current line for `obtainSingleNumber`
    const setupActiveLineForTokens = () => {
        // If current active line is exhausted or no line is active, and there are more lines
        if (activeWordPointer >= activeLineWords.length && lineCursor < allLines.length) {
            // Original GET.a reverses and pops, effectively reading left-to-right from the original line.
            activeLineWords = allLines[lineCursor].split(" ").reverse();
            activeWordPointer = 0;
            // The lineCursor is ONLY incremented when `obtainSingleNumber` fully exhausts this line.
            // Or when `obtainLineNumbers` consumes a full line.
        }
    };

    return {
        obtainSingleNumber: () => {
            setupActiveLineForTokens();
            if (activeWordPointer < activeLineWords.length) {
                const token = activeLineWords[activeWordPointer++];
                if (activeWordPointer >= activeLineWords.length) { // Line exhausted by this token
                    lineCursor++; // Advance line pointer
                }
                return Number(token);
            }
            return NaN; // No more tokens
        },
        obtainLineNumbers: () => {
            if (lineCursor < allLines.length) {
                const lineData = allLines[lineCursor];
                lineCursor++; // This method consumes a full line and advances the line pointer
                activeLineWords = []; // Clear active line cache as this line was consumed independently
                activeWordPointer = 0;
                return lineData.split(" ").map(Number);
            }
            return [];
        }
    };
};

const findBoundaryIndex = (dataCollection, searchStart, searchEnd, queryValue) => {
    let leftPointer = searchStart;
    let rightPointer = searchEnd;
    while (leftPointer < rightPointer) {
        const midPoint = Math.floor((leftPointer + rightPointer) / 2);
        if (dataCollection[midPoint] < queryValue) {
            leftPointer = midPoint + 1;
        } else {
            rightPointer = midPoint;
        }
    }
    return leftPointer;
};

const displayOutput = (elementsArray) => {
    if (elementsArray && elementsArray.length > 0) {
        console.log(elementsArray.join(" "));
    }
};

const identifyFirstUniqueElement = (
    currentSearchIdx,
    dataSequence,
    elementIndexMap,
    sequenceSize,
    searchFunction
) => {
    if (currentSearchIdx >= sequenceSize) {
        return -1;
    }
    const currentVal = dataSequence[currentSearchIdx];
    const indicesForVal = elementIndexMap.get(currentVal);
    const nextValOccurrenceIdx = searchFunction(indicesForVal, 0, indicesForVal.length, currentSearchIdx + 1);

    if (nextValOccurrenceIdx === indicesForVal.length) {
        return currentVal;
    } else {
        return identifyFirstUniqueElement(
            indicesForVal[nextValOccurrenceIdx] + 1,
            dataSequence,
            elementIndexMap,
            sequenceSize,
            searchFunction
        );
    }
};

const collectAllUniqueElements = (
    currentSearchIdx,
    dataSequence,
    elementIndexMap,
    sequenceSize,
    searchFunction,
    accumulatedResults = []
) => {
    if (currentSearchIdx >= sequenceSize) {
        return accumulatedResults;
    }
    const currentVal = dataSequence[currentSearchIdx];
    const indicesForVal = elementIndexMap.get(currentVal);
    const nextValOccurrenceIdx = searchFunction(indicesForVal, 0, indicesForVal.length, currentSearchIdx + 1);

    if (nextValOccurrenceIdx === indicesForVal.length) {
        return collectAllUniqueElements(
            currentSearchIdx + 1,
            dataSequence,
            elementIndexMap,
            sequenceSize,
            searchFunction,
            [...accumulatedResults, currentVal]
        );
    } else {
        return collectAllUniqueElements(
            indicesForVal[nextValOccurrenceIdx] + 1,
            dataSequence,
            elementIndexMap,
            sequenceSize,
            searchFunction,
            accumulatedResults
        );
    }
};

const executeProcess = () => {
    const inputReader = createInputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const sequenceSize = inputReader.obtainSingleNumber();
    const repetitionFactor = inputReader.obtainSingleNumber();
    const mainSequence = inputReader.obtainLineNumbers();

    const elementIndexMap = new Map();
    mainSequence.forEach((val, idx) => {
        if (!elementIndexMap.has(val)) {
            elementIndexMap.set(val, []);
        }
        elementIndexMap.get(val).push(idx);
    });

    const firstUniqueElement = identifyFirstUniqueElement(0, mainSequence, elementIndexMap, sequenceSize, findBoundaryIndex);

    if (repetitionFactor === 1 || firstUniqueElement === -1) {
        displayOutput(collectAllUniqueElements(0, mainSequence, elementIndexMap, sequenceSize, findBoundaryIndex));
        return;
    }

    const uniquePattern = [undefined, firstUniqueElement];
    let currentPatternIndex = 1;
    let lastFoundUnique = firstUniqueElement; // Tracks the `u` value from the original loop

    for (; currentPatternIndex < repetitionFactor; currentPatternIndex++) {
        const currentPatternElement = uniquePattern[currentPatternIndex];
        const indicesOfCurrentElement = elementIndexMap.get(currentPatternElement);
        const firstOccurrenceIdx = findBoundaryIndex(indicesOfCurrentElement, 0, indicesOfCurrentElement.length, 0);
        
        lastFoundUnique = identifyFirstUniqueElement(
            indicesOfCurrentElement[firstOccurrenceIdx] + 1,
            mainSequence,
            elementIndexMap,
            sequenceSize,
            findBoundaryIndex
        );
        
        if (lastFoundUnique === -1) {
            break;
        }
        uniquePattern.push(lastFoundUnique);
    }

    let finalEffectivePatternLength = uniquePattern.length - 1;
    if (lastFoundUnique === -1) { // If the loop broke because a -1 was encountered
        finalEffectivePatternLength++; // Replicates `i++` in the original
    }

    const cycleRemainder = repetitionFactor % finalEffectivePatternLength;

    if (cycleRemainder === 0) {
        if (lastFoundUnique === -1) { // If loop broke early and `lastFoundUnique` is -1
            return;
        }
        const finalPatternElement = uniquePattern[finalEffectivePatternLength];
        const indicesOfFinalElement = elementIndexMap.get(finalPatternElement);
        const finalStartIdx = findBoundaryIndex(indicesOfFinalElement, 0, indicesOfFinalElement.length, 0);
        displayOutput(collectAllUniqueElements(
            indicesOfFinalElement[finalStartIdx] + 1,
            mainSequence,
            elementIndexMap,
            sequenceSize,
            findBoundaryIndex
        ));
        return;
    }

    let finalStartingPoint;
    if (cycleRemainder === 1) {
        finalStartingPoint = 0;
    } else {
        const targetPatternElement = uniquePattern[cycleRemainder];
        const indicesOfTargetElement = elementIndexMap.get(targetPatternElement);
        const targetOccurrenceIdx = findBoundaryIndex(indicesOfTargetElement, 0, indicesOfTargetElement.length, 0);
        finalStartingPoint = indicesOfTargetElement[targetOccurrenceIdx] + 1;
    }
    displayOutput(collectAllUniqueElements(
        finalStartingPoint,
        mainSequence,
        elementIndexMap,
        sequenceSize,
        findBoundaryIndex
    ));
};

executeProcess();