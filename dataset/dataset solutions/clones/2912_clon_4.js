const processSwitchboard = (rawBoardData) => {
    const dataLines = rawBoardData.trim().split("\n");

    const boardDimensions = dataLines[0].split(" ").map(Number);
    const numberOfSwitches = boardDimensions[0];
    const numberOfLights = boardDimensions[1];

    const expectedLightParities = dataLines[numberOfLights + 1].split(" ").map(Number);

    const lightSwitchConfigurations = dataLines.slice(1, numberOfLights + 1).map(lineSegment => {
        const switchIndices = lineSegment.split(" ").map(Number);
        return switchIndices.slice(1).map(idx => idx - 1); // Convert to 0-indexed
    });

    let satisfiedCombinations = 0;
    const totalPossibleStates = 1 << numberOfSwitches;

    for (let switchStateMask = 0; switchStateMask < totalPossibleStates; switchStateMask++) {
        const allLightsAreCorrect = lightSwitchConfigurations.every((connectedSwitchesForLight, lightIdentifier) => {
            const activeConnectedSwitches = connectedSwitchesForLight.filter(switchIdx => {
                return (switchStateMask >> switchIdx) & 1; // Check if the bit for this switch is set
            });

            const currentLightParity = activeConnectedSwitches.length % 2;
            return currentLightParity === expectedLightParities[lightIdentifier];
        });

        if (allLightsAreCorrect) {
            satisfiedCombinations++;
        }
    }

    console.log(satisfiedCombinations);
};

processSwitchboard(require("fs").readFileSync("/dev/stdin", "utf8"));