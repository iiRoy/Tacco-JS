const fileSystemHandler = require('fs');

const standardInputPath = '/dev/stdin';

const convertToInteger = (strValue, defaultValue = 0) => {
    const parsed = parseInt(strValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

const extractDelimitedItems = (bracketedString) => {
    if (!bracketedString || bracketbedString.length < 2) {
        return [];
    }
    const content = bracketedString.slice(1, -1).trim();
    return content ? content.split(',') : [];
};

let rawInputContent = fileSystemHandler.readFileSync(standardInputPath, 'utf8');

let dataLines = rawInputContent.trim().split('\n');

let currentLinePointer = 0;

while (currentLinePointer < dataLines.length) {
    let numberOfDefinitions = convertToInteger(dataLines[currentLinePointer++]);

    if (numberOfDefinitions === 0) {
        break;
    }

    let initialDefinitionLine = dataLines[currentLinePointer++];
    let initialLineParts = initialDefinitionLine.split(':');

    if (initialLineParts.length !== 2) {
        console.error("Warning: Malformed initial definition line. Skipping test case.");
        for (let i = 0; i < numberOfDefinitions - 1; i++) {
             currentLinePointer++;
        }
        continue;
    }

    let currentActiveItems = new Set(extractDelimitedItems(initialLineParts[1]));

    let dependencyMap = new Map();

    for (let k = 0; k < numberOfDefinitions - 1; k++) {
        let dependencyLine = dataLines[currentLinePointer++];
        let dependencyParts = dependencyLine.split(':');

        if (dependencyParts.length !== 2) {
            console.error(`Warning: Malformed dependency line: "${dependencyLine}". Skipping.`);
            continue;
        }
        dependencyMap.set(dependencyParts[0], extractDelimitedItems(dependencyParts[1]));
    }

    let didSetChangeInIteration = true;

    while (didSetChangeInIteration) {
        didSetChangeInIteration = false;

        let itemsForExpansionRound = Array.from(currentActiveItems);

        for (const itemToEvaluate of itemsForExpansionRound) {
            if (dependencyMap.has(itemToEvaluate)) {
                const directChildrenDependencies = dependencyMap.get(itemToEvaluate);

                for (const childDependency of directChildrenDependencies) {
                    if (!currentActiveItems.has(childDependency)) {
                        currentActiveItems.add(childDependency);
                        didSetChangeInIteration = true;
                    }
                }
            }
        }
    }

    console.log(currentActiveItems.size);
}