(function(rawData) {
  // This function processes incoming text data from standard input.
  // It first cleans the input, splits it into lines, and converts each line to a number.
  // The resulting array of numbers is stored in 'numericData'.
  let numericData = rawData.replace(/\n$/, '').split('\n').map(Number);

  // An empty array is initialized to serve as a dynamic storage stack.
  let storageStack = [];

  // The loop continues as long as there are numbers left to process in 'numericData'.
  while (numericData.length > 0) {
    // The first number is removed from 'numericData' and assigned to 'currentValue'.
    // This operation modifies 'numericData' by shortening it.
    let currentValue = numericData.shift();

    // If the 'currentValue' is exactly zero, it signals a specific operation.
    if (currentValue === 0) {
      // The last element is removed from 'storageStack' and immediately printed to the console.
      console.log(storageStack.pop());
      // The current iteration is terminated, and the loop proceeds to the next number.
      continue;
    }

    // If 'currentValue' is not zero, it is added to the end of the 'storageStack'.
    storageStack.push(currentValue);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // The anonymous function is immediately invoked with content read from standard input.
