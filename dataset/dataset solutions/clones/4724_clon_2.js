var appState = initializeSystem();

ProcessData();

function retrieveInteger() {
    return transformInput(advanceCursor(), 1);
}

function retrieveStringGroup() {
    return transformInput(advanceCursor(), 2);
}

function retrieveNumberGroup() {
    return transformInput(advanceCursor(), 4);
}

function retrieveCharGroup() {
    return transformInput(advanceCursor(), 6);
}

function advanceCursor() {
    return appState.nextElement();
}

function hasMoreElements() {
    return appState.hasMoreContent();
}

function readSourceData() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeSystem() {
    var sourceFileContent = readSourceData();
    var systemHandler = {
        "dataList": sourceFileContent,
        "currentPosition": 0,
        "totalElements": sourceFileContent.length,
        "hasMoreContent": function() {
            return (this.currentPosition < this.totalElements);
        },
        "nextElement": function() {
            if (!this.hasMoreContent()) {
                throw "EndOfInputException - No more data available";
            } else {
                var extractedLine = this.dataList[this.currentPosition];
                this.currentPosition++;
                return extractedLine;
            }
        }
    };
    return systemHandler;
}

function displayResult(contentToLog) {
    console.log(contentToLog);
}

function logError(errorMessage) {
    console.error(errorMessage);
}

// This utility function converts input based on the specified type.
// Type 1: Converts to an integer.
// Type 2: Splits a string by spaces.
// Type 4: Splits by spaces and maps to numerical values.
// Type 6: Breaks a string into individual characters.
// Type 7: Breaks into characters and maps to numerical values.
// Type 8: Joins an array with spaces.
// Type 9: Joins an array with newlines.
// Type 0: Joins an array without any separator.
// Default: Returns the input without modification.
function transformInput(inputData, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputData);
            case 2:
                return inputData.split(" ");
            case 4:
                return inputData.split(" ").map((element) => Number(element));
            case 6:
                return inputData.split("");
            case 7:
                return inputData.split("").map((element) => Number(element));
            case 8:
                return inputData.join(" ");
            case 9:
                return inputData.join("\n");
            case 0:
                return inputData.join("");
            default:
                return inputData;
        }
    } catch (exceptionOccurred) {
        return inputData;
    }
}

function ProcessData() {
    var firstLineValues = retrieveNumberGroup();
    var totalItems = firstLineValues[0];
    var targetA = firstLineValues[1];
    var targetB = firstLineValues[2];

    var itemCollection = new Array(totalItems);
    for (var loopIdx = 0; loopIdx < totalItems; loopIdx++) {
        itemCollection[loopIdx] = retrieveNumberGroup();
    }

    var dynamicProgramTable = new Array(totalItems + 1);
    var maxDimensionValue = 151;

    for (var itemIdx = 0; itemIdx < totalItems + 1; itemIdx++) {
        dynamicProgramTable[itemIdx] = new Array(maxDimensionValue);
        for (var valJ = 0; valJ < maxDimensionValue; valJ++) {
            dynamicProgramTable[itemIdx][valJ] = new Array(maxDimensionValue);
        }
    }

    dynamicProgramTable[0][0][0] = 0;
    // dpTable[numItems][sumA][sumB] represents the minimum accumulated cost
    // to achieve sumA and sumB using the first 'numItems' available items.
    for (var currentItemCount = 1; currentItemCount <= totalItems; currentItemCount++) {
        for (var sumA = 0; sumA < maxDimensionValue; sumA++) {
            for (var sumB = 0; sumB < maxDimensionValue; sumB++) {
                if (dynamicProgramTable[currentItemCount - 1][sumA][sumB] !== null) {
                    dynamicProgramTable[currentItemCount][sumA][sumB] = dynamicProgramTable[currentItemCount - 1][sumA][sumB];
                }
            }
        }

        var currentItemDetails = itemCollection[currentItemCount - 1];
        for (var prevSumA = 0; prevSumA < maxDimensionValue; prevSumA++) {
            for (var prevSumB = 0; prevSumB < maxDimensionValue; prevSumB++) {
                // If a previous state is valid (not null), consider adding the current item.
                if (dynamicProgramTable[currentItemCount - 1][prevSumA][prevSumB] !== null) {
                    var newSumA = prevSumA + currentItemDetails[0];
                    var newSumB = prevSumB + currentItemDetails[1];
                    var currentCost = dynamicProgramTable[currentItemCount - 1][prevSumA][prevSumB] + currentItemDetails[2];

                    if (dynamicProgramTable[currentItemCount][newSumA][newSumB] === null) {
                        dynamicProgramTable[currentItemCount][newSumA][newSumB] = currentCost;
                    } else {
                        dynamicProgramTable[currentItemCount][newSumA][newSumB] = Math.min(currentCost, dynamicProgramTable[currentItemCount][newSumA][newSumB]);
                    }
                }
            }
        }
    }

    var ratioMultiplier = 1;
    var finalOutcome = 10000; // Represents an initial impossibly high cost

    while (true) {
        var currentTargetA = targetA * ratioMultiplier;
        var currentTargetB = targetB * ratioMultiplier;

        if (currentTargetA < maxDimensionValue && currentTargetB < maxDimensionValue) {
            if (dynamicProgramTable[totalItems][currentTargetA][currentTargetB] !== null) {
                finalOutcome = Math.min(finalOutcome, dynamicProgramTable[totalItems][currentTargetA][currentTargetB]);
            }
        } else {
            break; // Stop if target values exceed bounds
        }
        ratioMultiplier++;
    }

    if (finalOutcome === 10000) {
        displayResult(-1); // No combination found that meets the criteria
    } else {
        displayResult(finalOutcome);
    }
}