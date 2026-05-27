const parseNumbers = (line) => line.split(" ").map(Number);

function checkLightParity(lightIndex, switchConnections, parityExpectations, currentCombinationBinary) {
    const connectionsForLight = switchConnections[lightIndex];
    const numConnections = connectionsForLight[0];
    let activeSwitchesForLight = 0;

    for (let connectionIdx = 1; connectionIdx <= numConnections; connectionIdx++) {
        const connectedSwitchZeroBasedIndex = connectionsForLight[connectionIdx] - 1;
        const switchState = parseInt(currentCombinationBinary[connectedSwitchZeroBasedIndex], 10);
        activeSwitchesForLight += switchState;
    }

    return (activeSwitchesForLight % 2) === parityExpectations[lightIndex];
}

function ProcessInput(rawData) {
    rawData = rawData.trim().split("\n");

    const configParams = parseNumbers(rawData[0]);
    const numSwitches = configParams[0];
    const numLights = configParams[1];

    const parityExpectations = parseNumbers(rawData[numLights + 1]);

    const switchConnections = [];
    for (let lightIdx = 0; lightIdx < numLights; lightIdx++) {
        switchConnections.push(parseNumbers(rawData[lightIdx + 1]));
    }

    let validCombinationsCount = 0;

    const binaryStringBase = 1 << numSwitches;

    for (let combinationNumber = binaryStringBase; combinationNumber < binaryStringBase * 2; combinationNumber++) {
        const currentCombinationBinary = combinationNumber.toString(2).substring(1);

        let allLightsSatisfied = true;
        for (let lightIdx = 0; lightIdx < numLights; lightIdx++) {
            if (!checkLightParity(lightIdx, switchConnections, parityExpectations, currentCombinationBinary)) {
                allLightsSatisfied = false;
                break;
            }
        }

        if (allLightsSatisfied) {
            validCombinationsCount++;
        }
    }

    console.log(validCombinationsCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
