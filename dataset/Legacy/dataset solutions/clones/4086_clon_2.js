'use strict'
class PrimaryProcessor {
  execute() {
    const numKPair = READER.fetchIntArray();
    const entityCount = numKPair[0], divisorVal = numKPair[1];

    const doubleDivisor = 2 * divisorVal;

    const itemList = READER.fetchStringMatrix(entityCount).map(itemElement => {
      return {
        x_coord: (parseInt(itemElement[0]) + (itemElement[2] === 'B' ? divisorVal : 0)) % doubleDivisor,
        y_coord: parseInt(itemElement[1]) % doubleDivisor,
      }
    });

    const coordStore = CoordinateContainer.createFrom(itemList);

    const calculateParity = (coordX, coordY) => (coordX < divisorVal ? 0 : 1) ^ (coordY < divisorVal ? 0 : 1);

    let currentTally = itemList.filter(itemElement => calculateParity(itemElement.x_coord, itemElement.y_coord) === 0).length;
    let maximumTally = currentTally;

    for (let deltaY = 0; deltaY < divisorVal; ++deltaY) {
      for (let deltaX = 0; deltaX < doubleDivisor; ++deltaX) {
        const shiftedDeltaX = deltaX + ((deltaX + divisorVal) >= doubleDivisor ? -divisorVal : divisorVal);
        maximumTally = Math.max(maximumTally, currentTally);

        const whiteLeft = coordStore.countElements(deltaX, deltaY, deltaX, deltaY + divisorVal);
        const blackLeft = coordStore.dimensionSize('x_coord', deltaX) - whiteLeft;
        const whiteRight = coordStore.countElements(shiftedDeltaX, deltaY, shiftedDeltaX, deltaY + divisorVal);
        const blackRight = coordStore.dimensionSize('x_coord', shiftedDeltaX) - whiteRight;

        currentTally += (-whiteLeft + blackLeft) + (+whiteRight - blackRight);
      }

      while (deltaY < divisorVal && coordStore.dimensionSize('y_coord', deltaY) === 0 && coordStore.dimensionSize('y_coord', deltaY + divisorVal) === 0) {
        ++deltaY;
      }

      if (deltaY === divisorVal) {
        break;
      }

      const verticalWhite = coordStore.countElements(0, deltaY, divisorVal, deltaY);
      const verticalBlack = coordStore.dimensionSize('y_coord', deltaY) - verticalWhite;
      const verticalWhiteShifted = coordStore.countElements(0, deltaY + divisorVal, divisorVal, deltaY + divisorVal);
      const verticalBlackShifted = coordStore.dimensionSize('y_coord', deltaY + divisorVal) - verticalWhiteShifted;

      currentTally += (-verticalWhite + verticalBlack) + (+verticalWhiteShifted - verticalBlackShifted);
    }

    return maximumTally;
  }
}

// A class for managing grouped coordinate data
class CoordinateContainer {
  static get StandardAttributes() {
    return ['x_coord', 'y_coord'];
  }

  static get StandardSortFunctions() {
    return {
      'x_coord': (firstElement, secondElement) => firstElement.y_coord - secondElement.y_coord,
      'y_coord': (firstElement, secondElement) => firstElement.x_coord - secondElement.x_coord
    };
  }

  static createFrom(dataList, extraAttributes, extraSortFunctions) {
    return new CoordinateContainer().initialize(dataList, extraAttributes, extraSortFunctions);
  }

  dimensionSize(attributeName, indexValue) {
    return this.dimensionMaps[attributeName][indexValue] === null || this.dimensionMaps[attributeName][indexValue] === undefined ? 0 : this.dimensionMaps[attributeName][indexValue].length;
  }

