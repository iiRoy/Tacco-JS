const fs = require('fs');

/**
 * Pushes an item onto the provided stack.
 * @param {any} itemToStore The element to be added to the top of the stack.
 * @param {Array<any>} targetStack The array representing the stack.
 * @returns {Array<any>} The modified stack.
 */
function placeOnStack(itemToStore, targetStack) {
  targetStack.push(itemToStore);
  return targetStack;
}

/**
 * Performs addition on the top two elements of the stack.
 * Pops two operands, adds them, and pushes the result back.
 * Throws an error if there are not enough operands.
 * @param {Array<number>} operandStack The stack containing numeric operands.
 * @returns {Array<number>} The stack with the result of the addition.
 */
function executeAddition(operandStack) {
  if (operandStack.length < 2) {
    throw new Error("Stack underflow: Not enough operands for addition.");
  }
  const secondTerm = operandStack.pop();
  const firstTerm = operandStack.pop();
  const sumResult = firstTerm + secondTerm;
  operandStack.push(sumResult);
  return operandStack;
}

/**
 * Performs subtraction on the top two elements of the stack.
 * Pops two operands (first is minuend, second is subtrahend), subtracts, and pushes the result back.
 * Throws an error if there are not enough operands.
 * @param {Array<number>} operandStack The stack containing numeric operands.
 * @returns {Array<number>} The stack with the result of the subtraction.
 */
function performSubtraction(operandStack) {
  if (operandStack.length < 2) {
    throw new Error("Stack underflow: Not enough operands for subtraction.");
  }
  const subtrahend = operandStack.pop();
  const minuend = operandStack.pop();
  const differenceResult = minuend - subtrahend;
  operandStack.push(differenceResult);
  return operandStack;
}

/**
 * Performs multiplication on the top two elements of the stack.
 * Pops two operands, multiplies them, and pushes the result back.
 * Throws an error if there are not enough operands.
 * @param {Array<number>} operandStack The stack containing numeric operands.
 * @returns {Array<number>} The stack with the result of the multiplication.
 */
function computeProduct(operandStack) {
  if (operandStack.length < 2) {
    throw new Error("Stack underflow: Not enough operands for multiplication.");
  }
  const factorTwo = operandStack.pop();
  const factorOne = operandStack.pop();
  const productResult = factorOne * factorTwo;
  operandStack.push(productResult);
  return operandStack;
}

// A map to associate operator symbols with their corresponding functions.
const operatorDispatchMap = {
  '+': executeAddition,
  '-': performSubtraction,
  '*': computeProduct,
};

/**
 * Applies a given arithmetic operation to the data stack.
 * Uses a dispatch map to call the correct function based on the operator symbol.
 * Throws an error for unknown or unsupported operators.
 * @param {string} operatorSymbol The string representation of the operator ('+', '-', '*').
 * @param {Array<number>} dataStack The stack on which the operation should be performed.
 * @returns {Array<number>} The modified data stack.
 */
function applyArithmeticOperation(operatorSymbol, dataStack) {
  const handlerFunction = operatorDispatchMap[operatorSymbol];
  if (!handlerFunction) {
    throw new Error(`Unsupported or invalid operator encountered: "${operatorSymbol}"`);
  }
  return handlerFunction(dataStack);
}

/**
 * Parses a single token string from the input.
 * Attempts to convert it to a number. If successful, returns the number;
 * otherwise, returns the original string. Handles potential floating point numbers.
 * @param {string} tokenString The string token to parse.
 * @returns {number|string|null} The parsed number, the original string, or null if empty/invalid.
 */
function parseTokenToValue(tokenString) {
  if (!tokenString || tokenString.trim() === '') {
    return null;
  }
  const potentialNumber = Number.parseFloat(tokenString);
  if (Number.isFinite(potentialNumber)) {
    return potentialNumber;
  } else {
    return tokenString;
  }
}

// Read raw input from standard input (file descriptor 0)
const rawInputLine = fs.readFileSync(0, 'utf8').trim();

// Split the input line into segments using one or more whitespace characters
const initialInputSegments = rawInputLine.split(/\s+/);

// Process each raw segment into a number or operator string, filtering out any nulls
const expressionComponents = initialInputSegments
  .map(parseTokenToValue)
  .filter(component => component !== null);

// This array will serve as our RPN calculation stack.
const calculationPipeline = [];

// Iterate over each component of the parsed expression.
// This implements the core Reverse Polish Notation (RPN) logic.
for (const currentComponent of expressionComponents) {
  if (typeof currentComponent === 'number') {
    placeOnStack(currentComponent, calculationPipeline);
  } else if (typeof currentComponent === 'string') {
    try {
      applyArithmeticOperation(currentComponent, calculationPipeline);
    } catch (operationError) {
      console.error(`Calculation error for operator "${currentComponent}": ${operationError.message}`);
      process.exit(1);
    }
  } else {
    console.warn(`Warning: Skipping unexpected input component type: ${typeof currentComponent} - ${currentComponent}`);
  }
}

// After processing all components, the stack should ideally contain a single result.
if (calculationPipeline.length === 1 && typeof calculationPipeline[0] === 'number') {
  console.log(calculationPipeline[0]);
} else if (calculationPipeline.length === 0) {
  console.error("Error: The expression resulted in an empty stack. No final result.");
  process.exit(1);
} else {
  console.error(`Error: Malformed expression or unexpected stack state. Final stack has ${calculationPipeline.length} elements: ${calculationPipeline.join(', ')}`);
  process.exit(1);
}