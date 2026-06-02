'use strict';

class SolutionProcessor {
  processData() {
    const inputPair = inputReader.readNextIntArray();
    const numItems = inputPair[0];
    const paramK = inputPair[1];

    const doubleK = 2 * paramK;

    const pointData = inputReader.readStrMatrix(numItems).map(elementItem => {
      const xCoordStr = elementItem[0];
      const yCoordStr = elementItem[1];
      const colorChar = elementItem[2];
      
      const xBase = parseInt(xCoordStr);
      const yBase = parseInt(yCoordStr);

      const xOffsetForColor = (colorChar === 'B' ? paramK : 0);

      return {
        x: (xBase + xOffsetForColor) % doubleK,
        y: yBase % doubleK,
      };
    });

    const dataGrid = CompressedGrid.createFrom(pointData);

    const determineColor = (xVal, yVal) => {
      const xColorComponent = (xVal < paramK ? 0 : 1);
      const yColorComponent = (yVal < paramK ? 0 : 1);
      return xColorComponent ^ yColorComponent;
    };

    let currentCount = pointData.filter(elementItem => determineColor(elementItem.x, elementItem.y) === 0).length;

    let maximumCount = currentCount;

    for (let yOffset = 0; yOffset < paramK; ++yOffset) {
      for (let xOffset = 0; xOffset < doubleK; ++xOffset) {
        let adjustedXOffset;
        if ((xOffset + paramK) >= doubleK) {
          adjustedXOffset = xOffset - paramK;
        } else {
          adjustedXOffset = xOffset + paramK;
        }
        
        maximumCount = Math.max(maximumCount, currentCount);

        const whiteLeftCount = dataGrid.countPoints(xOffset, yOffset, xOffset, yOffset + paramK);
        const blackLeftCount = dataGrid.getItemCount('x', xOffset) - whiteLeftCount;

        const whiteRightCount = dataGrid.countPoints(adjustedXOffset, yOffset, adjustedXOffset, yOffset + paramK);
        const blackRightCount = dataGrid.getItemCount('x', adjustedXOffset) - whiteRightCount;

        const deltaCount = (-whiteLeftCount + blackLeftCount) + (+whiteRightCount - blackRightCount);
        currentCount += deltaCount;
      }

      while (true) {
        if (!(yOffset < paramK && dataGrid.getItemCount('y', yOffset) === 0 && dataGrid.getItemCount('y', yOffset + paramK) === 0)) {
          break;
        }
        ++yOffset;
      }
      
      if (yOffset >= paramK) {
        break;
      }

      const whiteRowLeft = dataGrid.countPoints(0, yOffset, paramK, yOffset);
      const blackRowLeft = dataGrid.getItemCount('y', yOffset) - whiteRowLeft;

      const whiteRowRight = dataGrid.countPoints(0, yOffset + paramK, paramK, yOffset + paramK);
      const blackRowRight = dataGrid.getItemCount('y', yOffset + paramK) - whiteRowRight;

      const rowDeltaCount = (-whiteRowLeft + blackRowLeft) + (+whiteRowRight - blackRowRight);
      currentCount += rowDeltaCount;
    }
    return maximumCount;
  }
}

class CompressedGrid {
  static get standardParams() {
    return ['x', 'y'];
  }
  static get standardSortComparators() {
    return { 'x': (itemA, itemB) => itemA.y - itemB.y, 'y': (itemA, itemB) => itemA.x - itemB.x };
  }
  static createFrom(itemList, additionalParams, additionalSortComparators) {
    return new CompressedGrid().initializeGrid(itemList, additionalParams, additionalSortComparators);
  }
  getItemCount(dimensionKey, indexValue) {
    const dimensionMap = this.dimensionMaps[dimensionKey];
    return (dimensionMap == null || dimensionMap[indexValue] == null) ? 0 : dimensionMap[indexValue].length;
  }
  initializeGrid(itemList, additionalParams, additionalSortComparators) {
    const extraParams = additionalParams || [];
    const extraSortComparators = additionalSortComparators || {};

    this.gridDimensions = CompressedGrid.standardParams.concat(extraParams);
    this.dimensionComparators = Object.assign({}, CompressedGrid.standardSortComparators, extraSortComparators);
    this.dimensionMaps = {};

    for (const dimKey of this.gridDimensions) {
      this.dimensionMaps[dimKey] = {};
    }

    itemList.forEach(elementItem => {
      for (const dimKey of this.gridDimensions) {
        const currentDimensionMap = this.dimensionMaps[dimKey];
        const elementDimensionValue = elementItem[dimKey];
        if (currentDimensionMap[elementDimensionValue] === undefined) {
          currentDimensionMap[elementDimensionValue] = [];
        }
        currentDimensionMap[elementDimensionValue].push(elementItem);
      }
    });

    for (const dimKey of this.gridDimensions) {
      const dimensionEntries = this.dimensionMaps[dimKey];
      const comparator = this.dimensionComparators[dimKey];
      for (const mapEntryKey in dimensionEntries) {
        dimensionEntries[mapEntryKey].sort(comparator);
      }
    }
    return this;
  }

