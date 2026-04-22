class PriceHeap {
    constructor() {
        this.store = [];
    }

    // Helper to get index of parent, left, right children
    getUpstream(idx) { return Math.floor((idx - 1) / 2); }
    getDownstreamLeft(idx) { return 2 * idx + 1; }
    getDownstreamRight(idx) { return 2 * idx + 2; }

    // Check existence of parent, children
    hasUpstream(idx) { return this.getUpstream(idx) >= 0; }
    hasDownstreamLeft(idx) { return this.getDownstreamLeft(idx) < this.store.length; }
    hasDownstreamRight(idx) { return this.getDownstreamRight(idx) < this.store.length; }

    // Get value of parent, children
    fetchUpstream(idx) { return this.store[this.getUpstream(idx)]; }
    fetchDownstreamLeft(idx) { return this.store[this.getDownstreamLeft(idx)]; }
    fetchDownstreamRight(idx) { return this.store[this.getDownstreamRight(idx)]; }

    // Swap elements
    exchange(idxA, idxB) {
        [this.store[idxA], this.store[idxB]] = [this.store[idxB], this.store[idxA]];
    }

    // Add item to heap
    insert(item) {
        this.store.push(item);
        this.heapifyAscending();
    }

    // Remove and return max item
    retrieveHighest() {
        if (this.store.length === 0) return null;
        if (this.store.length === 1) return this.store.pop();

        const highest = this.store[0];
        this.store[0] = this.store.pop();
        this.heapifyDescending();
        return highest;
    }

    // Get max item without removing
    peekHighest() {
        if (this.store.length === 0) return null;
        return this.store[0];
    }

    // Current number of items in heap
    currentCount() {
        return this.store.length;
    }

    // Adjust heap upwards after insertion
    heapifyAscending() {
        let currentPosition = this.store.length - 1;
        while (this.hasUpstream(currentPosition) && this.fetchUpstream(currentPosition) < this.store[currentPosition]) {
            this.exchange(currentPosition, this.getUpstream(currentPosition));
            currentPosition = this.getUpstream(currentPosition);
        }
    }

    // Adjust heap downwards after extraction
    heapifyDescending() {
        let currentPosition = 0;
        while (this.hasDownstreamLeft(currentPosition)) {
            let dominantChildPosition = this.getDownstreamLeft(currentPosition);
            if (this.hasDownstreamRight(currentPosition) && this.fetchDownstreamRight(currentPosition) > this.fetchDownstreamLeft(currentPosition)) {
                dominantChildPosition = this.getDownstreamRight(currentPosition);
            }

            if (this.store[currentPosition] > this.store[dominantChildPosition]) {
                break;
            } else {
                this.exchange(currentPosition, dominantChildPosition);
            }
            currentPosition = dominantChildPosition;
        }
    }
}

function calculateDiscountedTotal(sourceData) {
    const lines = sourceData.match(/[^\r\n]+/g);

    const firstLineNumeric = lines[0].match(/\d+/g).map(val => +val);
    const itemQuantity = firstLineNumeric[0];
    let budgetAllowance = firstLineNumeric[1];

    const itemValues = lines[1].match(/\d+/g).map(val => +val);

    if (itemQuantity === 1) {
        let soleItemValue = itemValues[0];
        for (let voucher = 0; voucher < budgetAllowance; ++voucher) {
            soleItemValue >>= 1;
        }
        console.log(soleItemValue);
        return;
    }

    const valueHeap = new PriceHeap();
    for (const val of itemValues) {
        valueHeap.insert(val);
    }

    for (let voucher = 0; voucher < budgetAllowance; ++voucher) {
        if (valueHeap.currentCount() === 0) break;
        let topValue = valueHeap.retrieveHighest();
        topValue >>= 1;
        valueHeap.insert(topValue);
    }

    let finalAccumulation = 0;
    while (valueHeap.currentCount() > 0) {
        finalAccumulation += valueHeap.retrieveHighest();
    }
    console.log(finalAccumulation);
}

const fileSystem = require("fs");
const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
calculateDiscountedTotal(inputContent);