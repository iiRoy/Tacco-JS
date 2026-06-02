'use strict';

class SolutionProcessor {
  process() {
    const inputDimensions = inputHandler.getNextIntArr();
    const numPoints = inputDimensions[0];
    const gridSizeK = inputDimensions[1];
    const doubleGridSizeK = 2 * gridSizeK;

    const parsePointData = (pointStringArray, currentGridSizeK) => {
      const xCoordinate = parseInt(pointStringArray[0]);
      const yCoordinate = parseInt(pointStringArray[1]);
      const blackColorOffset = (pointStringArray[2] === 'B' ? currentGridSizeK : 0);
      return {
        x: (xCoordinate + blackColorOffset) % (2 * currentGridSizeK),
        y: yCoordinate % (2 * currentGridSizeK),
      };
    };

    const pointDataList = inputHandler.nextStrRange(numPoints).map(pStrArr => parsePointData(pStrArr, gridSizeK));

    const pointGrid = CoordinateGrid.from(pointDataList);

    const calculatePointColor = (xVal, yVal) => {
      const xQuadrant = (xVal < gridSizeK ? 0 : 1);
      const yQuadrant = (yVal < gridSizeK ? 0 : 1);
      return xQuadrant ^ yQuadrant;
    };

    let currentCount = pointDataList.filter(currentPoint => calculatePointColor(currentPoint.x, currentPoint.y) === 0).length;
    let maximumCount = currentCount;

    const updateQuadrantCount = (currentWhiteLeft, currentBlackLeft, currentWhiteRight, currentBlackRight) => {
      return (currentBlackLeft - currentWhiteLeft) + (currentWhiteRight - currentBlackRight);
    };

    for (let deltaY = 0; deltaY < gridSizeK; ++deltaY) {
      for (let deltaX = 0; deltaX < doubleGridSizeK; ++deltaX) {
        while (deltaX < gridSizeK && pointGrid.size('x', deltaX) === 0 && pointGrid.size('x', deltaX + gridSizeK) === 0) {
          deltaX++;
        }
        if (deltaX >= doubleGridSizeK) {
          break;
        }

        maximumCount = Math.max(maximumCount, currentCount);

        const whiteLeft = pointGrid.count(deltaX, deltaY, deltaX, deltaY + gridSizeK);
        const blackLeft = pointGrid.size('x', deltaX) - whiteLeft;

        const rightColumnX = (deltaX + gridSizeK) % doubleGridSizeK;
        const whiteRight = pointGrid.count(rightColumnX, deltaY, rightColumnX, deltaY + gridSizeK);
        const blackRight = pointGrid.size('x', rightColumnX) - whiteRight;

        currentCount += updateQuadrantCount(whiteLeft, blackLeft, whiteRight, blackRight);
      }

      while (deltaY < gridSizeK && pointGrid.size('y', deltaY) === 0 && pointGrid.size('y', deltaY + gridSizeK) === 0) {
        deltaY++;
      }
      if (deltaY === gridSizeK) {
        break;
      }

      const whiteRowLeft = pointGrid.count(0, deltaY, gridSizeK, deltaY);
      const blackRowLeft = pointGrid.size('y', deltaY) - whiteRowLeft;

      const whiteRowRight = pointGrid.count(0, deltaY + gridSizeK, gridSizeK, deltaY + gridSizeK);
      const blackRowRight = pointGrid.size('y', deltaY + gridSizeK) - whiteRowRight;

      currentCount += updateQuadrantCount(whiteRowLeft, blackRowLeft, whiteRowRight, blackRowRight);
    }
    return maximumCount;
  }
}

class CoordinateGrid {
  static get DefaultParameters() {
    return ['x', 'y'];
  }
  static get DefaultSortComparators() {
    return {
      'x': (a, b) => a.y - b.y,
      'y': (a, b) => a.x - b.x
    };
  }
  static from(dataList, extraParams, extraSortComparators) {
    return new CoordinateGrid().initialize(dataList, extraParams, extraSortComparators);
  }
  size(dimensionKey, indexValue) {
    const dimensionList = this.lists[dimensionKey];
    if (dimensionList == null || dimensionList[indexValue] == null) {
      return 0;
    }
    return dimensionList[indexValue].length;
  }
  initialize(dataList, extraParams, extraSortComparators) {
    if (extraParams == null) {
      extraParams = [];
    }
    if (extraSortComparators == null) {
      extraSortComparators = {};
    }
    this.parameters = CoordinateGrid.DefaultParameters.concat(extraParams);
    this.sortComparators = Object.assign(CoordinateGrid.DefaultSortComparators, extraSortComparators);
    this.lists = {};
    this.parameters.forEach(dimensionKey => {
      this.lists[dimensionKey] = {};
    });

    const ensureDimensionKeyEntry = (dimensionKey, valueKey) => {
      if (this.lists[dimensionKey][valueKey] === undefined) {
        this.lists[dimensionKey][valueKey] = [];
      }
    };

    dataList.forEach(dataElement => {
      this.parameters.forEach(dimensionKey => {
        ensureDimensionKeyEntry(dimensionKey, dataElement[dimensionKey]);
        this.lists[dimensionKey][dataElement[dimensionKey]].push(dataElement);
      });
    });

    this.dimensionKeys = {};
    this.parameters.forEach(dimensionKey => {
      const elementsInDimension = this.lists[dimensionKey];
      for (const keyInDimension in elementsInDimension) {
        elementsInDimension[keyInDimension].sort(this.sortComparators[dimensionKey]);
      }
      this.dimensionKeys[dimensionKey] = Object.keys(this.lists[dimensionKey]);
    });
    return this;
  }

