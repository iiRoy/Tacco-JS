function ProcessInput(rawData) {
  "use strict"; // Enforce strict mode for cleaner code.

  // Split the raw input string into an array of lines.
  const linesArray = rawData.split("\n");

  // The first line contains 'n', which is parsed as an integer.
  const countN = parseInt(linesArray.shift(), 10); // Parse the first line as an integer.

  // The second line contains space-separated numbers for 'bn'.
  // These are split, then each element is parsed as an integer.
  const bValues = linesArray.shift().split(" ").map(elementStr => parseInt(elementStr, 10));

  // Initialize 'aSequence' with the first element of 'bValues'.
  let aSequence = [bValues[0]];

  // Iterate through each value in 'bValues' to build 'aSequence'.
  bValues.forEach(currentB => {
    // Retrieve the last element added to 'aSequence'.
    const previousA = aSequence.pop();

    // Compare the last 'a' element with the current 'b' element.
    if (previousA > currentB) {
      // If 'previousA' is greater, add 'currentB' twice.
      aSequence.push(currentB);
      aSequence.push(currentB);
    } else {
      // Otherwise, add 'previousA' back, then 'currentB'.
      aSequence.push(previousA);
      aSequence.push(currentB);
    }
  });

  // Calculate the sum of all elements in the final 'aSequence'.
  let totalSum = aSequence.reduce((accumulator, currentValue) => accumulator + currentValue, 0); // Sum all elements.

  // Output the calculated total sum to the console.
  console.log(totalSum);
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
