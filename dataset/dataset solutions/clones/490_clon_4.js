const dataBuffer = require('node:fs').readFileSync('/dev/stdin', 'utf8');

function processAllInputs(fullContent) {
    const rawLines = fullContent.trim().split('\n');
    const structuredCases = [];
    let currentLineLocator = 0;

    while (currentLineLocator < rawLines.length) {
        const entryCount = parseInt(rawLines[currentLineLocator++], 10);
        if (entryCount === 0) {
            break; 
        }

        const currentCaseData = [];
        for (let i = 0; i < entryCount; i++) {
            const itemDetails = rawLines[currentLineLocator++].split(' ').map(Number);
            currentCaseData.push({
                itemWeight: itemDetails[0],
                intervalStart: itemDetails[1],
                intervalEnd: itemDetails[2]
            });
        }
        structuredCases.push(currentCaseData);
    }
    return structuredCases;
}

function evaluateScenario(collectionOfItems) {
    const anyExceedsCapacity = collectionOfItems.some((primaryElement, primaryIndex) => {
        let cumulativeWeight = primaryElement.itemWeight;

        collectionOfItems.forEach((secondaryElement, secondaryIndex) => {
            if (primaryIndex === secondaryIndex) {
                return; 
            }
            // Check if the primary element's interval finishes before or at the start of the secondary element's interval
            if (primaryElement.intervalEnd <= secondaryElement.intervalStart) {
                cumulativeWeight += secondaryElement.itemWeight;
            }
        });
        return cumulativeWeight > 150; 
    });

    return anyExceedsCapacity ? "NG" : "OK";
}

const allStructuredCases = processAllInputs(dataBuffer);

allStructuredCases.forEach(individualCase => {
    console.log(evaluateScenario(individualCase));
});