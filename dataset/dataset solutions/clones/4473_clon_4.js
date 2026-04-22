function processData(rawData) {
  const allLines = rawData.split('\n');

  const firstLineNums = allLines[0].match(/\d+/g).map(Number);
  const quantityToSum = firstLineNums[1];

  const numberSequence = allLines[1].match(/\d+/g).map(Number);

  class SmallestOnTopHeap {
    constructor() {
      this.heapContent = [];
    }

    place(item) {
      this.heapContent.push(item);
      this._bubbleUp(this.heapContent.length - 1);
    }

    extractSmallest() {
      if (this.heapContent.length === 0) return undefined;
      if (this.heapContent.length === 1) return this.heapContent.pop();

      const smallest = this.heapContent[0];
      this.heapContent[0] = this.heapContent.pop();
      this._bubbleDown(0);
      return smallest;
    }

    viewSmallest() {
      return this.heapContent.length > 0 ? this.heapContent[0] : undefined;
    }

    currentSize() {
      return this.heapContent.length;
    }

    _bubbleUp(index) {
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (this.heapContent[index] < this.heapContent[parentIndex]) {
          [this.heapContent[index], this.heapContent[parentIndex]] = [this.heapContent[parentIndex], this.heapContent[index]];
          index = parentIndex;
        } else {
          break;
        }
      }
    }

    _bubbleDown(index) {
      const lastIndex = this.heapContent.length - 1;
      while (true) {
        const leftChildIndex = 2 * index + 1;
        const rightChildIndex = 2 * index + 2;
        let smallestChildIndex = index;

        if (leftChildIndex <= lastIndex && this.heapContent[leftChildIndex] < this.heapContent[smallestChildIndex]) {
          smallestChildIndex = leftChildIndex;
        }

        if (rightChildIndex <= lastIndex && this.heapContent[rightChildIndex] < this.heapContent[smallestChildIndex]) {
          smallestChildIndex = rightChildIndex;
        }

        if (smallestChildIndex !== index) {
          [this.heapContent[index], this.heapContent[smallestChildIndex]] = [this.heapContent[smallestChildIndex], this.heapContent[index]];
          index = smallestChildIndex;
        } else {
          break;
        }
      }
    }
  }

  const topElementsHeap = new SmallestOnTopHeap();
  
  for (const num of numberSequence) {
    if (topElementsHeap.currentSize() < quantityToSum) {
      topElementsHeap.place(num);
    } else if (num > topElementsHeap.viewSmallest()) {
      topElementsHeap.extractSmallest();
      topElementsHeap.place(num);
    }
  }

  const finalTally = topElementsHeap.heapContent.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  console.log(finalTally);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));