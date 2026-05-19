function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let linesOfData = rawData.split("\n");

  // Split the first line into parts based on space.
  let firstLineParts = linesOfData[0].split(" ");

  // Convert string parts to integers for N and Y.
  // N represents the total number of bills.
  let totalBills = parseInt(firstLineParts[0], 10);
  // Y represents the target sum of money.
  let targetSum = parseInt(firstLineParts[1], 10);

  // Initialize variables to store the counts of each bill type.
  // -1 indicates no solution found yet.
  let countTenThousands = -1;
  let countFiveThousands = -1;
  let countOneThousands = -1;

  // Calculate the maximum possible number of 10,000 yen bills.
  // This helps to limit the outer loop iterations.
  let maxTenThousands = targetSum / 10000;

  // Iterate through possible counts of 10,000 yen bills.
  for (let idx1 = 0; idx1 <= maxTenThousands; idx1++) {
    // Iterate through possible counts of 5,000 yen bills.
    // The sum of 10,000 and 5,000 yen bills cannot exceed totalBills.
    for (let idx2 = 0; idx2 <= totalBills - idx1; idx2++) {
      // Check if the current combination of bills sums up to the targetSum
      // and if the total number of bills matches totalBills.
      if (targetSum === idx1 * 10000 + idx2 * 5000 + (totalBills - idx1 - idx2) * 1000) {
        // If a solution is found, store the counts.
        countTenThousands = idx1;
        countFiveThousands = idx2;
        countOneThousands = totalBills - idx1 - idx2;
      }
    }
    // If a solution for 10,000 yen bills was found in the inner loop,
    // we can break out of the outer loop as we only need one valid combination.
    if (countTenThousands !== -1) {
      break;
    }
  }

  // Output the counts of 10,000, 5,000, and 1,000 yen bills, separated by spaces.
  console.log(countTenThousands + " " + countFiveThousands + " " + countOneThousands);
}

// This part handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
