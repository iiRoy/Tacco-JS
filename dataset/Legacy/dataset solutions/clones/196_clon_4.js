const fileSystem = require("fs");

const weightClasses = [
    { upperBoundary: 48, classIdentifier: 'light fly' },
    { upperBoundary: 51, classIdentifier: 'fly' },
    { upperBoundary: 54, classIdentifier: 'bantam' },
    { upperBoundary: 57, classIdentifier: 'feather' },
    { upperBoundary: 60, classIdentifier: 'light' },
    { upperBoundary: 64, classIdentifier: 'light welter' },
    { upperBoundary: 69, classIdentifier: 'welter' },
    { upperBoundary: 75, classIdentifier: 'light middle' },
    { upperBoundary: 81, classIdentifier: 'middle' },
    { upperBoundary: 91, classIdentifier: 'light heavy' }
];

function findClass(weight) {
    for (const categoryInfo of weightClasses) {
        if (weight <= categoryInfo.upperBoundary) {
            return categoryInfo.classIdentifier;
        }
    }
    return 'heavy';
}

const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const rawEntries = inputData.split(/\s/);

rawEntries.forEach(function(currentEntry) {
    const numericValue = Number(currentEntry);
    if (!Number.isNaN(numericValue) && numericValue !== 0) {
        const classLabel = findClass(numericValue);
        console.log(classLabel);
    }
});
