function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputValue) {
  console.log(outputValue);
}

// This utility function handles various input parsing scenarios.
// conversionType:
// 0: No conversion, return as is.
// 1: Convert to integer.
// 2: Split by space.
// 3: Split by newline.
// 4: Split by space and convert to number array.
// 5: Split by newline and convert to number array.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to number array.
function transformInput(inputString, conversionType) {
  switch (conversionType) {
    case 0:
      return inputString;
    case 1:
      return parseInt(inputString, 10);
    case 2:
      return inputString.split(" ");
    case 3:
      return inputString.split("\n");
    case 4:
      return inputString.split(" ").map((elementStr) => Number(elementStr));
    case 5:
      return inputString.split("\n").map((elementStr) => Number(elementStr));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((elementStr) => Number(elementStr));
    default:
      // Default case, though not expected to be hit with current usage.
      return inputString;
  }
}

function processSimulation(rawInputContent) {
  // First, parse the entire input string by newlines.
  let parsedInputLines = transformInput(rawInputContent, 3);

  // Remove the first line, which typically indicates the number of test cases.
  parsedInputLines.shift();

  // Array to store the results for each simulation case.
  const simulationOutcomes = [];

  // Iterate through each line representing a simulation case.
  for (let currentCaseIndex = 0; currentCaseIndex < parsedInputLines.length; currentCaseIndex++) {
    // Parse the current line into numerical parameters.
    // Parameters:
    // currentStock: Initial stock quantity.
    // purchaseQuantity: Number of items Snuke tries to buy.
    // replenishThreshold: Stock level below which replenishment occurs.
    // replenishAmount: Quantity added to stock if below threshold.
    const caseParameters = transformInput(parsedInputLines[currentCaseIndex], 4);
    let currentStock = caseParameters[0];
    const initialStockLevel = caseParameters[0]; // Store initial stock for cycle detection.
    const purchaseQuantity = caseParameters[1];
    const replenishThreshold = caseParameters[2];
    const replenishAmount = caseParameters[3];

    // Flag to indicate if Snuke cannot make a purchase.
    let cannotPurchaseFlag = false;
    // Counter for simulation iterations to detect infinite loops.
    let iterationCounter = 0;

    // Simulate the process until a specific condition is met.
    while (true) {
      iterationCounter++; // Increment iteration count.

      // Check if current stock is less than the purchase quantity.
      if (currentStock < purchaseQuantity) {
        cannotPurchaseFlag = true; // Snuke cannot buy.
        break; // Exit simulation loop.
      }

      // Calculate remaining stock after Snuke buys as much as possible.
      // This is equivalent to `a = a % b` in the original, meaning `a` becomes the remainder
      // after `b` units are repeatedly removed from `a`.
      currentStock %= purchaseQuantity;

      // Check if stock falls below or equals the replenishment threshold.
      if (currentStock <= replenishThreshold) {
        currentStock += replenishAmount; // Replenish stock.
      }

      // Check for cycle detection or maximum iterations to prevent infinite loops.
      // If stock returns to its initial level, it's an infinite loop (Yes).
      // If iteration counter exceeds a large number, assume infinite loop (Yes).
      if (currentStock === initialStockLevel || iterationCounter >= 10000000) {
        break; // Exit simulation loop.
      }
    }

    // Record the outcome based on the flag.
    if (cannotPurchaseFlag) {
      simulationOutcomes.push("No");
    } else {
      simulationOutcomes.push("Yes");
    }
  }

  // Output all results, joined by newlines.
  displayResult(simulationOutcomes.join("\n"));
}

// Execute the main simulation process with input from stdin.
processSimulation(getInputData());
