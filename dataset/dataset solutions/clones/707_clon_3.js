const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
let inputChunks = rawInputData.split("\n").filter(line => line.length > 0);

const NO_SOLUTION_INDICATOR = -1;
const INITIAL_MIN_SWAP_SUM = Infinity;

while (inputChunks.length > 1) {
    const sizesLine = inputChunks.shift();
    if (!sizesLine) {
        break;
    }
    const [firstCollectionSize, secondCollectionSize] = sizesLine.trim().split(" ").map(Number);

    const populateCollection = (count) => {
        const collection = [];
        for (let k = 0; k < count; k++) {
            const currentLine = inputChunks.shift();
            if (currentLine === undefined) {
                return [];
            }
            const parsedValue = Number(currentLine.trim());
            if (isNaN(parsedValue)) {
                continue;
            }
            collection.push(parsedValue);
        }
        return collection;
    };

    const firstCollectionItems = populateCollection(firstCollectionSize);
    const secondCollectionItems = populateCollection(secondCollectionSize);

    const sumFirstCollection = firstCollectionItems.reduce((acc, val) => acc + val, 0);
    const sumSecondCollection = secondCollectionItems.reduce((acc, val) => acc + val, 0);

    if (sumFirstCollection === sumSecondCollection) {
        const secondCollectionSet = new Set(secondCollectionItems);
        const sortedFirstCollection = [...firstCollectionItems].sort((a, b) => a - b);
        
        let commonValueFound = NO_SOLUTION_INDICATOR;

        for (const element of sortedFirstCollection) {
            if (secondCollectionSet.has(element)) {
                commonValueFound = element;
                break;
            }
        }

        if (commonValueFound === NO_SOLUTION_INDICATOR) {
            console.log(NO_SOLUTION_INDICATOR);
        } else {
            console.log(`${commonValueFound} ${commonValueFound}`);
        }
    }
    else if ((sumFirstCollection + sumSecondCollection) % 2 !== 0) {
        console.log(NO_SOLUTION_INDICATOR);
    }
    else {
        const targetSumPerCollection = (sumFirstCollection + sumSecondCollection) / 2;

        let bestSwapCandidate1 = NO_SOLUTION_INDICATOR;
        let bestSwapCandidate2 = NO_SOLUTION_INDICATOR;
        let minSwapSum = INITIAL_MIN_SWAP_SUM;

        const secondCollectionSetForLookup = new Set(secondCollectionItems);

        for (const itemFromFirst of firstCollectionItems) {
            const requiredItemFromSecond = targetSumPerCollection - sumFirstCollection + itemFromFirst;

            if (secondCollectionSetForLookup.has(requiredItemFromSecond) && (itemFromFirst + requiredItemFromSecond) < minSwapSum) {
                minSwapSum = itemFromFirst + requiredItemFromSecond;
                bestSwapCandidate1 = itemFromFirst;
                bestSwapCandidate2 = requiredItemFromSecond;
            }
        }

        if (bestSwapCandidate1 !== NO_SOLUTION_INDICATOR) {
            console.log(`${bestSwapCandidate1} ${bestSwapCandidate2}`);
        } else {
            console.log(NO_SOLUTION_INDICATOR);
        }
    }
}