"use strict";

// This function processes the provided input string to calculate a specific sum.
const processInput = (rawInput) => {
    // Clean up the input string and split it into lines.
    rawInput = rawInput.trim().split("\n");

    // Parse the first line to extract two integer values.
    const elementCount = parseInt(rawInput[0].split(" ")[0]); // Represents N from original
    const removalThreshold = parseInt(rawInput[0].split(" ")[1]); // Represents K from original

    // Parse the second line, splitting by space and converting each part to an integer.
    const numericValues = rawInput[1].split(" ").map(currentValue => parseInt(currentValue));

    // Initialize an array to count frequencies, assuming values up to 200,000.
    const valueFrequencies = [...Array(200000)].fill(0);

    // Iterate through the numeric values and increment their counts in the frequency array.
    for (let valueIndex in numericValues) {
        valueFrequencies[numericValues[valueIndex]]++;
    }

    // Sort the frequency counts in descending order.
    valueFrequencies.sort((freqA, freqB) => freqB - freqA);

    // Slice the sorted frequencies from the 'removalThreshold' index onwards,
    // then sum the remaining frequencies.
    console.log(valueFrequencies.slice(removalThreshold, valueFrequencies.length + 1).reduce((totalSum, currentFreq) => totalSum + currentFreq));
};

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
