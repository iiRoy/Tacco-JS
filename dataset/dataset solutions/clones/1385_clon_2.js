process.stdin.on(
  "data",
  function (inputBuffer) {
    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and then split it into an array of individual lines based on newline characters.
    (String(inputBuffer)).trim().split("\n").some(
      function (currentLine, lineIndex) {
        // Evaluate if the current line, when coerced to a number, results in a falsy value (e.g., 0, NaN).
        // If it's not a valid positive number, we skip processing this particular line.
        if (!Number(currentLine)) {
          return;
        }
        // For valid numeric lines, print the case number (1-indexed) along with the line's content.
        console.log("Case", lineIndex + 1 + ":", currentLine);
      }
    );
  }
).resume(); // Keep the standard input stream active to continue receiving data.
