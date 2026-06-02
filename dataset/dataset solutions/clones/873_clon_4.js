const readline = require('readline');
const process = require('process');

let storedInputLines = [];
let currentInputLineIndex = 0;

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputReader.on('line', (lineContent) => {
    storedInputLines.push(lineContent);
});

inputReader.on('close', () => {
    executeMainLogic().catch(console.error);
});

class DisjointSetUnion {
    constructor(elementCount) {
        this.parentRegistry = new Map();
        this.setSizes = new Map();

        for (let i = 0; i < elementCount; i++) {
            this.parentRegistry.set(i, i);
            this.setSizes.set(i, 1);
        }
    }

    findRepresentative(element) {
        if (this.parentRegistry.get(element) === element) {
            return element;
        }
        const root = this.findRepresentative(this.parentRegistry.get(element));
        this.parentRegistry.set(element, root); // Path compression
        return root;
    }

    uniteSets(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        if (rootA !== rootB) {
            // Union by size heuristic
            if (this.setSizes.get(rootA) < this.setSizes.get(rootB)) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.parentRegistry.set(rootB, rootA);
            this.setSizes.set(rootA, this.setSizes.get(rootA) + this.setSizes.get(rootB));
            return true;
        }
        return false;
    }

    countDistinctComponents(activeElementsSet) {
        const uniqueRoots = new Set();
        for (const element of activeElementsSet) {
            uniqueRoots.add(this.findRepresentative(element));
        }
        return uniqueRoots.size;
    }
}

async function executeMainLogic() {
    const retrieveLine = () => storedInputLines[currentInputLineIndex++];

    while (true) {
        const dimensions = retrieveLine().split(' ');
        const numNodes = parseInt(dimensions[0], 10);
        const numEdges = parseInt(dimensions[1], 10);

        if (numNodes === 0 && numEdges === 0) {
            break;
        }

        const nodeAvailabilityDays = new Map(); // nodeIndex -> days
        const nodesSortedByDays = []; // { id: nodeIndex, day: daysValue }
        for (let i = 0; i < numNodes; i++) {
            const dayValue = parseInt(retrieveLine(), 10);
            nodeAvailabilityDays.set(i, dayValue);
            nodesSortedByDays.push({ id: i, day: dayValue });
        }

        const allGraphEdges = []; // { source, target, weight }
        for (let i = 0; i < numEdges; i++) {
            const edgeData = retrieveLine().split(' ');
            const u = parseInt(edgeData[0], 10) - 1;
            const v = parseInt(edgeData[1], 10) - 1;
            const w = parseInt(edgeData[2], 10);
            allGraphEdges.push({ source: u, target: v, weight: w });
        }

        nodesSortedByDays.sort((a, b) => a.day - b.day);

        // Initial connectivity check with all nodes present
        let initialConnectivityDSU = new DisjointSetUnion(numNodes);
        let allNodesSet = new Set(Array.from({ length: numNodes }, (_, i) => i));

        for (const edge of allGraphEdges) {
            initialConnectivityDSU.uniteSets(edge.source, edge.target);
        }

        if (initialConnectivityDSU.countDistinctComponents(allNodesSet) > 1) {
            console.log(0);
            continue;
        }

        // Determine the critical day threshold
        let criticalDayValue = 0;
        let currentActiveNodes = new Set(allNodesSet); // All nodes initially considered active for this check

        const nodesGroupedByDay = new Map(); // day -> Set<nodeIndex>
        for (const { id, day } of nodesSortedByDays) {
            if (!nodesGroupedByDay.has(day)) {
                nodesGroupedByDay.set(day, new Set());
            }
            nodesGroupedByDay.get(day).add(id);
        }
        const orderedUniqueDays = Array.from(nodesGroupedByDay.keys()).sort((a, b) => a - b);

        let criticalDayFound = false;
        for (let i = 0; i < orderedUniqueDays.length; i++) {
            const dayToConsider = orderedUniqueDays[i];
            const nodesToDeactivate = nodesGroupedByDay.get(dayToConsider);

            const hypotheticalActiveSet = new Set(currentActiveNodes);
            for (const node of nodesToDeactivate) {
                hypotheticalActiveSet.delete(node);
            }

            if (hypotheticalActiveSet.size === 0) {
                criticalDayValue = dayToConsider;
                criticalDayFound = true;
                break;
            }

            const dsuForCheck = new DisjointSetUnion(numNodes);
            const relevantEdgesForConnectivity = allGraphEdges.filter(edge =>
                hypotheticalActiveSet.has(edge.source) && hypotheticalActiveSet.has(edge.target)
            );
            for (const edge of relevantEdgesForConnectivity) {
                dsuForCheck.uniteSets(edge.source, edge.target);
            }

            if (dsuForCheck.countDistinctComponents(hypotheticalActiveSet) > 1) {
                criticalDayValue = dayToConsider;
                criticalDayFound = true;
                break;
            }
            currentActiveNodes = hypotheticalActiveSet; // If connected, these nodes are permanently removed for next iteration
        }

        if (!criticalDayFound && orderedUniqueDays.length > 0) {
            criticalDayValue = orderedUniqueDays[0]; // All nodes are needed, so the lowest day is the threshold
        }

        // Re-initialize the set of active nodes based on the determined critical day
        let finalActiveNodesSet = new Set();
        for (const { id, day } of nodesSortedByDays) {
            if (day >= criticalDayValue) {
                finalActiveNodesSet.add(id);
            }
        }

        // Kruskal's algorithm on the initial set of active nodes
        let minimumSpanningTreeCost = 0;
        let currentDSUState = new DisjointSetUnion(numNodes);
        const sortedAllEdges = [...allGraphEdges].sort((a, b) => a.weight - b.weight);

        // First pass: MST for nodes available on or after the critical day
        for (const edge of sortedAllEdges) {
            if (finalActiveNodesSet.has(edge.source) && finalActiveNodesSet.has(edge.target)) {
                if (currentDSUState.uniteSets(edge.source, edge.target)) {
                    minimumSpanningTreeCost += edge.weight;
                }
            }
        }

        // Iteratively add back nodes with days less than the critical day, from highest to lowest day
        const daysToReintroduce = orderedUniqueDays.filter(d => d < criticalDayValue).sort((a, b) => b - a);

        for (const dayGroup of daysToReintroduce) {
            const nodesToActivate = nodesGroupedByDay.get(dayGroup);
            for (const node of nodesToActivate) {
                finalActiveNodesSet.add(node);
            }

            // Re-calculate MST for the expanded set of active nodes
            minimumSpanningTreeCost = 0;
            currentDSUState = new DisjointSetUnion(numNodes); // Reset DSU for full MST calculation
            for (const edge of sortedAllEdges) {
                if (finalActiveNodesSet.has(edge.source) && finalActiveNodesSet.has(edge.target)) {
                    if (currentDSUState.uniteSets(edge.source, edge.target)) {
                        minimumSpanningTreeCost += edge.weight;
                    }
                }
            }
        }

        console.log(minimumSpanningTreeCost);
    }
}
