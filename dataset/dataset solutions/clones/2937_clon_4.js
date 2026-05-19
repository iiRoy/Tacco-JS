const createInputParser = (sourceText) => {
    const allLines = sourceText.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokens = [];
    let currentTokenIndex = 0;

    const advanceToNextLine = () => {
        currentLineIndex++;
        currentTokenIndex = 0;
        currentLineTokens = [];
        if (currentLineIndex < allLines.length) {
            currentLineTokens = allLines[currentLineIndex].split(' ');
        }
    };

    const retrieveNextToken = (returnAsString) => {
        if (currentTokenIndex >= currentLineTokens.length) {
            advanceToNextLine();
            if (currentLineIndex >= allLines.length) {
                return undefined;
            }
        }
        const tokenValue = currentLineTokens[currentTokenIndex++];
        return returnAsString ? tokenValue : Number(tokenValue);
    };

    const retrieveFullLineTokens = (returnAsString) => {
        if (currentTokenIndex > 0 && currentTokenIndex < currentLineTokens.length) {
            advanceToNextLine();
        }
        if (currentLineIndex >= allLines.length) {
            return undefined;
        }
        const lineContent = allLines[currentLineIndex];
        advanceToNextLine();
        const tokens = lineContent.split(' ');
        return returnAsString ? tokens : tokens.map(Number);
    };

    const retrieveMultipleLinesTokens = (count, returnAsString) => {
        if (currentTokenIndex > 0 && currentTokenIndex < currentLineTokens.length) {
            advanceToNextLine();
        }
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= allLines.length) {
                break;
            }
            const lineContent = allLines[currentLineIndex];
            advanceToNextLine();
            collectedLines.push(returnAsString ? lineContent.split(' ') : lineContent.split(' ').map(Number));
        }
        return collectedLines;
    };

    const retrieveRawLines = (count, returnAsString) => {
        if (currentTokenIndex > 0 && currentTokenIndex < currentLineTokens.length) {
            advanceToNextLine();
        }
        const collectedRawLines = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= allLines.length) {
                break;
            }
            const lineContent = allLines[currentLineIndex];
            advanceToNextLine();
            collectedRawLines.push(returnAsString ? lineContent : Number(lineContent));
        }
        return collectedRawLines;
    };

    if (allLines.length > 0) {
        currentLineTokens = allLines[0].split(' ');
    }

    return {
        fetchAtom: retrieveNextToken,
        fetchLine: retrieveFullLineTokens,
        fetchManyLines: retrieveMultipleLinesTokens,
        fetchRawLines: retrieveRawLines,
    };
};

const generateNestedArray = (initialValue, ...dimensions) => {
    const constructArray = (remainingDimensions) => {
        if (remainingDimensions.length === 0) {
            return initialValue;
        }
        const currentDimensionSize = remainingDimensions[0];
        const nextDimensions = remainingDimensions.slice(1);
        return Array.from({ length: currentDimensionSize }, () => constructArray(nextDimensions));
    };
    return constructArray(dimensions);
};

const inputSource = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function processData() {
    const totalElements = inputSource.fetchAtom();
    const modificationSetCount = inputSource.fetchAtom();

    const elementValues = inputSource.fetchLine().sort((valA, valB) => valA - valB);

    const modificationSets = inputSource.fetchManyLines(modificationSetCount);
    modificationSets.sort((setA, setB) => setB[1] - setA[1]);

    let elementPointer = 0;
    let setPointer = 0;
    let currentSetApplications = 0;

    while (elementPointer < totalElements && setPointer < modificationSetCount) {
        const [applicationLimit, modificationValue] = modificationSets[setPointer];

        if (currentSetApplications >= applicationLimit) {
            setPointer++;
            currentSetApplications = 0;
            continue;
        }

        if (elementValues[elementPointer] < modificationValue) {
            elementValues[elementPointer] = modificationValue;
            elementPointer++;
            currentSetApplications++;
        } else {
            break;
        }
    }

    let finalSum = 0;
    for (const value of elementValues) {
        finalSum += value;
    }
    return finalSum;
}

console.log(processData());
