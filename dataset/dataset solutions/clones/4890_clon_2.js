// This function handles the entirety of the provided raw input data.
function ProcessInput(rawData) {
  // Each line of the input is separated by newlines; here we split it into an array of strings.
  const linesOfData = rawData.split("\n");

  // The second line of input is split by spaces to get individual elements.
  let secondLineElements = linesOfData[1].split(" ");

  // The first line contains a number, which we parse as an integer.
  const countVal = parseInt(linesOfData[0], 10);

  // We initialize an array with a specific size determined by the parsed number.
  let initialNumbers = new Array(2 * countVal - 1);

  // Iterate to populate the initial array by converting string elements to integers.
  for (let idx = 0; idx < initialNumbers.length; idx++) {
    initialNumbers[idx] = parseInt(secondLineElements[idx], 10);
  }

  // This helper function computes the next iteration of the number sequence.
  function deriveNextSequence(currentSequence) {
    // A new array is created to store the results of the current iteration.
    let futureSequence = new Array(currentSequence.length - 2);

    // Loop through the current sequence, taking triplets and finding their middle value.
    for (let subIdx = 0; subIdx < futureSequence.length; subIdx++) {
      // Extract a sub-array of three elements.
      const tripletSlice = currentSequence.slice(subIdx, subIdx + 3);

      // Sort the triplet and pick the middle element (index 1).
      // The custom sort function ensures numeric comparison.
      futureSequence[subIdx] = tripletSlice.sort(
        function(elemA, elemB) {
          return (elemA < elemB ? -1 : 1);
        }
      )[1];
    }
    return futureSequence; // Return the newly generated sequence.
  }

  // Start with the initial array as our working sequence.
  let workingSequence = initialNumbers;

  // Continue processing the sequence until only one element remains.
  while (workingSequence.length > 1) {
    workingSequence = deriveNextSequence(workingSequence);
  }

  // Display the final remaining value from the processed sequence.
  console.log('%d', workingSequence[0]);
}
// Do not modify the following line; it handles reading input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));