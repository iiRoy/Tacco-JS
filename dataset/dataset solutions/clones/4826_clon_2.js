function ProcessInput(sourceText) {
  // This function processes the given text by removing specific patterns.
  // It checks if the text becomes empty after removals.
  let remainingContent = sourceText
    .replace(/eraser/g, '') // Remove 'eraser' occurrences
    .replace(/erase/g, '')  // Then remove 'erase' occurrences
    .replace(/dreamer/g, '')// Next, remove 'dreamer' occurrences
    .replace(/dream/g, ''); // Finally, remove 'dream' occurrences

  // Determine the output based on whether any content remains.
  if (remainingContent === '') {
    console.log("YES"); // All patterns were successfully removed.
  } else {
    console.log("NO");  // Some content remained after pattern removal.
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
