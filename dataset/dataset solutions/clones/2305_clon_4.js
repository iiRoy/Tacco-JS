class SelectionHeap {
  constructor() {
    this.elements = [];
  }

  _getIndexForParent(nodeIndex) { return Math.floor((nodeIndex - 1) / 2); }
  _getIndexForLeftChild(nodeIndex) { return 2 * nodeIndex + 1; }
  _getIndexForRightChild(nodeIndex) { return 2 * nodeIndex + 2; }

  _existsParent(nodeIndex) { return this._getIndexForParent(nodeIndex) >= 0; }
  _existsLeftChild(nodeIndex) { return this._getIndexForLeftChild(nodeIndex) < this.elements.length; }
  _existsRightChild(nodeIndex) { return this._getIndexForRightChild(nodeIndex) < this.elements.length; }

  _retrieveParent(nodeIndex) { return this.elements[this._getIndexForParent(nodeIndex)]; }
  _retrieveLeftChild(nodeIndex) { return this.elements[this._getIndexForLeftChild(nodeIndex)]; }
  _retrieveRightChild(nodeIndex) { return this.elements[this._getIndexForRightChild(nodeIndex)]; }

  _exchangeElements(firstIndex, secondIndex) {
    [this.elements[firstIndex], this.elements[secondIndex]] = [this.elements[secondIndex], this.elements[firstIndex]];
  }

  incorporate(item) {
    this.elements.push(item);
    this._heapifyUpward();
  }

  extractHighest() {
    if (this.elements.length === 0) return undefined;
    if (this.elements.length === 1) return this.elements.pop();

    const item = this.elements[0];
    this.elements[0] = this.elements.pop();
    this._heapifyDownward();
    return item;
  }

  peekHighest() {
    if (this.elements.length === 0) return undefined;
    return this.elements[0];
  }

  countElements() {
    return this.elements.length;
  }

  _heapifyUpward() {
    let currentElementIndex = this.elements.length - 1;
    while (this._existsParent(currentElementIndex) && this._retrieveParent(currentElementIndex)[0] < this.elements[currentElementIndex][0]) {
      this._exchangeElements(this._getIndexForParent(currentElementIndex), currentElementIndex);
      currentElementIndex = this._getIndexForParent(currentElementIndex);
    }
  }

  _heapifyDownward() {
    let currentElementIndex = 0;
    while (this._existsLeftChild(currentElementIndex)) {
      let predominantChildIndex = this._getIndexForLeftChild(currentElementIndex);
      if (this._existsRightChild(currentElementIndex) && this._retrieveRightChild(currentElementIndex)[0] > this._retrieveLeftChild(currentElementIndex)[0]) {
        predominantChildIndex = this._getIndexForRightChild(currentElementIndex);
      }

      if (this.elements[currentElementIndex][0] > this.elements[predominantChildIndex][0]) {
        break;
      } else {
        this._exchangeElements(currentElementIndex, predominantChildIndex);
        currentElementIndex = predominantChildIndex;
      }
    }
  }
}

function processSequences(rawData) {
  const quantityToSelect = rawData[0][1];
  const sortedNumerals = rawData[1].sort((valA, valB) => valB - valA);

  let cumulativeTotal = 0;
  let carryOver = null;

  const candidatePrioritizer = new SelectionHeap();
  const totalNumerals = sortedNumerals.length;

  for (let idx = 0; idx < totalNumerals; ++idx) {
    candidatePrioritizer.incorporate([sortedNumerals[idx] * 2, idx, 0]);
  }

  for (let operation = 0; operation < quantityToSelect; ++operation) {
    if (carryOver !== null) {
      cumulativeTotal += carryOver;
      carryOver = null;
      continue;
    }

    const highestEntry = candidatePrioritizer.extractHighest();
    if (!highestEntry) {
      break;
    }

    const [currentValue, originalIndex, currentOffset] = highestEntry;
    cumulativeTotal += currentValue;

    if (currentOffset > 0) {
      carryOver = currentValue;
    }

    const nextPartnerOffset = currentOffset + 1;
    const nextPartnerActualIndex = originalIndex + nextPartnerOffset;

    if (nextPartnerActualIndex < totalNumerals) {
      const nextCombinedValue = sortedNumerals[originalIndex] + sortedNumerals[nextPartnerActualIndex];
      candidatePrioritizer.incorporate([nextCombinedValue, originalIndex, nextPartnerOffset]);
    }
  }

  console.log(cumulativeTotal);
}

processSequences(require("fs").readFileSync("/dev/stdin", "utf8").trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number))
);