const processData = (rawInputLines) => {
    const countElements = Number(rawInputLines[0]);
    const parseNumericPair = (lineContent) => lineContent.split(" ").map(Number);

    const collectionAlpha = rawInputLines.slice(1, 1 + countElements).map(parseNumericPair);
    const collectionBeta = rawInputLines.slice(1 + countElements, 1 + 2 * countElements).map(parseNumericPair);

    const compareAlphaItems = (itemA, itemB) => itemA[0] > itemA[1] ? (itemA[1] - itemB[1]) : (itemA[0] - itemB[0]);
    const compareBetaItems = (itemA, itemB) => itemA[0] > itemA[1] ? (itemB[1] - itemA[1]) : (itemA[0] - itemB[0]);

    const executeSelectionSort = (targetArray, comparisonFunction) => {
        const arrayLength = targetArray.length;
        for (let outerIndex = 0; outerIndex < arrayLength - 1; outerIndex++) {
            let minimumIndex = outerIndex;
            for (let innerIndex = outerIndex + 1; innerIndex < arrayLength; innerIndex++) {
                if (comparisonFunction(targetArray[innerIndex], targetArray[minimumIndex]) < 0) {
                    minimumIndex = innerIndex;
                }
            }
            if (minimumIndex !== outerIndex) {
                [targetArray[outerIndex], targetArray[minimumIndex]] = [targetArray[minimumIndex], targetArray[outerIndex]];
            }
        }
    };

    executeSelectionSort(collectionAlpha, compareAlphaItems);
    executeSelectionSort(collectionBeta, compareBetaItems);

    const calculateMatchesRecursively = (alphaSet, betaSet, currentAlphaPointer, currentBetaPointer, accumulatedMatches) => {
        if (currentAlphaPointer >= alphaSet.length || currentBetaPointer >= betaSet.length) {
            return accumulatedMatches;
        }

        const currentAlphaItem = alphaSet[currentAlphaPointer];
        const currentBetaItem = betaSet[currentBetaPointer];

        if (currentAlphaItem[0] < currentBetaItem[0] && currentAlphaItem[1] < currentBetaItem[1]) {
            return calculateMatchesRecursively(alphaSet, betaSet, currentAlphaPointer + 1, currentBetaPointer + 1, accumulatedMatches + 1);
        } else {
            return calculateMatchesRecursively(alphaSet, betaSet, currentAlphaPointer, currentBetaPointer + 1, accumulatedMatches);
        }
    };

    const finalMatchCount = calculateMatchesRecursively(collectionAlpha, collectionBeta, 0, 0, 0);
    console.log(finalMatchCount);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
