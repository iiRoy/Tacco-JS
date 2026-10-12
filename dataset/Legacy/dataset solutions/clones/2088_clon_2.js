function getInputData(){
  // Reads the entire content from standard input,
  // decodes it as UTF-8, and removes leading/trailing whitespace.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

/**
 * Processes an input string based on a specified conversion type.
 * This utility function handles various common input parsing scenarios.
 *
 * @param {string} dataString - The input string to be processed.
 * @param {number} conversionType - An integer indicating the desired conversion.
 *   0: Return the string as is.
 *   1: Convert to an integer.
 *   2: Split by single space character.
 *   3: Split by newline character.
 *   4: Split by single space character and convert each part to a number.
 *   5: Split by newline character and convert each part to a number.
 *   6: Split into individual characters.
 *   7: Split into individual characters and convert each to a number.
 * @returns {any} The processed data, which could be a string, number, or array.
 */
function processInput(dataString, conversionType){
  switch(conversionType){
    case 0:
      // No conversion, return the original string.
      return dataString;
    case 1:
      // Convert to an integer.
      return parseInt(dataString, 10);
    case 2:
      // Split the string by spaces.
      return dataString.split(" ");
    case 3:
      // Split the string by newline characters.
      return dataString.split("\n");
    case 4:
      // Split by spaces, then map each part to a number.
      return dataString.split(" ").map((element) => Number(element));
    case 5:
      // Split by newlines, then map each part to a number.
      return dataString.split("\n").map((element) => Number(element));
    case 6:
      // Split the string into an array of individual characters.
      return dataString.split("");
    case 7:
      // Split into characters, then map each character to a number.
      return dataString.split("").map((element) => Number(element));
    default:
      // Default case, perhaps throw an error or return original.
      // For this clone, we'll just return the original string for unknown types.
      return dataString;
  }
}

/**
 * Main program execution function.
 * It reads input, calculates various price combinations, applies discounts,
 * and outputs the minimum price found.
 *
 * @param {string} rawInputString - The raw input string read from stdin.
 */
function ExecuteProgram(rawInputString) {
  // First, split the entire input string by newlines.
  let processedLines = processInput(rawInputString, 3);

  // Parse the first line to get A, B, and M values.
  // A: number of items in category 'a'
  // B: number of items in category 'b'
  // M: number of discount offers
  const numItemsA = processInput(processedLines[0], 4)[0];
  const numItemsB = processInput(processedLines[0], 4)[1];
  const numDiscounts = processInput(processedLines[0], 4)[2];

  // Parse the second line for prices of items in category 'a'.
  const pricesA = processInput(processedLines[1], 4);
  // Parse the third line for prices of items in category 'b'.
  const pricesB = processInput(processedLines[2], 4);

  // Remove the first three lines as they have been parsed.
  processedLines.shift(); // Removes line containing A, B, M
  processedLines.shift(); // Removes line containing pricesA
  processedLines.shift(); // Removes line containing pricesB

  // Initialize an array to store all possible combined prices.
  let allCalculatedPrices = [];

  // Calculate all possible combinations of prices from category 'a' and 'b'.
  // This forms the base set of prices without any discounts.
  for (let idxA = 0; idxA < numItemsA; idxA++) {
    for (let idxB = 0; idxB < numItemsB; idxB++) {
      let currentCombinedPrice = pricesA[idxA] + pricesB[idxB];
      allCalculatedPrices.push(currentCombinedPrice);
    }
  }

  // Get the number of remaining lines, which represent discount offers.
  const discountCount = processedLines.length;

  // Iterate through each discount offer.
  for (let idxDiscount = 0; idxDiscount < discountCount; idxDiscount++) {
    // Parse the current discount line to get item indices (x, y) and discount amount (c).
    let itemXIndex = processInput(processedLines[idxDiscount], 4)[0];
    let itemYIndex = processInput(processedLines[idxDiscount], 4)[1];
    let discountAmount = processInput(processedLines[idxDiscount], 4)[2];

    // Calculate the index in the 'allCalculatedPrices' array
    // that corresponds to the item combination (x, y).
    // Note: x and y are 1-indexed in the input, so we convert to 0-indexed.
    let originalPriceIndex = (itemXIndex - 1) * numItemsB + (itemYIndex - 1);

    // Retrieve the original combined price for this specific item pair.
    const basePriceBeforeDiscount = allCalculatedPrices[originalPriceIndex];

    // Apply the discount and add the new discounted price to the list.
    allCalculatedPrices.push(basePriceBeforeDiscount - discountAmount);
  }

  // Find and print the minimum price from all calculated prices (original and discounted).
  console.log(Math.min.apply(null, allCalculatedPrices));
}

// Execute the main program with input obtained from stdin.
ExecuteProgram(getInputData());
