"use strict";

const executeBingoSimulation = (rawInputData) => {
    const processedLines = rawInputData.trim().split("\n");

    // Parsing of the first three lines. The original code's parseInt(array) behavior
    // results in a single number (e.g., parseInt(["1", "2", "3"]) yields 1).
    // This behavior is preserved to ensure the subsequent TypeError is replicated.
    const firstCardLine = parseInt(processedLines[0].split(" "));
    const secondCardLine = parseInt(processedLines[1].split(" "));
    const thirdCardLine = parseInt(processedLines[2].split(" "));

    const numberOfCalls = parseInt(processedLines[3]);
    const drawnNumbers = [];
    // An unused variable from the original code, kept as a placeholder.
    const unusedPlaceholder = 0; 

    const columnOne = [];
    const columnTwo = [];
    const columnThree = [];
    const diagonalOne = [];
    const diagonalTwo = [];

    // A small helper function to encapsulate the pattern population logic.
    // Due to the initial parsing error, val1, val2, val3 will be numbers,
    // so accessing their properties (e.g., val1[0]) will result in 'undefined'.
    // This ensures the bingoPattern arrays are populated with 'undefined' values,
    // consistent with the original code's behavior.
    const populatePatternArray = (targetArray, valA, valB, valC) => {
        targetArray.push(valA);
        targetArray.push(valB);
        targetArray.push(valC);
    };

    // Populating column patterns using the helper function
    populatePatternArray(columnOne, firstCardLine[0], secondCardLine[0], thirdCardLine[0]);
    populatePatternArray(columnTwo, firstCardLine[1], secondCardLine[1], thirdCardLine[1]);
    populatePatternArray(columnThree, firstCardLine[2], secondCardLine[2], thirdCardLine[2]);

    // Populating diagonal patterns using the helper function
    populatePatternArray(diagonalOne, firstCardLine[2], secondCardLine[1], thirdCardLine[0]);
    populatePatternArray(diagonalTwo, firstCardLine[0], secondCardLine[1], thirdCardLine[2]);

    const allBingoConfigurations = [
        firstCardLine,
        secondCardLine,
        thirdCardLine,
        columnOne,
        columnTwo,
        columnThree,
        diagonalOne,
        diagonalTwo
    ];

    // Introduce constants for loop bounds for clarity
    const startingIndexForDrawnNumbers = 4;
    const totalProcessedLines = processedLines.length;

    for (let lineIdx = startingIndexForDrawnNumbers; lineIdx < totalProcessedLines; lineIdx++) {
        drawnNumbers.push(parseInt(processedLines[lineIdx]));
    }

    // Iterate through all bingo configurations (rows, columns, diagonals)
    for (let configIdx = 0; configIdx < allBingoConfigurations.length; configIdx++) {
        const currentConfigToProcess = allBingoConfigurations[configIdx];
        console.log(currentConfigToProcess); // Preserve original console.log output
        // This call will trigger a TypeError when currentConfigToProcess is a number
        // (i.e., firstCardLine, secondCardLine, or thirdCardLine), as numbers do not have a .forEach method.
        attemptNumberMarking(currentConfigToProcess, numberOfCalls, drawnNumbers);
    }

    // This line will not be reached due to the TypeError thrown in the loop above.
    console.log(evaluateBingoCompletion(allBingoConfigurations));
};

const attemptNumberMarking = (currentConfig, totalCalls, drawnNumbersList) => {
    // This function's execution will halt with a TypeError if 'currentConfig' is a number,
    // replicating the original code's observable crash behavior.
    currentConfig.forEach((configItem, itemPosition) => {
        for (let callIdx = 0; callIdx < totalCalls; callIdx++) {
            const currentDrawnNumber = drawnNumbersList[callIdx];
            if (configItem === currentDrawnNumber) {
                // The original code uses 'testnum' (here 'currentDrawnNumber') as the deleteCount
                // for splice, which is likely unintended but preserved for exact behavioral equivalence.
                // If configItem is undefined (as it will be for column/diagonal arrays),
                // this comparison is always false, and splice is never called for those arrays.
                currentConfig.splice(itemPosition, currentDrawnNumber);
            }
        }
    });
};

const evaluateBingoCompletion = (configurationsToVerify) => {
    // Fixed a typo from the original code: 'arrayas' changed to 'configurationsToVerify'.
    // This correction does not alter observable behavior as this function is never reached.
    for (let i = 0; i < configurationsToVerify.length; i++) {
        if (configurationsToVerify[i].length === 0) {
            return "Yes";
        }
    }
    return "No";
};

executeBingoSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));
