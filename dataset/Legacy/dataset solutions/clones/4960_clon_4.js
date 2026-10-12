'use strict';

function processSequenceTransformation(rawInputData) {
    const parsedLines = rawInputData.split("\n");
    const initialSequence = parsedLines[0];
    let powerBudget = parseInt(parsedLines[1]);

    const charNumericValues = Array.from(initialSequence).map(char => char.charCodeAt(0));

    const transformationResult = charNumericValues.reduce((accumulator, currentNumericValue, currentIndex, sourceArray) => {
        if (accumulator.remainingBudget === 0) {
            accumulator.transformedValues.push(currentNumericValue);
            return accumulator;
        }

        if (currentNumericValue === 97) {
            accumulator.transformedValues.push(currentNumericValue);
            return accumulator;
        }

        const costToTargetA = 123 - currentNumericValue;

        if (accumulator.remainingBudget >= costToTargetA) {
            accumulator.remainingBudget -= costToTargetA;
            accumulator.transformedValues.push(97);
            return accumulator;
        } else {
            if (currentIndex === sourceArray.length - 1) {
                const effectiveModification = accumulator.remainingBudget % 26;
                const modifiedNumericValue = (currentNumericValue - 97 + effectiveModification) % 26 + 97;
                accumulator.transformedValues.push(modifiedNumericValue);
                accumulator.remainingBudget = 0;
                return accumulator;
            } else {
                accumulator.transformedValues.push(currentNumericValue);
                return accumulator;
            }
        }
    }, { transformedValues: [], remainingBudget: powerBudget });

    console.log(String.fromCharCode(...transformationResult.transformedValues));
}

processSequenceTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));
