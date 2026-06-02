"use strict";

function calculateTripExpenses(journeyData) {
    const allLines = journeyData.split('\n');

    const parsedNumbers = allLines.reduce((accumulator, currentLine) => {
        const trimmedLine = currentLine.trim();
        if (trimmedLine !== '') {
            accumulator.push(parseInt(trimmedLine, 10));
        }
        return accumulator;
    }, []);

    let firstPairOptions = [];
    firstPairOptions.push(parsedNumbers.shift());
    firstPairOptions.push(parsedNumbers.shift());

    let secondPairOptions = [];
    secondPairOptions.push(parsedNumbers.pop());
    secondPairOptions.push(parsedNumbers.pop());
    secondPairOptions.reverse();

    let minimumFirstLeg;
    if (firstPairOptions[0] < firstPairOptions[1]) {
        minimumFirstLeg = firstPairOptions[0];
    } else {
        minimumFirstLeg = firstPairOptions[1];
    }

    const determineSmallerValue = (valueA, valueB) => {
        return valueA < valueB ? valueA : valueB;
    };
    let minimumSecondLeg = determineSmallerValue(secondPairOptions[0], secondPairOptions[1]);

    console.log(minimumFirstLeg + minimumSecondLeg);
}

calculateTripExpenses(require('fs').readFileSync('/dev/stdin', 'utf8'));
