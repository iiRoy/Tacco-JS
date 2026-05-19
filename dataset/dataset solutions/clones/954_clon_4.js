class ComponentTracker {
    constructor(nodeCount) {
        this.parentMap = new Map();
        this.rankMap = new Map();
        for (let nodeIdentifier = 0; nodeIdentifier < nodeCount; nodeIdentifier++) {
            this.parentMap.set(nodeIdentifier, nodeIdentifier);
            this.rankMap.set(nodeIdentifier, 0);
        }
    }

    findRoot(elementIdentifier) {
        if (this.parentMap.get(elementIdentifier) === elementIdentifier) {
            return elementIdentifier;
        }
        const root = this.findRoot(this.parentMap.get(elementIdentifier));
        this.parentMap.set(elementIdentifier, root);
        return root;
    }

    areConnected(elementA, elementB) {
        return this.findRoot(elementA) === this.findRoot(elementB);
    }

    uniteSets(elementA, elementB) {
        let rootA = this.findRoot(elementA);
        let rootB = this.findRoot(elementB);

        if (rootA === rootB) {
            return;
        }

        let rankA = this.rankMap.get(rootA);
        let rankB = this.rankMap.get(rootB);

        if (rankA > rankB) {
            this.parentMap.set(rootB, rootA);
        } else if (rankB > rankA) {
            this.parentMap.set(rootA, rootB);
        } else {
            this.parentMap.set(rootB, rootA);
            this.rankMap.set(rootA, rankA + 1);
        }
    }
}

let inputBuffer = '';
let tokenIndex = 0;
let parsedTokens = [];

function readNextToken(tokenType) {
    const token = parsedTokens[tokenIndex++];
    if (tokenType === 'string') {
        return token;
    } else {
        return +token;
    }
}

function outputResult(value) {
    console.log(value);
}

function executeAlgorithm() {
    const nodeCount = readNextToken();
    
    const graphEdges = Array.from({ length: nodeCount }).flatMap((_, nodeIdxA) =>
        Array.from({ length: nodeCount }).map((__, nodeIdxB) => {
            const edgeWeight = readNextToken();
            return { weight: edgeWeight, u: nodeIdxA, v: nodeIdxB };
        }).filter(edge => edge.u < edge.v && edge.weight !== -1)
    );

    graphEdges.sort((edgeA, edgeB) => edgeA.weight - edgeB.weight);

    const dsu = new ComponentTracker(nodeCount);
    
    const minimumSpanningTreeWeight = graphEdges.reduce((totalWeight, currentEdge) => {
        if (!dsu.areConnected(currentEdge.u, currentEdge.v)) {
            dsu.uniteSets(currentEdge.u, currentEdge.v);
            return totalWeight + currentEdge.weight;
        }
        return totalWeight;
    }, 0);

    outputResult(minimumSpanningTreeWeight);
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    parsedTokens = inputBuffer.trim().split(/\s+/);
    executeAlgorithm();
});
