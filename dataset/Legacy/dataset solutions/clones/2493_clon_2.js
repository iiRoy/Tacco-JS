function ProcessInput(rawData) {
  let parsedLines = rawData.trim().split('\n');
  let numElements = Number(parsedLines[0]);
  let charSequence = parsedLines[1].split('');
  let distinctSegments = 0;

  if (numElements > 0) {
    distinctSegments++;
  }

  for (let idx = 0; idx <= numElements; idx++) {
    if (charSequence[idx] !== charSequence[idx + 1]) {
      distinctSegments++;
    }
  }

  console.log(distinctSegments - 1);
}

/*
// This section is for local testing with predefined input.
// It is commented out to ensure the script reads from stdin in production.
const testInput = `5
abcde`;
ProcessInput(testInput);
*/

// The primary execution path: read input from standard input and process it.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
