function processInputData(rawText) {
    const dataLines = rawText.trim().split("\n");
    const [switchCount, lampCount] = dataLines[0].split(" ").map(Number);

    const requiredParities = dataLines[lampCount + 1].split(" ").map(Number);

    const lampSwitchIndices = dataLines.slice(1, lampCount + 1).map(lineContent => {
        const lineParts = lineContent.split(" ").map(Number);
        return lineParts.slice(1).map(originalIndex => originalIndex - 1);
    });

    return {
        totalSwitches: switchCount,
        totalLamps: lampCount,
        parityRequirements: requiredParities,
        lampConnections: lampSwitchIndices
    };
}

function determineValidConfigurations(systemConfig) {
    const { totalSwitches, totalLamps, parityRequirements, lampConnections } = systemConfig;
    let successfulCombinations = 0;

    for (let currentSwitchState = 0; currentSwitchState < (1 << totalSwitches); currentSwitchState++) {
        const allConditionsMet = lampConnections.every((connectedSwitches, lampIdentifier) => {
            const activeSwitchSum = connectedSwitches.reduce((accumulator, switchPosition) => {
                return accumulator + ((currentSwitchState >> switchPosition) & 1);
            }, 0);

            return (activeSwitchSum % 2) === parityRequirements[lampIdentifier];
        });

        if (allConditionsMet) {
            successfulCombinations++;
        }
    }

    return successfulCombinations;
}

function mainEntry(inputString) {
    const configuration = processInputData(inputString);
    const resultCount = determineValidConfigurations(configuration);
    console.log(resultCount);
}

mainEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
