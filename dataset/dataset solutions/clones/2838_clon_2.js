/* This function receives the entire block of raw input data. */
function ProcessData(rawData) {
  rawData = rawData.split('\n'); // Divide the incoming text by newline characters.
  let firstLineElements = rawData[0].split(' '); // Extract components from the initial line.
  let firstValue = parseInt(firstLineElements[0]); // Parse the primary numeric entry.
  let secondValue = parseInt(firstLineElements[1]); // Parse the secondary numeric entry.

  if (firstValue === 1) { // Check if the initial number is one.
    console.log(0); // If true, output zero.
  } else {
    console.log(firstValue - secondValue); // Otherwise, calculate and output the difference.
  }
}
/* It is advised not to modify the following line; it handles reading from standard input/output and invoking the primary routine. */
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));