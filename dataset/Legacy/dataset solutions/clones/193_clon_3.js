var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedInputLines = rawInputData.trim().split("\n");
var numericWeightValues = processedInputLines.map(Number);

const BOXING_WEIGHT_CLASSES = [
    "light fly", "fly", "bantam", "feather", "light",
    "light welter", "welter", "light middle", "middle",
    "light heavy", "heavy"
];

const WEIGHT_CLASS_CONDITIONS = [
    { check: (weight) => weight <= 48, categoryIndex: 0 },
    { check: (weight) => weight > 48, categoryIndex: 1 },
    { check: (weight) => weight > 51, categoryIndex: 2 },
    { check: (weight) => weight > 54, categoryIndex: 3 },
    { check: (weight) => weight > 57, categoryIndex: 4 },
    { check: (weight) => weight > 60, categoryIndex: 5 },
    { check: (weight) => weight > 64, categoryIndex: 6 },
    { check: (weight) => weight > 69, categoryIndex: 7 },
    { check: (weight) => weight > 75, categoryIndex: 8 },
    { check: (weight) => weight > 81, categoryIndex: 9 },
    { check: (weight) => weight > 91, categoryIndex: 10 }
];

function resolveWeightCategory(weightInKg, classLabels, conditionsList) {
    let finalCategory = "";

    for (const conditionEntry of conditionsList) {
        if (conditionEntry.check(weightInKg)) {
            finalCategory = classLabels[conditionEntry.categoryIndex];
        }
    }
    return finalCategory;
}

numericWeightValues.forEach(function(individualWeight) {
    const outputCategory = resolveWeightCategory(individualWeight, BOXING_WEIGHT_CLASSES, WEIGHT_CLASS_CONDITIONS);
    console.log(outputCategory);
});
