var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/), tokenIndex = 0;
function getNextTokenAsNumber() { return +tokenizedInput[tokenIndex++]; }

class DisjointSet {
    constructor(count) {
        this.parent = Array.from({ length: count }, (_, i) => i);
        this.componentSizes = Array(count).fill(1);
        this.numComponents = count;
    }

    findRoot(element) {
        if (this.parent[element] === element) {
            return element;
        }
        const root = this.findRoot(this.parent[element]);
        this.parent[element] = root;
        return root;
    }

    unionSets(elementA, elementB) {
        let rootA = this.findRoot(elementA);
        let rootB = this.findRoot(elementB);

        if (rootA === rootB) {
            return;
        }

        let largerRoot, smallerRoot;
        if (this.componentSizes[rootA] >= this.componentSizes[rootB]) {
            largerRoot = rootA;
            smallerRoot = rootB;
        } else {
            largerRoot = rootB;
            smallerRoot = rootA;
        }

        this.parent[smallerRoot] = largerRoot;
        this.componentSizes[largerRoot] += this.componentSizes[smallerRoot];
        this.numComponents--;
    }

    areConnected(elementA, elementB) {
        return this.findRoot(elementA) === this.findRoot(elementB);
    }
}

function executeQueries() {
    const numElements = getNextTokenAsNumber();
    let numQueries = getNextTokenAsNumber();

    const disjointSetInstance = new DisjointSet(numElements);

    for (let i = 0; i < numQueries; i++) {
        const queryType = getNextTokenAsNumber();
        const elementA = getNextTokenAsNumber();
        const elementB = getNextTokenAsNumber();

        switch (queryType) {
            case 0:
                disjointSetInstance.unionSets(elementA, elementB);
                break;
            case 1:
                const connectedStatus = disjointSetInstance.areConnected(elementA, elementB);
                console.log(connectedStatus ? 1 : 0);
                break;
        }
    }
}

executeQueries();
