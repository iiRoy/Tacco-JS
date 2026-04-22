function executeAnalysis(inputPayload) {
    const lines = inputPayload.split("\n");
    const dimensions = lines[0].split(" ").map(Number);
    const nodeTotal = dimensions[0];
    const edgeTotal = dimensions[1];

    const connectionManifest = new Map();
    for (let currentLine = 1; currentLine <= edgeTotal; currentLine++) {
        const edgeDetails = lines[currentLine].split(" ").map(Number);
        const source = edgeDetails[0];
        const destination = edgeDetails[1];
        const cost = edgeDetails[2];
        connectionManifest.set(`${source}-${destination}`, cost);
    }

    const findDirectWeight = (initial, final) => {
        return connectionManifest.get(`${initial}-${final}`) || 0;
    };

    const computeSegmentTotal = (initial, final) => {
        let cumulativeSum = 0;
        for (let current = initial; current < final; current++) {
            cumulativeSum += findDirectWeight(current, final);
        }
        return cumulativeSum;
    };

    for (let originNode = 1; originNode <= nodeTotal; originNode++) {
        for (let terminalNode = 1; terminalNode <= nodeTotal; terminalNode++) {
            if (originNode < terminalNode) {
                const aggregateValue = computeSegmentTotal(originNode, terminalNode);
                const directConnectionCost = findDirectWeight(originNode, terminalNode);

                console.log("src=", originNode, "dest=", terminalNode, "of shortest value is");
                console.log("calculated value=", aggregateValue);
                console.log("parameter=", directConnectionCost);
            }
        }
    }
}

executeAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));