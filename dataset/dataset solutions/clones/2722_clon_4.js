const GET = (() => {
    const inputLinesSymbol = Symbol('inputLines');
    const currentLineIndexSymbol = Symbol('currentLineIndex');

    class InputDataProcessor {
        constructor(sourceText) {
            this[inputLinesSymbol] = sourceText.trim().split("\n");
            this[currentLineIndexSymbol] = 0;
        }

        // Extracts a single numeric item from the current line (right-to-left), advancing to the next line if current becomes empty.
        a() {
            let lineSegments = this[inputLinesSymbol][this[currentLineIndexSymbol]];
            if (typeof lineSegments === "string") {
                this[inputLinesSymbol][this[currentLineIndexSymbol]] = lineSegments.split(" ").reverse();
                lineSegments = this[inputLinesSymbol][this[currentLineIndexSymbol]];
            }
            const extractedItem = lineSegments.pop();
            if (lineSegments.length === 0) {
                this[currentLineIndexSymbol]++;
            }
            return Number(extractedItem);
        }

        // Reads an entire line, splits by space, and returns an array of numbers.
        l() {
            const lineContent = this[inputLinesSymbol][this[currentLineIndexSymbol]++];
            return lineContent.split(" ").map(Number);
        }

        // Reads 'count' lines, splits each by space, and returns a 2D array of numbers.
        m(count) {
            const matrixSlice = this[inputLinesSymbol].slice(this[currentLineIndexSymbol], this[currentLineIndexSymbol] + count);
            this[currentLineIndexSymbol] += count;
            return matrixSlice.map(line => line.split(" ").map(Number));
        }

        // Reads 'count' lines as raw strings and returns an array of strings.
        r(count) {
            const stringSlice = this[inputLinesSymbol].slice(this[currentLineIndexSymbol], this[currentLineIndexSymbol] + count);
            this[currentLineIndexSymbol] += count;
            return stringSlice;
        }
    }

    return (source) => new InputDataProcessor(source);
})();

const xArray = (initialValue, ...dimensions) => {
    const createNestedArray = (dimensionIndex) => {
        if (dimensionIndex === dimensions.length - 1) {
            return Array(dimensions[dimensionIndex]).fill(initialValue);
        }
        return Array(dimensions[dimensionIndex]).fill(null).map(() => createNestedArray(dimensionIndex + 1));
    };
    return createNestedArray(0);
};

const lower_bound = (dataCollection, searchStart, searchEnd, targetValue) => {
    let leftPointer = searchStart;
    let rightPointer = searchEnd;
    while (leftPointer < rightPointer) {
        const midPoint = Math.floor((leftPointer + rightPointer) / 2);
        if (dataCollection[midPoint] < targetValue) {
            leftPointer = midPoint + 1;
        } else {
            rightPointer = midPoint;
        }
    }
    return leftPointer;
};

const inputReader = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

function* generateUniqueElements(startPosition, sourceArray, indexMapping, arraySize, searchFunction) {
    let currentScanIndex = startPosition;
    while (currentScanIndex < arraySize) {
        const currentItem = sourceArray[currentScanIndex];
        const itemOccurrences = indexMapping.get(currentItem);
        const nextRelevantIndex = searchFunction(itemOccurrences, 0, itemOccurrences.length, currentScanIndex + 1);

        if (nextRelevantIndex !== itemOccurrences.length) {
            currentScanIndex = itemOccurrences[nextRelevantIndex];
        } else {
            yield currentItem;
        }
        currentScanIndex++;
    }
}

const collectUniqueSequence = (startPosition, sourceArray, indexMapping, arraySize, searchFunction) => {
    return Array.from(generateUniqueElements(startPosition, sourceArray, indexMapping, arraySize, searchFunction));
};

const retrieveFirstUnique = (startPosition, sourceArray, indexMapping, arraySize, searchFunction) => {
    const iterator = generateUniqueElements(startPosition, sourceArray, indexMapping, arraySize, searchFunction);
    const result = iterator.next();
    return result.done ? -1 : result.value;
};

function main() {
    const totalElements = inputReader.a();
    const cycleCount = inputReader.a();
    const dataArray = inputReader.l();

    const valueIndices = new Map();
    dataArray.forEach((val, idx) => {
        if (!valueIndices.has(val)) {
            valueIndices.set(val, []);
        }
        valueIndices.get(val).push(idx);
    });

    const initialUniqueElement = retrieveFirstUnique(0, dataArray, valueIndices, totalElements, lower_bound);

    if (cycleCount === 1 || initialUniqueElement === -1) {
        printf(collectUniqueSequence(0, dataArray, valueIndices, totalElements, lower_bound));
        return;
    }

    const sequenceChain = [initialUniqueElement];
    let currentElementInChain = initialUniqueElement;
    let chainProgress = 1;

    while (chainProgress < cycleCount) {
        const nextStartIndex = valueIndices.get(currentElementInChain)[0] + 1;
        const nextUniqueElement = retrieveFirstUnique(nextStartIndex, dataArray, valueIndices, totalElements, lower_bound);

        if (nextUniqueElement === -1) {
            break;
        }
        sequenceChain.push(nextUniqueElement);
        currentElementInChain = nextUniqueElement;
        chainProgress++;
    }

    const actualChainLength = sequenceChain.length;
    const effectiveChainLength = (currentElementInChain === -1 && chainProgress < cycleCount) ? actualChainLength + 1 : actualChainLength;

    let finalStartingIndex;
    const remainder = cycleCount % effectiveChainLength;

    if (remainder === 0) {
        if (currentElementInChain === -1) {
            return;
        }
        finalStartingIndex = valueIndices.get(sequenceChain[actualChainLength - 1])[0] + 1;
    } else if (remainder === 1) {
        finalStartingIndex = 0;
    } else {
        finalStartingIndex = valueIndices.get(sequenceChain[remainder - 1])[0] + 1;
    }

    printf(collectUniqueSequence(finalStartingIndex, dataArray, valueIndices, totalElements, lower_bound));
}

function printf(resultArray) {
    if (resultArray.length > 0) {
        console.log(resultArray.join(" "));
    }
}

main();
