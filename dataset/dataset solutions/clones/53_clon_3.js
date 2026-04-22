// This self-executing function processes a series of numeric inputs
// from standard input, treating them as commands for a stack-like data structure.
// Non-zero numbers are pushed onto the stack, while a zero signals a pop operation.
// This implementation includes enhanced input validation and structural modifications
// compared to its original form, demonstrating a Type III code clone.
(function(initialDataString) {

  // Define a symbolic constant for the special numeric value that
  // triggers a stack pop operation rather than a push. Using a constant
  // improves readability and maintainability.
  const STACK_POP_INDICATOR_VALUE = 0;

  // Process the raw input string to prepare an ordered collection of numeric entries.
  // This multi-step transformation cleans and parses the input:
  // 1. Utilize `trimEnd()` to robustly remove any trailing newline characters,
  //    preventing an accidental empty string from being processed as a line.
  // 2. Split the cleaned string into an array of individual line contents based on newline characters.
  // 3. Convert each line content into a numeric value using the global `Number()` function.
  //    It's important to note that `Number('')` and `Number('   ')` both result in `0`,
  //    while `Number('abc')` (or any non-numeric string) results in `NaN`.
  const processedNumericEntries = initialDataString
    .trimEnd()
    .split('\n')
    .map(lineContent => Number(lineContent));

  // Initialize our primary data storage. This array will function as a
  // Last-In, First-Out (LIFO) stack, storing numeric values as they are pushed.
  const workingStorageStack = [];

  // Iterate through the prepared numeric entries until the input collection is entirely exhausted.
  // This `while` loop ensures every piece of input is considered for a stack operation.
  while (processedNumericEntries.length > 0) {
    // Extract the next command or value from the beginning of our input stream.
    // The `shift()` method modifies the array in place and returns the removed element.
    const currentCommandOrValue = processedNumericEntries.shift();

    // Type III Addition: Implement a guard clause to handle non-numeric (NaN) inputs.
    // The original code would implicitly push `NaN` onto the stack if it was encountered
    // and was not equal to `0`. This revised version explicitly checks for and skips
    // such malformed inputs for cleaner stack operations, demonstrating an added
    // validation fragment and a change in robustness for invalid input.
    if (Number.isNaN(currentCommandOrValue)) {
      // One could optionally log a warning here for debugging or user feedback,
      // e.g., `console.warn(`Skipping malformed input entry: '${currentCommandOrValue}' detected.`);`
      continue; // Skip the rest of this iteration and fetch the next entry.
    }

    // Evaluate the current entry:
    // If it matches the special indicator for popping, perform a stack pop operation.
    // Otherwise, treat it as a value to be pushed onto the stack.
    if (currentCommandOrValue === STACK_POP_INDICATOR_VALUE) {
      // The original implementation directly calls `array.pop()` and logs its result.
      // If the stack is empty, `array.pop()` returns `undefined`, which `console.log` then prints.
      // This exact functional behavior (logging `undefined` for an empty stack pop) is preserved
      // by storing the result in an intermediate variable before logging.
      const valueToOutput = workingStorageStack.pop();
      console.log(valueToOutput);
    } else {
      // For any other valid numeric value (non-zero and not `NaN`), push it onto the top of the stack.
      workingStorageStack.push(currentCommandOrValue);
    }
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));