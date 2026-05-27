(function(rawInput) {
    const processedLines = rawInput.trim().split('\n');
    const totalNodes = parseInt(processedLines[0], 10);
    const edgeDetails = processedLines.slice(1).map(line =>
        line.split(/\s+/).map(Number)
    );

    const linkageMatrix = Array.from({ length: totalNodes + 1 }, () => []);
    const nodeAssignments = Array(totalNodes + 1).fill(-1);

    edgeDetails.forEach(edge => {
        const [sourceId, targetId, weightVal] = edge;
        linkageMatrix[sourceId].push([targetId, weightVal % 2]);
    });

    const visitQueue = [];

    nodeAssignments[1] = 0;
    visitQueue.push(1);

    let queuePointer = 0;
    while (queuePointer < visitQueue.length) {
        const currentIdentifier = visitQueue[queuePointer++];
        const currentAssignment = nodeAssignments[currentIdentifier];

        for (const connection of linkageMatrix[currentIdentifier]) {
            const [connectedIdentifier, connectionWeightMod] = connection;
            if (nodeAssignments[connectedIdentifier] === -1) {
                nodeAssignments[connectedIdentifier] = currentAssignment ^ connectionWeightMod;
                visitQueue.push(connectedIdentifier);
            }
        }
    }

    const resultGroups = [];
    for (let i = 1; i <= totalNodes; ++i) {
        resultGroups.push(nodeAssignments[i]);
    }
    console.log(resultGroups.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