  initialize(dataList, extraAttributes, extraSortFunctions) {
    if (extraAttributes === null || extraAttributes === undefined) {
      extraAttributes = [];
    }
    if (extraSortFunctions === null || extraSortFunctions === undefined) {
      extraSortFunctions = {};
    }

    this.attributes = CoordinateContainer.StandardAttributes.concat(extraAttributes);
    this.sortMethods = Object.assign(CoordinateContainer.StandardSortFunctions, extraSortFunctions);
    this.dimensionMaps = {};

    this.attributes.forEach(attr => {
      this.dimensionMaps[attr] = {};
    });

    dataList.forEach(elementItem => {
      this.attributes.forEach(attr => {
        if (this.dimensionMaps[attr][elementItem[attr]] === undefined) {
          this.dimensionMaps[attr][elementItem[attr]] = [];
        }
        this.dimensionMaps[attr][elementItem[attr]].push(elementItem);
      });
    });

    this.attributes.forEach(attr => {
      const groupedElements = this.dimensionMaps[attr];
      for (const keyId in groupedElements) {
        groupedElements[keyId].sort(this.sortMethods[attr]);
      }
    });

    return this;
  }

  retrieveSingle(xCoord, yCoord) {
    if (this.dimensionMaps.x_coord === undefined || this.dimensionMaps.x_coord[xCoord] === undefined) {
      return null;
    }
    const indexFound = UTIL.findBinary(this.dimensionMaps.x_coord[xCoord], yCoord, 'y_coord');
    if (this.dimensionMaps.x_coord[xCoord][indexFound] === null || this.dimensionMaps.x_coord[xCoord][indexFound] === undefined || this.dimensionMaps.x_coord[xCoord][indexFound].y_coord !== yCoord) {
      return null;
    }
    return this.dimensionMaps.x_coord[xCoord][indexFound];
  }

  // Counts points within a rectangular region [(x1,y1),(x2,y2))
  countElements(xStart, yStart, xEnd, yEnd) {
    if (xStart === xEnd) {
      if (this.dimensionMaps.x_coord === undefined || this.dimensionMaps.x_coord[xStart] === undefined) return 0;
      const lowerBound = UTIL.findBinary(this.dimensionMaps.x_coord[xStart], yStart, 'y_coord');
      const upperBound = UTIL.findBinary(this.dimensionMaps.x_coord[xStart], yEnd, 'y_coord');
      return upperBound - lowerBound;
    }
    if (yStart === yEnd) {
      if (this.dimensionMaps.y_coord === undefined || this.dimensionMaps.y_coord[yStart] === undefined) return 0;
      const lowerBound = UTIL.findBinary(this.dimensionMaps.y_coord[yStart], xStart, 'x_coord');
      const upperBound = UTIL.findBinary(this.dimensionMaps.y_coord[yStart], xEnd, 'x_coord');
      return upperBound - lowerBound;
    }
    return -1; // Not supported for general rectangles in this method
  }

  fetchRange(xBegin, yBegin, xFinish, yFinish) {
    if (xBegin === xFinish) {
      const resultCollection = [];
      if (this.dimensionMaps.x_coord === undefined || this.dimensionMaps.x_coord[xBegin] === undefined) return resultCollection;
      const lowerIdx = UTIL.findBinary(this.dimensionMaps.x_coord[xBegin], yBegin, 'y_coord');
      const upperIdx = UTIL.findBinary(this.dimensionMaps.x_coord[xBegin], yFinish, 'y_coord');
      for (let currentIdx = lowerIdx; currentIdx < upperIdx; ++currentIdx) {
        resultCollection.push(this.dimensionMaps.x_coord[xBegin][currentIdx]);
      }
      return resultCollection;
    }
    if (yBegin === yFinish) {
      const resultCollection = [];
      if (this.dimensionMaps.y_coord === undefined || this.dimensionMaps.y_coord[yBegin] === undefined) return resultCollection;
      const lowerIdx = UTIL.findBinary(this.dimensionMaps.y_coord[yBegin], xBegin, 'x_coord');
      const upperIdx = UTIL.findBinary(this.dimensionMaps.y_coord[yBegin], xFinish, 'x_coord');
      for (let currentIdx = lowerIdx; currentIdx < upperIdx; ++currentIdx) {
        resultCollection.push(this.dimensionMaps.y_coord[yBegin][currentIdx]);
      }
      return resultCollection;
    }
    return -1; // Not supported for general rectangles
  }
}

class ModularArithmetic {
  constructor(moduloValue) {
    this.defaultModulus = 1000000007; // A common default prime modulus
    this.modulus = moduloValue || this.defaultModulus;
  }

