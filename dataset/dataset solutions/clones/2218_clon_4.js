'use strict';
const processSequence = (sourceData) => {
    const [sizeOfSequence, elementsAsString] = sourceData;
    const arrayLength = Number(sizeOfSequence);
    const numericValues = elementsAsString.split(' ').map(Number);

    const calculateSpecialElements = (currentIdx, minimumEncountered, dataSeries) => {
        if (currentIdx >= dataSeries.length) {
            return 0;
        }

        const currentItem = dataSeries[currentIdx];
        let contribution = 0;

        if (currentItem <= minimumEncountered) {
            contribution = 1;
        }

        const nextMinimum = Math.min(minimumEncountered, currentItem);

        return contribution + calculateSpecialElements(currentIdx + 1, nextMinimum, dataSeries);
    };

    const finalTally = calculateSpecialElements(0, Number.POSITIVE_INFINITY, numericValues);

    console.log(finalTally);
};

const fileSystemUtility = require("fs");
const rawFileContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
const contentLines = rawFileContent.split('\n').filter(Boolean);

processSequence(contentLines);