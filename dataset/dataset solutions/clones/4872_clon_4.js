function determineConfiguration (sourceData) {
    const numericalElements = sourceData.match(/\d+/g).map(Number);
    const orderedValues = numericalElements.sort((valA, valB) => valA - valB);

    const firstComponent = orderedValues[0];
    const secondComponent = orderedValues[1];
    const principalComponent = orderedValues[2];

    const outcomeIndicator = (firstComponent + secondComponent === principalComponent) ? "Yes" : "No";
    return outcomeIndicator;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(determineConfiguration(fileContent));