const processInputData = (payloadText) => {
  let collectedStrings = [];
  let lineCursor = 0;
  let startOfLinePosition = 0;
  let lineIdentifier = 0;

  // Process characters to extract lines, skipping the first (N) line.
  while (lineCursor < payloadText.length) {
    const currentChar = payloadText[lineCursor];
    if (currentChar === '\n') {
      if (lineIdentifier > 0) { // All lines after the first (N)
        collectedStrings.push(payloadText.substring(startOfLinePosition, lineCursor));
      }
      lineIdentifier++;
      startOfLinePosition = lineCursor + 1; // Start of next line
    }
    lineCursor++;
  }

  // Handle the very last line scenario to match `split('\n')` behavior.
  // This covers cases where the input doesn't end with a newline,
  // or where it does, implying an empty string at the end.
  if (lineIdentifier === 0 && payloadText.length > 0) {
    // Input was just "N" with no trailing newline, no other lines.
    // collectedStrings remains empty as only N was present.
  } else if (lineIdentifier > 0 && startOfLinePosition < payloadText.length) {
    // The last segment of the input forms a non-empty line after the last '\n' (or if no '\n' after N).
    // e.g., "3\napple" -> adds "apple" to collectedStrings.
    collectedStrings.push(payloadText.substring(startOfLinePosition, payloadText.length));
  } else if (lineIdentifier > 0 && startOfLinePosition === payloadText.length && payloadText[payloadText.length - 1] === '\n') {
    // The input ended with a newline, implying an empty line as the last element.
    // This matches `split('\n')` behavior for trailing newlines.
    // e.g., "3\napple\n" -> adds "" to collectedStrings.
    // e.g., "3\n" -> adds "" to collectedStrings.
    collectedStrings.push("");
  }


  let encounteredElements = {}; // Use an object as a hash map for tracking uniqueness
  let distinctElementCount = 0;
  let currentElementIndex = 0;

  // Iterate through the collected strings to count unique ones
  while (currentElementIndex < collectedStrings.length) {
    const currentItem = collectedStrings[currentElementIndex];
    if (encounteredElements[currentItem] === undefined) { // Check if this string has not been seen before
      encounteredElements[currentItem] = true; // Mark as seen
      distinctElementCount++; // Increment unique count
    }
    currentElementIndex++;
  }

  console.log(distinctElementCount);
};

// Use a different variable name for the input source and module
const systemInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');
processInputData(systemInput);