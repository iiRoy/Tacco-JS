const fileSystemInterface = require('node:fs');
const rawContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const transformedValues = rawContent.split('\n').map(Number);

const determineMinimum = (collection) => {
    return collection.reduce((currentMin, element) => (element < currentMin ? element : currentMin), collection[0]);
};

const primarySet = transformedValues.slice(0, 3);
const secondarySet = transformedValues.slice(3, 5);

const smallestPrimary = determineMinimum(primarySet);
const smallestSecondary = determineMinimum(secondarySet);

const combinedOutcome = smallestPrimary + smallestSecondary;

process.stdout.write(String(combinedOutcome) + '\n');