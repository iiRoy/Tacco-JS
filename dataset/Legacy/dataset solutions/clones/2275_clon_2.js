function ProcessInput(rawData) {
  // This function processes the incoming raw data string.
  const parsedData = rawData.split(' '); // Split the input string by space.

  let itemCount = parsedData[0]; // The first part is the item count.
  let totalCost = 500 * parseInt(itemCount, 10); // Calculate the total cost based on item count.

  let budgetAmount = parsedData[1]; // The second part is the available budget.

  // Compare the calculated total cost with the budget.
  if (totalCost >= budgetAmount) {
    console.log('yes'); // If total cost is within budget, print 'yes'.
  } else {
    console.log('no'); // Otherwise, print 'no'.
  }
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
