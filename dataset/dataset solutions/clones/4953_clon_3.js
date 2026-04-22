// This function processes the raw input data to identify and count mutual connections.
function ProcessConnectionData(receivedPayload) {
  // Deconstruct the incoming payload into its constituent lines.
  // The first line (conventionally 'N') provides the total number of elements,
  // but it is not directly utilized in this specific logic, so we discard it.
  const [_, rawPointerSequence] = receivedPayload.split('\n');

  // Convert the string of space-separated numeric pointers into an array of integers.
  // Each value in 'connectionTargets' represents where the element at its index points.
  const connectionTargets = rawPointerSequence
    .trim() // Remove any leading/trailing whitespace from the line.
    .split(' ') // Split the string by spaces to get individual pointer strings.
    .map(valStr => {
      // Explicitly convert each string to a number.
      // Using Number() is a clear way to perform this conversion.
      const parsedValue = Number(valStr);
      // A robust implementation might include error handling for non-numeric strings,
      // but for typical competitive programming scenarios, input is assumed valid.
      return parsedValue;
    });

  let reciprocalLinkagesCount = 0; // Initialize a counter for mutually pointing elements.

  // Iterate through each potential source element in the 'connectionTargets' array.
  // 'sourceIndex' refers to the 0-based index of the current element.
  for (let sourceIndex = 0; sourceIndex < connectionTargets.length; sourceIndex++) {
    const currentSourcePointer = connectionTargets[sourceIndex];

    // The problem statement implies 1-based indexing for the pointer values.
    // Convert the 1-based pointer value to a 0-based array index.
    const destinationIndex = currentSourcePointer - 1;

    // Implement a guard clause to ensure the 'destinationIndex' is within valid array bounds.
    // This prevents potential errors if pointers point outside the array.
    if (destinationIndex >= 0 && destinationIndex < connectionTargets.length) {
      const destinationElementValue = connectionTargets[destinationIndex];

      // Check if the element at 'destinationIndex' points back to the original source element.
      // The original source element is identified by its 1-based index: 'sourceIndex + 1'.
      if (destinationElementValue === (sourceIndex + 1)) {
        reciprocalLinkagesCount++; // Increment the counter if a mutual link is found.
      }
    }
  }

  // Each reciprocal pair (A points to B, and B points to A) will be counted twice
  // (once when A is the source, and once when B is the source).
  // Therefore, divide the total count by two to get the unique number of such pairs.
  const finalUniquePairCount = reciprocalLinkagesCount / 2;

  // Output the computed result to the standard output.
  console.log(finalUniquePairCount);
}

// --- DO NOT MODIFY THE FOLLOWING SECTION ---
// This part ensures the script can read input from standard input
// and invoke the main processing function with the received data.
ProcessConnectionData(require("fs").readFileSync("/dev/stdin", "utf8"));