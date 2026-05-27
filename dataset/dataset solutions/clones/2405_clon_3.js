"use strict";

// Helper function to parse the input line into two integer values
const extractNumbers = (lineContent) => {
    const parts = lineContent.split(" ");
    const numA = parseInt(parts[0], 10);
    const numB = parseInt(parts[1], 10);
    return { numA, numB };
};

// Constant lookup map for base scores based on rank
const rankScoreMap = {
    1: 30000,
    2: 20000,
    3: 10000,
};

// Main function to calculate and display the final score
const calculateAndDisplayScore = (inputString) => {
    // Process the raw input string
    const trimmedInput = inputString.trim();
    const inputLines = trimmedInput.split("\n");
    const firstDataLine = inputLines[0];

    // Extract the two primary values from the first line
    const { numA: primaryValueA, numB: primaryValueB } = extractNumbers(firstDataLine);

    let currentTotalScore = 0;

    // Determine and add score for primaryValueA
    const scoreForPrimaryA = rankScoreMap[primaryValueA];
    if (scoreForPrimaryA !== undefined) {
        currentTotalScore += scoreForPrimaryA;
    }

    // Determine and add score for primaryValueB
    const scoreForPrimaryB = rankScoreMap[primaryValueB];
    if (scoreForPrimaryB !== undefined) {
        currentTotalScore += scoreForPrimaryB;
    }

    // Check for and apply the special bonus condition
    const isBonusConditionMet = (primaryValueA === 1 && primaryValueB === 1);
    if (isBonusConditionMet) {
        const bonusValue = 40000;
        currentTotalScore += bonusValue;
    }

    // Output the final calculated score
    console.log(currentTotalScore);
};

// Define the standard input file path as a constant
const standardInputFilePath = '/dev/stdin';

// Read input from stdin and execute the main processing function
calculateAndDisplayScore(require('fs').readFileSync(standardInputFilePath, 'utf8'));
