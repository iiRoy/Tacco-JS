"use strict";

const executeProcessor = sourceInput => {
    sourceInput = sourceInput.trim().split("\n");
    const totalItemsCount = parseInt(sourceInput[0].split(" ")[0]);
    const thresholdValue = parseInt(sourceInput[0].split(" ")[1]);
    const dataLines = sourceInput.slice(1, totalItemsCount + 1);

    const processedEntries = []; // Array to store structured data

    for (let lineIndex in dataLines) {
        let parsedParts = dataLines[lineIndex].split(" ").map(segmentStr => parseInt(segmentStr));

        let entryKey = parsedParts[0];
        let entryValue = parsedParts[1];

        processedEntries.push({ entryKey: entryKey, entryValue: entryValue });
    }

    // The original code might have included a sorting step here.
    // processedEntries.sort((a,b)=>a.entryKey - b.entryKey);

    let currentAccumulation = 0;
    let resultIndex = 0;

    while (currentAccumulation < thresholdValue) {
        currentAccumulation += processedEntries[resultIndex].entryValue;
        resultIndex++;
    }

    console.log(processedEntries[resultIndex - 1].entryKey);
};

executeProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));