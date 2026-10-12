function processInput(rawData) {
    const parsedValues = rawData.split(' ');
    const totalNodes = Number(parsedValues[0]);
    const specialNodeX = Number(parsedValues[1]);
    const specialNodeY = Number(parsedValues[2]);

    function measurePath(startNode, endNode) {
        return Math.min(
            endNode - startNode,
            Math.abs(specialNodeX - startNode) + Math.abs(specialNodeY - endNode) + 1
        );
    }

    const tallyOfDistances = new Array(totalNodes).fill(0);

    for (let nodeA = 1; nodeA < totalNodes; nodeA++) {
        for (let nodeB = nodeA + 1; nodeB <= totalNodes; nodeB++) {
            const computedSpan = measurePath(nodeA, nodeB);
            tallyOfDistances[computedSpan]++;
        }
    }

    for (let spanValue = 1; spanValue < totalNodes; spanValue++) {
        console.log(tallyOfDistances[spanValue]);
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
