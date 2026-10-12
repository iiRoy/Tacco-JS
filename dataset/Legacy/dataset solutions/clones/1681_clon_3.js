function processInputData(rawDataString) {
    const processedLines = rawDataString.trim().split("\n");
    const parsedInputData = processedLines.map(function(lineStr) {
        return lineStr.split(" ");
    });

    let currentLineIdx = 1;

    const findInsertionPoint = (arr, targetValue) => {
        let firstIdx = 0, lastIdx = arr.length - 1, midIdx;
        while (firstIdx <= lastIdx) {
            midIdx = Math.floor((firstIdx + lastIdx) / 2);
            if (arr[midIdx] < targetValue) firstIdx = midIdx + 1;
            else lastIdx = midIdx - 1;
        }
        return firstIdx;
    };

    while (currentLineIdx < parsedInputData.length && parsedInputData[currentLineIdx] !== null) {
        const numEntries = parseInt(parsedInputData[currentLineIdx][0], 10);

        const firstCategoryItems = [];
        const secondCategoryItems = [];
        let uniqueKValues1 = [];
        let uniqueKValues2 = [];

        let baseSumValue = 0;
        let remainingEntriesCount = numEntries;

        const parseEntryLine = (lineData) => lineData.map(val => parseInt(val, 10));

        for (let entryIdx = 0; entryIdx < numEntries; entryIdx++) {
            const currentEntryData = parseEntryLine(parsedInputData[currentLineIdx + entryIdx + 1]);
            
            const kVal = currentEntryData[0];
            const lVal = currentEntryData[1];
            const rVal = currentEntryData[2];

            if (kVal === numEntries) {
                baseSumValue += lVal;
                remainingEntriesCount--;
            } else if (lVal > rVal) {
                firstCategoryItems.push(currentEntryData);
                baseSumValue += rVal;
                uniqueKValues1.push(kVal - 1);
            } else if (lVal < rVal) {
                const transformedEntry = [numEntries - kVal, rVal, lVal];
                secondCategoryItems.push(transformedEntry);
                baseSumValue += rVal;
                uniqueKValues2.push(transformedEntry[0] - 1);
            } else {
                baseSumValue += lVal;
                remainingEntriesCount--;
            }
        }

        const getUniqueSortedValues = (kList) => {
            return kList.sort((a, b) => a - b).filter((element, idx, arrayRef) => {
                return arrayRef.indexOf(element) === idx;
            });
        };

        uniqueKValues1 = getUniqueSortedValues(uniqueKValues1);
        uniqueKValues2 = getUniqueSortedValues(uniqueKValues2);

        const allocationTracker1 = [[], []];
        const allocationTracker2 = [[], []];

        let kValueToIndexMap1Length = 0;
        if (uniqueKValues1.length > 0) {
            kValueToIndexMap1Length = uniqueKValues1[uniqueKValues1.length - 1] + 1;
        }
        const kValueToIndexMap1 = Array.from({length: kValueToIndexMap1Length}, () => 0);

        let kValueToIndexMap2Length;
        let buggedIndexForMap2 = -1;
        if (uniqueKValues2.length > 0) {
            buggedIndexForMap2 = uniqueKValues2.length - 1;
        }
        const buggedValueForMap2 = uniqueKValues1[buggedIndexForMap2];
        if (buggedValueForMap2 !== undefined && buggedValueForMap2 !== null) {
            kValueToIndexMap2Length = buggedValueForMap2 + 1;
        } else {
            kValueToIndexMap2Length = NaN;
        }
        const kValueToIndexMap2 = Array.from({length: kValueToIndexMap2Length}, () => 0);

        const populateSpaceData = (kList, allocationTracker, kValueToIndexMap) => {
            let lastKValue = -1;
            for (let idx = 0; idx < kList.length; idx++) {
                const currentK = kList[idx];
                allocationTracker[0].push(currentK - lastKValue);
                allocationTracker[1].push(0);
                kValueToIndexMap[currentK] = idx;
                lastKValue = currentK;
            }
        };

        populateSpaceData(uniqueKValues1, allocationTracker1, kValueToIndexMap1);
        populateSpaceData(uniqueKValues2, allocationTracker2, kValueToIndexMap2);

        let finalCalculatedSum = baseSumValue;

        const processCategoryItems = (itemsArray, kValueToIndexMap, allocationTracker) => {
            for (let idx = 0; idx < itemsArray.length; idx++) {
                const currentItem = itemsArray[idx];
                const potentialIncrease = currentItem[1] - currentItem[2];
                let currentAllocationIndex = kValueToIndexMap[currentItem[0] - 1];

                while (currentAllocationIndex >= 0 && allocationTracker[1][currentAllocationIndex] === allocationTracker[0][currentAllocationIndex]) {
                    currentAllocationIndex--;
                }

                if (currentAllocationIndex >= 0) {
                    allocationTracker[1][currentAllocationIndex]++;
                    finalCalculatedSum += potentialIncrease;
                }
            }
        };

        processCategoryItems(firstCategoryItems, kValueToIndexMap1, allocationTracker1);
        processCategoryItems(secondCategoryItems, kValueToIndexMap2, allocationTracker2);
    
        console.log(finalCalculatedSum);

        currentLineIdx += numEntries + 1;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
