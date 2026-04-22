function generateBinaryStates(depth) {
    if (depth === 0) {
        return [[]];
    }
    const priorStates = generateBinaryStates(depth - 1);
    const currentStates = [];
    for (const state of priorStates) {
        currentStates.push([...state, false]);
        currentStates.push([...state, true]);
    }
    return currentStates;
}

function computeLampOutput(lampConnections, currentDeviceStates) {
    const activeConnectionCount = lampConnections.filter(deviceIndex => {
        return currentDeviceStates[deviceIndex];
    }).length;
    return activeConnectionCount % 2;
}

function evaluateSystem(sourceText) {
    const allInputRows = sourceText.trim().split('\n');

    const [firstRow, ...restOfRows] = allInputRows;

    const [totalDevices, totalLamps] = firstRow.split(' ').map(Number);
    
    const desiredParities = restOfRows.pop().split(' ').map(Number);

    const lampWiringInfo = restOfRows.map(rowContent => {
        const parts = rowContent.split(' ').map(Number);
        const connectedSwitchCount = parts[0];
        return parts.slice(1, connectedSwitchCount);
    });

    const allDeviceStateCombinations = generateBinaryStates(totalDevices);

    const successfulCombinations = allDeviceStateCombinations.filter(currentDeviceConfiguration => {
        const computedLampResults = lampWiringInfo.map(lampConnections => {
            return computeLampOutput(lampConnections, currentDeviceConfiguration);
        });
        return JSON.stringify(computedLampResults) === JSON.stringify(desiredParities);
    });

    console.log(successfulCombinations.length);
}

evaluateSystem(require("fs").readFileSync("/dev/stdin", "utf8"));