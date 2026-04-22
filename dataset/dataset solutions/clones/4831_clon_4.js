function processGraphData(graphDataLines) {
    const initialConfig = graphDataLines[0].split(' ').map(Number);
    const totalNodes = initialConfig[0];
    const firstConnectionCount = initialConfig[1];
    const secondConnectionCount = initialConfig[2];

    class ComponentGrouper {
        constructor(nodeCount) {
            this.parentNodes = Array.from({ length: nodeCount }, (_, index) => index);
            this.groupSizes = Array(nodeCount).fill(1);
        }

        determineRoot(nodeIdentifier) {
            if (this.parentNodes[nodeIdentifier] === nodeIdentifier) {
                return nodeIdentifier;
            }
            this.parentNodes[nodeIdentifier] = this.determineRoot(this.parentNodes[nodeIdentifier]);
            return this.parentNodes[nodeIdentifier];
        }

        uniteGroups(nodeA, nodeB) {
            let rootA = this.determineRoot(nodeA);
            let rootB = this.determineRoot(nodeB);

            if (rootA !== rootB) {
                if (this.groupSizes[rootA] < this.groupSizes[rootB]) {
                    [rootA, rootB] = [rootB, rootA];
                }
                this.parentNodes[rootB] = rootA;
                this.groupSizes[rootA] += this.groupSizes[rootB];
                return true;
            }
            return false;
        }
    }

    const pathwayGrouper = new ComponentGrouper(totalNodes);
    const routeGrouper = new ComponentGrouper(totalNodes);

    for (let currentLine = 1; currentLine <= firstConnectionCount; currentLine++) {
        const [node1, node2] = graphDataLines[currentLine].split(' ').map(Number);
        pathwayGrouper.uniteGroups(node1 - 1, node2 - 1);
    }

    for (let currentLine = firstConnectionCount + 1; currentLine <= firstConnectionCount + secondConnectionCount; currentLine++) {
        const [node1, node2] = graphDataLines[currentLine].split(' ').map(Number);
        routeGrouper.uniteGroups(node1 - 1, node2 - 1);
    }

    const combinedComponentCounts = new Map();
    const finalCounts = new Array(totalNodes);

    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        const pathwayRoot = pathwayGrouper.determineRoot(nodeIndex);
        const routeRoot = routeGrouper.determineRoot(nodeIndex);
        const combinedKey = `${pathwayRoot}-${routeRoot}`;

        combinedComponentCounts.set(combinedKey, (combinedComponentCounts.get(combinedKey) || 0) + 1);
    }

    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        const pathwayRoot = pathwayGrouper.determineRoot(nodeIndex);
        const routeRoot = routeGrouper.determineRoot(nodeIndex);
        const combinedKey = `${pathwayRoot}-${routeRoot}`;
        finalCounts[nodeIndex] = combinedComponentCounts.get(combinedKey);
    }

    return finalCounts.join(' ');
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
console.log(processGraphData(inputData));