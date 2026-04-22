function createInputReader(rawContent) {
    const segmentedData = rawContent.trim().split('\n').map(segment => segment.split(' ').map(Number));
    let currentSegmentIndex = 0;
    const itemTrackers = segmentedData.map(segment => segment.length - 1);

    return {
        extractUnit: function() {
            const retrievedValue = segmentedData[currentSegmentIndex][itemTrackers[currentSegmentIndex]];
            itemTrackers[currentSegmentIndex]--;
            if (itemTrackers[currentSegmentIndex] < 0) {
                currentSegmentIndex++;
            }
            return retrievedValue;
        },

        extractLine: function() {
            const lineValues = segmentedData[currentSegmentIndex];
            currentSegmentIndex++;
            return lineValues;
        },

        extractBlock: function(quantity) {
            const blockContent = [];
            for (let k = 0; k < quantity; k++) {
                blockContent.push(segmentedData[currentSegmentIndex + k]);
            }
            currentSegmentIndex += quantity;
            return blockContent;
        },

        extractRows: function(quantity) {
            const rowValues = [];
            for (let k = 0; k < quantity; k++) {
                rowValues.push(segmentedData[currentSegmentIndex + k][0]);
            }
            currentSegmentIndex += quantity;
            return rowValues;
        }
    };
}

function determineLayerCount() {
    const dataAccess = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalNodes = dataAccess.extractUnit();
    const totalEdges = dataAccess.extractUnit();
    const edgeConnections = dataAccess.extractBlock(totalEdges);

    const predecessorMap = new Map();
    const potentialSinks = new Set();

    for (let j = 1; j <= totalNodes; j++) {
        predecessorMap.set(j, []);
        potentialSinks.add(j);
    }

    for (const [sourceNode, targetNode] of edgeConnections) {
        predecessorMap.get(targetNode).push(sourceNode);
        potentialSinks.delete(sourceNode);
    }

    let currentWaveNodes = Array.from(potentialSinks);
    let waveCounter = -1;

    while (currentWaveNodes.length > 0) {
        const nextWaveCandidates = new Set();
        const visitedInThisWave = new Set();

        waveCounter++;

        for (const nodeInWave of currentWaveNodes) {
            if (visitedInThisWave.has(nodeInWave)) {
                continue;
            }
            visitedInThisWave.add(nodeInWave);

            for (const incomingNode of predecessorMap.get(nodeInWave)) {
                nextWaveCandidates.add(incomingNode);
            }
        }
        currentWaveNodes = Array.from(nextWaveCandidates);
    }

    return waveCounter;
}

console.log(determineLayerCount());