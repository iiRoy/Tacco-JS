function processInput(rawData) {
    const inputLines = rawData.trim().split("\n");
    const numPoints = parseInt(inputLines[0].split(" ")[0], 10);

    const parseCoordinates = (lineString) => lineString.split(" ").map(coordStr => parseInt(coordStr, 10));

    const redCoordinates = [];
    const blueCoordinates = [];

    for (let i = 0; i < numPoints; i++) {
        redCoordinates.push(parseCoordinates(inputLines[i + 1]));
        blueCoordinates.push(parseCoordinates(inputLines[i + numPoints + 1]));
    }

    const redNodeConnections = Array.from({ length: numPoints }, () => []);
    const blueNodeConnections = Array.from({ length: numPoints }, () => []);
    const redNodeDegree = Array.from({ length: numPoints }, () => 0);
    const blueNodeDegree = Array.from({ length: numPoints }, () => 0);

    let totalPotentialMatches = 0;

    for (let rIdx = 0; rIdx < numPoints; rIdx++) {
        const currentRedX = redCoordinates[rIdx][0];
        const currentRedY = redCoordinates[rIdx][1];
        for (let bIdx = 0; bIdx < numPoints; bIdx++) {
            const currentBlueX = blueCoordinates[bIdx][0];
            const currentBlueY = blueCoordinates[bIdx][1];

            if (currentRedX < currentBlueX && currentRedY < currentBlueY) {
                redNodeConnections[rIdx].push(bIdx);
                redNodeDegree[rIdx]++;
                blueNodeConnections[bIdx].push(rIdx);
                blueNodeDegree[bIdx]++;
                totalPotentialMatches++;
            }
        }
    }

    let currentMatchCount = 0;
    const excludedStatus = [Array.from({ length: numPoints }, () => 0), Array.from({ length: numPoints }, () => 0)];

    const findOptimalMatchCandidate = (redConns, blueConns, redDegrees, blueDegrees, excludedFlags, N_val) => {
        let minimumDegreeSum = 2 * N_val + 1;
        let bestRedNodeIdx = -1;
        let bestBlueNodeIdx = -1;

        for (let r = 0; r < redConns.length; r++) {
            if (excludedFlags[0][r] === 1) continue;

            for (const connectedB of redConns[r]) {
                if (excludedFlags[1][connectedB] === 1) continue;

                const combinedDegree = redDegrees[r] + blueDegrees[connectedB];
                if (combinedDegree <= minimumDegreeSum) {
                    minimumDegreeSum = combinedDegree;
                    bestRedNodeIdx = r;
                    bestBlueNodeIdx = connectedB;
                }
            }
        }
        return { red: bestRedNodeIdx, blue: bestBlueNodeIdx, sum: minimumDegreeSum };
    };

    const applyMatchAndRecalculate = (
        redConns, blueConns, redDegrees, blueDegrees,
        chosenRed, chosenBlue, excludedFlags, currentTotalMatches
    ) => {
        currentTotalMatches -= (redDegrees[chosenRed] + blueDegrees[chosenBlue] - 1);

        for (const bNodeToUpdate of redConns[chosenRed]) {
            if (excludedFlags[1][bNodeToUpdate] === 0) {
                blueConns[bNodeToUpdate] = blueConns[bNodeToUpdate].filter(rNode => rNode !== chosenRed);
                blueDegrees[bNodeToUpdate]--;
            }
        }

        for (const rNodeToUpdate of blueConns[chosenBlue]) {
            if (excludedFlags[0][rNodeToUpdate] === 0) {
                redConns[rNodeToUpdate] = redConns[rNodeToUpdate].filter(bNode => bNode !== chosenBlue);
                redDegrees[rNodeToUpdate]--;
            }
        }

        excludedFlags[0][chosenRed] = 1;
        excludedFlags[1][chosenBlue] = 1;

        redConns[chosenRed] = chosenBlue;
        redDegrees[chosenRed] = 1;
        blueConns[chosenBlue] = chosenRed;
        blueDegrees[chosenBlue] = 1;

        return currentTotalMatches;
    };

    while (totalPotentialMatches > 0) {
        const { red: chosenRedNode, blue: chosenBlueNode, sum: chosenDegreeSum } =
            findOptimalMatchCandidate(redNodeConnections, blueNodeConnections, redNodeDegree, blueNodeDegree, excludedStatus, numPoints);

        totalPotentialMatches = applyMatchAndRecalculate(
            redNodeConnections, blueNodeConnections, redNodeDegree, blueNodeDegree,
            chosenRedNode, chosenBlueNode, excludedStatus, totalPotentialMatches
        );
        currentMatchCount++;
    }

    console.log(currentMatchCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
