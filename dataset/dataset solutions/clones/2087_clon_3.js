const acquireInputData = () => {
  // This function is responsible for reading raw input from the standard input stream.
  // It uses Node.js's 'fs' module to synchronously read the file content.
  const fileSystemUtility = require("fs");
  const inputFilePath = "/dev/stdin";
  const textEncoding = "utf8";

  // Read the entire file content and remove any leading or trailing whitespace.
  const rawInputContent = fileSystemUtility.readFileSync(inputFilePath, textEncoding);
  return rawInputContent.trim();
};

const divideIntoLines = (fullTextContent) => {
  // Utility function to split a multi-line string into an array of individual lines.
  // It handles different newline characters (CRLF, LF) and filters out any empty lines.
  if (typeof fullTextContent !== 'string' || fullTextContent.length === 0) {
    // Basic validation: return an empty array if input is not a valid string or is empty.
    console.error("Warning: Invalid or empty text provided to line splitter.");
    return [];
  }
  // Split by common newline patterns and filter out any resulting empty strings.
  return fullTextContent.split(/\r?\n/).filter(line => line.trim() !== '');
};

const extractNumbersFromLine = (lineOfText, valueSeparator = ' ') => {
  // Utility function to parse a single line of text into an array of numbers.
  // It splits the line by a specified separator, filters out empty parts, and converts to Number.
  if (typeof lineOfText !== 'string' || lineOfText.length === 0) {
    // Basic validation: return an empty array if input is not a valid string or is empty.
    console.error("Warning: Invalid or empty line provided for number extraction.");
    return [];
  }
  // Split the line, filter out any empty string segments, and map them to Number.
  return lineOfText.split(valueSeparator)
             .filter(segment => segment.trim() !== '') // Remove empty segments from multiple spaces
             .map(segment => {
                const numericValue = Number(segment);
                if (isNaN(numericValue)) {
                  // Log a warning if a non-numeric value is encountered, but still return NaN for consistency.
                  console.warn(`Non-numeric value detected: '${segment}'. Resulting in NaN.`);
                }
                return numericValue;
             });
};

