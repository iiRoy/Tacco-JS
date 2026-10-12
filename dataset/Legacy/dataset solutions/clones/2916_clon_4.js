const createInputReader = (() => {
  class InputReader {
    #lineIterator;
    #currentLineParts = [];

    constructor(sourceText) {
      const lines = sourceText.trim().split('\n');
      this.#lineIterator = (function* () {
        for (const line of lines) {
          yield line;
        }
      })();
    }

    #fetchNextLineParts() {
      const { value, done } = this.#lineIterator.next();
      if (done) {
        throw new Error("Input stream exhausted.");
      }
      this.#currentLineParts = value.split(' ');
    }

    extractScalar(asString = false) {
      if (this.#currentLineParts.length === 0) {
        this.#fetchNextLineParts();
      }
      const token = this.#currentLineParts.shift();
      return asString ? token : Number(token);
    }

    readVector(asStrings = false) {
      const { value, done } = this.#lineIterator.next();
      if (done) {
        throw new Error("Input stream exhausted.");
      }
      const parts = value.split(' ');
      return asStrings ? parts : parts.map(Number);
    }

    readMatrix(rowCount, asStrings = false) {
      const rows = [];
      for (let i = 0; i < rowCount; i++) {
        const { value, done } = this.#lineIterator.next();
        if (done) {
          throw new Error("Input stream exhausted.");
        }
        const parts = value.split(' ');
        rows.push(asStrings ? parts : parts.map(Number));
      }
      return rows;
    }

    readLines(rowCount, asStrings = false) {
      const lines = [];
      for (let i = 0; i < rowCount; i++) {
        const { value, done } = this.#lineIterator.next();
        if (done) {
          throw new Error("Input stream exhausted.");
        }
        lines.push(asStrings ? value : Number(value));
      }
      return lines;
    }
  }
  return (inputData) => new InputReader(inputData);
})();

const inputSource = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
  const constructRecursiveArray = (dims, currentDimensionIndex) => {
    if (currentDimensionIndex === dims.length - 1) {
      return Array(dims[currentDimensionIndex]).fill(initialValue);
    } else {
      return Array(dims[currentDimensionIndex]).fill(0).map(() => constructRecursiveArray(dims, currentDimensionIndex + 1));
    }
  };
  return constructRecursiveArray(dimensions, 0);
}

console.log(calculateOptimalSum());

function calculateOptimalSum() {
  const totalElementsCount = inputSource.extractScalar();
  const maxRemovalOperations = inputSource.extractScalar();
  const elementCollection = inputSource.readVector();

  let currentMaxSum = 0;

  Array.from({ length: Math.min(maxRemovalOperations, totalElementsCount) + 1 }, (_, selectedCount) => {
    Array.from({ length: selectedCount + 1 }, (_, leftCount) => {
      const rightCount = selectedCount - leftCount;

      const currentSubset = [
        ...elementCollection.slice(0, leftCount),
        ...elementCollection.slice(totalElementsCount - rightCount, totalElementsCount)
      ];

      let subsetSum = currentSubset.reduce((accumulator, value) => accumulator + value, 0);

      const negativeValuesInSubset = currentSubset.filter(val => val < 0);

      negativeValuesInSubset.sort((a, b) => a - b);

      const discardableNegatives = Math.min(
        maxRemovalOperations - selectedCount,
        negativeValuesInSubset.length
      );

      for (let idx = 0; idx < discardableNegatives; idx++) {
        subsetSum -= negativeValuesInSubset[idx];
      }

      currentMaxSum = Math.max(currentMaxSum, subsetSum);
    });
  });

  return currentMaxSum;
}