  get(xCoord, yCoord) {
    if (this.lists.x[xCoord] == null) return null;
    const searchIndex = utilityFunctions.binarySearch(this.lists.x[xCoord], yCoord, 'y');
    const foundElement = this.lists.x[xCoord][searchIndex];
    if (foundElement == null || foundElement.y !== yCoord) {
      return null;
    }
    return foundElement;
  }

  count(xStart, yStart, xEnd, yEnd) {
    if (xStart === xEnd) {
      const xList = this.lists.x[xStart];
      if (xList == null) return 0;
      const leftBound = utilityFunctions.binarySearch(xList, yStart, 'y');
      const rightBound = utilityFunctions.binarySearch(xList, yEnd, 'y');
      return rightBound - leftBound;
    }
    if (yStart === yEnd) {
      const yList = this.lists.y[yStart];
      if (yList == null) return 0;
      const leftBound = utilityFunctions.binarySearch(yList, xStart, 'x');
      const rightBound = utilityFunctions.binarySearch(yList, xEnd, 'x');
      return rightBound - leftBound;
    }
    return -1;
  }

  getSome(xStart, yStart, xEnd, yEnd) {
    if (xStart === xEnd) {
      const resultElements = [];
      const xList = this.lists.x[xStart];
      if (xList == null) return resultElements;
      const leftBound = utilityFunctions.binarySearch(xList, yStart, 'y');
      const rightBound = utilityFunctions.binarySearch(xList, yEnd, 'y');
      for (let currentIdx = leftBound; currentIdx < rightBound; ++currentIdx) {
        resultElements.push(xList[currentIdx]);
      }
      return resultElements;
    }
    if (yStart === yEnd) {
      const resultElements = [];
      const yList = this.lists.y[yStart];
      if (yList == null) return resultElements;
      const leftBound = utilityFunctions.binarySearch(yList, xStart, 'x');
      const rightBound = utilityFunctions.binarySearch(yList, xEnd, 'x');
      for (let currentIdx = leftBound; currentIdx < rightBound; ++currentIdx) {
        resultElements.push(yList[currentIdx]);
      }
      return resultElements;
    }
    return -1;
  }
}

