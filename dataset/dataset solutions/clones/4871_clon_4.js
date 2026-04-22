let sequenceText = prompt("Supply three numbers, separated by spaces:");
let numericalElements = sequenceText.split(' ');

let valOne = parseInt(numericalElements[0], 10);
let valTwo = parseInt(numericalElements[1], 10);
let valThree = parseInt(numericalElements[2], 10);

let minimumValue = Math.min(valOne, valTwo, valThree);
let maximumValue = Math.max(valOne, valTwo, valThree);

// The sum of the three values will be used in the condition.
// This also implicitly provides the middle value: valOne + valTwo + valThree - minimumValue - maximumValue
let aggregateSum = valOne + valTwo + valThree;

if (aggregateSum === 2 * maximumValue || aggregateSum === 2 * minimumValue) {
    console.log('Affirmative');
} else {
    console.log('Negative');
}