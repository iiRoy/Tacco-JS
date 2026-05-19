const processInput = (rawText) => {
    const lines = rawText.trim().split('\n');
    const totalCities = parseInt(lines[0].split(' ')[0], 10);
    const cityData = lines.slice(1, totalCities + 1).map(line =>
        line.split(' ').map(coord => parseInt(coord, 10))
    );
    return { totalCities, cityData };
};

const findConnectedNodes = (currentCityIdx, allCityCoords) => {
    const currentCity = allCityCoords[currentCityIdx];
    const connectedIndices = [];
    const cityCount = allCityCoords.length;

    for (let otherCityIdx = 0; otherCityIdx < cityCount; otherCityIdx++) {
        const otherCity = allCityCoords[otherCityIdx];
        const [cx, cy] = currentCity;
        const [ox, oy] = otherCity;

        if ((cx > ox && cy > oy) || (cx < ox && cy < oy)) {
            connectedIndices.push(otherCityIdx);
        }
    }
    return connectedIndices;
};

const executeTraversal = (inputData) => {
    const { totalCities, cityData } = inputData;
    const reachabilityCounts = new Array(totalCities);

    for (let startNode = 0; startNode < totalCities; startNode++) {
        const traversalQueue = [startNode];
        const visitedNodes = new Set();
        visitedNodes.add(startNode);
        let queueHead = 0;

        while (queueHead < traversalQueue.length) {
            const currentNode = traversalQueue[queueHead++];
            const neighbors = findConnectedNodes(currentNode, cityData);

            for (const neighborIdx of neighbors) {
                if (!visitedNodes.has(neighborIdx)) {
                    visitedNodes.add(neighborIdx);
                    traversalQueue.push(neighborIdx);
                }
            }
        }
        reachabilityCounts[startNode] = visitedNodes.size;
    }
    console.log(reachabilityCounts.join('\n'));
};

executeTraversal(processInput(require('fs').readFileSync('/dev/stdin', 'utf8')));