class ModularArithmetic {
  constructor(moduloValue) {
    if (moduloValue == null) {
      moduloValue = 1e9 + 7;
    }
    this.modulo = moduloValue;
  }
  multiply(factorA, factorB) {
    let result = 0;
    factorA %= this.modulo;
    factorB %= this.modulo;
    while (factorB) {
      if (factorB & 1) {
        result += factorA;
        if (result >= this.modulo) {
          result -= this.modulo;
        }
      }
      let shiftedA = factorA << 1;
      if (shiftedA >= this.modulo) {
        shiftedA -= this.modulo;
      }
      factorA = shiftedA;
      factorB >>= 1;
    }
    return result;
  }
  power(baseVal, exponentVal) {
    let result = 1;
    while (exponentVal) {
      if (exponentVal & 1) {
        result = this.multiply(result, baseVal);
      }
      let squaredBase = this.multiply(baseVal, baseVal);
      baseVal = squaredBase;
      exponentVal >>= 1;
    }
    return result;
  }
  divide(numerator, denominator) {
    return this.multiply(numerator, this.power(denominator, this.modulo - 2));
  }
  combinations(nVal, kVal) {
    // Note: factTable and invFactTable are not defined in the provided snippet.
    // Assuming they are globally available or part of a larger context.
    return MOD_INSTANCE.multiply(factTable[nVal], MOD_INSTANCE.multiply(invFactTable[kVal], invFactTable[nVal - kVal]));
  }
}
const MOD_INSTANCE = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  sum(dataArray) {
    if (!dataArray || dataArray.length === 0) return 0;
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }
  modSum(dataArray, moduloValue) {
    if (!dataArray || dataArray.length === 0) return 0;
    if (moduloValue == null) {
      moduloValue = MOD_INSTANCE.modulo;
    }
    return dataArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloValue);
  }
  min(dataArray, comparisonFn) {
    if (!dataArray || dataArray.length === 0) return undefined;
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return dataArray.reduce((minVal, currentVal) => comparisonFn(minVal, currentVal) < 0 ? minVal : currentVal);
  }
  max(dataArray, comparisonFn) {
    if (!dataArray || dataArray.length === 0) return undefined;
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return dataArray.reduce((maxVal, currentVal) => comparisonFn(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }
  sort(dataArray, comparisonFn) {
    if (!dataArray) return [];
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return dataArray.sort(comparisonFn);
  }
  unique(dataArray) {
    if (!dataArray) return [];
    const sortedArray = [...dataArray].sort();
    const filteredArray = [];
    for (let i = 0; i < sortedArray.length; ++i) {
      const currentElement = sortedArray[i];
      const nextElement = sortedArray[i + 1];
      if (i === sortedArray.length - 1 || currentElement !== nextElement) {
        filteredArray.push(currentElement);
      }
    }
    return filteredArray;
  }
  generateRange(startVal, stopVal, stepVal) {
    if (stopVal == null) {
      stopVal = startVal || 0;
      startVal = 0;
    }
    if (!stepVal) {
      stepVal = stopVal < startVal ? -1 : 1;
    }
    const rangeLength = Math.max(Math.ceil((stopVal - startVal) / stepVal), 0);
    const generatedRange = Array(rangeLength);
    for (let currentIndex = 0; currentIndex < rangeLength; currentIndex++, startVal += stepVal) {
      generatedRange[currentIndex] = startVal;
    }
    return generatedRange;
  }
  getFirst(dataArray, numElements) {
    if (dataArray == null || dataArray.length < 1) return numElements == null ? undefined : [];
    if (numElements == null) return dataArray[0];
    return this.getInitial(dataArray, dataArray.length - numElements);
  };
  getInitial(dataArray, numToExclude) {
    const excludeCount = numToExclude == null ? 1 : numToExclude;
    return dataArray.slice(0, Math.max(0, dataArray.length - excludeCount));
  }
  getTail(dataArray, numToSkip) {
    const skipCount = numToSkip == null ? 1 : numToSkip;
    return dataArray.slice(skipCount);
  }
  getLast(dataArray, numElements) {
    if (numElements == null) return dataArray[dataArray.length - 1];
    return this.getTail(dataArray, Math.max(0, dataArray.length - numElements));
  }
  cumulativeSumArray(dataArray) {
    if (!dataArray || dataArray.length === 0) return [];
    const sums = [0];
    for (let i = 0; i < dataArray.length; i++) {
      sums.push(dataArray[i] + sums[i]);
    }
    return this.getTail(sums);
  }
  differenceArray(dataArray) {
    if (!dataArray || dataArray.length < 2) return [];
    const differences = [];
    for (let i = 1; i < dataArray.length; ++i) {
      differences.push(dataArray[i] - dataArray[i - 1]);
    }
    return differences;
  }
  binarySearch(dataArray, searchKey, propertyName) {
    const accessorFn = (itemObject) => (typeof itemObject === 'object') ? itemObject[propertyName] : itemObject;
    const targetValue = accessorFn(searchKey);
    let lowIndex = 0,
      highIndex = dataArray.length;
    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (accessorFn(dataArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  };
}
const utilityFunctions = new UtilityFunctions();

class InputHandler {
  constructor() {
    this.currentCursor = 0;
    this.loadAllInput();
  }

  loadAllInput() {
    this.rawInputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawInputLines;
  }

  getNextLine(countLines) {
    if (countLines) {
      const resultLines = this.rawInputLines.slice(this.currentCursor, this.currentCursor + countLines);
      this.currentCursor += countLines;
      return resultLines;
    }
    const singleLine = this.rawInputLines[this.currentCursor];
    this.currentCursor++;
    return singleLine;
  }
  getNextInt() {
    return parseInt(this.getNextLine());
  }
  getNextStrArr() {
    return this.getNextLine().split(' ');
  }
  getNextIntArr() {
    return this.getNextStrArr().map((element) => parseInt(element));
  }
  getNextFloatArr() {
    return this.getNextStrArr().map((element) => parseFloat(element));
  }
  getNextIntLines(countLines) {
    return this.getNextLine(countLines).map((element) => parseInt(element));
  }
  getNextFloatLines(countLines) {
    return this.getNextLine(countLines).map((element) => parseFloat(element));
  }
  nextStrRange(countLines) {
    return this.getNextLine(countLines).map((lineString) => lineString.split(' '));
  }
  nextIntRange(countLines) {
    return this.getNextLine(countLines).map((lineString) => lineString.split(' ').map((element) => parseInt(element)));
  }
  nextFloatRange(countLines) {
    return this.getNextLine(countLines).map((lineString) => lineString.split(' ').map((element) => parseFloat(element)));
  }
}
const inputHandler = new InputHandler();

class OutputWriter {
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  writeOutput(outputValue) {
    let finalOutput;
    if (outputValue == null) {
      return;
    }

    if (outputValue === true) {
      finalOutput = this.booleanOptions['true'];
    } else if (outputValue === false) {
      finalOutput = this.booleanOptions['false'];
    } else {
      finalOutput = outputValue;
    }
    console.log(finalOutput);
  }
  setBooleanOptions(optionsArray) {
    this.booleanOptions['false'] = optionsArray[0];
    this.booleanOptions['true'] = optionsArray[1];
    return this;
  }
}
const outputWriter = new OutputWriter();

outputWriter.writeOutput(new SolutionProcessor().process());
