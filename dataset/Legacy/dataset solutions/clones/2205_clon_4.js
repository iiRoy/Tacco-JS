class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return undefined;
        const root = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return root;
    }

    peek() {
        return this.heap[0];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (element[0] >= parent[0]) break;
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = element;
    }

    _sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild[0] < element[0]) {
                    swap = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && rightChild[0] < element[0]) ||
                    (swap !== null && rightChild[0] < leftChild[0])
                ) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            index = swap;
        }
        this.heap[index] = element;
    }
}

var inputBuffer = [];
var dataProcessor;

require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', function(line) {
    inputBuffer.push(line);
}).on('close', function() {
    dataProcessor = createInputProcessor(inputBuffer);
    console.error('\n↑入力 ↓出力');
    processGame();
});

function createInputProcessor(sourceLines) {
    let currentLineIndex = 0;
    const totalLines = sourceLines.length;

    const retrieveNextLine = () => {
        if (currentLineIndex >= totalLines) {
            throw new Error('No more input available');
        }
        return sourceLines[currentLineIndex++];
    };

    const parseLine = (lineContent, formatType) => {
        switch (formatType) {
            case 'int': return parseInt(lineContent, 10);
            case 'strArray': return lineContent.split(' ');
            case 'intArray': return lineContent.split(' ').map(Number);
            case 'charArray': return lineContent.split('');
            case 'charIntArray': return lineContent.split('').map(Number);
            default: return lineContent;
        }
    };

    return {
        fetchNumericArray: () => parseLine(retrieveNextLine(), 'intArray'),
        fetchInteger: () => parseLine(retrieveNextLine(), 'int'),
        fetchStringArray: () => parseLine(retrieveNextLine(), 'strArray'),
        fetchCharacterArray: () => parseLine(retrieveNextLine(), 'charArray'),
        fetchCharacterIntegerArray: () => parseLine(retrieveNextLine(), 'charIntArray'),
        peekNext: () => (currentLineIndex < totalLines) ? sourceLines[currentLineIndex] : undefined,
        hasMore: () => currentLineIndex < totalLines
    };
}

function outputResult(content) {
    console.log(content);
}

function logDebug(data) {
    console.error('debug_info:' + require('util').inspect(data, false, null));
}

function processGame() {
    const [numMonsters, bombRange, attackPower] = dataProcessor.fetchNumericArray();

    let monsterData = [];
    for (let k = 0; k < numMonsters; k++) {
        monsterData.push(dataProcessor.fetchNumericArray());
    }

    monsterData.sort((a, b) => a[0] - b[0]);

    let totalBombsDeployed = 0;
    let currentActiveDamage = 0;
    const activeBombEffects = new MinHeap();

    for (let k = 0; k < numMonsters; k++) {
        const [monsterX, monsterHealth] = monsterData[k];

        while (!activeBombEffects.isEmpty() && activeBombEffects.peek()[0] < monsterX) {
            currentActiveDamage -= activeBombEffects.pop()[1];
        }

        const effectiveHealth = monsterHealth - currentActiveDamage;

        if (effectiveHealth > 0) {
            const bombsNeeded = Math.ceil(effectiveHealth / attackPower);
            totalBombsDeployed += bombsNeeded;
            const damageFromThisBomb = bombsNeeded * attackPower;
            currentActiveDamage += damageFromThisBomb;
            activeBombEffects.push([monsterX + 2 * bombRange, damageFromThisBomb]);
        }
    }
    outputResult(totalBombsDeployed);
}