  multiply(factorA, factorB) {
    let productResult = 0;
    factorA %= this.modulus;
    factorB %= this.modulus;

    while (factorB > 0) {
      if (factorB & 1) {
        productResult += factorA;
        if (productResult >= this.modulus) {
          productResult -= this.modulus;
        }
      }
      factorA <<= 1;
      if (factorA >= this.modulus) {
        factorA -= this.modulus;
      }
      factorB >>= 1;
    }
    return productResult;
  }

  power(baseVal, exponentVal) {
    let result = 1;
    while (exponentVal > 0) {
      if (exponentVal & 1) {
        result = this.multiply(result, baseVal);
      }
      baseVal = this.multiply(baseVal, baseVal);
      exponentVal >>= 1;
    }
    return result;
  }

  divide(numerator, denominator) {
    // Modular inverse using Fermat's Little Theorem for prime modulus
    return this.multiply(numerator, this.power(denominator, this.modulus - 2));
  }

  combinations(totalN, pickK) {
    // Assumes factorialLookup and inverseFactorialLookup are globally available or class properties
    // For a fully self-contained class, these would be precomputed or passed
    return MATH_MOD.multiply(factorialLookup[totalN], MATH_MOD.multiply(inverseFactorialLookup[pickK], inverseFactorialLookup[totalN - pickK]));
  }
}
const MATH_MOD = new ModularArithmetic(1000000007); // Renamed MOD to MATH_MOD

class UtilityBelt {
  sumArrayElements(dataArray) {
    return dataArray.reduce((acc, curr) => acc + curr);
  }

  modulusSumArray(dataArray, moduloVal) {
    if (moduloVal === null || moduloVal === undefined) {
      moduloVal = MATH_MOD.modulus;
    }
    return dataArray.reduce((accum, current) => (accum + current) % moduloVal, 0);
  }

  findMinimum(dataArray, compareFunc) {
    if (compareFunc === null || compareFunc === undefined) {
      compareFunc = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((valA, valB) => compareFunc(valA, valB) < 0 ? valA : valB);
  }

  findMaximum(dataArray, compareFunc) {
    if (compareFunc === null || compareFunc === undefined) {
      compareFunc = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((valA, valB) => compareFunc(valA, valB) > 0 ? valA : valB);
  }

  sortArray(dataArray, sortFunction) {
    if (sortFunction === null || sortFunction === undefined) {
      sortFunction = (valA, valB) => valA - valB;
    }
    return dataArray.sort(sortFunction);
  }

  uniqueElements(dataArray) {
    dataArray.sort();
    for (let idx = 0; idx < dataArray.length - 1; ++idx) {
      dataArray[idx] = dataArray[idx + 1] === dataArray[idx] ? null : dataArray[idx];
    }
    return dataArray.filter(element => element !== null);
  }

  createRange(rangeStart, rangeEnd, stepSize) {
    if (rangeEnd === null || rangeEnd === undefined) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!stepSize) {
      stepSize = rangeEnd < rangeStart ? -1 : 1;
    }
    const seriesLength = Math.max(Math.ceil((rangeEnd - rangeStart) / stepSize), 0);
    const numberRange = Array(seriesLength);
    for (let currentIdx = 0; currentIdx < seriesLength; currentIdx++, rangeStart += stepSize) {
      numberRange[currentIdx] = rangeStart;
    }
    return numberRange;
  }

  getFirstElements(sourceArray, numElements) {
    if (sourceArray === null || sourceArray.length < 1) return numElements === null || numElements === undefined ? undefined : [];
    if (numElements === null || numElements === undefined) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - numElements);
  }

