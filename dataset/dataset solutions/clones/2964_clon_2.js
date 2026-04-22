var inputData = [];
const terminalIO = require('readline');

let streamHandler = terminalIO.createInterface({
    input: process.stdin,
    output: process.stdout,
});

streamHandler.on('line', function (currentText) {
    inputData.push(currentText);
});

streamHandler.on('close', function () {
    const nodeQuantity = Number(inputData[0]);
    inputData.shift();

    const graphEdges = inputData.map(edgeString =>
        edgeString.split(" ").map(numericVal => Number(numericVal))
    );

    // This algorithm assigns one of two states (0 or 1) to each node.
    // Nodes connected by an edge with an even weight will share the same state.
    // Nodes connected by an edge with an odd weight will have differing states.
    // The initial node (node 0, or 1-indexed 1) is arbitrarily assigned state 0.

    // Sort the connections by their second node ID, then by their first node ID.
    graphEdges.sort((linkA, linkB) => {
        if (linkA[1] === linkB[1]) {
            return (linkA[0] - linkB[0]);
        } else {
            return (linkA[1] - linkB[1]);
        }
    });
    console.log(graphEdges);

    let vertexShades = Array(nodeQuantity).fill(-1);
    vertexShades[0] = 0;

    while (graphEdges.length > 0) {
        let currentLink = graphEdges.shift();
        let sourceID = currentLink[0];
        let targetID = currentLink[1];
        let linkCost = currentLink[2];

        if (vertexShades[sourceID - 1] !== -1) {
            if (linkCost % 2 === 0) {
                vertexShades[targetID - 1] = vertexShades[sourceID - 1];
            } else {
                vertexShades[targetID - 1] = 1 - vertexShades[sourceID - 1];
            }
        } else {
            if (vertexShades[targetID - 1] !== -1) {
                if (linkCost % 2 === 0) {
                    vertexShades[sourceID - 1] = vertexShades[targetID - 1];
                } else {
                    vertexShades[sourceID - 1] = 1 - vertexShades[targetID - 1];
                }
            } else {
                graphEdges.push(currentLink);
            }
        }
    }

    for (let nodeIdx = 0; nodeIdx < nodeQuantity; nodeIdx++) {
        console.log(vertexShades[nodeIdx]);
    }
});