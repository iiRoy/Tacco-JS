// This function processes the entire input data.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let lines = rawData.split('\n');

  // Parse the first line to get the count of elements.
  const count = parseInt(lines[0], 10);

  // Split the second line into an array of strings for the first sequence.
  let arrayA = lines[1].split(' ');

  // Split the third line into an array of strings for the second sequence.
  let arrayB = lines[2].split(' ');

  // Initialize a variable to accumulate the differences between elements.
  let differenceSum = 0;

  // Declare a variable to hold the current difference in each iteration.
  let currentDiff = 0;

  // Loop through the arrays to calculate the sum of differences.
  for (let idx = 0; idx < count; ++idx) {
    // Calculate the difference between corresponding elements of arrayB and arrayA.
    currentDiff = (parseInt(arrayB[idx], 10) - parseInt(arrayA[idx], 10));
    // Add the current difference to the total sum.
    differenceSum += currentDiff;
  }

  // Check if the total sum of differences is an odd number.
  if (differenceSum % 2 === 1) {
    // If the sum is odd, print "Yes".
    console.log("%s", "Yes");
  } else {
    // If the sum is even, print "No".
    console.log("%s", "No");
  }
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
