function processGraphPaths(inputLines) {
    const NEG_INF_VAL = -100000000000000;

    const [graphParamsLine, ...edgeDefinitionLines] = inputLines;
    const [vertexCountStr, connectionCountStr] = graphParamsLine.split(" ");
    const vertexCount = parseInt(vertexCountStr);
    const connectionCount = parseInt(connectionCountStr);

    const connectionList = edgeDefinitionLines.slice(0, connectionCount).map(line => {
        const [startNode, endNode, edgeCost] = line.split(" ").map(Number);
        return {
            sourceVertex: startNode - 1,
            targetVertex: endNode - 1,
            weightValue: edgeCost
        };
    });

    let currentPathDistances = Array.from({ length: vertexCount }, () => NEG_INF_VAL);
    currentPathDistances[0] = 0;

    const phaseOneConnections = connectionList.filter(conn => conn.sourceVertex < vertexCount - 1);

    const applyPathRelaxation = (distances, connectionsToUse) => {
        connectionsToUse.forEach(conn => {
            const { sourceVertex, targetVertex, weightValue } = conn;
            if (distances[sourceVertex] !== NEG_INF_VAL) {
                const candidateNewDistance = distances[sourceVertex] + weightValue;
                if (distances[targetVertex] < candidateNewDistance) {
                    distances[targetVertex] = candidateNewDistance;
                }
            }
        });
    };

    Array.from({ length: vertexCount }).forEach(() => {
        applyPathRelaxation(currentPathDistances, phaseOneConnections);
    });

    let targetAffectedByPositiveCycle = false;
    const finalTargetIndex = vertexCount - 1;

    const checkCycleImpact = (distances, connectionsToUse, targetIdx) => {
        let targetRelaxedInPass = false;
        connectionsToUse.forEach(conn => {
            const { sourceVertex, targetVertex, weightValue } = conn;
            if (distances[sourceVertex] !== NEG_INF_VAL) {
                const candidateNewDistance = distances[sourceVertex] + weightValue;
                if (distances[targetVertex] < candidateNewDistance) {
                    distances[targetVertex] = candidateNewDistance;
                    if (targetVertex === targetIdx) {
                        targetRelaxedInPass = true;
                    }
                }
            }
        });
        return targetRelaxedInPass;
    };

    Array.from({ length: vertexCount }).forEach(() => {
        if (!targetAffectedByPositiveCycle) {
            const wasTargetRelaxed = checkCycleImpact(currentPathDistances, connectionList, finalTargetIndex);
            if (wasTargetRelaxed) {
                targetAffectedByPositiveCycle = true;
            }
        }
    });

    if (targetAffectedByPositiveCycle) {
        console.log("inf");
    } else {
        console.log(currentPathDistances[finalTargetIndex]);
    }
}

processGraphPaths(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
