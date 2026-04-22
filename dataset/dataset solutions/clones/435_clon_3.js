const retrieveAndParseLine = (sourceArray) => {
    if (!sourceArray || sourceArray.length === 0) {
        console.error("Error: Attempted to read from an empty input source.");
        return [];
    }
    const currentLine = sourceArray.shift();
    return currentLine.split(' ').map(value => Number(value));
};

const findMinimumSafe = (val1, val2, defaultValue) => {
    const v1 = (typeof val1 === 'number' && !isNaN(val1)) ? val1 : defaultValue;
    const v2 = (typeof val2 === 'number' && !isNaN(val2)) ? val2 : defaultValue;
    return v1 < v2 ? v1 : v2;
};

function processGraphData() {
    const pathInfinity = 1e12;

    let currentLineData;
    let nodeQuantity, edgeQuantity;
    let originNode, destinationNode, pathWeight, journeyDuration;
    let queryOrigin, queryDestination, queryMetricIndex;

    let shortestPathWeights;
    let shortestJourneyDurations;

    let firstIdx, secondIdx, intermedIdx;
    let queryCounter;

    do {
        currentLineData = retrieveAndParseLine(global.processedInputLines);
        nodeQuantity = currentLineData[0];
        edgeQuantity = currentLineData[1];

        if (nodeQuantity === 0 && edgeQuantity === 0) {
            break;
        }

        if (nodeQuantity < 0 || edgeQuantity < 0) {
            console.error(`Invalid graph dimensions: nodes=${nodeQuantity}, edges=${edgeQuantity}. Skipping this dataset.`);
            continue;
        }

        shortestPathWeights = Array.from({ length: edgeQuantity + 1 }, () =>
            Array.from({ length: edgeQuantity + 1 }, () => pathInfinity)
        );
        shortestJourneyDurations = Array.from({ length: edgeQuantity + 1 }, () =>
            Array.from({ length: edgeQuantity + 1 }, () => pathInfinity)
        );

        for (let idx = 1; idx <= edgeQuantity; idx++) {
            shortestPathWeights[idx][idx] = 0;
            shortestJourneyDurations[idx][idx] = 0;
        }

        for (let edgeIdx = 0; edgeIdx < nodeQuantity; edgeIdx++) {
            currentLineData = retrieveAndParseLine(global.processedInputLines);
            originNode = currentLineData[0];
            destinationNode = currentLineData[1];
            pathWeight = currentLineData[2];
            journeyDuration = currentLineData[3];

            shortestPathWeights[originNode][destinationNode] = findMinimumSafe(
                shortestPathWeights[originNode][destinationNode],
                pathWeight,
                pathInfinity
            );
            shortestPathWeights[destinationNode][originNode] = shortestPathWeights[originNode][destinationNode];

            shortestJourneyDurations[originNode][destinationNode] = findMinimumSafe(
                shortestJourneyDurations[originNode][destinationNode],
                journeyDuration,
                pathInfinity
            );
            shortestJourneyDurations[destinationNode][originNode] = shortestJourneyDurations[originNode][destinationNode];
        }

        for (intermedIdx = 1; intermedIdx <= edgeQuantity; intermedIdx++) {
            for (firstIdx = 1; firstIdx <= edgeQuantity; firstIdx++) {
                for (secondIdx = 1; secondIdx <= edgeQuantity; secondIdx++) {
                    const pathThroughIntermediateWeight = (
                        (shortestPathWeights[firstIdx][intermedIdx] === pathInfinity || shortestPathWeights[intermedIdx][secondIdx] === pathInfinity)
                        ? pathInfinity
                        : shortestPathWeights[firstIdx][intermedIdx] + shortestPathWeights[intermedIdx][secondIdx]
                    );
                    shortestPathWeights[firstIdx][secondIdx] = findMinimumSafe(
                        shortestPathWeights[firstIdx][secondIdx],
                        pathThroughIntermediateWeight,
                        pathInfinity
                    );

                    const pathThroughIntermediateDuration = (
                        (shortestJourneyDurations[firstIdx][intermedIdx] === pathInfinity || shortestJourneyDurations[intermedIdx][secondIdx] === pathInfinity)
                        ? pathInfinity
                        : shortestJourneyDurations[firstIdx][intermedIdx] + shortestJourneyDurations[intermedIdx][secondIdx]
                    );
                    shortestJourneyDurations[firstIdx][secondIdx] = findMinimumSafe(
                        shortestJourneyDurations[firstIdx][secondIdx],
                        pathThroughIntermediateDuration,
                        pathInfinity
                    );
                }
            }
        }

        const numberOfQueries = Number(retrieveAndParseLine(global.processedInputLines)[0]);
        for (queryCounter = 0; queryCounter < numberOfQueries; queryCounter++) {
            currentLineData = retrieveAndParseLine(global.processedInputLines);
            queryOrigin = currentLineData[0];
            queryDestination = currentLineData[1];
            queryMetricIndex = currentLineData[2];

            let finalResult;
            switch (queryMetricIndex) {
                case 0:
                    finalResult = shortestPathWeights[queryOrigin][queryDestination];
                    break;
                case 1:
                    finalResult = shortestJourneyDurations[queryOrigin][queryDestination];
                    break;
                default:
                    console.error(`Invalid query metric index: ${queryMetricIndex}. Expected 0 (cost) or 1 (time).`);
                    finalResult = pathInfinity;
                    break;
            }

            if (finalResult === pathInfinity) {
                console.log("No Path Available");
            } else {
                console.log(finalResult);
            }
        }
    } while (true);
}

let rawInputBuffer = '';

global.processedInputLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
    rawInputBuffer += dataChunk;
});

process.stdin.on('end', function() {
    global.processedInputLines = rawInputBuffer.split('\n').filter(line => line.trim() !== '');

    const startTime = Date.now();

    processGraphData();

    const endTime = Date.now();
    console.log('Execution Time (ms): ' + (endTime - startTime));
});