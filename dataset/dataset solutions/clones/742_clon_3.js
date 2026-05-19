var fileSystem = require('fs');
var rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
var inputLinesBuffer = rawInputData.trim().split("\n");

while (true) {
    let currentEntryCount = parseInt(inputLinesBuffer.shift(), 10);

    if (currentEntryCount === 0) {
        break;
    }

    let initialDefinitionLine = inputLinesBuffer.shift();
    let firstColonPosition = initialDefinitionLine.indexOf(':');
    let initialValuesString = initialDefinitionLine.substring(firstColonPosition + 1, initialDefinitionLine.length - 1);
    let currentExpansionList = initialValuesString.split(",");

    let expansionRuleMap = {};
    for (let i = 0; i < currentEntryCount - 1; i++) {
        let ruleLine = inputLinesBuffer.shift();
        let ruleParts = ruleLine.split(":");
        let ruleKey = ruleParts[0];
        let ruleValueString = ruleParts[1].slice(0, -1);
        expansionRuleMap[ruleKey] = ruleValueString.split(",");
    }

    let previousListLength = 0;
    while (true) {
        let currentListSize = currentExpansionList.length;
        if (currentListSize === previousListLength) {
            break;
        }
        previousListLength = currentListSize;

        for (let k = 0; k < currentListSize; k++) {
            let elementToProcess = currentExpansionList[k];
            if (expansionRuleMap.hasOwnProperty(elementToProcess)) {
                currentExpansionList[k] = "";
                currentExpansionList.push(expansionRuleMap[elementToProcess]);
            }
        }
    }

    let finalProcessedList = currentExpansionList.filter(item => item !== "");

    let uniqueElementsSet = new Set();
    finalProcessedList.forEach(item => {
        if (Array.isArray(item)) {
            uniqueElementsSet.add(item.join(','));
        } else {
            uniqueElementsSet.add(item);
        }
    });

    console.log(uniqueElementsSet.size);
}
