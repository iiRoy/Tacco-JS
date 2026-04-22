const acquireStreamContent = async () => {
    const collectedInput = [];
    const streamProcessor = require("node:readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    for await (const piece of streamProcessor) {
        collectedInput.push(piece);
    }
    streamProcessor.close();
    return collectedInput;
};

class CircularPathOptimizer {
    constructor(ringSize, pointCoordinates) {
        this.ringCircumference = ringSize;
        this.sortedMarkers = pointCoordinates;
        this.cumulativePathLength = 0;
        this.currentLocationReference = 0;
        this.leftmostBoundaryIndex = this.sortedMarkers.length - 1;
        this.rightmostBoundaryIndex = 0;

        // Initialize potential path costs from the conceptual start (0 or ringSize)
        this.potentialLeftwardCost = this.ringCircumference - this.sortedMarkers[this.leftmostBoundaryIndex];
        this.potentialRightwardCost = this.sortedMarkers[this.rightmostBoundaryIndex];
    }

    // Advances the optimization process by one step
    advanceOptimizationStep() {
        if (this.rightmostBoundaryIndex > this.leftmostBoundaryIndex) {
            // All markers have been considered or indices have crossed
            return;
        }

        if (this.potentialRightwardCost <= this.potentialLeftwardCost) {
            // Prioritize moving towards the 'left' (larger coordinate)
            this.cumulativePathLength += this.potentialLeftwardCost;
            this.currentLocationReference = this.sortedMarkers[this.leftmostBoundaryIndex];
            this.leftmostBoundaryIndex--;

            // Recalculate potential costs for the next step based on the new reference point
            this.potentialLeftwardCost = this.currentLocationReference - this.sortedMarkers[this.leftmostBoundaryIndex];
            this.potentialRightwardCost = this.ringCircumference - (this.currentLocationReference - this.sortedMarkers[this.rightmostBoundaryIndex]);
        } else {
            // Prioritize moving towards the 'right' (smaller coordinate)
            this.cumulativePathLength += this.potentialRightwardCost;
            this.currentLocationReference = this.sortedMarkers[this.rightmostBoundaryIndex];
            this.rightmostBoundaryIndex++;

            // Recalculate potential costs for the next step based on the new reference point
            this.potentialLeftwardCost = this.ringCircumference - (this.sortedMarkers[this.leftmostBoundaryIndex] - this.currentLocationReference);
            this.potentialRightwardCost = this.sortedMarkers[this.rightmostBoundaryIndex] - this.currentLocationReference;
        }
    }

    // Executes the full optimization plan
    computeOptimalPath() {
        const totalMarkers = this.sortedMarkers.length;
        for (let k = 0; k < totalMarkers; k++) {
            this.advanceOptimizationStep();
        }
        return this.cumulativePathLength;
    }
}

const orchestrateCalculation = async () => {
    const receivedLines = await acquireStreamContent();

    const [trackDimension, markerCount] = receivedLines.shift().split(" ").map(Number);
    const markerPositions = receivedLines.map(Number).sort((first, second) => first - second);

    const pathFinder = new CircularPathOptimizer(trackDimension, markerPositions);
    const finalCalculatedLength = pathFinder.computeOptimalPath();

    console.log(finalCalculatedLength);
};

orchestrateCalculation();