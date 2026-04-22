class GraphPathFinder {
    constructor(nodeCount, edgeList, infiniteMetric) {
        this.vertexCount = nodeCount;
        this.edgeList = edgeList;
        this.infiniteMetric = infiniteMetric;
        this.nodeDistances = new Array(this.vertexCount).fill(this.infiniteMetric);
        this.nodeDistances[0] = 0;
        this.lastVisitedTarget = undefined; // Simulates 't' variable for the bug
    }

    // Performs one iteration of the relaxation process
    applyRelaxationIteration(maximumSourceIndex, isCycleDetectionRun, targetNodeForCycleCheck) {
        let cyclePathFound = false;

        // Use 'some' to allow early exit (mimicking 'break' for 'i' loop)
        Array.from({ length: maximumSourceIndex + 1 }).some((_, currentSourceIndex) => {
            // Replicate the 't' bug: if (dist[t] === inf) { continue; }
            if (this.lastVisitedTarget !== undefined && this.nodeDistances[this.lastVisitedTarget] === this.infiniteMetric) {
                return false; // Equivalent to 'continue' for forEach. `some` continues if false.
            }

            if (this.nodeDistances[currentSourceIndex] === this.infiniteMetric) {
                return false; // Equivalent to 'continue'
            }

            // Use 'some' to allow early exit (mimicking 'break' for 'j' loop)
            this.edgeList.filter(e => e.sourceVertex === currentSourceIndex).some(edge => {
                this.lastVisitedTarget = edge.destinationVertex; // Update 't'
                if (this.nodeDistances[this.lastVisitedTarget] < this.nodeDistances[currentSourceIndex] + edge.weightValue) {
                    this.nodeDistances[this.lastVisitedTarget] = this.nodeDistances[currentSourceIndex] + edge.weightValue;
                    if (isCycleDetectionRun && currentSourceIndex === targetNodeForCycleCheck) {
                        cyclePathFound = true;
                        return true; // Equivalent to 'break' for 'j' loop
                    }
                }
                return false; // Equivalent to 'continue' for 'j' loop
            });

            if (isCycleDetectionRun && cyclePathFound) {
                return true; // Equivalent to 'break' for 'i' loop
            }
            return false; // Equivalent to 'continue' for 'i' loop
        });
        return cyclePathFound;
    }

    // Main solver method
    solveGraph() {
        // First set of relaxation passes (N times, source nodes up to N-2)
        Array.from({ length: this.vertexCount }).forEach(() => {
            this.applyRelaxationIteration(this.vertexCount - 2, false, -1);
        });

        // Second set of passes for cycle detection (N times, all source nodes 0 to N-1)
        let confirmedInfinitePath = false;
        Array.from({ length: this.vertexCount }).forEach(() => {
            if (this.applyRelaxationIteration(this.vertexCount - 1, true, this.vertexCount - 1)) {
                confirmedInfinitePath = true;
            }
        });

        if (confirmedInfinitePath) {
            console.log("inf");
        } else {
            console.log(this.nodeDistances[this.vertexCount - 1]);
        }
    }
}

function processInputData(rawDataLines) {
    const NegligibleMagnitude = -100000000000000;

    const [firstLineData, ...edgeLines] = rawDataLines;
    const [vertexQuantityStr, edgeQuantityStr] = firstLineData.split(" ");
    const vertexQuantity = parseInt(vertexQuantityStr);
    const edgeQuantity = parseInt(edgeQuantityStr);

    const graphEdges = edgeLines.slice(0, edgeQuantity).map((line, index) => {
        const [uStr, vStr, wStr] = line.split(" ");
        return {
            sourceVertex: parseInt(uStr) - 1,
            destinationVertex: parseInt(vStr) - 1,
            weightValue: parseInt(wStr)
        };
    });

    const graphEngine = new GraphPathFinder(vertexQuantity, graphEdges, NegligibleMagnitude);
    graphEngine.solveGraph();
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));