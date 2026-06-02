const processData = (rawInputContent) => {
    const dataLines = rawInputContent.split("\n");
    let maximumValue = 0;

    const parsedConnections = dataLines.map(currentLine => {
        const numericParts = currentLine.split(" ");
        const sourceNode = Number(numericParts[0]);
        const targetNode = Number(numericParts[1]);

        if (sourceNode > maximumValue) {
            maximumValue = sourceNode;
        }
        if (targetNode > maximumValue) {
            maximumValue = targetNode;
        }
        return [sourceNode, targetNode];
    });

    const adjacencyStructure = new Map();

    parsedConnections.forEach(([origin, destination]) => {
        if (!adjacencyStructure.has(origin)) {
            adjacencyStructure.set(origin, new Set());
        }
        adjacencyStructure.get(origin).add(destination);
    });

    if (!adjacencyStructure.has(1)) {
        console.log("IMPOSSIBLE");
        return;
    }

    const firstLevelTargets = adjacencyStructure.get(1);
    let pathDiscovered = false;

    for (const intermediateNode of firstLevelTargets) {
        if (adjacencyStructure.has(intermediateNode)) {
            const secondLevelTargets = adjacencyStructure.get(intermediateNode);
            if (secondLevelTargets.has(maximumValue)) {
                pathDiscovered = true;
                break;
            }
        }
    }

    if (pathDiscovered) {
        console.log("POSSIBLE");
    } else {
        console.log("IMPOSSIBLE");
    }
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
