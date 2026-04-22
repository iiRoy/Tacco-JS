function processInputData(sourceElements) {
  let combinedContentString;
  try {
    // Mimic the behavior of sourceElements.join('') using a different invocation method.
    // This will correctly concatenate if sourceElements is an array,
    // and throw a TypeError if sourceElements is a string (as String.prototype lacks join).
    combinedContentString = Array.prototype.join.call(sourceElements, '');
  } catch (error) {
    // Re-throw the error to ensure exact same behavior as original for invalid types.
    throw error;
  }

  const forbiddenSequences = new Set(['AAA', 'BBB']);

  // Determine the outcome using a Set lookup and ternary operator for divergence.
  const outcomeIndicator = forbiddenSequences.has(combinedContentString) ? 'No' : 'Yes';

  // Use a different output stream method.
  process.stdout.write(outcomeIndicator + '\n');
}

// Obtain the raw input using a different module specifier (node:fs vs fs)
// and pass it directly to the processing function, mirroring the original's call structure.
const incomingPayload = require('node:fs').readFileSync('/dev/stdin', 'utf8');
processInputData(incomingPayload);