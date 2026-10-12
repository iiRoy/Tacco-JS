class NodeSet {
    constructor(count) {
        this.representatives = Array.from({ length: count }, (_, idx) => idx);
        this.sizes = Array.from({ length: count }, () => 1);
        this.componentCount = count;
    }

    locate(idx) {
        if (this.representatives[idx] === idx) {
            return idx;
        }
        this.representatives[idx] = this.locate(this.representatives[idx]);
        return this.representatives[idx];
    }

    unite(first, second) {
        let rootA = this.locate(first);
        let rootB = this.locate(second);

        if (rootA !== rootB) {
            if (this.sizes[rootA] < this.sizes[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.representatives[rootB] = rootA;
            this.sizes[rootA] += this.sizes[rootB];
            this.componentCount--;
            return true;
        }
        return false;
    }

    getComponentCount() {
        return this.componentCount;
    }
}

function ProcessGraphData(rawData) {
    const parsedData = rawData.split(/\n/).map(line => line.split(' ').map(Number));
    const nodeCount = parsedData[0][0];
    const edgeCount = parsedData[0][1];

    const dsu = new NodeSet(nodeCount);

    for (let i = 1; i <= edgeCount; i++) {
        const sourceNode = parsedData[i][0];
        const targetNode = parsedData[i][1];
        dsu.unite(sourceNode - 1, targetNode - 1);
    }

    const distinctComponents = dsu.getComponentCount();

    const finalResult = distinctComponents - 1;
    console.log(finalResult);
}

ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