const processApplicationLogic = (initialInputString) => {
  // This is the main function that orchestrates the program's logic.

  // --- Input Validation and Initial Data Extraction ---

  if (!initialInputString || typeof initialInputString !== 'string') {
    console.error("Error: No valid input string received for processing.");
    return; // Exit if the input is fundamentally flawed.
  }

  // Step 1: Divide the raw input into an array of lines.
  const allParsedLines = divideIntoLines(initialInputString);

  // Ensure a minimum number of lines are present for configuration and price lists.
  const minimumRequiredLines = 3; // For A, B, M and list_a, list_b
  if (allParsedLines.length < minimumRequiredLines) {
      console.error(`Error: Insufficient input lines. Expected at least ${minimumRequiredLines}, got ${allParsedLines.length}.`);
      return;
  }

  // Step 2: Parse the first line to get the counts of items in set A, B, and the number of discount offers.
  // Using array destructuring for cleaner assignment.
  const [declaredCountA, declaredCountB, totalDiscountOffers] = extractNumbersFromLine(allParsedLines[0]);

  // Validate the parsed counts.
  if (isNaN(declaredCountA) || isNaN(declaredCountB) || isNaN(totalDiscountOffers)) {
    console.error("Error: Failed to parse initial configuration numbers (counts or offers).");
    return;
  }
  if (declaredCountA <= 0 || declaredCountB <= 0) {
    console.warn("Warning: Item counts for set A or B are non-positive. This might lead to unexpected behavior.");
  }
  if (totalDiscountOffers < 0) {
    console.warn("Warning: Negative number of discount offers detected. Treating as zero offers.");
    // Optionally, could set totalDiscountOffers to 0 here.
  }

  // Step 3: Parse the second line for the prices of items in set A.
  const pricesForItemsA = extractNumbersFromLine(allParsedLines[1]);
  // Step 4: Parse the third line for the prices of items in set B.
  const pricesForItemsB = extractNumbersFromLine(allParsedLines[2]);

  // Validate that the actual number of prices matches the declared counts.
  if (pricesForItemsA.length !== declaredCountA) {
      console.warn(`Warning: Declared ${declaredCountA} items for set A, but found ${pricesForItemsA.length} prices.`);
  }
  if (pricesForItemsB.length !== declaredCountB) {
      console.warn(`Warning: Declared ${declaredCountB} items for set B, but found ${pricesForItemsB.length} prices.`);
  }

  // --- Calculate Initial Minimum Combined Cost ---

  // Find the minimum price in each item set. Use Infinity for empty arrays to handle edge cases gracefully.
  const minimumPriceFromSetA = pricesForItemsA.length > 0 ? Math.min(...pricesForItemsA) : Infinity;
  const minimumPriceFromSetB = pricesForItemsB.length > 0 ? Math.min(...pricesForItemsB) : Infinity;

  // Initialize the overall minimum cost with the sum of the cheapest items from each set (without any deals).
  let overallLowestCost = minimumPriceFromSetA + minimumPriceFromSetB;

  // --- Process Discount Offers ---

  // Extract the lines that contain the discount offer details.
  // These are all lines starting from the 4th line (index 3).
  const discountOfferDetailLines = allParsedLines.slice(minimumRequiredLines);

  // Guard clause: If there are no discount offers, the initial sum is the final answer.
  if (discountOfferDetailLines.length === 0 || totalDiscountOffers === 0) {
      console.log(overallLowestCost);
      return;
  }

  // Another check: compare the number of actual offer lines with the declared total.
  if (discountOfferDetailLines.length !== totalDiscountOffers) {
      console.warn(`Warning: Declared ${totalDiscountOffers} discount offers but found ${discountOfferDetailLines.length} actual offer lines.`);
      // The loop will proceed with the available lines, which is generally safer than assuming 'totalDiscountOffers' is correct.
  }

  // Iterate through each available discount offer line.
  for (let offerLineIndex = 0; offerLineIndex < discountOfferDetailLines.length; ++offerLineIndex) {
    // Parse the current offer line into its components: item indices and discount amount.
    const [itemIndexA, itemIndexB, discountAmount] = extractNumbersFromLine(discountOfferDetailLines[offerLineIndex]);

    // Validate the parsed components for the current offer.
    if (isNaN(itemIndexA) || isNaN(itemIndexB) || isNaN(discountAmount)) {
        console.warn(`Skipping invalid offer line at index ${offerLineIndex} due to non-numeric components: "${discountOfferDetailLines[offerLineIndex]}".`);
        continue; // Move to the next offer if this one is malformed.
    }

    // Convert 1-based indices from input to 0-based for array access.
    const zeroBasedIndexA = itemIndexA - 1;
    const zeroBasedIndexB = itemIndexB - 1;

    // Guard against out-of-bounds array access for item prices.
    if (zeroBasedIndexA < 0 || zeroBasedIndexA >= pricesForItemsA.length ||
        zeroBasedIndexB < 0 || zeroBasedIndexB >= pricesForItemsB.length) {
        console.warn(`Skipping offer at index ${offerLineIndex} due to invalid item indices (out of range): A=${itemIndexA}, B=${itemIndexB}.`);
        continue; // Skip this offer if indices are invalid.
    }

    // Calculate the total cost for this specific deal.
    const currentDealCalculatedPrice = pricesForItemsA[zeroBasedIndexA] + pricesForItemsB[zeroBasedIndexB] - discountAmount;

    // Update the overall minimum cost if the current deal offers a better price.
    if (currentDealCalculatedPrice < overallLowestCost) {
      overallLowestCost = currentDealCalculatedPrice;
    }
  }

  // --- Output the Final Result ---
  console.log(overallLowestCost);
};

// Initiate the program by acquiring input and then processing it.
processApplicationLogic(acquireInputData());