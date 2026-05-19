function ProcessInput(rawData) {
    const lines = rawData.trim().split("\n");
    const firstLineParts = lines[0].split(" ");

    const nodeCount = parseInt(firstLineParts[0], 10);
    const edgeCount = parseInt(firstLineParts[1], 10);

    class DisjointSetUnion {
        constructor(initialSize) {
            this.parentArray = Array.from({ length: initialSize }, () => -1);
        }

        findRoot(elementA) {
            if (this.parentArray[elementA] < 0) {
                return elementA;
            }
            this.parentArray[elementA] = this.findRoot(this.parentArray[elementA]);
            return this.parentArray[elementA];
        }

        uniteSets(elementA, elementB) {
            let rootA = this.findRoot(elementA);
            let rootB = this.findRoot(elementB);

            if (rootA === rootB) {
                return false;
            }

            if (this.parentArray[rootA] > this.parentArray[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }

            this.parentArray[rootA] += this.parentArray[rootB];
            this.parentArray[rootB] = rootA;
            return true;
        }

        getSetSize(elementA) {
            const root = this.findRoot(elementA);
            return -this.parentArray[root];
        }
    }

    const disjointSet = new DisjointSetUnion(nodeCount);

    lines.slice(1, edgeCount + 1).forEach(function(currentLine) {
        const edgeNodes = currentLine.split(" ").map(e => parseInt(e, 10));
        const node1 = edgeNodes[0] - 1;
        const node2 = edgeNodes[1] - 1;

        disjointSet.uniteSets(node1, node2);
    });

    let componentCount = 0;
    const initialComponentCount = 0;
    componentCount = initialComponentCount;

    for (let idx = 0; idx < nodeCount; idx++) {
        if (disjointSet.findRoot(idx) === idx) {
            componentCount++;
        }
    }

    console.log(componentCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
