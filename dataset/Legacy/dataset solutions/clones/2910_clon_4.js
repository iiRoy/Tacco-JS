"use strict";

(function() {
    const parseNumbers = (textLine) => textLine.split(/\s+/).map(Number);

    const processInputAndSolve = (rawData) => {
        const dataLines = rawData.split("\n");

        const [totalSwitches, totalLights] = parseNumbers(dataLines[0]);

        const lightRequirements = [];
        for (let lightIndex = 0; lightIndex < totalLights; lightIndex++) {
            const [_, ...connectedSwitchIdentifiers] = parseNumbers(dataLines[lightIndex + 1]);
            lightRequirements.push({
                connectedSwitches: connectedSwitchIdentifiers,
            });
        }

        const parityExpectations = parseNumbers(dataLines[totalLights + 1]);

        const completeLightSpecs = lightRequirements.map((spec, index) => ({
            ...spec,
            expectedParity: parityExpectations[index]
        }));

        let successfulConfigurations = 0;

        const evaluateSwitchStates = (currentSwitchIndex, currentSwitchSettings) => {
            if (currentSwitchIndex === totalSwitches) {
                // All switches have been assigned a state (0 for off, 1 for on)
                const isConfigurationValid = completeLightSpecs.every(lightSpec => {
                    const activeConnections = lightSpec.connectedSwitches.filter(switchId =>
                        currentSwitchSettings[switchId - 1] === 1
                    );
                    return activeConnections.length % 2 === lightSpec.expectedParity;
                });

                if (isConfigurationValid) {
                    successfulConfigurations++;
                }
                return;
            }

            // Recursively explore setting the current switch to 'off' (0)
            evaluateSwitchStates(currentSwitchIndex + 1, [...currentSwitchSettings, 0]);
            // Recursively explore setting the current switch to 'on' (1)
            evaluateSwitchStates(currentSwitchIndex + 1, [...currentSwitchSettings, 1]);
        };

        // Initiate the recursive exploration starting from the first switch (index 0)
        // with an empty array of switch settings.
        evaluateSwitchStates(0, []);

        console.log(successfulConfigurations);
    };

    processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
