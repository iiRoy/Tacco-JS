class MinHeap {
    constructor() {
        this.heap = [];
    }

    _getParentIndex(i) { return Math.floor((i - 1) / 2); }
    _getLeftChildIndex(i) { return 2 * i + 1; }
    _getRightChildIndex(i) { return 2 * i + 2; }

    _hasParent(i) { return this._getParentIndex(i) >= 0; }
    _hasLeftChild(i) { return this._getLeftChildIndex(i) < this.heap.length; }
    _hasRightChild(i) { return this._getRightChildIndex(i) < this.heap.length; }

    _getParent(i) { return this.heap[this._getParentIndex(i)]; }
    _getLeftChild(i) { return this.heap[this._getLeftChildIndex(i)]; }
    _getRightChild(i) { return this.heap[this._getRightChildIndex(i)]; }

    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    peek() {
        if (this.heap.length === 0) return null;
        return this.heap[0];
    }

    add(item) {
        this.heap.push(item);
        this._heapifyUp();
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const item = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown();
        return item;
    }

    _heapifyUp() {
        let index = this.heap.length - 1;
        while (this._hasParent(index) && this._getParent(index) > this.heap[index]) {
            this._swap(this._getParentIndex(index), index);
            index = this._getParentIndex(index);
        }
    }

    _heapifyDown() {
        let index = 0;
        while (this._hasLeftChild(index)) {
            let smallerChildIndex = this._getLeftChildIndex(index);
            if (this._hasRightChild(index) && this._getRightChild(index) < this._getLeftChild(index)) {
                smallerChildIndex = this._getRightChildIndex(index);
            }

            if (this.heap[index] < this.heap[smallerChildIndex]) {
                break;
            } else {
                this._swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }

    size() {
        return this.heap.length;
    }
}

class MinHeapWithLazyDeletion {
    constructor() {
        this.internalHeap = new MinHeap();
        this.elementCounts = new Map();
    }

    add(val) {
        if (!this.elementCounts.has(val) || this.elementCounts.get(val) === 0) {
            this.internalHeap.add(val);
        }
        this.elementCounts.set(val, (this.elementCounts.get(val) || 0) + 1);
    }

    remove(val) {
        if (this.elementCounts.has(val) && this.elementCounts.get(val) > 0) {
            this.elementCounts.set(val, this.elementCounts.get(val) - 1);
        }
    }

    getMin() {
        this._purgeDeletedElements();
        return this.internalHeap.peek();
    }

    _purgeDeletedElements() {
        while (this.internalHeap.size() > 0 && this.elementCounts.get(this.internalHeap.peek()) === 0) {
            this.internalHeap.extractMin();
        }
    }

    isEmpty() {
        this._purgeDeletedElements();
        return this.internalHeap.size() === 0;
    }
}

(function (fileSystem) {
    "use strict";

    const parseLineToNumbers = (lineContent) => lineContent.split(/\s+/).map(Number);

    (function (rawInput) {
        const allInputLines = rawInput.split("\n");

        const [projectCount, queryCount] = parseLineToNumbers(allInputLines[0]);

        const projectData = allInputLines.slice(1, projectCount + 1).map((line) => {
            const [startPoint, endPoint, xValue] = parseLineToNumbers(line);
            return {
                startPoint: startPoint,
                endPoint: endPoint,
                xValue: xValue,
                activationTime: startPoint - xValue - 0.5,
                deactivationTime: endPoint - xValue - 0.6
            };
        });

        const queryTimePoints = parseLineToNumbers(allInputLines.slice(projectCount + 1)).slice(0, queryCount);

        let allScheduledActions = [];

        for (const project of projectData) {
            allScheduledActions.push({
                actionType: 0, // 'add' type
                eventTime: project.activationTime,
                associatedValue: project.xValue
            });
            allScheduledActions.push({
                actionType: 1, // 'delete' type
                eventTime: project.deactivationTime,
                associatedValue: project.xValue
            });
        }

        for (let q = 0; q < queryTimePoints.length; q++) {
            allScheduledActions.push({
                actionType: 2, // 'query' type
                eventTime: queryTimePoints[q],
                queryIndex: q
            });
        }

        allScheduledActions.sort((actionA, actionB) => {
            if (actionA.eventTime !== actionB.eventTime) {
                return actionA.eventTime - actionB.eventTime;
            }
            return actionA.actionType - actionB.actionType;
        });

        const activeElementsTracker = new MinHeapWithLazyDeletion();
        const storedQueryResults = new Array(queryCount);

        for (const currentAction of allScheduledActions) {
            if (currentAction.actionType === 0) { // 'add'
                activeElementsTracker.add(currentAction.associatedValue);
            } else if (currentAction.actionType === 1) { // 'delete'
                activeElementsTracker.remove(currentAction.associatedValue);
            } else { // 'query'
                storedQueryResults[currentAction.queryIndex] = activeElementsTracker.getMin() ?? -1;
            }
        }

        for (const result of storedQueryResults) {
            console.log(result);
        }

    })(fileSystem.readFileSync("/dev/stdin", "utf8"));

}(require("fs")));
