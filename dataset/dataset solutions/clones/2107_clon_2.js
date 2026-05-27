function ProcessInput(rawData) {
  // Process the raw input string: trim, split by newlines, then split each line by spaces.
  let parsedLines = rawData.trim().split("\n").map(function(lineContent) {
    return lineContent.split(" ");
  });

  // Extract the initial string from the first line.
  const initialString = parsedLines[0][0];
  // Parse the number of queries from the second line.
  const numQueries = parseInt(parsedLines[1], 10);

  // Initialize an array to store query instructions.
  let queryInstructions = [];
  // Populate the query instructions array.
  for (let k = 0; k < numQueries; k++) {
    queryInstructions.push(parsedLines[k + 2]);
  }

  // Create a character buffer array, pre-sized to accommodate potential insertions.
  // The size is S.length + Q * 2 to allow Q insertions at the head and Q at the tail.
  let charBuffer = Array.from({
    length: (initialString.length + numQueries * 2)
  }, () => '');

  // Initialize pointers for the head and tail of the active string within the buffer.
  // We start by placing the original string in the middle of the buffer.
  let currentHeadIndex = numQueries;
  let currentTailIndex = numQueries + initialString.length - 1;
  let tempIndex; // A temporary variable for swapping indices during reversal.

  // Copy the characters of the initial string into the central part of the buffer.
  for (let k = 0; k < initialString.length; k++) {
    charBuffer[k + numQueries] = initialString.substr(k, 1);
  }

  // Iterate through each query instruction.
  for (let k = 0; k < numQueries; k++) {
    // Check if the query is a type 1 (reverse operation).
    if (queryInstructions[k][0] === '1') {
      // Reverse the entire character buffer.
      charBuffer = charBuffer.reverse();
      // Adjust head and tail pointers after reversal.
      // The new head is effectively the old tail's position relative to the end of the buffer,
      // and vice-versa.
      tempIndex = currentHeadIndex;
      currentHeadIndex = numQueries - (currentTailIndex - (numQueries + initialString.length - 1));
      currentTailIndex = numQueries + initialString.length - 1 + (numQueries - tempIndex);
      continue; // Move to the next query.
    }

    // Check if the query is a type 2 (insert at head or tail).
    // If the second element is '1', insert at the head.
    if (queryInstructions[k][1] === '1') {
      currentHeadIndex--; // Decrement head pointer.
      charBuffer[currentHeadIndex] = queryInstructions[k][2]; // Insert character.
      continue; // Move to the next query.
    }

    // Otherwise, insert at the tail.
    currentTailIndex++; // Increment tail pointer.
    charBuffer[currentTailIndex] = queryInstructions[k][2]; // Insert character.
  }

  // Join the characters in the active part of the buffer and print the result.
  // The active part is from currentHeadIndex to currentTailIndex (inclusive).
  console.log(charBuffer.slice(currentHeadIndex, currentTailIndex + 1).join(''));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
