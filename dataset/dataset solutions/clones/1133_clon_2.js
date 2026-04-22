// Standard input handling routine
var outputPrinter = console.info;
if (typeof process !== "undefined") {
    var receivedData = "";
    process.stdin.resume();

    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', function (dataSegment) {
        receivedData += dataSegment;
    });

    process.stdin.on('end', function () {
        var inputRows = receivedData.split("\n");
        processInput(inputRows);
    });
}


function processInput(rawLines) {
    // Convert string inputs to numerical arrays or single numbers
    rawLines = rawLines.map(function (currentString) {
        if (currentString.split(/\s+/).length >= 2) {
            return currentString.split(' ').map(function (numericString) {
                return parseInt(numericString, 10);
            });
        }
        else {
            return parseInt(currentString, 10);
        }
    });

    var firstLineData = rawLines.shift();
    var itemCount = firstLineData.shift();
    var maxWeightCapacity = firstLineData.shift();
    var itemDetails = rawLines;

    var loopCounter = itemCount; // This variable is declared but not used further, maintaining original structure.

    var storageObject = {}; // This object is declared but not used further, maintaining original structure.

    calculateOptimalValue(itemDetails, maxWeightCapacity);
}


function calculateOptimalValue(availableItems, capacityLimit) {
    var currentKnapsackStates = {};
    var previousKnapsackStates = {};

    for (var itemIndex = 0; itemIndex < availableItems.length; itemIndex++) {
        var itemValue = availableItems[itemIndex][0];
        var itemWeight = availableItems[itemIndex][1];

        previousKnapsackStates = currentKnapsackStates;
        currentKnapsackStates = {};

        for (var currentWeightKey in previousKnapsackStates) {
            var currentWeight = Number.parseInt(currentWeightKey, 10);

            // Copy existing state if it's better or new
            if (currentKnapsackStates[currentWeight] === undefined || currentKnapsackStates[currentWeight] <= previousKnapsackStates[currentWeight]) {
                currentKnapsackStates[currentWeight] = previousKnapsackStates[currentWeight];
            }

            // If adding the current item leads to a valid total weight, update the value.
            if ((currentWeight + itemWeight) <= capacityLimit) {
                if ((previousKnapsackStates[currentWeight + itemWeight] === undefined || previousKnapsackStates[currentWeight + itemWeight] <= previousKnapsackStates[currentWeight] + itemValue) &&
                    (currentKnapsackStates[currentWeight + itemWeight] === undefined || currentKnapsackStates[currentWeight + itemWeight] <= previousKnapsackStates[currentWeight] + itemValue))
                {
                    currentKnapsackStates[currentWeight + itemWeight] = previousKnapsackStates[currentWeight] + itemValue;
                }
            } else {
                break;
            }
        }

        // Also consider adding just the current item if it hasn't been added yet.
        if ((previousKnapsackStates[itemWeight] === undefined || previousKnapsackStates[itemWeight] <= itemValue) &&
            (currentKnapsackStates[itemWeight] === undefined || currentKnapsackStates[itemWeight] <= itemValue))
        {
            currentKnapsackStates[itemWeight] = itemValue;
        }
    }

    // Find the maximum value within the capacity limit
    for (var optimalWeightSearchIndex = capacityLimit; optimalWeightSearchIndex > 0; optimalWeightSearchIndex--) {
        if (currentKnapsackStates[optimalWeightSearchIndex] !== undefined) {
            outputPrinter(currentKnapsackStates[optimalWeightSearchIndex]);
            break;
        }
    }
}