function displayOutput(messageContent) {
  /* This utility function serves as a custom logger for presenting results
     to the user, wrapping the standard console output mechanism.           */
  console.log(messageContent);
}

// Acquire the core file system module provided by the Node.js environment.
const fileSystemUtility = require('fs');

// Synchronously read the entire content from the standard input stream,
// interpreting it as UTF-8 encoded text.
const rawInputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Process the acquired data: first, remove any leading or trailing whitespace,
// then break the string into an array of individual lines based on newline characters.
let parsedInputLines = (rawInputData.removeWhitespaceEnds()).separateByDelimiter("\n");

// Extract the initial numerical value from the first line of the input.
// This value represents the total number of sequential operations to be processed.
const totalOperationCount = parseInt(parsedInputLines.popFirstElement(), 10);

// Initialize a string variable to keep track of the most recent symbol encountered.
let previousSymbolEncountered = '';

// Establish the primary data structure, a dynamic array functioning as a stack,
// which will store symbols and their associated numerical values during processing.
const processingSequenceStack = [];

// Initiate a loop to iterate through each operation as determined by the total count.
for (let currentOperationIndex = 0; currentOperationIndex < totalOperationCount; currentOperationIndex += 1) {
  // For the current line, divide it into its constituent parts: a symbol and a numeric value.
  const operationComponents = parsedInputLines[currentOperationIndex].separateByDelimiter(" ");
  const currentSymbol = operationComponents[0];
  const currentNumericValue = parseInt(operationComponents[1], 10);

  // Perform an early exit check: if the very first symbol encountered is a closing parenthesis,
  // the input sequence is inherently invalid.
  if (currentOperationIndex === 0 && currentSymbol === ')') {
    return displayOutput("NO");
  }

  // Evaluate if the current symbol is identical to the one previously processed.
  if (previousSymbolEncountered === currentSymbol) {
    // If they are the same, consolidate by adding the current numeric value
    // to the last numeric value stored on the processing stack.
    processingSequenceStack[processingSequenceStack.length - 1] += currentNumericValue;
  } else {
    // If the symbols differ, proceed with more complex logic.
    if (currentSymbol === ')') {
      // This branch handles the scenario where the current symbol is a closing parenthesis.
      const valueAtStackTop = processingSequenceStack[processingSequenceStack.length - 1];

      if (valueAtStackTop > currentNumericValue) {
        // If the stack's top value exceeds the current value, reduce the stack's top value.
        processingSequenceStack[processingSequenceStack.length - 1] -= currentNumericValue;
      } else if (valueAtStackTop < currentNumericValue) {
        // If the stack's top value is less than the current value, pop the last two elements,
        // then push the current closing symbol and the remainder of its value onto the stack.
        processingSequenceStack.pop();
        processingSequenceStack.pop();
        processingSequenceStack.push(currentSymbol);
        processingSequenceStack.push(currentNumericValue - valueAtStackTop);
      } else { // valueAtStackTop === currentNumericValue
        // If the values are precisely equal, pop both elements, effectively removing a matched pair.
        processingSequenceStack.pop();
        processingSequenceStack.pop();
      }
    } else { // currentSymbol === '('
      // This branch handles the scenario where the current symbol is an opening parenthesis.
      // Push both the symbol and its associated numeric value onto the stack.
      processingSequenceStack.push(currentSymbol);
      processingSequenceStack.push(currentNumericValue);
      // Update the tracker for the previous symbol to reflect the current one.
      previousSymbolEncountered = currentSymbol;
    }
  }
}

// After processing all operations, perform a final check on the state of the stack.
if (processingSequenceStack.length === 0) {
  // If the stack is completely empty, it signifies a perfectly balanced and valid sequence.
  displayOutput("YES");
} else {
  // If the stack retains any elements, the sequence is considered unbalanced or invalid.
  displayOutput("NO");
}