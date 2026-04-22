let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
let numericInputs = rawInputData.split(/\s+/).map(Number);

function executeComputation() {
    const limitValue = numericInputs[0];

    const componentMaximum = 100;
    const maximumAttainableSum = 6 * componentMaximum * componentMaximum;

    const occurrenceRegister = new Array(maximumAttainableSum + 1).fill(0);

    for (let primary = 1; primary <= componentMaximum; primary++) {
        const primarySquared = primary * primary;
        for (let secondary = primary; secondary <= componentMaximum; secondary++) {
            const secondarySquared = secondary * secondary;
            for (let tertiary = secondary; tertiary <= componentMaximum; tertiary++) {
                const tertiarySquared = tertiary * tertiary;

                const currentSumValue = primarySquared + secondarySquared + tertiarySquared +
                                        primary * secondary + secondary * tertiary + tertiary * primary;

                if (currentSumValue <= limitValue) {
                    let countingMultiplier;

                    if (primary === secondary && secondary === tertiary) {
                        countingMultiplier = 1;
                    } else if (primary === secondary || secondary === tertiary || primary === tertiary) {
                        countingMultiplier = 3;
                    } else {
                        countingMultiplier = 6;
                    }
                    
                    occurrenceRegister[currentSumValue] += countingMultiplier;
                }
            }
        }
    }

    const outputCollection = [];
    for (let outputIndex = 1; outputIndex <= limitValue; outputIndex++) {
        outputCollection.push(occurrenceRegister[outputIndex]);
    }

    return outputCollection.join('\n');
}

let finalResult = executeComputation();
console.log(finalResult);