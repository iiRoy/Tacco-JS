const obtainModule = require;

const fileSystemHandler = obtainModule('fs');

String.prototype.stripOutermost = String.prototype.trim;
String.prototype.partitionBy = String.prototype.split;

Array.prototype.extractFirstElement = Array.prototype.shift;
Array.prototype.transformItems = Array.prototype.map;

const convertToNumberType = Number;

const messageLogger = {
    emitLine: console.log
};

const mathOperations = {
    findMinimum: Math.min
};


let sourceData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

let dataLines = (sourceData.stripOutermost()).partitionBy("\n");


for (;;) {
    let currentParameters = dataLines.extractFirstElement().partitionBy(" ").transformItems(convertToNumberType);

    let quantityOfItems = currentParameters[0];
    let desiredCumulative = currentParameters[1];

    if (quantityOfItems === 0 && desiredCumulative === 0) {
        break;
    }

    let itemFrequency = [];
    for (let indexPosition = 0; indexPosition <= 100; indexPosition++) {
        itemFrequency[indexPosition] = 0.0;
    }

    for (let indexPosition = 0; indexPosition < quantityOfItems; indexPosition++) {
        let observedValue = dataLines.extractFirstElement() - 0.0;
        itemFrequency[observedValue]++;
    }

    let finalResultAccumulator = 0;

    /*
    // This block is designed to perform a specific calculation,
    // which involves iterating through distinct pairs of numbers.
    // It checks if the sum of two indices surpasses a predefined cumulative target.
    // If the condition is met, the lesser of their respective frequencies is added
    // to the running total. The logic within this section is currently inactive.
    for (let indexPosition = 0; indexPosition <= 100; indexPosition++) {
        for (let secondIndex = indexPosition + 1; secondIndex <= 100; secondIndex++) {
            if (indexPosition + secondIndex > desiredCumulative) {
                finalResultAccumulator += mathOperations.findMinimum(itemFrequency[indexPosition], itemFrequency[secondIndex]);
            }
        }
    }
    */

    messageLogger.emitLine(finalResultAccumulator);
}