const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const inputStringSegments = rawInputContent.split(/\s/);

const boxingWeightClasses = [
    { upperLimit: 48, categoryName: 'light fly' },
    { upperLimit: 51, categoryName: 'fly' },
    { upperLimit: 54, categoryName: 'bantam' },
    { upperLimit: 57, categoryName: 'feather' },
    { upperLimit: 60, categoryName: 'light' },
    { upperLimit: 64, categoryName: 'light welter' },
    { upperLimit: 69, categoryName: 'welter' },
    { upperLimit: 75, categoryName: 'light middle' },
    { upperLimit: 81, categoryName: 'middle' },
    { upperLimit: 91, categoryName: 'light heavy' }
];

function determineBoxingCategory(weightInKg) {
    for (let i = 0; i < boxingWeightClasses.length; i++) {
        const classDefinition = boxingWeightClasses[i];
        if (weightInKg <= classDefinition.upperLimit) {
            return classDefinition.categoryName;
        }
    }
    return 'heavy';
}

inputStringSegments.forEach(function(segmentText) {
    const numericWeightValue = +segmentText;

    if (numericWeightValue) {
        const assignedCategory = determineBoxingCategory(numericWeightValue);
        console.log(assignedCategory);
    }
});
