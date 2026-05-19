class MinHeap {
  #heapArray;
  #comparatorFn;

  constructor(comparator) {
    this.#heapArray = [];
    this.#comparatorFn = comparator;
  }

  #getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  #getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }

  #getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }

  #swapElements(idx1, idx2) {
    const tempValue = this.#heapArray[idx1];
    this.#heapArray[idx1] = this.#heapArray[idx2];
    this.#heapArray[idx2] = tempValue;
  }

  #bubbleUp(startIndex) {
    let currentPosition = startIndex;
    const elementToPlace = this.#heapArray[currentPosition];

    while (currentPosition > 0) {
      const parentPosition = this.#getParentIndex(currentPosition);
      const parentElement = this.#heapArray[parentPosition];

      if (this.#comparatorFn(parentElement, elementToPlace) <= 0) {
        break;
      }

      this.#heapArray[currentPosition] = parentElement;
      currentPosition = parentPosition;
    }
    this.#heapArray[currentPosition] = elementToPlace;
  }

  #bubbleDown(startIndex) {
    let currentPosition = startIndex;
    const heapSize = this.#heapArray.length;

    while (true) {
      const leftChildPosition = this.#getLeftChildIndex(currentPosition);
      const rightChildPosition = this.#getRightChildIndex(currentPosition);
      let smallestChildPosition = currentPosition;

      if (leftChildPosition < heapSize && this.#comparatorFn(this.#heapArray[leftChildPosition], this.#heapArray[smallestChildPosition]) < 0) {
        smallestChildPosition = leftChildPosition;
      }
      if (rightChildPosition < heapSize && this.#comparatorFn(this.#heapArray[rightChildPosition], this.#heapArray[smallestChildPosition]) < 0) {
        smallestChildPosition = rightChildPosition;
      }

      if (smallestChildPosition === currentPosition) {
        break;
      }

      this.#swapElements(currentPosition, smallestChildPosition);
      currentPosition = smallestChildPosition;
    }
  }

  enqueue(element) {
    this.#heapArray.push(element);
    this.#bubbleUp(this.#heapArray.length - 1);
  }

  dequeue() {
    if (this.isHeapEmpty()) {
      return undefined;
    }

    const minElement = this.#heapArray[0];
    const lastElement = this.#heapArray.pop();

    if (!this.isHeapEmpty()) {
      this.#heapArray[0] = lastElement;
      this.#bubbleDown(0);
    }

    return minElement;
  }

  getMin() {
    return this.isHeapEmpty() ? undefined : this.#heapArray[0];
  }

  count() {
    return this.#heapArray.length;
  }

  isHeapEmpty() {
    return this.count() === 0;
  }
}

const MAX_NODES = 100000;
const INFINITY_VAL = Number.POSITIVE_INFINITY / 4;
let numVertices, numEdges, startNode;
let adjacencyList;
let distances;

/*
function calculateShortestPaths(sourceNode) {
  const pathComparator = (pathA, pathB) => {
    if (pathA.dist !== pathB.dist) {
      return pathA.dist - pathB.dist;
    }
    return pathA.v - pathB.v;
  };

  const priorityQueueInstance = new MinHeap(pathComparator);
  distances[sourceNode] = 0;
  priorityQueueInstance.enqueue({ dist: 0, v: sourceNode });

  while (!priorityQueueInstance.isHeapEmpty()) {
    const currentVertexData = priorityQueueInstance.dequeue();

    if (distances[currentVertexData.v] < currentVertexData.dist) {
      continue;
    }

    for (const edgeData of adjacencyList[currentVertexData.v]) {
      const newDistance = distances[currentVertexData.v] + edgeData.cost;

      if (distances[edgeData.to] > newDistance) {
        distances[edgeData.to] = newDistance;
        priorityQueueInstance.enqueue({ dist: newDistance, v: edgeData.to });
      }
    }
  }
}
*/

/*
(function processInputAndRunDijkstra(inputContent) {
  const standardInputPath = '/dev/stdin';

  // The original code's main logic was commented out.
  // To preserve exact observable behavior, this block remains commented out.
  // If active, it would parse input and call calculateShortestPaths.

  // const inputLines = inputContent.trim().split('\n');
  // let isFirstLine = true;

  // for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
  //   const parsedNumbers = inputLines[lineIndex].split(' ').map(Number);

  //   if (isFirstLine) {
  //     numVertices = parsedNumbers[0];
  //     numEdges = parsedNumbers[1];
  //     startNode = parsedNumbers[2];

  //     adjacencyList = Array.from({ length: numVertices }, () => []);
  //     distances = new Array(numVertices).fill(INFINITY_VAL);
  //   } else {
  //     adjacencyList[parsedNumbers[0]].push({ to: parsedNumbers[1], cost: parsedNumbers[2] });
  //   }

  //   isFirstLine = false;
  // }

  // calculateShortestPaths(startNode);

  // for (const distanceValue of distances) {
  //   console.log(distanceValue === INFINITY_VAL ? "INF" : distanceValue);
  // }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
*/