  getInitialElements(sourceArray, numToExclude) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (numToExclude === null || numToExclude === undefined ? 1 : numToExclude)));
  }

  getTailElements(sourceArray, numToSkip) {
    return sourceArray.slice.call(sourceArray, numToSkip === null || numToSkip === undefined ? 1 : numToSkip);
  }

  getLastElements(sourceArray, numElements) {
    if (numElements === null || numElements === undefined) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - numElements));
  }

  cumulativeSumArray(dataArray) {
    return this.getTailElements(dataArray.reduce(((accum, currVal, currIdx) => {
      accum.push(currVal + accum[currIdx]);
      return accum;
    }), [0]));
  }

  differenceArray(dataArray) {
    const diffs = [];
    for (let idx = 1; idx < dataArray.length; ++idx) {
      diffs.push(dataArray[idx] - dataArray[idx - 1]);
    }
    return diffs;
  }

  // Finds the index of the largest element less than or equal to the searchKey
  findBinary(sortedArray, searchKey, propertyName) {
    const accessor = (objItem) => (typeof objItem === 'object') ? objItem[propertyName] : objItem;
    const targetValue = accessor(searchKey);
    let lowIndex = 0,
      highIndex = sortedArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (accessor(sortedArray[midIndex]) < targetValue) lowIndex = midIndex + 1;
      else highIndex = midIndex;
    }
    return lowIndex;
  }
}
const UTIL = new UtilityBelt(); // Renamed _ to UTIL

class DataReader {
  constructor() {
    this.readPointer = 0;
    this.ingestAllData();
  }

  ingestAllData() {
    this.rawLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawLines;
  }

  /* Fetches a single line or multiple lines as strings */
  getNextLines(lineCount) {
    if (lineCount) {
      const fetchedLines = this.rawLines.slice(this.readPointer, this.readPointer + lineCount);
      this.readPointer += lineCount;
      return fetchedLines;
    }
    return this.rawLines[this.readPointer++];
  }

  /* Fetches a single integer from the next line */
  fetchNextInteger() {
    return parseInt(this.getNextLines(), 10);
  }

  /* Fetches a line and splits it into a string array */
  fetchNextStringArray() {
    return this.getNextLines().split(' ');
  }

  /* Fetches a line and converts elements to an integer array */
  fetchIntArray() {
    return this.fetchNextStringArray().map((strVal) => parseInt(strVal, 10));
  }

  /* Fetches a line and converts elements to a float array */
  fetchFloatArray() {
    return this.fetchNextStringArray().map((strVal) => parseFloat(strVal));
  }

  /* Fetches 'lineCount' lines and converts each to an integer */
  fetchIntegerLines(lineCount) {
    return this.getNextLines(lineCount).map((lineItem) => parseInt(lineItem, 10));
  }

  /* Fetches 'lineCount' lines and converts each to a float */
  fetchFloatLines(lineCount) {
    return this.getNextLines(lineCount).map((lineItem) => parseFloat(lineItem));
  }

  /* Fetches 'lineCount' lines, each split into a string array (2D array of strings) */
  fetchStringMatrix(lineCount) {
    return this.getNextLines(lineCount).map((textLine) => textLine.split(' '));
  }

  /* Fetches 'lineCount' lines, each split and converted to an integer array (2D array of integers) */
  fetchIntegerMatrix(lineCount) {
    return this.getNextLines(lineCount).map((textLine) => textLine.split(' ').map((valStr) => parseInt(valStr, 10)));
  }

  /* Fetches 'lineCount' lines, each split and converted to a float array (2D array of floats) */
  fetchFloatMatrix(lineCount) {
    return this.getNextLines(lineCount).map((textLine) => textLine.split(' ').map((valStr) => parseFloat(valStr)));
  }
}
const READER = new DataReader(); // Renamed input to READER

class ResultPresenter {
  constructor() {
    this.outputSettings = {
      'true_val': 'Yes',
      'false_val': 'No',
    };
  }

  display(resultOutput) {
    let finalMessage;
    if (resultOutput === null || resultOutput === undefined) return;

    if (resultOutput === true) {
      finalMessage = this.outputSettings['true_val'];
    } else if (resultOutput === false) {
      finalMessage = this.outputSettings['false_val'];
    } else {
      finalMessage = resultOutput;
    }
    console.log(finalMessage);
  }

  setBooleanOutput(boolOptions) {
    this.outputSettings['false_val'] = boolOptions[0];
    this.outputSettings['true_val'] = boolOptions[1];
    return this;
  }
}
const PRESENTER = new ResultPresenter(); // Renamed out to PRESENTER

PRESENTER.display(new PrimaryProcessor().execute());