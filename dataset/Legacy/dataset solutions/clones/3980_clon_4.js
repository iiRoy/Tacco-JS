function processInputData(rawDataString) {
    const parsedLines = rawDataString.trim().split("\n");
    const nodeCount = parseInt(parsedLines[0].split(" ")[0], 10);

    const redCoordinates = parsedLines.slice(1, nodeCount + 1).map(line => line.split(" ").map(Number));
    const blueCoordinates = parsedLines.slice(nodeCount + 1, 2 * nodeCount + 1).map(line => line.split(" ").map(Number));

    let redEntities = Array.from({ length: nodeCount }, (_, idx) => ({
        entityIdentifier: idx,
        xCoord: redCoordinates[idx][0],
        yCoord: redCoordinates[idx][1],
        redEntityLinks: new Set(),
        entityDegree: 0,
        isEntityMatched: false,
        matchedEntityIdentifier: null
    }));

    let blueEntities = Array.from({ length: nodeCount }, (_, idx) => ({
        entityIdentifier: idx,
        xCoord: blueCoordinates[idx][0],
        yCoord: blueCoordinates[idx][1],
        blueEntityLinks: new Set(),
        entityDegree: 0,
        isEntityMatched: false,
        matchedEntityIdentifier: null
    }));

    let totalPotentialLinks = 0;

    for (let rIdx = 0; rIdx < nodeCount; rIdx++) {
        for (let bIdx = 0; bIdx < nodeCount; bIdx++) {
            if (redEntities[rIdx].xCoord < blueEntities[bIdx].xCoord && redEntities[rIdx].yCoord < blueEntities[bIdx].yCoord) {
                redEntities[rIdx].redEntityLinks.add(bIdx);
                blueEntities[bIdx].blueEntityLinks.add(rIdx);
                redEntities[rIdx].entityDegree++;
                blueEntities[bIdx].entityDegree++;
                totalPotentialLinks++;
            }
        }
    }

    let initialGraphState = {
        redEntities: redEntities,
        blueEntities: blueEntities,
        currentMatchCount: 0,
        totalRemainingPotentialLinks: totalPotentialLinks
    };

    const finalMatchResult = findOptimalMatch(initialGraphState);
    console.log(finalMatchResult);
}

const cloneGraphState = (stateToClone) => ({
    redEntities: stateToClone.redEntities.map(r => ({
        ...r,
        redEntityLinks: new Set(r.redEntityLinks)
    })),
    blueEntities: stateToClone.blueEntities.map(b => ({
        ...b,
        blueEntityLinks: new Set(b.blueEntityLinks)
    })),
    currentMatchCount: stateToClone.currentMatchCount,
    totalRemainingPotentialLinks: stateToClone.totalRemainingPotentialLinks
});

function findOptimalMatch(currentState) {
    if (currentState.totalRemainingPotentialLinks <= 0) {
        return currentState.currentMatchCount;
    }

    let bestRedIndex = -1;
    let bestBlueIndex = -1;
    let minimumCombinedDegree = 2 * currentState.redEntities.length + 1;

    for (let rIdx = 0; rIdx < currentState.redEntities.length; rIdx++) {
        const currentRed = currentState.redEntities[rIdx];
        if (currentRed.isEntityMatched) continue;

        for (const bIdx of currentRed.redEntityLinks) {
            const currentBlue = currentState.blueEntities[bIdx];
            if (currentBlue.isEntityMatched) continue;

            const combinedDegree = currentRed.entityDegree + currentBlue.entityDegree;
            if (combinedDegree < minimumCombinedDegree) {
                minimumCombinedDegree = combinedDegree;
                bestRedIndex = rIdx;
                bestBlueIndex = bIdx;
            }
        }
    }

    if (bestRedIndex === -1) {
        return currentState.currentMatchCount;
    }

    const nextState = cloneGraphState(currentState);

    const chosenRed = nextState.redEntities[bestRedIndex];
    const chosenBlue = nextState.blueEntities[bestBlueIndex];

    chosenRed.isEntityMatched = true;
    chosenRed.matchedEntityIdentifier = chosenBlue.entityIdentifier;
    chosenBlue.isEntityMatched = true;
    chosenBlue.matchedEntityIdentifier = chosenRed.entityIdentifier;

    for (const bNeighborId of chosenRed.redEntityLinks) {
        if (bNeighborId === chosenBlue.entityIdentifier) continue;
        const neighborBlue = nextState.blueEntities[bNeighborId];
        if (!neighborBlue.isEntityMatched) {
            neighborBlue.blueEntityLinks.delete(chosenRed.entityIdentifier);
            neighborBlue.entityDegree--;
        }
    }

    for (const rNeighborId of chosenBlue.blueEntityLinks) {
        if (rNeighborId === chosenRed.entityIdentifier) continue;
        const neighborRed = nextState.redEntities[rNeighborId];
        if (!neighborRed.isEntityMatched) {
            neighborRed.redEntityLinks.delete(chosenBlue.entityIdentifier);
            neighborRed.entityDegree--;
        }
    }

    chosenRed.redEntityLinks = new Set([chosenBlue.entityIdentifier]);
    chosenRed.entityDegree = 1;
    chosenBlue.blueEntityLinks = new Set([chosenRed.entityIdentifier]);
    chosenBlue.entityDegree = 1;

    nextState.currentMatchCount++;
    nextState.totalRemainingPotentialLinks -= (minimumCombinedDegree - 1);

    return findOptimalMatch(nextState);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
