const UNREACHABLE = -1_000_000_000_000_000;

function acquireGraphElements(inputLines) {
    const [nodeCountStr, linkCountStr] = inputLines[0].split(" ");
    const nodeCount = parseInt(nodeCountStr);
    const linkCount = parseInt(linkCountStr);

    const connections = inputLines.slice(1, 1 + linkCount).map(line => {
        const [sourceId, destId, gainValue] = line.split(" ").map(Number);
        return { start: sourceId - 1, end: destId - 1, value: gainValue };
    });

    return { totalNodes: nodeCount, allConnections: connections };
}

function updatePathValues(currentPathMap, allLinks, targetNodeIndex, voidValue) {
    let nextPathMap = new Map(currentPathMap);
    let targetBecameBetter = false;

    for (const { start, end, value } of allLinks) {
        const currentStartValue = currentPathMap.get(start);
        if (currentStartValue === voidValue) {
            continue;
        }

        const potentialEndValue = currentStartValue + value;
        const existingEndValue = currentPathMap.get(end);

        if (potentialEndValue > existingEndValue) {
            nextPathMap.set(end, potentialEndValue);
            if (end === targetNodeIndex) {
                targetBecameBetter = true;
            }
        }
    }
    return { newMap: nextPathMap, targetAffected: targetBecameBetter };
}

function chartPathGains(dataLines) {
    const { totalNodes, allConnections } = acquireGraphElements(dataLines);

    let nodeGains = new Map();
    for (let i = 0; i < totalNodes; i++) {
        nodeGains.set(i, UNREACHABLE);
    }
    nodeGains.set(0, 0);

    for (let p = 0; p < totalNodes; p++) {
        nodeGains = updatePathValues(nodeGains, allConnections, -1, UNREACHABLE).newMap;
    }

    let hasInfiniteGainToTarget = false;
    const finalNode = totalNodes - 1;

    for (let p = 0; p < totalNodes; p++) {
        const result = updatePathValues(nodeGains, allConnections, finalNode, UNREACHABLE);
        nodeGains = result.newMap;
        if (result.targetAffected) {
            hasInfiniteGainToTarget = true;
            break;
        }
    }

    if (hasInfiniteGainToTarget) {
        console.log("inf");
    } else {
        console.log(nodeGains.get(finalNode));
    }
}

chartPathGains(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));