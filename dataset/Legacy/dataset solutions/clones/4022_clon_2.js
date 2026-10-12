function processInput(inputData) {
  // This function processes the provided input string.
  // It extracts two numeric values from the input.

  // The first value represents the cost of an item.
  const itemCost = parseInt(inputData.split("\n")[0]);

  // The second value represents the available funds for a specific purpose.
  const availableFunds = parseInt(inputData.split("\n")[1]);

  // Determine if the remainder of the item cost divided by 500
  // is less than or equal to the available funds.
  // Then, print "YES" or "NO" accordingly.
  console.log(itemCost % 500 <= availableFunds ? "YES" : "NO");
}

// Read the standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
