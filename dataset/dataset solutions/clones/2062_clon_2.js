function ProcessInput(incomingText) {
  // Split the raw input string into an array of lines based on newline characters.
  // This prepares the data for processing in blocks.
  let textLines = incomingText.split('\n');

  // Iterate through the processed lines, handling two lines at a time.
  // The 'blockIndex' increments by two to process a pair of input lines in each cycle.
  for (let blockIndex = 0; blockIndex < textLines.length; blockIndex += 2) {

    // Convert the first line of the current block (which is a string) into an integer.
    // This value often represents a count or a limit for subsequent operations.
    const primaryValue = Number(textLines[blockIndex]);

    // Take the second line of the current block, split it into individual characters,
    // and store them as an array of strings.
    const digitStrings = textLines[blockIndex + 1].split('');

    // Transform the array of character strings into an array of actual numbers.
    // Each string character is explicitly converted to an integer.
    let numberPool = digitStrings.map(val => parseInt(val, 10));


    // This outer loop controls the reduction steps of the number pool.
    // It starts from 'primaryValue' and continues until 'outerIterator' is greater than 1.
    for (let outerIterator = primaryValue; outerIterator > 1; outerIterator--) {

      // The inner loop processes elements within the current number pool.
      // It iterates 'outerIterator' times for each step of the outer loop.
      for (let innerIterator = 0; innerIterator < outerIterator; innerIterator++) {

        // Calculate the absolute difference between the first two elements in the 'numberPool'.
        const absoluteDelta = Math.abs(numberPool[0] - numberPool[1]);

        // Add this newly computed difference to the end of the 'numberPool'.
        numberPool.push(absoluteDelta);

        // Remove the first element from the 'numberPool'.
        // This effectively shifts all elements to the left and removes the oldest element.
        numberPool.shift();
      }

      // After the inner loop completes, remove the last element from the 'numberPool'.
      // This is part of the reduction logic.
      numberPool.pop();
    }

    // Output the final remaining element in the 'numberPool' to the console.
    // This represents the result of all reduction operations for the current input block.
    console.log(numberPool[0]);
  }
}

// Invoke the main processing function with data read from standard input.
// The file system module is used to read the entire content of '/dev/stdin' as a UTF-8 string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));