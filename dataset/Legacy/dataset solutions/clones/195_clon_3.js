const fs = require('fs');

const INPUT_SOURCE_PATH = '/dev/stdin';

function getBoxingCategory(weightInKg) {
    let categoryLabel;
    if (weightInKg <= 48) {
        categoryLabel = 'light fly';
    } else if (weightInKg <= 51) {
        categoryLabel = 'fly';
    } else if (weightInKg <= 54) {
        categoryLabel = 'bantam';
    } else if (weightInKg <= 57) {
        categoryLabel = 'feather';
    } else if (weightInKg <= 60) {
        categoryLabel = 'light';
    } else if (weightInKg <= 64) {
        categoryLabel = 'light welter';
    } else if (weightInKg <= 69) {
        categoryLabel = 'welter';
    } else if (weightInKg <= 75) {
        categoryLabel = 'light middle';
    } else if (weightInKg <= 81) {
        categoryLabel = 'middle';
    } else if (weightInKg <= 91) {
        categoryLabel = 'light heavy';
    } else {
        categoryLabel = 'heavy';
    }
    return categoryLabel;
}

const rawInputContent = fs.readFileSync(INPUT_SOURCE_PATH, 'utf8');
const processedInputLines = rawInputContent.trim().split('\n');

let currentLineData;
while (currentLineData = processedInputLines.shift()) {
    const parsedWeightValue = Number(currentLineData);
    const assignedCategory = getBoxingCategory(parsedWeightValue);
    console.log(assignedCategory);
}
