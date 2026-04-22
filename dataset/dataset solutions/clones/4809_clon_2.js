// This function processes an input string to determine a specific numeric result.
// It analyzes a sequence of numbers based on certain parity and frequency conditions.
function AnalyzeSequence(sourceText) {
  // Break down the entire input string into an array of individual lines.
  let parsedLines = sourceText.split("\n");

  // From the second line of the input, extract and split it into an array of number strings.
  // These represent the sequence of values to be analyzed.
  let numberStrings = parsedLines[1].split(" ");

  // Initialize a flag that represents the validity or final outcome of the analysis.
  // A value of 1 typically signifies a valid state, while 0 indicates an invalid one.
  let finalOutcome = 1;

  // This variable is declared but remains unused throughout the function.
  // It is maintained for structural consistency with the original code pattern.
  let unusedCounter = 0;

  // Create an array to serve as a frequency map for the numbers encountered.
  // Its indices will correspond to the numbers, and values will be their counts.
  let valueCounts = [];

  // Initialize the first 'numberStrings.length' elements of the frequency map to zero.
  // This ensures that accesses like `valueCounts[initIterator]` are safe and defined.
  for (let initIterator = 0; initIterator < numberStrings.length; initIterator++) {
    valueCounts[initIterator] = 0;
  }

  // Iterate through the array of number strings to calculate their frequencies.
  // This loop also performs an initial validation check.
  for (let scanIndex = 0; scanIndex < numberStrings.length; scanIndex++) {
    // Increment the count for the current number string. JavaScript implicitly converts
    // the string to a number for use as an array index if it's a valid integer.
    valueCounts[numberStrings[scanIndex]]++;

    // If any number's frequency exceeds two, the sequence is immediately deemed invalid.
    if (valueCounts[numberStrings[scanIndex]] > 2) {
      finalOutcome = 0; // Set the outcome flag to invalid.
      break; // Terminate the loop as the sequence is already invalid.
    }
  }

  // Perform a specific validation check based on the parity of the first number in the input.
  // `parseInt` is used to ensure the comparison is done with the numerical value of the string.
  if (parseInt(parsedLines[0]) % 2 === 1 && valueCounts[0] !== 1) {
    // If the first input number is odd AND the count of zero is not exactly one, it's invalid.
    finalOutcome = 0;
  } else {
    // If the initial check passes, proceed with a more detailed validation of frequencies
    // for numbers from 1 up to the length of the number sequence.
    for (let checkIndex = 1; checkIndex < numberStrings.length; checkIndex++) {
      // Pre-calculate parity conditions for readability.
      const isFirstLineEven = parseInt(parsedLines[0]) % 2 === 0;
      const isCurrentIndexOdd = checkIndex % 2 === 1;
      const isCurrentIndexEven = checkIndex % 2 === 0;

      // This complex condition checks several scenarios for invalidity:
      // 1. First line even, current index odd, and its count is not 2.
      // 2. First line odd, current index even, and its count is not 2.
      // 3. First line even, current index even, and its count is not 0.
      // 4. First line odd, current index odd, and its count is not 0.
      if (
        (isFirstLineEven && isCurrentIndexOdd && valueCounts[checkIndex] !== 2) ||
        (!isFirstLineEven && isCurrentIndexEven && valueCounts[checkIndex] !== 2) ||
        (isFirstLineEven && isCurrentIndexEven && valueCounts[checkIndex] !== 0) ||
        (!isFirstLineEven && isCurrentIndexOdd && valueCounts[checkIndex] !== 0)
      ) {
        finalOutcome = 0; // Mark the sequence as invalid.
        break; // Exit the validation loop immediately.
      }
    }
  }

  // If after all checks, the sequence is still considered valid (finalOutcome is 1),
  // calculate the final numerical result.
  if (finalOutcome === 1) {
    // Calculate (length of sequence / 2) squared, modulo (10^9 + 7).
    // `parseInt` ensures integer division before squaring.
    let halfLength = parseInt(numberStrings.length / 2);
    finalOutcome = Math.pow(halfLength, 2) % (Math.pow(10, 9) + 7);
  }

  // Output the computed final outcome to the standard console.
  console.log('%s', finalOutcome);
}

// This utility function is designed for local testing, typically in a web browser environment.
// It fetches input from an HTML element and passes it to the main analysis function.
function runLocalTest() {
  const browserInput = document.getElementById("input").value;
  AnalyzeSequence(browserInput); // Invoke the primary sequence analysis.
}

// This block ensures that the main analysis function is called when the script is executed
// in a Node.js environment, reading its input from standard input (e.g., a file).
AnalyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));