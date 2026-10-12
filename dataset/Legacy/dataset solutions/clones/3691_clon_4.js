let _inputLines = [];
let _currentLineIndex = 0;
let _currentTokenIndex = 0;

function _readNextToken() {
    while (_currentLineIndex < _inputLines.length) {
        const currentLine = _inputLines[_currentLineIndex];
        if (currentLine === null || currentLine.trim() === '') {
            _currentLineIndex++;
            _currentTokenIndex = 0;
            continue;
        }
        const tokens = currentLine.split(/\s+/).filter(token => token.length > 0);
        if (_currentTokenIndex < tokens.length) {
            return tokens[_currentTokenIndex++];
        }
        _currentLineIndex++;
        _currentTokenIndex = 0;
    }
    return null;
}

function _readNumber() {
    return Number(_readNextToken());
}

function _readBigInt() {
    return BigInt(_readNextToken());
}

class NodeMinHeap {
    constructor() {
        this.heapElements = [];
    }

    _getParentIndex(idx) {
        return Math.floor((idx - 1) / 2);
    }

    _getLeftChildIndex(idx) {
        return 2 * idx + 1;
    }

    _getRightChildIndex(idx) {
        return 2 * idx + 2;
    }

    _swapElements(idx1, idx2) {
        [this.heapElements[idx1], this.heapElements[idx2]] = [this.heapElements[idx2], this.heapElements[idx1]];
    }

    _heapifyUp(idx) {
        let current = idx;
        while (current > 0 && this.heapElements[current].distance < this.heapElements[this._getParentIndex(current)].distance) {
            this._swapElements(current, this._getParentIndex(current));
            current = this._getParentIndex(current);
        }
    }

    _heapifyDown(idx) {
        let current = idx;
        const lastIndex = this.heapElements.length - 1;

        while (true) {
            let leftChild = this._getLeftChildIndex(current);
            let rightChild = this._getRightChildIndex(current);
            let smallest = current;

            if (leftChild <= lastIndex && this.heapElements[leftChild].distance < this.heapElements[smallest].distance) {
                smallest = leftChild;
            }

            if (rightChild <= lastIndex && this.heapElements[rightChild].distance < this.heapElements[smallest].distance) {
                smallest = rightChild;
            }

            if (smallest !== current) {
                this._swapElements(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

    add(element) {
        this.heapElements.push(element);
        this._heapifyUp(this.heapElements.length - 1);
    }

    extractMinimum() {
        if (this.isEmpty()) {
            return null;
        }
        if (this.heapElements.length === 1) {
            return this.heapElements.pop();
        }

        const minimum = this.heapElements[0];
        this.heapElements[0] = this.heapElements.pop();
        this._heapifyDown(0);
        return minimum;
    }

    isEmpty() {
        return this.heapElements.length === 0;
    }
}

function calculateShortestPaths(sourceNode, adjacencyList) {
    const totalNodes = adjacencyList.length;
    const pathDistances = Array.from({ length: totalNodes }, () => BigInt("1000000000000000000"));
    const minPriorityQueue = new NodeMinHeap();

    pathDistances[sourceNode] = 0n;
    minPriorityQueue.add({ distance: 0n, node: sourceNode });

    while (!minPriorityQueue.isEmpty()) {
        const { distance: currentDist, node: currentNode } = minPriorityQueue.extractMinimum();

        if (currentDist > pathDistances[currentNode]) {
            continue;
        }

        for (const connectedEdge of adjacencyList[currentNode]) {
            const neighborNode = connectedEdge.target;
            const edgeCost = BigInt(connectedEdge.weight);

            if (pathDistances[neighborNode] > currentDist + edgeCost) {
                pathDistances[neighborNode] = currentDist + edgeCost;
                minPriorityQueue.add({ distance: pathDistances[neighborNode], node: neighborNode });
            }
        }
    }
    return pathDistances;
}

function mainProgram() {
    _inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

    const numNodes = _readNumber();
    const numEdges = _readNumber();
    let startPointA = _readNumber();
    let startPointB = _readNumber();

    startPointA--;
    startPointB--;

    const graphForA = Array.from({ length: numNodes }, () => []);
    const graphForB = Array.from({ length: numNodes }, () => []);

    for (let i = 0; i < numEdges; i++) {
        let nodeU = _readNumber();
        let nodeV = _readNumber();
        let costA = _readNumber();
        let costB = _readNumber();

        nodeU--;
        nodeV--;

        graphForA[nodeU].push({ target: nodeV, weight: costA });
        graphForA[nodeV].push({ target: nodeU, weight: costA });

        graphForB[nodeU].push({ target: nodeV, weight: costB });
        graphForB[nodeV].push({ target: nodeU, weight: costB });
    }

    const distancesFromA = calculateShortestPaths(startPointA, graphForA);
    const distancesFromB = calculateShortestPaths(startPointB, graphForB);

    let currentMaxOverallValue = 0n;
    const finalCalculatedResults = [];
    const fixedLargeConstant = 1000000000000000n;

    for (let i = numNodes - 1; i >= 0; i--) {
        const valueForCurrentNode = fixedLargeConstant - distancesFromA[i] - distancesFromB[i];
        currentMaxOverallValue = BigInt.max(currentMaxOverallValue, valueForCurrentNode);
        finalCalculatedResults.push(currentMaxOverallValue);
    }

    for (let i = 0; i < finalCalculatedResults.length; i++) {
        console.log(finalCalculatedResults[i].toString());
    }
}

mainProgram();
