class MaxPriorityQueue {
    constructor() {
        this.heapElements = [];
    }

    retrieveParentIndex(childIndex) { return Math.floor((childIndex - 1) / 2); }
    retrieveLeftChildIndex(parentIndex) { return 2 * parentIndex + 1; }
    retrieveRightChildIndex(parentIndex) { return 2 * parentIndex + 2; }

    hasParentNode(childIndex) { return this.retrieveParentIndex(childIndex) >= 0; }
    hasLeftChildNode(parentIndex) { return this.retrieveLeftChildIndex(parentIndex) < this.heapElements.length; }
    hasRightChildNode(parentIndex) { return this.retrieveRightChildIndex(parentIndex) < this.heapElements.length; }

    getParentNode(childIndex) { return this.heapElements[this.retrieveParentIndex(childIndex)]; }
    getLeftChildNode(parentIndex) { return this.heapElements[this.retrieveLeftChildIndex(parentIndex)]; }
    getRightChildNode(parentIndex) { return this.heapElements[this.retrieveRightChildIndex(parentIndex)]; }

    exchangeElements(indexA, indexB) {
        [this.heapElements[indexA], this.heapElements[indexB]] = [this.heapElements[indexB], this.heapElements[indexA]];
    }

    viewTop() {
        if (this.heapElements.length === 0) return null;
        return this.heapElements[0];
    }

    extractHighest() {
        if (this.heapElements.length === 0) return null;
        if (this.heapElements.length === 1) return this.heapElements.pop();

        const highestItem = this.heapElements[0];
        this.heapElements[0] = this.heapElements.pop();
        this.siftDown();
        return highestItem;
    }

    addEntry(item) {
        this.heapElements.push(item);
        this.siftUp();
    }

    siftUp() {
        let currentElementIndex = this.heapElements.length - 1;
        while (this.hasParentNode(currentElementIndex) && this.getParentNode(currentElementIndex).productValue < this.heapElements[currentElementIndex].productValue) {
            this.exchangeElements(this.retrieveParentIndex(currentElementIndex), currentElementIndex);
            currentElementIndex = this.retrieveParentIndex(currentElementIndex);
        }
    }

    siftDown() {
        let currentElementIndex = 0;
        while (this.hasLeftChildNode(currentElementIndex)) {
            let largerChildIndex = this.retrieveLeftChildIndex(currentElementIndex);
            if (this.hasRightChildNode(currentElementIndex) && this.getRightChildNode(currentElementIndex).productValue > this.getLeftChildNode(currentElementIndex).productValue) {
                largerChildIndex = this.retrieveRightChildIndex(currentElementIndex);
            }

            if (this.heapElements[currentElementIndex].productValue > this.heapElements[largerChildIndex].productValue) {
                break;
            } else {
                this.exchangeElements(currentElementIndex, largerChildIndex);
            }
            currentElementIndex = largerChildIndex;
        }
    }
}

function processInputData(sourceLines) {
    const [firstLineContent, secondLineContent, thirdLineContent] = sourceLines;

    const [countItemsStr, limitOperationsStr] = firstLineContent.split(' ');
    const countItems = Number(countItemsStr);
    const limitOperations = Number(limitOperationsStr);

    const firstValueCollection = secondLineContent.split(' ').map(Number);
    const secondValueCollection = thirdLineContent.split(' ').map(Number);

    firstValueCollection.sort((valX, valY) => valY - valX);
    secondValueCollection.sort((valX, valY) => valX - valY);

    const productHeap = new MaxPriorityQueue();

    for (let currentPosition = 0; currentPosition < countItems; currentPosition++) {
        const currentAVal = firstValueCollection[currentPosition];
        const currentFVal = secondValueCollection[currentPosition];
        productHeap.addEntry({
            productValue: currentAVal * currentFVal,
            aComponent: currentAVal,
            fComponent: currentFVal
        });
    }

    for (let operationCounter = 0; operationCounter < limitOperations; operationCounter++) {
        const highestProductEntry = productHeap.extractHighest();
        
        highestProductEntry.aComponent--;
        highestProductEntry.productValue = highestProductEntry.aComponent * highestProductEntry.fComponent;
        
        productHeap.addEntry(highestProductEntry);
    }

    console.log(productHeap.viewTop().productValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
