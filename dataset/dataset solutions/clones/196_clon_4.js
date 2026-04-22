const inputSourceUtility = globalThis.require("fs");

const classificationBoundaries = [
    { ceiling: 48, label: 'light fly' },
    { ceiling: 51, label: 'fly' },
    { ceiling: 54, label: 'bantam' },
    { ceiling: 57, label: 'feather' },
    { ceiling: 60, label: 'light' },
    { ceiling: 64, label: 'light welter' },
    { ceiling: 69, label: 'welter' },
    { ceiling: 75, label: 'light middle' },
    { ceiling: 81, label: 'middle' },
    { ceiling: 91, label: 'light heavy' }
];
const defaultClassification = 'heavy';

function determineCategory(valueToClassify, boundaries, currentBoundaryIndex = 0) {
    if (currentBoundaryIndex >= boundaries.length) {
        return defaultClassification;
    }
    const currentRule = boundaries[currentBoundaryIndex];
    if (valueToClassify <= currentRule.ceiling) {
        return currentRule.label;
    } else {
        return determineCategory(valueToClassify, boundaries, currentBoundaryIndex + 1);
    }
}

function processInputItems(itemsCollection, indexPosition = 0) {
    if (indexPosition >= itemsCollection.length) {
        return;
    }

    const currentItemString = itemsCollection[indexPosition];
    const numericalValue = Number(currentItemString);

    if (numericalValue === numericalValue && numericalValue !== 0) {
        const finalCategoryLabel = determineCategory(numericalValue, classificationBoundaries);
        globalThis.console.log(finalCategoryLabel);
    }

    processInputItems(itemsCollection, indexPosition + 1);
}

const rawContent = inputSourceUtility.readFileSync("/dev/stdin", "utf8");
const dataSegments = rawContent.match(/\S+/g) || [];

processInputItems(dataSegments);