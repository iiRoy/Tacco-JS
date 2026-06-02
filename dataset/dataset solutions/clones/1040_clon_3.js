const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const parseStringToNumber = (str) => Number(str);
const parseSpaceSeparatedNumbers = (str) => str.split(" ").map(parseStringToNumber);

const inputLines = rawInputContent.trim().split("\n");

const firstArrayLength = parseStringToNumber(inputLines[0]);
const sortedSearchCollection = parseSpaceSeparatedNumbers(inputLines[1]);
const valuesToFind = parseSpaceSeparatedNumbers(inputLines[3]);

const createOptimizedBinarySearcher = (collectionReference, collectionSize) => {
    const minimumSearchableValue = collectionReference[0];
    const maximumSearchableValue = collectionReference[collectionSize - 1];

    return (targetElement) => {
        if (targetElement < minimumSearchableValue || targetElement > maximumSearchableValue) {
            return 0;
        }

        let lowerBound = 0;
        let upperBound = collectionSize;

        while (lowerBound < upperBound) {
            const midPoint = Math.floor((lowerBound + upperBound) / 2);
            const valueAtMidPoint = collectionReference[midPoint];

            if (targetElement < valueAtMidPoint) {
                upperBound = midPoint;
            } else if (targetElement > valueAtMidPoint) {
                lowerBound = midPoint + 1;
            } else {
                return 1;
            }
        }
        return 0;
    };
};

const searchForExistence = createOptimizedBinarySearcher(sortedSearchCollection, firstArrayLength);

const accumulateSum = (currentTotal, itemToAdd) => currentTotal + itemToAdd;

const existenceFlags = valuesToFind.map(searchForExistence);

const finalCount = existenceFlags.reduce(accumulateSum, 0);

console.log(finalCount);
