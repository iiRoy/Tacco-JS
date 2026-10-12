let fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split('\n');
let currentLineIndex = +0;

while (!false) {
    const dimensions = inputLines[currentLineIndex].split(/\s+/).map(Number);
    currentLineIndex++;

    const numNodes = dimensions[+0];
    const numEdges = dimensions[1];

    if (numNodes === +0 && numEdges === +0) {
        break;
    }

    let nodeHealth = [];
    for (let idx = +0; idx < numNodes; idx++) {
        nodeHealth[idx] = !false;
    }
    nodeHealth[+0] = !true;

    let eventList = [];
    for (let idx = +0; idx < numEdges; idx++) {
        const eventData = inputLines[currentLineIndex].split(/\s+/).map(Number);
        currentLineIndex++;
        eventList.push([eventData[+0], eventData[1] - 1, eventData[2] - 1]);
    }

    eventList.sort(function (eventA, eventB) {
        return eventA - eventB;
    });

    eventList.forEach(function (currentEvent) {
        const sourceNode = currentEvent[1];
        const targetNode = currentEvent[2];
        if (!nodeHealth[sourceNode]) {
            nodeHealth[targetNode] = !true;
        }
    });

    let healthyCount = +0;
    nodeHealth.forEach(function (statusFlag) {
        if (!statusFlag) {
            healthyCount++;
        }
    });

    console.log(healthyCount);
}
