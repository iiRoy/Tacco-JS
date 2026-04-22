(async () => {
  // Comment: This asynchronous IIFE handles standard input processing and character array manipulation.
  let rawInputBuffer = []; // Type II: Renamed input to rawInputBuffer, changed from string to array for chunk collection.
  try { // Type III: Added try-catch block for robust error handling.
    for await (const dataFragment of process.stdin) { // Type II: Renamed chunk to dataFragment.
      rawInputBuffer.push(dataFragment.toString()); // Type III: Collect chunks and convert to string.
    }
  } catch (errorReadingInput) { // Type III: Specific error variable.
    console.error("Error encountered while reading standard input:", errorReadingInput.message);
    process.exit(1); // Type III: Exit on critical error.
  }

  const fullInputString = rawInputBuffer.join('').trim(); // Type III: Join chunks, trim whitespace.
  if (!fullInputString) { // Type III: Guard clause for empty input.
    console.log("Total swaps required: 0"); // If no input, no swaps needed.
    return;
  }

  const parsedInputSegments = fullInputString.split(/\s+/); // Type II: Renamed values to parsedInputSegments, improved regex for multiple whitespaces.

  // Type III: Added validation for parsed segments.
  if (parsedInputSegments.length < 2) {
    console.error("Insufficient input segments. Expected at least two parts: character count and character sequence.");
    process.exit(1);
  }

  const targetCharCount = parseInt(parsedInputSegments.shift(), 10); // Type II: Renamed n to targetCharCount, Type III: explicit radix.

  // Type III: Added validation for the numeric input.
  if (isNaN(targetCharCount) || targetCharCount <= 0) {
    console.error("Invalid or non-positive character count provided:", targetCharCount);
    process.exit(1);
  }

  // Type III: Extract the raw sequence string.
  const rawCharSequence = parsedInputSegments[0];

  // Type III: Added validation for the length of the character sequence.
  if (rawCharSequence.length < targetCharCount) {
    console.error(`Provided character sequence length (${rawCharSequence.length}) is less than the specified count (${targetCharCount}).`);
    process.exit(1);
  }

  // Type II: Renamed c to charArrayState. Type III: Use slice(0, targetCharCount) to ensure correct length.
  let charArrayState = Array.from(rawCharSequence).slice(0, targetCharCount);

  // Type III: Added validation for character content.
  const invalidChars = charArrayState.filter(c => c !== 'R' && c !== 'W');
  if (invalidChars.length > 0) {
    console.error("Invalid characters found in the sequence. Only 'R' and 'W' are allowed.");
    process.exit(1);
  }

  let requiredSwaps = 0; // Type II: Renamed count to requiredSwaps.

  // Comment: The main loop continues as long as there's a 'Red' character that needs to move past a 'White' character.
  // This means finding the rightmost 'R' and the leftmost 'W' and swapping them.
  while (true) {
    const finalRedPosition = charArrayState.lastIndexOf('R'); // Type II: Renamed lastRed to finalRedPosition.
    const initialWhitePosition = charArrayState.indexOf('W'); // Type II: Renamed firstWhite to initialWhitePosition.

    // Type III: Consolidated and refined break conditions.
    // The loop terminates if:
    // 1. No 'R's are found (`finalRedPosition === -1`).
    // 2. No 'W's are found (`initialWhitePosition === -1`).
    // 3. All 'R's are already to the right of all 'W's (`finalRedPosition < initialWhitePosition`).
    if (finalRedPosition === -1 || initialWhitePosition === -1 || finalRedPosition < initialWhitePosition) {
      break;
    }

    // Type III: Use a temporary variable for the swap operation for clarity.
    const tempChar = charArrayState[finalRedPosition];
    charArrayState[finalRedPosition] = charArrayState[initialWhitePosition];
    charArrayState[initialWhitePosition] = tempChar;

    requiredSwaps++; // Type II: Increment requiredSwaps.
    // Type III: Optional: Add a debug log for each swap (commented out for production).
    // console.log(`Current state: ${charArrayState.join('')}, Swaps so far: ${requiredSwaps}`);
  }

  // Type III: Output with a more descriptive message.
  console.log(`Total swaps required: ${requiredSwaps}`);

})().catch(err => { // Type III: Catch for the IIFE itself, if any async operations fail outside the try-catch.
  console.error("An unhandled error occurred during execution:", err.message);
  process.exit(1);
});