const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split('\n').filter(Boolean);

const classificationBounds = [
    { upper: 48, label: 'light fly' },
    { upper: 51, label: 'fly' },
    { upper: 54, label: 'bantam' },
    { upper: 57, label: 'feather' },
    { upper: 60, label: 'light' },
    { upper: 64, label: 'light welter' },
    { upper: 69, label: 'welter' },
    { upper: 75, label: 'light middle' },
    { upper: 81, label: 'middle' },
    { upper: 91, label: 'light heavy' }
];

const obtainWeightClass = (massValue) => {
    const foundClass = classificationBounds.find(boundary => massValue <= boundary.upper);
    return foundClass ? foundClass.label : 'heavy';
};

processedLines.forEach(individualLine => {
    const numericWeight = +individualLine;
    const assignedClass = obtainWeightClass(numericWeight);
    console.log(assignedClass);
});
