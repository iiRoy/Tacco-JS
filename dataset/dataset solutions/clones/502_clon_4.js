class PriorityContainer {
    constructor() {
        this.structure = [];
    }

    insertElement(itemValue) {
        this.structure.push(itemValue);
        this.ascendElement();
    }

    extractMinimum() {
        if (this.isVacant()) return null;
        const minimalItem = this.structure[0];
        const finalItem = this.structure.pop();
        if (!this.isVacant()) {
            this.structure[0] = finalItem;
            this.descendElement();
        }
        return minimalItem;
    }

    isVacant() {
        return this.structure.length === 0;
    }

    ascendElement() {
        let currentPosition = this.structure.length - 1;
        while (currentPosition > 0) {
            let superiorPosition = Math.floor((currentPosition - 1) / 2);
            if (this.structure[superiorPosition][0] <= this.structure[currentPosition][0]) break;
            [this.structure[superiorPosition], this.structure[currentPosition]] = [this.structure[currentPosition], this.structure[superiorPosition]];
            currentPosition = superiorPosition;
        }
    }

    descendElement() {
        let currentPosition = 0;
        const contentSize = this.structure.length;
        const elementToSift = this.structure[0];

        while (true) {
            let leftSubordinatePosition = 2 * currentPosition + 1;
            let rightSubordinatePosition = 2 * currentPosition + 2;
            let leftSubordinate, rightSubordinate;
            let exchangeIndex = null;

            if (leftSubordinatePosition < contentSize) {
                leftSubordinate = this.structure[leftSubordinatePosition];
                if (leftSubordinate[0] < elementToSift[0]) {
                    exchangeIndex = leftSubordinatePosition;
                }
            }

            if (rightSubordinatePosition < contentSize) {
                rightSubordinate = this.structure[rightSubordinatePosition];
                if (
                    (exchangeIndex === null && rightSubordinate[0] < elementToSift[0]) ||
                    (exchangeIndex !== null && rightSubordinate[0] < leftSubordinate[0])
                ) {
                    exchangeIndex = rightSubordinatePosition;
                }
            }

            if (exchangeIndex === null) break;
            [this.structure[currentPosition], this.structure[exchangeIndex]] = [this.structure[exchangeIndex], this.structure[currentPosition]];
            currentPosition = exchangeIndex;
        }
    }
}

const rawDataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedLines = rawDataSource.trim().split("\n");

function processNextScenario(dataBatch) {
    if (dataBatch.length === 0) return;

    const initialParameters = dataBatch.shift().split(" ").map(Number);
    const nodeCountValue = initialParameters[0];
    const connectionQuantity = initialParameters[1];

    if (nodeCountValue === 0 && connectionQuantity === 0) return;

    const maximumNodeIdentifier = nodeCountValue + 100;
    const commencementNode = 1;
    const ultimateNode = nodeCountValue;

    const pathwayNetwork = new Map();
    for (let currentVertex = 1; currentVertex <= maximumNodeIdentifier; ++currentVertex) {
        pathwayNetwork.set(currentVertex, []);
    }

    for (let k = 0; k < connectionQuantity; ++k) {
        const connectionDetails = dataBatch.shift().split(" ").map(Number);
        const endpointA = connectionDetails[0];
        const endpointB = connectionDetails[1];
        const linkCost = connectionDetails[2];
        pathwayNetwork.get(endpointA).push({ destination: endpointB, cost: linkCost });
        pathwayNetwork.get(endpointB).push({ destination: endpointA, cost: linkCost });
    }

    const journeyMetrics = new Map();
    for (let currentVertex = 1; currentVertex <= maximumNodeIdentifier; ++currentVertex) {
        journeyMetrics.set(currentVertex, { primary: Infinity, secondary: Infinity, tertiary: Infinity });
    }

    journeyMetrics.get(commencementNode).primary = 0;

    const metricQueue = new PriorityContainer();
    metricQueue.insertElement([0, commencementNode, 0]);

    while (!metricQueue.isVacant()) {
        const [currentAccumulatedCost, currentPointIdentifier, currentMetricKind] = metricQueue.extractMinimum();

        const pointData = journeyMetrics.get(currentPointIdentifier);

        if (currentMetricKind === 0 && currentAccumulatedCost > pointData.primary) continue;
        if (currentMetricKind === 1 && currentAccumulatedCost > pointData.secondary) continue;
        if (currentMetricKind === 2 && currentAccumulatedCost > pointData.tertiary) continue;

        const connectedPoints = pathwayNetwork.get(currentPointIdentifier);
        if (!connectedPoints) continue;

        for (const { destination: connectedPoint, cost: edgeValue } of connectedPoints) {
            const connectedPointData = journeyMetrics.get(connectedPoint);

            if (currentMetricKind === 0) {
                const newPrimaryCost = currentAccumulatedCost + edgeValue;
                if (newPrimaryCost < connectedPointData.primary) {
                    connectedPointData.primary = newPrimaryCost;
                    metricQueue.insertElement([newPrimaryCost, connectedPoint, 0]);
                }
                const newSecondaryCost = currentAccumulatedCost;
                if (newSecondaryCost < connectedPointData.secondary) {
                    connectedPointData.secondary = newSecondaryCost;
                    metricQueue.insertElement([newSecondaryCost, connectedPoint, 1]);
                }
            }

            if (currentMetricKind === 1) {
                const newTertiaryCost = currentAccumulatedCost;
                if (newTertiaryCost < connectedPointData.tertiary) {
                    connectedPointData.tertiary = newTertiaryCost;
                    metricQueue.insertElement([newTertiaryCost, connectedPoint, 2]);
                }
            }

            if (currentMetricKind === 2) {
                const newTertiaryCost = currentAccumulatedCost + edgeValue;
                if (newTertiaryCost < connectedPointData.tertiary) {
                    connectedPointData.tertiary = newTertiaryCost;
                    metricQueue.insertElement([newTertiaryCost, connectedPoint, 2]);
                }
            }
        }
    }

    const finalPointMetrics = journeyMetrics.get(ultimateNode);
    let finalEvaluation = Math.min(finalPointMetrics.primary, finalPointMetrics.tertiary);
    console.log(finalEvaluation);

    processNextScenario(dataBatch);
}

processNextScenario(processedLines);