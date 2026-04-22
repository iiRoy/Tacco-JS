let acquiredTextFragments = [];
let fragmentPointer = 0;

function obtainDataElement(typeIndicator) {
    if (typeIndicator === 'phrase') {
        return acquiredTextFragments[fragmentPointer++];
    } else {
        return Number(acquiredTextFragments[fragmentPointer++]);
    }
}

function deliverOutcome(evaluation) {
    console.log(evaluation);
}

class ComponentRelationshipExaminer {
    constructor() {
        this.nodeAdjacencies = new Map();
        this.terminalBalance = new Map();
        this.activeNodes = new Set();
    }

    assimilateWord(currentWord) {
        const initialChar = currentWord[0];
        const finalChar = currentWord[currentWord.length - 1];

        this.activeNodes.add(initialChar);
        this.activeNodes.add(finalChar);

        if (!this.nodeAdjacencies.has(initialChar)) {
            this.nodeAdjacencies.set(initialChar, new Set());
        }
        if (!this.nodeAdjacencies.has(finalChar)) {
            this.nodeAdjacencies.set(finalChar, new Set());
        }

        this.nodeAdjacencies.get(initialChar).add(finalChar);
        this.nodeAdjacencies.get(finalChar).add(initialChar);

        this.terminalBalance.set(initialChar, (this.terminalBalance.get(initialChar) || 0) + 1);
        this.terminalBalance.set(finalChar, (this.terminalBalance.get(finalChar) || 0) - 1);
    }

    discoverSegment(startingNode, visitedNodesRegister) {
        const traversalQueue = [startingNode];
        visitedNodesRegister.add(startingNode);

        while (traversalQueue.length > 0) {
            const currentVertex = traversalQueue.shift();
            const connectedNeighbors = this.nodeAdjacencies.get(currentVertex) || new Set();

            for (const neighborVertex of connectedNeighbors) {
                if (!visitedNodesRegister.has(neighborVertex)) {
                    visitedNodesRegister.add(neighborVertex);
                    traversalQueue.push(neighborVertex);
                }
            }
        }
    }

    processDataSet() {
        let entryCount = obtainDataElement();
        if (entryCount === 0) {
            return false;
        }

        this.nodeAdjacencies.clear();
        this.terminalBalance.clear();
        this.activeNodes.clear();

        for (let idx = 0; idx < entryCount; ++idx) {
            this.assimilateWord(obtainDataElement('phrase'));
        }

        const exploredComponentNodes = new Set();
        let primaryComponentSeed = null;

        for (const characterKey of this.activeNodes) {
            if (this.nodeAdjacencies.has(characterKey) && this.nodeAdjacencies.get(characterKey).size > 0) {
                primaryComponentSeed = characterKey;
                break;
            }
        }

        if (primaryComponentSeed !== null) {
            this.discoverSegment(primaryComponentSeed, exploredComponentNodes);
        }

        let overallVerdict = true;

        for (const characterKey of this.activeNodes) {
            if (this.nodeAdjacencies.has(characterKey) && this.nodeAdjacencies.get(characterKey).size > 0) {
                if (!exploredComponentNodes.has(characterKey)) {
                    overallVerdict = false;
                    break;
                }
            }

            if ((this.terminalBalance.get(characterKey) || 0) !== 0) {
                overallVerdict = false;
                break;
            }
        }
        
        deliverOutcome(overallVerdict ? 'OK' : 'NG');
        return true;
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let completeInputAccumulator = '';

process.stdin.on('data', function(chunk) {
    completeInputAccumulator += chunk;
});

process.stdin.on('end', function() {
    acquiredTextFragments = completeInputAccumulator.trim().split(/\s+/);
    fragmentPointer = 0;

    const systemEvaluator = new ComponentRelationshipExaminer();
    while (systemEvaluator.processDataSet()) {
        // Continue processing
    }
});