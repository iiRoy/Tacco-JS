const InputReaderFactory = (() => {
  class InputReader {
    constructor(rawInputString) {
      this.inputLines = rawInputString.trim().split("\n");
      this.currentLineIndex = 0;
    }

    _parseItem(itemString, asString) {
      return asString ? itemString : +itemString;
    }

    readNextItem(asString) {
      let currentLineItems = this.inputLines[this.currentLineIndex];
      if (typeof currentLineItems === "string") {
        currentLineItems = currentLineItems.split(" ").reverse();
        this.inputLines[this.currentLineIndex] = currentLineItems;
      }
      const item = currentLineItems.pop();
      if (!currentLineItems.length) {
        this.currentLineIndex++;
      }
      return this._parseItem(item, asString);
    }

    readLineItems(asString) {
      const lineContent = this.inputLines[this.currentLineIndex++];
      const items = lineContent.split(" ");
      return asString ? items : items.map(val => +val);
    }

    readMatrix(numRows, asString) {
      const matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
      this.currentLineIndex += numRows;
      const parsedMatrix = matrixRows.map(row => row.split(" "));
      return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
    }

    readLines(numLines, asString) {
      const lines = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
      this.currentLineIndex += numLines;
      return asString ? lines : lines.map(val => +val);
    }
  }

  return (inputString) => new InputReader(inputString);
})();

const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
  const args = arguments;
  let lengthCount = args.length;
  let arrayCreationString = `Array(args[${--lengthCount}]).fill(0).map(x=>{return ${initialValue};})`;
  while (--lengthCount) {
    arrayCreationString = `Array(args[${lengthCount}]).fill(0).map(x=>${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

const MODULUS_VAL = 1000003;

function modularMultiply(...factors) {
  let result = factors[0];
  for (let i = 1; i < factors.length; i++) {
    result = (result * factors[i]) % MODULUS_VAL;
  }
  return result;
}

const factorials = [1, 1];
function precomputeFactorials(limit) {
  for (let i = 2; i <= limit; i++) {
    factorials[i] = modularMultiply(factorials[i - 1], i);
  }
}

function modularInverse(a) {
  let b = MODULUS_VAL, u = 1, v = 0, temp;
  while (b) {
    temp = Math.floor(a / b);
    a -= temp * b;
    u -= temp * v;
    temp = a;
    a = b;
    b = temp;
    temp = u;
    u = v;
    v = temp;
  }
  u %= MODULUS_VAL;
  return u < 0 ? u + MODULUS_VAL : u;
}

function modularPermutations(n, r) {
  const nMinusR = (n - r + MODULUS_VAL) % MODULUS_VAL;
  return modularMultiply(factorials[n], modularInverse(factorials[nMinusR]));
}

function modularExponentiation(base, exponent) {
  let result = 1;
  let currentBase = base;
  let currentExponent = exponent;
  while (currentExponent > 0) {
    if (currentExponent & 1) {
      result = modularMultiply(currentBase, result);
    }
    currentBase = modularMultiply(currentBase, currentBase);
    currentExponent >>= 1;
  }
  return result;
}

console.log(mainProcessor());

function mainProcessor() {
  const queryCount = inputData.readNextItem();
  const resultsArray = Array(queryCount).fill(0);

  precomputeFactorials(MODULUS_VAL);

  const calculateQueryResult = (baseVal, diffVal, exponentVal) => {
    if (exponentVal >= MODULUS_VAL || baseVal === 0) {
      return 0;
    }

    if (diffVal === 0) {
      return modularExponentiation(baseVal, exponentVal);
    } else {
      const diffInverse = modularInverse(diffVal);
      const termXDivD = modularMultiply(baseVal, diffInverse);
      const intermediateA = (MODULUS_VAL - termXDivD + MODULUS_VAL) % MODULUS_VAL;
      
      const permutationsResult = modularPermutations(intermediateA, exponentVal);
      const modInverseTerm = modularExponentiation(MODULUS_VAL - diffVal, exponentVal);
      
      return modularMultiply(permutationsResult, modInverseTerm);
    }
  };

  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const currentQueryParameters = inputData.readLineItems();
    const baseVal = currentQueryParameters[0];
    const diffVal = currentQueryParameters[1];
    const exponentVal = currentQueryParameters[2];

    resultsArray[queryIndex] = calculateQueryResult(baseVal, diffVal, exponentVal);
  }

  return resultsArray.join("\n");
}
