function obtainRawInput() {
  // This function reads raw input from standard input.
  // It uses Node.js 'fs' module to synchronously read the file.
  // The input is then trimmed of leading/trailing whitespace.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

// Input transformation types:
// 0: No change, return as is
// 1: Convert to integer
// 2: Split by single space character
// 3: Split by newline character
// 4: Split by space, then convert each part to a number
// 5: Split by newline, then convert each part to a number
// 6: Split into individual characters
// 7: Split into individual characters, then convert each to a number
function transformInputData(sourceString, transformationType) {
  switch (transformationType) {
    case 0:
      return sourceString;
    case 1:
      return parseInt(sourceString);
    case 2:
      return sourceString.split(" ");
    case 3:
      return sourceString.split("\n");
    case 4:
      return sourceString.split(" ").map((elementStr) => Number(elementStr));
    case 5:
      return sourceString.split("\n").map((elementStr) => Number(elementStr));
    case 6:
      return sourceString.split("");
    case 7:
      return sourceString.split("").map((elementStr) => Number(elementStr));
  }
}

function runApplicationLogic(initialInputString) {
  // First, split the entire input string by newlines to get an array of lines.
  let parsedInputLines = transformInputData(initialInputString, 3);

  // Extract the initial counts and the number of discount offers from the first line.
  const itemCountA = transformInputData(parsedInputLines[0], 4)[0];
  const itemCountB = transformInputData(parsedInputLines[0], 4)[1];
  const discountOfferCount = transformInputData(parsedInputLines[0], 4)[2];

  // Get the price lists for items A and B from the next two lines.
  const itemPricesA = transformInputData(parsedInputLines[1], 4);
  const itemPricesB = transformInputData(parsedInputLines[2], 4);

  // Remove the first three lines as they have been processed.
  parsedInputLines.shift();
  parsedInputLines.shift();
  parsedInputLines.shift();

  // Calculate the minimum price for items in list A and list B.
  let minPriceForA = Math.min.apply(null, itemPricesA);
  let minPriceForB = Math.min.apply(null, itemPricesB);

  // Initialize the overall minimum cost with the sum of the cheapest items without any discount.
  let overallMinCost = minPriceForA + minPriceForB;

  // Iterate through the remaining lines, which represent discount offers.
  const remainingOffersLength = parsedInputLines.length;
  for (let offerIndex = 0; offerIndex < remainingOffersLength; offerIndex++) {
    // Parse the current discount offer line.
    // x: index of item A (0-based)
    // y: index of item B (0-based)
    // c: discount amount
    let itemASelectionIndex = transformInputData(parsedInputLines[offerIndex], 4)[0] - 1;
    let itemBSelectionIndex = transformInputData(parsedInputLines[offerIndex], 4)[1] - 1;
    let discountValue = transformInputData(parsedInputLines[offerIndex], 4)[2];

    // Calculate the total cost for this specific offer.
    let currentOfferTotal = itemPricesA[itemASelectionIndex] + itemPricesB[itemBSelectionIndex] - discountValue;

    // Update the overall minimum cost if this offer is cheaper.
    if (currentOfferTotal < overallMinCost) {
      overallMinCost = currentOfferTotal;
    }
  }

  // Output the final calculated minimum cost.
  console.log(overallMinCost);
}

// Execute the main application logic with the input obtained from stdin.
runApplicationLogic(obtainRawInput());
