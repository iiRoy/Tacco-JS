"use strict";

const spinForward = (currentLayout) => [
    currentLayout[1],
    currentLayout[5],
    currentLayout[2],
    currentLayout[3],
    currentLayout[0],
    currentLayout[4]
];

const spinRight = (currentLayout) => [
    currentLayout[3],
    currentLayout[1],
    currentLayout[0],
    currentLayout[5],
    currentLayout[4],
    currentLayout[2]
];

const spinClockwise = (currentLayout) => [
    currentLayout[0],
    currentLayout[2],
    currentLayout[4],
    currentLayout[1],
    currentLayout[3],
    currentLayout[5]
];

const compareConfigurations = (configA, configB) => {
    for (let i = 0; i < 6; i++) {
        if (configA[i] < configB[i]) return -1;
        if (configA[i] > configB[i]) return 1;
    }
    return 0;
};

const makeDiceUnit = (initialValues) => {
    const allPossibleOrientations = new Set();
    const explorationQueue = [initialValues.slice(0, 6)];

    while (explorationQueue.length > 0) {
        const currentConfig = explorationQueue.shift();
        const configIdentifier = currentConfig.join(',');

        if (allPossibleOrientations.has(configIdentifier)) {
            continue;
        }
        allPossibleOrientations.add(configIdentifier);

        explorationQueue.push(spinForward(currentConfig));
        explorationQueue.push(spinRight(currentConfig));
        explorationQueue.push(spinClockwise(currentConfig));
    }

    let smallestConfiguration = Array.from(allPossibleOrientations)
        .map(s => s.split(',').map(Number))
        .reduce((minConfig, currentConfig) =>
            compareConfigurations(currentConfig, minConfig) < 0 ? currentConfig : minConfig
        );

    return {
        retrieveCanonicalForm: () => smallestConfiguration,
        checkEquivalence: (otherUnit) => {
            return compareConfigurations(smallestConfiguration, otherUnit.retrieveCanonicalForm()) === 0;
        }
    };
};


new Promise(function (resolve, reject) {
    let inputBuffer = "";
    process.stdin.on("data", segment => { inputBuffer += segment; });
    process.stdin.on("end", () => { resolve([inputBuffer, process.stdout]); });
}).then(function([inputContent, outputStream]) {
    const [[countUnits], ...unitData] = inputContent.split("\n").map(line => line.split(" ").map(val => parseInt(val)));
    const diceCollection = unitData.slice(0, countUnits).map(values => makeDiceUnit(values));

    let foundDuplicate = false;
    for (let i = 0; i < countUnits; ++i) {
        for (let j = i + 1; j < countUnits; ++j) {
            if (diceCollection[i].checkEquivalence(diceCollection[j])) {
                foundDuplicate = true;
                break;
            }
        }
        if (foundDuplicate) {
            break;
        }
    }

    if (foundDuplicate) {
        outputStream.write("No\n");
    } else {
        outputStream.write("Yes\n");
    }
});