  getPoint(xCoord, yCoord) {
    const xDimensionList = this.dimensionMaps.x[xCoord];
    if (xDimensionList == null) return null;

    const indexVal = _UTILITIES.findInsertionPoint(xDimensionList, yCoord, 'y');
    if (xDimensionList[indexVal] == null || xDimensionList[indexVal].y !== yCoord) {
      return null;
    }
    return xDimensionList[indexVal];
  }

  _getRangeCount(dimensionList, val1, val2, property) {
    if (dimensionList == null) return 0;
    const leftIdx = _UTILITIES.findInsertionPoint(dimensionList, val1, property);
    const rightIdx = _UTILITIES.findInsertionPoint(dimensionList, val2, property);
    return rightIdx - leftIdx;
  }

  countPoints(x1, y1, x2, y2) {
    if (x1 === x2) {
      return this._getRangeCount(this.dimensionMaps.x[x1], y1, y2, 'y');
    }
    if (y1 === y2) {
      return this._getRangeCount(this.dimensionMaps.y[y1], x1, x2, 'x');
    }
    return -1;
  }

  getPointsInRegion(x1, y1, x2, y2) {
    const resultArr = [];
    const extractPoints = (dimensionList, startIdx, endIdx) => {
      if (dimensionList == null) return [];
      const extracted = [];
      for (let i = startIdx; i < endIdx; ++i) {
        extracted.push(dimensionList[i]);
      }
      return extracted;
    };

    if (x1 === x2) {
      const xDimensionList = this.dimensionMaps.x[x1];
      const leftIdx = _UTILITIES.findInsertionPoint(xDimensionList, y1, 'y');
      const rightIdx = _UTILITIES.findInsertionPoint(xDimensionList, y2, 'y');
      return extractPoints(xDimensionList, leftIdx, rightIdx);
    }
    if (y1 === y2) {
      const yDimensionList = this.dimensionMaps.y[y1];
      const leftIdx = _UTILITIES.findInsertionPoint(yDimensionList, x1, 'x');
      const rightIdx = _UTILITIES.findInsertionPoint(yDimensionList, x2, 'x');
      return extractPoints(yDimensionList, leftIdx, rightIdx);
    }
    return -1;
  }
}

