class DataStreamProcessor {
  #sourceLines;
  #lineCursor;
  #lineTokenBuffer;

  constructor(rawSource) {
    this.#sourceLines = rawSource.trim().split('\n');
    this.#lineCursor = 0;
    this.#lineTokenBuffer = null;
  }

  extractNextValue(isString = false) {
    if (this.#lineTokenBuffer === null || this.#lineTokenBuffer.length === 0) {
      if (this.#lineCursor >= this.#sourceLines.length) {
        throw new Error("End of input stream reached.");
      }
      this.#lineTokenBuffer = this.#sourceLines[this.#lineCursor].split(' ').reverse();
    }

    const val = this.#lineTokenBuffer.pop();

    if (this.#lineTokenBuffer.length === 0) {
      this.#lineCursor++;
      this.#lineTokenBuffer = null;
    }
    return isString ? val : Number(val);
  }

  retrieveLineValues(asStrings = false) {
    if (this.#lineCursor >= this.#sourceLines.length) {
      throw new Error("End of input stream reached.");
    }
    const line = this.#sourceLines[this.#lineCursor++];
    const tokens = line.split(' ');
    return asStrings ? tokens : tokens.map(Number);
  }

  fetchBlock(numRows, asStrings = false) {
    if (this.#lineCursor + numRows > this.#sourceLines.length) {
      throw new Error("Insufficient lines for block extraction.");
    }
    const blockLines = this.#sourceLines.slice(this.#lineCursor, this.#lineCursor + numRows);
    this.#lineCursor += numRows;
    const result = blockLines.map(line => line.split(' '));
    return asStrings ? result : result.map(row => row.map(Number));
  }

  getSequence(numElements, asStrings = false) {
    if (this.#lineCursor + numElements > this.#sourceLines.length) {
      throw new Error("Insufficient lines for sequence extraction.");
    }
    const sequenceLines = this.#sourceLines.slice(this.#lineCursor, this.#lineCursor + numElements);
    this.#lineCursor += numElements;
    return asStrings ? sequenceLines : sequenceLines.map(Number);
  }
}

const dataSource = new DataStreamProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

function generateMultiDimensionalArray(initialVal, ...dimensions) {
  if (dimensions.length === 0) {
    return initialVal;
  }
  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);
  return Array.from({ length: currentDimensionSize }, () => generateMultiDimensionalArray(initialVal, ...remainingDimensions));
}

function calculateOptimalValue() {
  const itemCount = dataSource.extractNextValue();
  const unitCapacity = dataSource.extractNextValue();
  const rawItemData = dataSource.fetchBlock(itemCount);

  let accumulatedDirectCost = 0;
  const enhancedItemData = rawItemData.map(itemRow => {
    const [valA, valB, valC] = itemRow;
    const currentDirectCost = valA * valB;
    const currentExtraCost = (unitCapacity - valA) * valC;
    accumulatedDirectCost += currentDirectCost;
    return [...itemRow, currentExtraCost, currentDirectCost, currentExtraCost + currentDirectCost];
  });

  enhancedItemData.sort((item1, item2) => item2[5] - item1[5]);

  const isTargetAchievable = (potentialCapacity, initialTotalSum, processedItemsList, singleUnitSize) => {
    let currentTotalSum = initialTotalSum;
    let currentRemainingCapacity = potentialCapacity;
    let currentItemIndex = 0;

    while (currentItemIndex < processedItemsList.length && currentRemainingCapacity > 0 && currentTotalSum > 0) {
      const currentItem = processedItemsList[currentItemIndex];
      const [itemValA, itemValB, itemValC, itemExtraC, itemDirectC, itemTotalC] = currentItem;

      if (singleUnitSize <= currentRemainingCapacity) {
        currentTotalSum -= itemTotalC;
        currentRemainingCapacity -= singleUnitSize;
        currentItemIndex++;
      } else {
        let finalInnerLoopSum = currentTotalSum;
        let innerLoopCursor = currentItemIndex;

        while (innerLoopCursor < processedItemsList.length && finalInnerLoopSum > 0) {
          const innerItem = processedItemsList[innerLoopCursor];
          const [innerValA, innerValB, innerValC, innerExtraC, innerDirectC, innerTotalC] = innerItem;

          let costForPartialFill = 0;
          if (currentRemainingCapacity < innerValA) {
            costForPartialFill = innerValB * currentRemainingCapacity;
          } else {
            costForPartialFill = innerDirectC + (currentRemainingCapacity - innerValA) * innerValC;
          }
          finalInnerLoopSum = currentTotalSum - costForPartialFill;
          innerLoopCursor++;
        }
        currentTotalSum = finalInnerLoopSum;
        currentRemainingCapacity = 0;
        currentItemIndex = innerLoopCursor;
      }
    }
    return currentTotalSum <= 0;
  };

  const performBinarySearch = (lowerBoundVal, upperBoundVal) => {
    if (upperBoundVal - lowerBoundVal <= 1) {
      return upperBoundVal;
    }
    const middlePoint = Math.floor((lowerBoundVal + upperBoundVal) / 2);
    if (isTargetAchievable(middlePoint, accumulatedDirectCost, enhancedItemData, unitCapacity)) {
      return performBinarySearch(lowerBoundVal, middlePoint);
    } else {
      return performBinarySearch(middlePoint, upperBoundVal);
    }
  };

  const minimumCapacity = performBinarySearch(-1, itemCount * unitCapacity);
  return minimumCapacity;
}

console.log(calculateOptimalValue());