const systemInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processDataStream = (dataInput) => {
    let streamElements = dataInput.trim().split(/\s+/g);
    let streamCursor = 0;

    const streamHandler = {
        fetchElement: () => {
            if (streamCursor >= streamElements.length) {
                throw new Error("Input stream exhausted.");
            }
            return streamElements[streamCursor++];
        },
        fetchNumber: () => {
            return parseInt(streamHandler.fetchElement(), 10);
        }
    };

    const computeSolution = () => {
        const nodeQuantity = streamHandler.fetchNumber();
        const graphRepresentation = new Map();

        for (let linkIndex = 0; linkIndex < nodeQuantity - 1; ++linkIndex) {
            const pointAlpha = streamHandler.fetchNumber() - 1;
            const pointBeta = streamHandler.fetchNumber() - 1;
            const connectionWeight = streamHandler.fetchNumber();

            if (!graphRepresentation.has(pointAlpha)) {
                graphRepresentation.set(pointAlpha, []);
            }
            if (!graphRepresentation.has(pointBeta)) {
                graphRepresentation.set(pointBeta, []);
            }

            graphRepresentation.get(pointAlpha).push({ targetIdentifier: pointBeta, pathCost: connectionWeight });
            graphRepresentation.get(pointBeta).push({ targetIdentifier: pointAlpha, pathCost: connectionWeight });
        }

        const queryQuantity = streamHandler.fetchNumber();
        const initialLocation = streamHandler.fetchNumber() - 1;

        const costToNode = new Map();
        const explorationQueue = [{ currentPoint: initialLocation, totalJourneyCost: 0 }];
        costToNode.set(initialLocation, 0);

        let queueHead = 0;
        while (queueHead < explorationQueue.length) {
            const currentExploration = explorationQueue[queueHead++];
            const activePoint = currentExploration.currentPoint;
            const accumulatedJourneyCost = currentExploration.totalJourneyCost;

            const adjacentConnections = graphRepresentation.get(activePoint) || [];
            for (const incidentLink of adjacentConnections) {
                const connectedPoint = incidentLink.targetIdentifier;
                const segmentCost = incidentLink.pathCost;

                if (!costToNode.has(connectedPoint)) {
                    const newAccumulatedCost = accumulatedJourneyCost + segmentCost;
                    costToNode.set(connectedPoint, newAccumulatedCost);
                    explorationQueue.push({ currentPoint: connectedPoint, totalJourneyCost: newAccumulatedCost });
                }
            }
        }

        const finalOutputs = [];
        for (let q = 0; q < queryQuantity; ++q) {
            const queryNodeA = streamHandler.fetchNumber() - 1;
            const queryNodeB = streamHandler.fetchNumber() - 1;
            const sumOfCosts = costToNode.get(queryNodeA) + costToNode.get(queryNodeB);
            finalOutputs.push(sumOfCosts);
        }
        return finalOutputs.join('\n');
    };

    return computeSolution();
};

console.log(processDataStream(systemInput));