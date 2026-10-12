"use strict";

const parseNumericArray = (strArray) => strArray.map(s => +s);

const createInputParser = (() => {
  class InputProcessor {
    constructor(sourceContent) {
      this._inputLines = sourceContent.trim().split("\n");
      this._currentLineIndex = 0;
    }

    readNextValue(returnAsString = false) {
      let activeLine = this._inputLines[this._currentLineIndex];
      if (typeof activeLine === "string") {
        this._inputLines[this._currentLineIndex] = activeLine.split(" ").reverse();
        activeLine = this._inputLines[this._currentLineIndex];
      }
      const extractedItem = activeLine.pop();
      if (activeLine.length === 0) {
        this._currentLineIndex++;
      }
      return returnAsString ? extractedItem : +extractedItem;
    }

    readLineValues(returnAsStrings = false) {
      const lineData = this._inputLines[this._currentLineIndex++].split(" ");
      return returnAsStrings ? lineData : parseNumericArray(lineData);
    }

    readMatrix(numberOfRows, returnAsStrings = false) {
      const matrixContent = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex + numberOfRows)
                                            .map(rowString => rowString.split(" "));
      this._currentLineIndex += numberOfRows;
      return returnAsStrings ? matrixContent : matrixContent.map(parseNumericArray);
    }

    readRawLines(numberOfLines, returnAsStrings = false) {
      const rawLineData = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex + numberOfLines);
      this._currentLineIndex += numberOfLines;
      return returnAsStrings ? rawLineData : rawLineData.map(s => +s);
    }
  }
  return (sourceContent) => new InputProcessor(sourceContent);
})();

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimensionalArray(initialValue) {
  var args = arguments, argCount = args.length, arrayDefinition = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--argCount) arrayDefinition = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayDefinition + ")";
  return eval(arrayDefinition);
}

const MODULO_CONSTANT = 998244353;

function performModularMultiplication() {
  let productResult = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    productResult = (((productResult >>> 16) * arguments[i]) % MODULO_CONSTANT * 65536 + (productResult & 0xFFFF) * arguments[i]) % MODULO_CONSTANT;
  }
  return productResult;
}

let cachedFactorial = 1;
const inverseFactorialLookup = [];

function precomputeFactorialsAndInverses(upperLimit) {
  if (upperLimit < 8000000) {
    for (let i = 2; i <= upperLimit; i++) {
      cachedFactorial = performModularMultiplication(cachedFactorial, i);
    }
  } else {
    cachedFactorial = 833655840;
    for (let i = 8000001; i <= upperLimit; i++) {
      cachedFactorial = performModularMultiplication(cachedFactorial, i);
    }
  }

  inverseFactorialLookup.length = upperLimit + 1;
  inverseFactorialLookup[0] = 1;
  inverseFactorialLookup[1] = 1;
  inverseFactorialLookup[upperLimit] = calculateModularInverse(cachedFactorial);

  for (let i = upperLimit; i > 1; i--) {
    inverseFactorialLookup[i - 1] = performModularMultiplication(inverseFactorialLookup[i], i);
  }
}

function calculateModularInverse(valueA) {
  let b = MODULO_CONSTANT, u = 1, v = 0, temp;
  while (b !== 0) {
    temp = Math.floor(valueA / b);
    valueA -= temp * b;
    u -= temp * v;
    [valueA, b] = [b, valueA];
    [u, v] = [v, u];
  }
  u %= MODULO_CONSTANT;
  return u < 0 ? u + MODULO_CONSTANT : u;
}

function calculateModularPower(baseValue, exponentValue) {
  let finalResult = 1;
  let currentBase = baseValue;
  while (exponentValue > 0) {
    if (exponentValue & 1) {
      finalResult = performModularMultiplication(finalResult, currentBase);
    }
    currentBase = performModularMultiplication(currentBase, currentBase);
    exponentValue >>= 1;
  }
  return finalResult;
}

function calculateNcrMod(n, r) {
  if (r < 0 || r > n) return 0;
  return performModularMultiplication(cachedFactorial, inverseFactorialLookup[r], inverseFactorialLookup[n - r]);
}

console.log(executeMainLogic());

function executeMainLogic() {
  const N_input = inputReader.readNextValue();
  let computedAnswer = calculateModularPower(3, N_input);

  precomputeFactorialsAndInverses(N_input);

  let currentPowerOfTwo = 1;
  const N_half_floor = N_input >> 1;

  for (let i = N_input; i > N_half_floor; i--) {
    currentPowerOfTwo = performModularMultiplication(currentPowerOfTwo, 2);
    const termToSubtract = performModularMultiplication(calculateNcrMod(N_input, i), currentPowerOfTwo);
    computedAnswer = (computedAnswer - termToSubtract + MODULO_CONSTANT) % MODULO_CONSTANT;
  }

  return computedAnswer;
}
