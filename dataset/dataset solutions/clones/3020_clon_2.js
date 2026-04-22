'use strict'

class Processor {
  execute() {
    const count = DATA_SOURCE.fetchNextInteger();
    const items = Array.from(DATA_SOURCE.fetchNextLine()).map(element => element === '#' ? 1 : 0);
    let ignoreLeading = true;
    const trimmedSequence = [];
    for (let idx = 0; idx < count; ++idx) {
      if (items[idx] == 1) ignoreLeading = false;
      if (ignoreLeading) {
        continue;
      }
      trimmedSequence.push(items[idx]);
    }
    let effectiveLength = trimmedSequence.length;
    for (let idx = trimmedSequence.length - 1; idx >= 0; --idx) {
      if (trimmedSequence[idx] == 0) {
        break;
      }
      effectiveLength = idx;
    }
    const finalSegment = trimmedSequence.slice(0, effectiveLength);
    return Math.min(finalSegment.filter(element => element == 1).length,
      finalSegment.filter(element => element == 0).length);
  }
}

class ModularArithmetic {
  constructor(moduloVal) {
    if (moduloVal == null) {
      moduloVal = DefaultModularValue;
    }
    this.modulus = moduloVal;
  }
  multiplyMod(operandA, operandB) {
    let result = 0;
    operandA %= this.modulus;
    operandB %= this.modulus;
    while (operandB) {
      if (operandB & 1) {
        result += operandA;
        if (result > this.modulus) {
          result -= this.modulus;
        }
      }
      operandA <<= 1;
      if (operandA > this.modulus) {
        operandA -= this.modulus;
      }
      operandB >>= 1;
    }
    return result;
  }
  powerMod(base, exponent) {
    let result = 1;
    while (exponent) {
      if (exponent & 1) {
        result = this.multiplyMod(result, base);
      }
      base = this.multiplyMod(base, base);
      exponent >>= 1;
    }
    return result;
  }
  divideMod(numerator, denominator) {
    return this.multiplyMod(numerator, this.powerMod(denominator, this.modulus - 2))
  }
  combinationsMod(totalItems, chosenItems) {
    return ARITH_MOD.multiplyMod(factorialCache[totalItems], ARITH_MOD.multiplyMod(inverseFactorialCache[chosenItems], inverseFactorialCache[totalItems - chosenItems]));
  }
}
const ARITH_MOD = new ModularArithmetic(998244353);

class UtilityToolkit {
  calculateSum(collection) {
    return collection.reduce((accumulator, currentValue) => accumulator + currentValue);
  }
  calculateModularSum(collection, moduloVal) {
    if (moduloVal == null) {
      moduloVal = ARITH_MOD.modulus;
    }
    return collection.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloVal);
  }
  findMinimum(collection, comparator) {
    if (comparator == null) {
      comparator = (a, b) => a - b
    }
    return collection.reduce((minVal, currentVal) => comparator(minVal, currentVal) < 0 ? minVal : currentVal);
  }
  findMaximum(collection, comparator) {
    if (comparator == null) {
      comparator = (a, b) => a - b
    }
    return collection.reduce((maxVal, currentVal) => comparator(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }
  sortCollection(collection, comparator) {
    if (comparator == null) {
      comparator = (a, b) => a - b
    }
    return collection.sort(comparator)
  }
  uniqueElements(collection) {
    collection.sort();
    for (let idx = 0; idx < collection.length - 1; ++idx) {
      collection[idx] = collection[idx + 1] == collection[idx] ? null : collection[idx];
    }
    return collection.filter(element => element != null);
  }
  generateRange(begin, end, increment) {
    if (end == null) {
      end = begin || 0;
      begin = 0;
    }
    if (!increment) {
      increment = end < begin ? -1 : 1;
    }
    const rangeSize = Math.max(Math.ceil((end - begin) / increment), 0);
    const generatedRange = Array(rangeSize);
    for (var indexVar = 0; indexVar < rangeSize; indexVar++, begin += increment) {
      generatedRange[indexVar] = begin;
    }
    return generatedRange;
  }
  getFirstElements(dataArray, numElements) {
    if (dataArray == null || dataArray.length < 1) return numElements == null ? void 0 : [];
    if (numElements == null) return dataArray[0];
    return this.getInitialElements(dataArray, dataArray.length - numElements);
  };
  getInitialElements(dataArray, numElements) {
    return dataArray.slice.call(dataArray, 0, Math.max(0, dataArray.length - (numElements == null ? 1 : numElements)));
  }
  getTailElements(dataArray, numElements) {
    return dataArray.slice.call(dataArray, numElements == null ? 1 : numElements);
  }
  getLastElements(dataArray, numElements) {
    if (numElements == null) return dataArray[dataArray.length - 1];
    return this.getTailElements(dataArray, Math.max(0, dataArray.length - numElements));
  }
  computePrefixSums(collection) {
    return this.getTailElements(collection.reduce(((acc, current, index) => {
      acc.push(current + acc[index]);
      return acc
    }), [0]));
  }
  computeDifferences(collection) {
    const diffs = [];
    for (let idx = 1; idx < collection.length; ++idx) {
      diffs.push(collection[idx] - collection[idx - 1]);
    }
    return diffs;
  }
  performBinarySearch(dataArray, searchValue, propertyAccessor) {
    const accessorFn = (itemObject) => (typeof itemObject === 'object') ? itemObject[propertyAccessor] : itemObject;
    const targetValue = accessorFn(searchValue);
    let lowerBound = 0,
      upperBound = dataArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFn(dataArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  };
}
const UTIL = new UtilityToolkit();

class DataAcquirer {
  constructor() {
    this.readPointer = 0;
    this.readAllInput();
  }

  readAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  fetchNextLine(numLines) {
    if (numLines) {
      const resultLines = this.inputLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return resultLines;
    }
    return this.inputLines[this.readPointer++];
  }
  fetchNextInteger() {
    return parseInt(this.fetchNextLine());
  }
  fetchNextStringArray() {
    return this.fetchNextLine().split(' ');
  }
  fetchNextIntegerArray() {
    return this.fetchNextStringArray().map((element) => parseInt(element));
  }
  fetchNextFloatArray() {
    return this.fetchNextStringArray().map((element) => parseFloat(element));
  }
  fetchIntegerLines(numLines) {
    return this.fetchNextLine(numLines).map((element) => parseInt(element))
  }
  fetchFloatLines(numLines) {
    return this.fetchNextLine(numLines).map((element) => parseFloat(element))
  }
  fetchStringGrid(numLines) {
    return this.fetchNextLine(numLines).map((currentLine) => currentLine.split(' '));
  }
  fetchIntegerGrid(numLines) {
    return this.fetchNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }
  fetchFloatGrid(numLines) {
    return this.fetchNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
const DATA_SOURCE = new DataAcquirer();

class OutputHandler {
  constructor() {
    this.displayOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  emitResult(dataToOutput) {
    let finalResult;
    if (dataToOutput == null) return;
    if (dataToOutput === true) {
      finalResult = this.displayOptions['true'];
    } else if (dataToOutput === false) {
      finalResult = this.displayOptions['false'];
    } else {
      finalResult = dataToOutput;
    }
    console.log(finalResult);
  }
  configureBooleanOutput(booleanOptions) {
    this.displayOptions['false'] = booleanOptions[0];
    this.displayOptions['true'] = booleanOptions[1];
    return this;
  }
}
const RESULT_WRITER = new OutputHandler();

RESULT_WRITER.emitResult(new Processor().execute());