class InputDataFlow {
  constructor(rawInputContent) {
    this.sourceLines = rawInputContent.trim().split('\n');
    this.currentLineCursor = 0;
    this.tokenQueue = [];
  }

  // Extracts a single numeric value from the current line's token stream.
  // Mimics the original's behavior of splitting a line, reversing it, and then popping.
  // This means it consumes tokens from left to right as they appeared in the original line.
  acquireNextScalar() {
    while (this.tokenQueue.length === 0) {
      if (this.currentLineCursor >= this.sourceLines.length) {
        throw new Error("End of input stream reached.");
      }
      // Splits the current line by space, reverses the resulting array,
      // then assigns it to tokenQueue. The original code then pops, which
      // effectively retrieves elements in their original order.
      this.tokenQueue = this.sourceLines[this.currentLineCursor++].split(' ').reverse();
    }
    return Number(this.tokenQueue.pop());
  }

  // Extracts all numeric values from the current line as an array.
  acquireLineElements() {
    if (this.currentLineCursor >= this.sourceLines.length) {
      throw new Error("End of input stream reached.");
    }
    const elements = this.sourceLines[this.currentLineCursor++].split(' ');
    return elements.map(Number);
  }

  // Extracts a specified number of lines as a 2D array of numbers.
  acquireMatrixData(rowCount) {
    const matrixResult = [];
    for (let i = 0; i < rowCount; i++) {
      matrixResult.push(this.acquireLineElements());
    }
    return matrixResult;
  }

  // Extracts a specified number of lines as a 1D array of numbers.
  acquireVectorData(elementCount) {
    const vectorResult = [];
    for (let i = 0; i < elementCount; i++) {
      if (this.currentLineCursor >= this.sourceLines.length) {
        throw new Error("End of input stream reached.");
      }
      vectorResult.push(Number(this.sourceLines[this.currentLineCursor++]));
    }
    return vectorResult;
  }
}

// Constant for modular arithmetic operations
const MODULO_CONSTANT = 1000000007;

// Recursively constructs a multi-dimensional array filled with an initial value.
// Provides a functional alternative to the original's eval-based `xArray`.
const constructNdArray = (initialFillValue, ...dimensions) => {
  const recursiveBuilder = (dims) => {
    if (dims.length === 0) {
      return initialFillValue;
    }
    const currentDimSize = dims[0];
    const remainingDims = dims.slice(1);
    return Array.from({ length: currentDimSize }, () => recursiveBuilder(remainingDims));
  };
  return recursiveBuilder(dimensions);
};

// Computes the product of multiple numbers modulo MODULO_CONSTANT.
// Uses `reduce` for a functional approach, replacing the original's imperative loop with bitwise optimization.
const computeProductMod = (...factors) => {
  return factors.reduce((accumulator, currentFactor) => {
    return (accumulator * currentFactor) % MODULO_CONSTANT;
  }, 1);
};

// Memoization cache for factorial results
const factorialCache = new Map([[0, 1], [1, 1]]);

// Recursively calculates factorial modulo MODULO_CONSTANT with memoization.
// Replaces the original's iterative memoized factorial calculation.
const deriveFactorialMod = (numValue) => {
  if (factorialCache.has(numValue)) {
    return factorialCache.get(numValue);
  }
  if (numValue < 0) throw new Error("Factorial of negative numbers is undefined.");
  
  const prevFactorial = deriveFactorialMod(numValue - 1);
  const currentFactorial = (prevFactorial * numValue) % MODULO_CONSTANT;
  factorialCache.set(numValue, currentFactorial);
  return currentFactorial;
};

// Calculates the modular multiplicative inverse using the extended Euclidean algorithm.
// Renames variables and uses array destructuring for clarity and different syntax.
const calculateModularInverse = (inputVal) => {
  let a_val = inputVal;
  let b_val = MODULO_CONSTANT;
  let x_coeff0 = 1;
  let x_coeff1 = 0;

  while (b_val !== 0) {
    const quotient = Math.floor(a_val / b_val);
    [a_val, b_val] = [b_val, a_val % b_val]; // Swap and update
    [x_coeff0, x_coeff1] = [x_coeff1, x_coeff0 - quotient * x_coeff1]; // Update coefficients
  }

  return (x_coeff0 % MODULO_CONSTANT + MODULO_CONSTANT) % MODULO_CONSTANT;
};

// Computes "n choose k" modulo MODULO_CONSTANT using factorials and modular inverse.
// Renames the function and its internal calls.
const evaluateCombinationsMod = (totalElements, selectElements) => {
  if (selectElements < 0 || selectElements > totalElements) return 0;
  if (selectElements === 0 || selectElements === totalElements) return 1;
  if (selectElements > totalElements / 2) selectElements = totalElements - selectElements; // Symmetry optimization

  const numeratorFactor = deriveFactorialMod(totalElements);
  const denominatorInverse = computeProductMod(
    calculateModularInverse(deriveFactorialMod(selectElements)),
    calculateModularInverse(deriveFactorialMod(totalElements - selectElements))
  );
  return computeProductMod(numeratorFactor, denominatorInverse);
};

// Helper function to calculate n*(n-1)/2, equivalent to original 'f'.
const computePairCount = (value) => {
  return (value * (value - 1)) / 2;
};

// The primary computation logic, replacing the original `main` function.
// Uses functional array methods (`Array.from`, `map`, `flat`, `reduce`)
// instead of imperative for loops for grid creation and summation.
const orchestrateSolution = () => {
  const inputStreamProcessor = new InputDataFlow(require("fs").readFileSync("/dev/stdin", "utf8"));

  const gridRows = inputStreamProcessor.acquireNextScalar();
  const gridColumns = inputStreamProcessor.acquireNextScalar();
  const selectionCount = inputStreamProcessor.acquireNextScalar();

  // Create and populate the grid using functional array methods
  const computedGrid = Array.from({ length: gridRows }, (_, yIdx) =>
    Array.from({ length: gridColumns }, (_, xIdx) => {
      const xContribution = (computePairCount(xIdx + 1) + computePairCount(gridColumns - xIdx)) * gridRows;
      const yContribution = (computePairCount(yIdx + 1) + computePairCount(gridRows - yIdx)) * gridColumns;
      return xContribution + yContribution;
    })
  );

  // Sum all elements in the computed grid, applying modulo at each step
  const finalAccumulatedSum = computedGrid.flat().reduce((currentAccum, elementValue) => {
    return (currentAccum + elementValue) % MODULO_CONSTANT;
  }, 0);

  // Perform the final calculation using the redefined helper functions
  const combinationFactor = evaluateCombinationsMod(gridRows * gridColumns - 2, selectionCount - 2);
  const inverseOfTwo = calculateModularInverse(2);

  return computeProductMod(finalAccumulatedSum, combinationFactor, inverseOfTwo);
};

// Execute the main computation and print the result
console.log(orchestrateSolution());