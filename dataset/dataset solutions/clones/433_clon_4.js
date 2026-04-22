const allInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let currentLineIndex = 0;

const fetchNextDataLine = () => allInputData[currentLineIndex++];
const parseLineIntoNumericArray = (lineContent) => lineContent.split(' ').map(Number);

const MAXIMUM_NODES_CAP = 101;
const UNREACHABLE_METRIC = Number.MAX_SAFE_INTEGER;

function calculateAllPairRoutes(totalNodes, pathGrid) {
    for (let intermediateNode = 0; intermediateNode < totalNodes; intermediateNode++) {
        for (let startingNode = 0; startingNode < totalNodes; startingNode++) {
            for (let endingNode = 0; endingNode < totalNodes; endingNode++) {
                const currentPrice = pathGrid[startingNode][endingNode].price;
                const currentDuration = pathGrid[startingNode][endingNode].duration;

                const priceThroughIntermediate = pathGrid[startingNode][intermediateNode].price + pathGrid[intermediateNode][endingNode].price;
                const durationThroughIntermediate = pathGrid[startingNode][intermediateNode].duration + pathGrid[intermediateNode][endingNode].duration;

                pathGrid[startingNode][endingNode] = {
                    price: Math.min(currentPrice, priceThroughIntermediate),
                    duration: Math.min(currentDuration, durationThroughIntermediate)
                };
            }
        }
    }
}

function processAllScenarios() {
    while (true) {
        const [numEdges, numVertices] = parseLineIntoNumericArray(fetchNextDataLine());

        if (numEdges === 0 && numVertices === 0) {
            break;
        }

        const journeyMap = [];
        for (let r = 0; r < MAXIMUM_NODES_CAP; r++) {
            journeyMap[r] = [];
            for (let c = 0; c < MAXIMUM_NODES_CAP; c++) {
                journeyMap[r][c] = {
                    price: (r === c) ? 0 : UNREACHABLE_METRIC,
                    duration: (r === c) ? 0 : UNREACHABLE_METRIC
                };
            }
        }

        for (let e = 0; e < numEdges; e++) {
            const [origin, destination, costValue, timeValue] = parseLineIntoNumericArray(fetchNextDataLine());
            journeyMap[origin - 1][destination - 1] = { price: costValue, duration: timeValue };
        }

        calculateAllPairRoutes(numVertices, journeyMap);

        const numQueries = Number(fetchNextDataLine());
        for (let q = 0; q < numQueries; q++) {
            const [queryOrigin, queryDestination, queryType] = parseLineIntoNumericArray(fetchNextDataLine());
            const requestedPath = journeyMap[queryOrigin - 1][queryDestination - 1];

            if (queryType === 0) {
                console.log(requestedPath.price);
            } else if (queryType === 1) {
                console.log(requestedPath.duration);
            }
        }
    }
}

processAllScenarios();