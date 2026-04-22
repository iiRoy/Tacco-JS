const fileSystem = require('node:fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedNumerics = rawInputContent.trim().split('\n').map(val => Number(val));

const classificationSchema = [
    { boundary: 48, designation: "light fly" },
    { boundary: 51, designation: "fly" },
    { boundary: 54, designation: "bantam" },
    { boundary: 57, designation: "feather" },
    { boundary: 60, designation: "light" },
    { boundary: 64, designation: "light welter" },
    { boundary: 69, designation: "welter" },
    { boundary: 75, designation: "light middle" },
    { boundary: 81, designation: "middle" },
    { boundary: 91, designation: "light heavy" },
    { boundary: Infinity, designation: "heavy" }
];

for (const currentMeasurement of processedNumerics) {
    const matchedCategory = classificationSchema.find(item => currentMeasurement <= item.boundary);
    
    if (matchedCategory) {
        console.log(matchedCategory.designation);
    }
}