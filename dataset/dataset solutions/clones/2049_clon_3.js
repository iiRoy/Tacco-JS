"use strict";

const STDIN_FILE_PATH = "/dev/stdin";
const NEWLINE_DELIMITER = '\n';

function parseInputData(rawContent) {
    const contentLines = rawContent.split(NEWLINE_DELIMITER);
    const maxCountValue = Number(contentLines[0]);
    const numbersCollection = contentLines[1].split(' ').map(Number);
    return { maxLimit: maxCountValue, inputNumbers: numbersCollection };
}

function computeFrequencyMap(limit, numbers) {
    const frequencyMap = (new Array(limit)).fill(0);
    for (let index = 0; index < limit; index++) {
        const currentNumber = numbers[index];
        frequencyMap[currentNumber - 1]++;
    }
    return frequencyMap;
}

function calculateTotalCombinations(frequencies) {
    let totalCombinations = 0;
    for (let i = 0; i < frequencies.length; i++) {
        const count = frequencies[i];
        if (count >= 2) {
            const combinationsForThisElement = count * (count - 1) / 2;
            totalCombinations += combinationsForThisElement;
        }
    }
    return totalCombinations;
}

const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, "utf8").trim();

const { maxLimit, inputNumbers } = parseInputData(rawInputContent);

const numberFrequencies = computeFrequencyMap(maxLimit, inputNumbers);

const initialTotalPairs = calculateTotalCombinations(numberFrequencies);

inputNumbers.forEach(currentValue => {
    const frequencyOfCurrentValue = numberFrequencies[currentValue - 1];
    const adjustedPairs = initialTotalPairs - (frequencyOfCurrentValue - 1);
    console.log(adjustedPairs);
});
