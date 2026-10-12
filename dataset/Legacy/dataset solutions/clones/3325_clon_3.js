function processInput(rawData) {
    const parseInputData = (inputString) => {
        const lines = inputString.trim().split("\n");
        const firstLineParts = lines[0].split(" ");
        const itemQuantity = parseInt(firstLineParts[0], 10);
        const itemValues = lines[1].split(" ").map(valStr => parseInt(valStr, 10));
        return { itemQuantity, itemValues };
    };

    const { itemQuantity: N, itemValues: a } = parseInputData(rawData);

    const getOccurrenceCounts = (values, maxPossibleValue) => {
        const counts = new Array(maxPossibleValue + 1).fill(0);
        for (let idx = 0; idx < values.length; idx++) {
            counts[values[idx]]++;
        }
        return counts;
    };

    let occurrenceCounts = getOccurrenceCounts(a, 3);

    const initialTotalNonZeroItems = occurrenceCounts[1] + occurrenceCounts[2] + occurrenceCounts[3];

    let memoizationTable = [];

    // This block explicitly handles the original specific pre-computation:
    // DPrecord[allCount - 1] = [[], [allCount]];
    // This sets memoizationTable[initialTotalNonZeroItems - 1][1][0] to initialTotalNonZeroItems.
    if (initialTotalNonZeroItems > 0) {
        const targetIndex0 = initialTotalNonZeroItems - 1;
        const targetIndex1 = 1;
        const targetIndex2 = 0;

        if (!memoizationTable[targetIndex0]) {
            memoizationTable[targetIndex0] = [];
        }
        if (!memoizationTable[targetIndex0][targetIndex1]) {
            memoizationTable[targetIndex0][targetIndex1] = [];
        }
        memoizationTable[targetIndex0][targetIndex1][targetIndex2] = initialTotalNonZeroItems;
    }

    console.log(calculateExpectedValue(occurrenceCounts, initialTotalNonZeroItems, memoizationTable));
}

function getNonZeroElementIndices(inputArray) {
    const indices = [];
    for (let k = 0; k < inputArray.length; k++) {
        if (inputArray[k] !== 0) {
            indices.push(k);
        }
    }
    return indices;
}

function calculateExpectedValue(currentCounts, initialTotalNonZeroItems, memoTable) {
    const countZeros = currentCounts[0];
    const countOnes = currentCounts[1];
    const countTwos = currentCounts[2];
    const countThrees = currentCounts[3];

    const getMemoizedResult = (c0, c1, c2) => memoTable[c0]?.[c1]?.[c2];
    const setMemoizedResult = (c0, c1, c2, value) => {
        if (!memoTable[c0]) memoTable[c0] = [];
        if (!memoTable[c0][c1]) memoTable[c0][c1] = [];
        memoTable[c0][c1][c2] = value;
    };

    const cachedValue = getMemoizedResult(countZeros, countOnes, countTwos);
    if (cachedValue !== undefined) {
        return cachedValue;
    }

    if (countOnes === 0 && countTwos === 0 && countThrees === 0) {
        setMemoizedResult(countZeros, countOnes, countTwos, 0);
        return 0;
    }

    const probabilityOfZeroSelection = countZeros / initialTotalNonZeroItems;
    const inverseOfProbNonZeroSelection = 1 / (1 - probabilityOfZeroSelection);
    const totalItemsForDivision = initialTotalNonZeroItems;

    let currentExpectedValue;
    let sumOfRecursiveTerms = 0;

    const allFourTypesPresent = countZeros > 0 && countOnes > 0 && countTwos > 0 && countThrees > 0;

    if (allFourTypesPresent) {
        const termForOne = calculateExpectedValue([countZeros + 1, countOnes - 1, countTwos, countThrees], initialTotalNonZeroItems, memoTable) * countOnes;
        const termForTwo = calculateExpectedValue([countZeros, countOnes + 1, countTwos - 1, countThrees], initialTotalNonZeroItems, memoTable) * countTwos;
        const termForThree = calculateExpectedValue([countZeros, countOnes, countTwos + 1, countThrees - 1], initialTotalNonZeroItems, memoTable) * countThrees;
        
        sumOfRecursiveTerms = termForOne + termForTwo + termForThree;

    } else {
        const presentItemTypes = getNonZeroElementIndices(currentCounts);
        for (const itemTypeIndex of presentItemTypes) {
            if (itemTypeIndex === 0) {
                continue;
            }

            const nextStateCounts = [...currentCounts];
            nextStateCounts[itemTypeIndex]--;
            nextStateCounts[itemTypeIndex - 1]++;

            sumOfRecursiveTerms += calculateExpectedValue(nextStateCounts, initialTotalNonZeroItems, memoTable) * currentCounts[itemTypeIndex];
        }
    }

    currentExpectedValue = (1 + sumOfRecursiveTerms / totalItemsForDivision) * inverseOfProbNonZeroSelection;

    setMemoizedResult(countZeros, countOnes, countTwos, currentExpectedValue);
    return currentExpectedValue;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
