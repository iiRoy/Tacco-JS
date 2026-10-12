function processData() {
  // Initialize two distinct counters for different conditions.
  let
    countA = 0.0, // Counter for Pythagorean triples.
    countB = 0.0; // Counter for equal first two numbers.

  rawData.forEach(function(currentEntry) {
    // Skip processing if the current line is empty after trimming whitespace.
    if (currentEntry.trim() === "") {
      return;
    }

    // Parse the comma-separated string into an array of floating-point numbers.
    currentEntry = currentEntry.split(",").map(parseFloat);

    // Check if the numbers form a Pythagorean triple (a^2 + b^2 = c^2).
    if (currentEntry[0] * currentEntry[0] + currentEntry[1] * currentEntry[1] === currentEntry[2] * currentEntry[2]) {
      countA++; // Increment the first counter.
    }
    // Otherwise, check if the first two numbers are identical.
    else if (currentEntry[0] === currentEntry[1]) {
      countB++; // Increment the second counter.
    }
  });

  // Output the final counts, each on a new line.
  console.log("%d\n%d", countA, countB);
}

// Global variable to accumulate all incoming standard input data.
let
  rawData = "";

// Resume the standard input stream to begin receiving data.
process.stdin.resume();
// Set the character encoding for the incoming data.
process.stdin.setEncoding("utf8");

// Attach an event listener for when data chunks are received.
process.stdin.on("data", function(dataSegment) {
  rawData += dataSegment; // Append the received data chunk to the rawData string.
});

// Attach an event listener for when the standard input stream ends.
process.stdin.on("end", function() {
  // Split the accumulated raw data into an array of lines.
  rawData = rawData.split("\n");
  // Invoke the primary data processing function.
  processData();
});