class ModularArithmetic {
  constructor(moduloValue) {
    if (moduloValue == null) {
      this.moduloVal = 1e9 + 7;
    } else {
      this.moduloVal = moduloValue;
    }
  }
  multiplyMod(operandA, operandB) {
    let resultVal = 0;
    operandA %= this.moduloVal;
    operandB %= this.moduloVal;
    
    for (; operandB > 0; operandB >>= 1) {
      if (operandB & 1) {
        resultVal += operandA;
        if (resultVal >= this.moduloVal) {
          resultVal -= this.moduloVal;
        }
      }
      operandA <<= 1;
      if (operandA >= this.moduloVal) {
        operandA -= this.moduloVal;
      }
    }
    return resultVal;
  }
  powerMod(baseVal, exponentVal) {
    let resultVal = 1;
    for (; exponentVal > 0; exponentVal >>= 1) {
      if (exponentVal & 1) {
        resultVal = this.multiplyMod(resultVal, baseVal);
      }
      baseVal = this.multiplyMod(baseVal, baseVal);
    }
    return resultVal;
  }
  divideMod(numerator, denominator) {
    return this.multiplyMod(numerator, this.powerMod(denominator, this.moduloVal - 2));
  }
  combinationsMod(nVal, kVal) {
    return MOD_ARITHMETIC_INSTANCE.multiplyMod(factTable[nVal], MOD_ARITHMETIC_INSTANCE.multiplyMod(invFactTable[kVal], invFactTable[nVal - kVal]));
  }
}
const MOD_ARITHMETIC_INSTANCE = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  calculateSum(inputArray) { return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue); }
  calculateModSum(inputArray, moduloValue) {
    const currentMod = moduloValue == null ? MOD_ARITHMETIC_INSTANCE.moduloVal : moduloValue;
    return inputArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % currentMod);
  }
  findMin(inputArray, comparatorFn) {
    const actualComparator = comparatorFn == null ? (a, b) => a - b : comparatorFn;
    return inputArray.reduce((minVal, currentVal) => actualComparator(minVal, currentVal) < 0 ? minVal : currentVal);
  }
  findMax(inputArray, comparatorFn) {
    const actualComparator = comparatorFn == null ? (a, b) => a - b : comparatorFn;
    return inputArray.reduce((maxVal, currentVal) => actualComparator(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }
  sortArray(inputArray, comparatorFn) {
    const actualComparator = comparatorFn == null ? (a, b) => a - b : comparatorFn;
    return inputArray.sort(actualComparator);
  }
  uniqueElements(inputArray) {
    inputArray.sort();
    const arrayLength = inputArray.length;
    for (let currentIdx = 0; currentIdx < arrayLength - 1; ++currentIdx) {
      const currentElement = inputArray[currentIdx];
      const nextElement = inputArray[currentIdx + 1];
      if (currentElement === nextElement) {
        inputArray[currentIdx] = null;
      }
    }
    return inputArray.filter(element => element != null);
  }
  generateRange(startVal, endVal, stepVal) {
    let actualStart = startVal;
    let actualEnd = endVal;
    let actualStep = stepVal;

    if (actualEnd == null) {
      actualEnd = actualStart || 0;
      actualStart = 0;
    }
    if (!actualStep) {
      actualStep = actualEnd < actualStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((actualEnd - actualStart) / actualStep), 0);
    const generatedRange = Array(rangeLength);

    let currentVal = actualStart;
    for (let i = 0; i < rangeLength; ++i) {
      generatedRange[i] = currentVal;
      currentVal += actualStep;
    }
    return generatedRange;
  }
  getFirst(targetArray, count) {
    if (targetArray == null || targetArray.length < 1) {
      return count == null ? void 0 : [];
    }
    if (count == null) {
      return targetArray[0];
    }
    return this.getInitial(targetArray, targetArray.length - count);
  }
  getInitial(targetArray, count) {
    return targetArray.slice(0, Math.max(0, targetArray.length - (count == null ? 1 : count)));
  }
  getTail(targetArray, count) {
    return targetArray.slice(count == null ? 1 : count);
  }
  getLast(targetArray, count) {
    if (count == null) {
      return targetArray[targetArray.length - 1];
    }
    return this.getTail(targetArray, Math.max(0, targetArray.length - count));
  }
  cumulativeSumArray(inputArray) {
    const sums = [0];
    for (let i = 0; i < inputArray.length; ++i) {
      sums.push(inputArray[i] + sums[i]);
    }
    return this.getTail(sums);
  }
  differenceArray(inputArray) {
    const differences = [];
    for (let i = 1; i < inputArray.length; ++i) {
      differences.push(inputArray[i] - inputArray[i - 1]);
    }
    return differences;
  }
  findInsertionPoint(targetArray, searchKey, propertyAccessor) {
    const accessorFn = (obj) => (typeof obj === 'object') ? obj[propertyAccessor] : obj;
    const searchValue = accessorFn(searchKey);
    let lowBound = 0;
    let highBound = targetArray.length;

    while (lowBound < highBound) {
      const midPoint = Math.floor((lowBound + highBound) / 2);
      if (accessorFn(targetArray[midPoint]) < searchValue) {
        lowBound = midPoint + 1;
      } else {
        highBound = midPoint;
      }
    }
    return lowBound;
  }
}
const _UTILITIES = new UtilityFunctions();

class InputHandler {
  constructor() {
    this.readPointer = 0;
    this.inputLines = [];
    this.loadAllInput();
  }

  loadAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  readNextLine(lineCount) {
    if (lineCount) {
      const linesRead = this.inputLines.slice(this.readPointer, this.readPointer + lineCount);
      this.readPointer += lineCount;
      return linesRead;
    }
    return this.inputLines[this.readPointer++];
  }
  readNextInt() { return parseInt(this.readNextLine()); }
  readNextStrArray() { return this.readNextLine().split(' '); }
  readNextIntArray() { return this.readNextStrArray().map((element) => parseInt(element)); }
  readNextFloatArray() { return this.readNextStrArray().map((element) => parseFloat(element)); }
  readIntLines(lineCount) { return this.readNextLine(lineCount).map((element) => parseInt(element)); }
  readFloatLines(lineCount) { return this.readNextLine(lineCount).map((element) => parseFloat(element)); }
  readStrMatrix(lineCount) { return this.readNextLine(lineCount).map((currentLine) => currentLine.split(' ')); }
  readIntMatrix(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }
  readFloatMatrix(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
const inputReader = new InputHandler();

class OutputFormatter {
  constructor() {
    this.boolOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  outputResult(dataToOutput) {
    let formattedOutput;
    if (dataToOutput == null) {
      return;
    } else if (dataToOutput === true) {
      formattedOutput = this.boolOptions['true'];
    } else if (dataToOutput === false) {
      formattedOutput = this.boolOptions['false'];
    } else {
      formattedOutput = dataToOutput;
    }
    console.log(formattedOutput);
  }
  setBooleanOptions(optionsArray) {
    this.boolOptions['false'] = optionsArray[0];
    this.boolOptions['true'] = optionsArray[1];
    return this;
  }
}
const outputWriter = new OutputFormatter();

outputWriter.outputResult(new SolutionProcessor().processData());
