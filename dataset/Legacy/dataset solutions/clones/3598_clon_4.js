const createInputHandler = (rawInputString) => {
    let lineSegments = rawInputString.split("\n");
    let currentLinePointer = 0;
    let currentLineTokenBuffer = [];

    const advanceToNextLine = () => {
        if (currentLinePointer < lineSegments.length) {
            currentLineTokenBuffer = lineSegments[currentLinePointer].split(" ");
            currentLinePointer++;
        } else {
            currentLineTokenBuffer = [];
        }
    };

    advanceToNextLine(); // Initialize the first line's tokens

    const extractSingleToken = (returnAsString) => {
        if (currentLineTokenBuffer.length === 0) {
            advanceToNextLine();
            if (currentLineTokenBuffer.length === 0) {
                return undefined;
            }
        }
        const tokenValue = currentLineTokenBuffer.pop();
        return returnAsString ? tokenValue : Number(tokenValue);
    };

    const extractFullLine = (returnAsStrings) => {
        const lineContent = currentLineTokenBuffer;
        advanceToNextLine();
        return returnAsStrings ? lineContent : lineContent.map(Number);
    };

    const extractMultiLineData = (numberOfRows, returnAsStrings) => {
        const collectedRows = [];
        for (let rowCounter = 0; rowCounter < numberOfRows; rowCounter++) {
            collectedRows.push(extractFullLine(returnAsStrings));
        }
        return collectedRows;
    };

    return {
        getNumericAtom: () => extractSingleToken(false),
        getStringAtom: () => extractSingleToken(true),
        getNumericLine: () => extractFullLine(false),
        getStringLine: () => extractFullLine(true),
        getNumericMatrix: (rows) => extractMultiLineData(rows, false),
        getStringMatrix: (rows) => extractMultiLineData(rows, true),
    };
};

const executeComputation = () => {
    const dataAcquirer = createInputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = dataAcquirer.getNumericAtom();
    const primaryDataArray = dataAcquirer.getNumericLine();

    const determineMidpointValue = (collection) => {
        const sortedCollection = [...collection].sort((valA, valB) => valA - valB);
        return sortedCollection[Math.floor(sortedCollection.length / 2)];
    };

    if (elementCount <= 2) {
        return Math.max(...primaryDataArray);
    }

    const derivedDataArray = Array.from({ length: elementCount - 1 }, (_, index) =>
        Math.max(primaryDataArray[index], primaryDataArray[index + 1])
    );

    const calculationDispatch = new Map([
        [1, (p, d) => determineMidpointValue([...p, ...d])],
        [2, (p, d) => determineMidpointValue([...p, ...d])],
        [3, (p, d) => {
            const sortedDerived = [...d].sort((valA, valB) => valA - valB);
            const primaryMid = determineMidpointValue(p);
            const derivedMid1 = sortedDerived[Math.floor((elementCount - 1) / 2)];
            const derivedMid2 = sortedDerived[Math.floor((elementCount - 2) / 2)];
            return determineMidpointValue([primaryMid, primaryMid, derivedMid1, derivedMid2]);
        }],
        [0, (p, d) => {
            const sortedPrimary = [...p].sort((valA, valB) => valA - valB);
            const derivedMid = determineMidpointValue(d);
            const primaryMid1 = sortedPrimary[Math.floor(elementCount / 2)];
            const primaryMid2 = sortedPrimary[Math.floor((elementCount - 1) / 2)];
            return determineMidpointValue([derivedMid, derivedMid, primaryMid1, primaryMid2]);
        }]
    ]);

    const strategyKey = elementCount % 4;
    const selectedStrategy = calculationDispatch.get(strategyKey);

    return selectedStrategy(primaryDataArray, derivedDataArray);
};

console.log(executeComputation());
