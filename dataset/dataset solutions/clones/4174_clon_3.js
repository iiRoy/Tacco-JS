"use strict";

const processInput = (inputContent) => {
    const processedLines = inputContent.trim().split("\n");

    const firstLineData = processedLines[0].split(" ");
    const totalCount = parseInt(firstLineData[0], 10);
    const categoriesToExclude = parseInt(firstLineData[1], 10);

    const rawNumbers = processedLines[1].split(" ").map(strNum => parseInt(strNum, 10));

    const frequencyArraySize = 200000;
    const itemFrequencies = Array.from({ length: frequencyArraySize }, () => 0);

    for (const currentItem of rawNumbers) {
        itemFrequencies[currentItem]++;
    }

    itemFrequencies.sort((freqA, freqB) => freqB - freqA);

    const countsAfterExclusion = itemFrequencies.slice(categoriesToExclude);

    let accumulatedSum = 0;
    for (const frequencyValue of countsAfterExclusion) {
        accumulatedSum += frequencyValue;
    }

    console.log(accumulatedSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
