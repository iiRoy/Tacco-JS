class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    getLeftChildIndex(i) { return 2 * i + 1; }
    getRightChildIndex(i) { return 2 * i + 2; }

    hasParent(i) { return this.getParentIndex(i) >= 0; }
    hasLeftChild(i) { return this.getLeftChildIndex(i) < this.heap.length; }
    hasRightChild(i) { return this.getRightChildIndex(i) < this.heap.length; }

    getParent(i) { return this.heap[this.getParentIndex(i)]; }
    getLeftChild(i) { return this.heap[this.getLeftChildIndex(i)]; }
    getRightChild(i) { return this.heap[this.getRightChildIndex(i)]; }

    swapElements(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    peekMinimum() {
        if (this.heap.length === 0) return null;
        return this.heap[0];
    }

    extractMinimum() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const minimumElement = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return minimumElement;
    }

    insertElement(item) {
        this.heap.push(item);
        this.heapifyUp();
    }

    heapifyUp() {
        let currentElementIndex = this.heap.length - 1;
        while (this.hasParent(currentElementIndex) && this.getParent(currentElementIndex)[0] > this.heap[currentElementIndex][0]) {
            this.swapElements(this.getParentIndex(currentElementIndex), currentElementIndex);
            currentElementIndex = this.getParentIndex(currentElementIndex);
        }
    }

    heapifyDown() {
        let currentElementIndex = 0;
        while (this.hasLeftChild(currentElementIndex)) {
            let smallerChildIndex = this.getLeftChildIndex(currentElementIndex);
            if (this.hasRightChild(currentElementIndex) && this.getRightChild(currentElementIndex)[0] < this.getLeftChild(currentElementIndex)[0]) {
                smallerChildIndex = this.getRightChildIndex(currentElementIndex);
            }

            if (this.heap[currentElementIndex][0] < this.heap[smallerChildIndex][0]) {
                break;
            } else {
                this.swapElements(currentElementIndex, smallerChildIndex);
            }
            currentElementIndex = smallerChildIndex;
        }
    }

    get currentSize() {
        return this.heap.length;
    }
}

function processPathfinding(inputData) {
    const inputLines = inputData.split('\n');
    const gridDimensions = inputLines[0].split(' ').map(Number);
    const startCoordinates = inputLines[1].split(' ').map(Number);
    const goalCoordinates = inputLines[2].split(' ').map(Number);

    const numRows = gridDimensions[0];
    const numCols = gridDimensions[1];

    const initialMapData = inputLines.splice(3, numRows).map(rowStr => rowStr.split(''));

    const costMatrix = Array.from({ length: numRows }, () => Array(numCols).fill(Infinity));
    const obstacleValue = -1; 

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (initialMapData[r][c] === '#') {
                costMatrix[r][c] = obstacleValue;
            }
        }
    }

    const pathQueue = new MinPriorityQueue();

    const startRow = startCoordinates[0] - 1;
    const startCol = startCoordinates[1] - 1;
    const goalRow = goalCoordinates[0] - 1;
    const goalCol = goalCoordinates[1] - 1;

    if (costMatrix[startRow][startCol] === obstacleValue || costMatrix[goalRow][goalCol] === obstacleValue) {
        console.log(-1);
        return;
    }

    costMatrix[startRow][startCol] = 0;
    pathQueue.insertElement([0, startRow, startCol]);

    let finalResult = -1;

    while (pathQueue.currentSize > 0) {
        const [currentCost, r, c] = pathQueue.extractMinimum();

        if (currentCost > costMatrix[r][c] && costMatrix[r][c] !== obstacleValue) {
            continue;
        }

        if (r === goalRow && c === goalCol) {
            finalResult = currentCost;
            break;
        }

        const directMoveOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of directMoveOffsets) {
            const nextR = r + dr;
            const nextC = c + dc;

            if (nextR >= 0 && nextR < numRows && nextC >= 0 && nextC < numCols && costMatrix[nextR][nextC] !== obstacleValue) {
                if (currentCost < costMatrix[nextR][nextC]) {
                    costMatrix[nextR][nextC] = currentCost;
                    pathQueue.insertElement([currentCost, nextR, nextC]);
                }
            }
        }

        const nextWarpCost = currentCost + 1;
        for (let hOffset = -2; hOffset <= 2; hOffset++) {
            for (let wOffset = -2; wOffset <= 2; wOffset++) {
                if (hOffset === 0 && wOffset === 0) {
                    continue;
                }

                const nextR = r + hOffset;
                const nextC = c + wOffset;

                if (nextR >= 0 && nextR < numRows && nextC >= 0 && nextC < numCols && costMatrix[nextR][nextC] !== obstacleValue) {
                    if (nextWarpCost < costMatrix[nextR][nextC]) {
                        costMatrix[nextR][nextC] = nextWarpCost;
                        pathQueue.insertElement([nextWarpCost, nextR, nextC]);
                    }
                }
            }
        }
    }

    console.log(finalResult);
}

processPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));
