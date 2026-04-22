const pathResolver = (() => {
    const inputInterface = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let currentInputData = [];

    // Verifies if the path contains any unpassable consecutive blockages
    const verifyBlockageAbsence = (routeLayout) => {
        return !routeLayout.split('').some((cell, position, entireLayout) => 
            cell === '#' && entireLayout[position + 1] === '#'
        );
    };

    // Determines if a bypass route is available within a specified segment
    // This looks for two consecutive empty cells ('.')
    const identifyBypassOption = (courseMap, startPosition, endPositionExclusive) => {
        // The segment to analyze for the pattern '..'
        // The first '.' of the '..' pair can be at indices from startPosition up to endPositionExclusive - 1.
        // So the substring needs to cover characters from startPosition up to endPositionExclusive.
        const relevantSection = courseMap.substring(startPosition, endPositionExclusive);
        return relevantSection.match(/\.\./) !== null;
    };

    // Main decision-making function for the path
    const processMovementScenario = (pathParameters, pathSurface) => {
        const [totalCells, initialA, initialB, finalC, finalD] = pathParameters;

        // Convert 1-based indices to 0-based for string manipulation
        const zeroBasedInitialB = initialB - 1;
        const zeroBasedFinalC = finalC - 1;
        const zeroBasedFinalD = finalD - 1;

        // First, check for any immediate blocking obstacles anywhere on the path
        if (!verifyBlockageAbsence(pathSurface)) {
            return "No";
        }

        // If the target (C) is before the destination (D), it's always possible
        if (zeroBasedFinalC < zeroBasedFinalD) {
            return "Yes";
        } else { // Target (C) is at or after destination (D)
            // A bypass is needed. Check if two consecutive empty cells exist between B and D.
            // The range for the *first* '.' of the '..' pair is from zeroBasedInitialB to zeroBasedFinalD - 2.
            // So the substring for regex matching should end exclusively at zeroBasedFinalD - 1.
            if (identifyBypassOption(pathSurface, zeroBasedInitialB, zeroBasedFinalD - 1)) {
                return "Yes";
            } else {
                return "No";
            }
        }
    };

    inputInterface.on('line', (lineContent) => {
        currentInputData.push(lineContent);
    });

    inputInterface.on('close', () => {
        const numericalSpecifications = currentInputData[0].split(' ').map(Number);
        const terrainDescription = currentInputData[1];
        
        const finalDecision = processMovementScenario(numericalSpecifications, terrainDescription);
        console.log(finalDecision);
    });
})();