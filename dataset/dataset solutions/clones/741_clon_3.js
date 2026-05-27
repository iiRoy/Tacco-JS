var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.trim()).split("\n");

function parseDependencyLine(lineContent) {
    const contentParts = lineContent.split(":");
    const parentIdentifier = contentParts[0];
    const childrenString = contentParts[1].endsWith(';') ? contentParts[1].slice(0, -1) : contentParts[1];
    const childIdentifiers = childrenString.split(",");
    return { parentIdentifier, childIdentifiers };
}

while (true) {
    var numEntries = parseInt(lineData.shift(), 10);
    if (numEntries === 0) {
        break;
    }

    var initialLineContent = lineData.shift();
    var initialLineParts = initialLineContent.split(":");
    var initialDependencyItems = initialLineParts[1].slice(0, -1).split(",");

    var activeDependencies = {};
    initialDependencyItems.forEach(function(itemKey) {
        activeDependencies[itemKey] = true;
    });

    var dependencyMap = {};
    for (var entryIndex = 0; entryIndex < numEntries - 1; entryIndex++) {
        var currentEntryLine = lineData.shift();
        var { parentIdentifier: currentParent, childIdentifiers: currentChildren } = parseDependencyLine(currentEntryLine);
        dependencyMap[currentParent] = currentChildren;
    }

    var previousDependencyCount = 0;
    do {
        previousDependencyCount = Object.keys(activeDependencies).length;

        const currentActiveKeysSnapshot = Object.keys(activeDependencies);

        for (const dependencyKey of currentActiveKeysSnapshot) {
            if (dependencyMap.hasOwnProperty(dependencyKey) && activeDependencies[dependencyKey]) {
                const childrenOfCurrentDep = dependencyMap[dependencyKey];
                childrenOfCurrentDep.forEach(function(dependentItem) {
                    activeDependencies[dependentItem] = true;
                });
                activeDependencies[dependencyKey] = false;
            }
        }
    } while (Object.keys(activeDependencies).length !== previousDependencyCount);

    var finalCount = 0;
    for (var dependencyKey in activeDependencies) {
        if (activeDependencies[dependencyKey]) {
            finalCount++;
        }
    }
    console.log(finalCount);
}
