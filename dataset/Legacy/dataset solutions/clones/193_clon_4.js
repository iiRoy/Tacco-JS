const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericInputs = fileContent.trim().split("\n").map(Number);

const categoryThresholds = [
    { limit: 91, designation: "heavy" },
    { limit: 81, designation: "light heavy" },
    { limit: 75, designation: "middle" },
    { limit: 69, designation: "light middle" },
    { limit: 64, designation: "welter" },
    { limit: 60, designation: "light welter" },
    { limit: 57, designation: "light" },
    { limit: 54, designation: "feather" },
    { limit: 51, designation: "bantam" },
    { limit: 48, designation: "fly" }
];

numericInputs.forEach(individualWeight => {
    const assignedCategory = categoryThresholds.reduce((currentCategory, thresholdDef) => {
        return individualWeight > thresholdDef.limit ? thresholdDef.designation : currentCategory;
    }, "light fly");

    console.log(assignedCategory);
});
