function acquireRawInput() {
  const fileSystemModule = require("fs");
  // The standard input stream is typically found at /dev/stdin on Unix-like systems.
  const standardInputPath = "/dev/stdin";

  // Read the entire file synchronously. The result is a Buffer.
  const rawDataBuffer = fileSystemModule.readFileSync(standardInputPath);

  // Convert the buffer to a UTF-8 string and remove any leading/trailing whitespace.
  const processedData = rawDataBuffer.toString('utf8').trim();
  return processedData;
}

// This object defines various parsing modes, replacing simple integer flags with descriptive names.
const InputTransformationModes = {
  RETURN_AS_IS: 0,            // No alteration, return the raw string.
  TO_NUMERIC_VALUE: 1,        // Convert the string to a floating-point number (or integer if no decimal).
  SEGMENT_BY_SPACES: 2,       // Split the string into an array of substrings using space as delimiter.
  SEGMENT_BY_NEWLINES: 3,     // Split the string into an array of substrings using newline as delimiter.
  NUMERIC_ARRAY_FROM_SPACES: 4, // Split by spaces, then convert each segment to a number.
  NUMERIC_ARRAY_FROM_NEWLINES: 5, // Split by newlines, then convert each segment to a number.
  CHARACTER_ARRAY: 6,         // Split the string into an array of individual characters.
  NUMERIC_CHARACTER_ARRAY: 7  // Split into characters, then convert each character to a number.
};

/**
 * Applies a specified transformation mode to an input string, returning the processed data.
 * This function serves as a versatile parser for different input formats often encountered in competitive programming.
 * @param {string} sourceString The string that needs to be processed.
 * @param {number} transformationMode A key from InputTransformationModes dictating the parsing logic.
 * @returns {*} The result of the transformation, which could be a string, number, or array.
 */
function applyDataTransformation(sourceString, transformationMode) {
  // A variable to store the outcome of the chosen transformation.
  let finalTransformedData;

  // Use a switch statement for clear, mode-based processing logic.
  switch (transformationMode) {
    case InputTransformationModes.RETURN_AS_IS:
      finalTransformedData = sourceString;
      break;
    case InputTransformationModes.TO_NUMERIC_VALUE:
      // Using Number() is generally more flexible than parseInt() as it can handle floats
      // and is consistent with the `map(Number)` usage for arrays.
      finalTransformedData = Number(sourceString);
      break;
    case InputTransformationModes.SEGMENT_BY_SPACES:
      finalTransformedData = sourceString.split(" ");
      break;
    case InputTransformationModes.SEGMENT_BY_NEWLINES:
      finalTransformedData = sourceString.split("\n");
      break;
    case InputTransformationModes.NUMERIC_ARRAY_FROM_SPACES:
      // Split by space, then iterate through the resulting segments to convert each to a number.
      finalTransformedData = sourceString.split(" ").map((itemSegment) => Number(itemSegment));
      break;
    case InputTransformationModes.NUMERIC_ARRAY_FROM_NEWLINES:
      // Split by newline, then convert each line segment to a number.
      finalTransformedData = sourceString.split("\n").map((lineSegment) => Number(lineSegment));
      break;
    case InputTransformationModes.CHARACTER_ARRAY:
      // Convert the string into an array where each element is a single character.
      finalTransformedData = sourceString.split("");
      break;
    case InputTransformationModes.NUMERIC_CHARACTER_ARRAY:
      // First, split into individual characters, then convert each character to its numeric representation.
      finalTransformedData = sourceString.split("").map((singleChar) => Number(singleChar));
      break;
    default:
      // If an unknown mode is provided, a warning is logged, and the original string is returned.
      console.warn(`Warning: An unrecognized transformation mode (${transformationMode}) was supplied. Returning the original string.`);
      finalTransformedData = sourceString;
  }
  return finalTransformedData;
}

/**
 * Orchestrates the calculation of the minimum possible total cost for a purchase,
 * considering various item combinations and available discounts.
 * @param {string} fullRawInput The complete input data as a single string, typically from stdin.
 */
function determineOptimalPurchaseCost(fullRawInput) {
  // Step 1: Break down the raw input string into an array of individual lines.
  const allInputLines = applyDataTransformation(fullRawInput, InputTransformationModes.SEGMENT_BY_NEWLINES);

  // Step 2: Parse the first line to get the primary dimensions and counts.
  // This line typically contains:
  // - countOfFridgeAModels: Total number of available models for fridge type A.
  // - countOfFridgeBModels: Total number of available models for fridge type B.
  // - totalDiscountOffers: The number of special discount offers available.
  const primaryConfigurationDetails = applyDataTransformation(allInputLines[0], InputTransformationModes.NUMERIC_ARRAY_FROM_SPACES);
  const countOfFridgeAModels = primaryConfigurationDetails[0];
  const countOfFridgeBModels = primaryConfigurationDetails[1];
  const totalDiscountOffers = primaryConfigurationDetails[2];

  // Step 3: Parse the second line for the prices of all Fridge A models.
  const pricesForFridgeAModels = applyDataTransformation(allInputLines[1], InputTransformationModes.NUMERIC_ARRAY_FROM_SPACES);

  // Step 4: Parse the third line for the prices of all Fridge B models.
  const pricesForFridgeBModels = applyDataTransformation(allInputLines[2], InputTransformationModes.NUMERIC_ARRAY_FROM_SPACES);

  // Step 5: The remaining lines contain details about discount offers.
  // We extract these by slicing the array from the fourth line onwards (index 3).
  const discountOfferSpecifications = allInputLines.slice(3);

  // Initialize an array to store every potential purchase cost.
  // This will include all original item combinations and any discounted combinations.
  const allEvaluatedCosts = [];

  // Step 6: Calculate all possible base combinations of prices without any discounts.
  // This involves pairing each Fridge A model with each Fridge B model.
  for (let idxA = 0; idxA < countOfFridgeAModels; idxA++) {
    for (let idxB = 0; idxB < countOfFridgeBModels; idxB++) {
      const currentPairBasePrice = pricesForFridgeAModels[idxA] + pricesForFridgeBModels[idxB];
      allEvaluatedCosts.push(currentPairBasePrice);
    }
  }

  // Step 7: Process each discount offer and add the resulting discounted prices.
  // Each discount offer specifies a particular Fridge A model, Fridge B model, and a discount amount.
  for (let offerIndex = 0; offerIndex < totalDiscountOffers; offerIndex++) {
    const currentOfferString = discountOfferSpecifications[offerIndex];
    const offerParameters = applyDataTransformation(currentOfferString, InputTransformationModes.NUMERIC_ARRAY_FROM_SPACES);

    // The offer parameters are 1-based indices for the fridge models and the discount value.
    const fridgeA_1_Based_Identifier = offerParameters[0];
    const fridgeB_1_Based_Identifier = offerParameters[1];
    const discountAmount = offerParameters[2];

    // Convert the 1-based identifiers to 0-based indices for array access.
    const fridgeA_0_Based_Index = fridgeA_1_Based_Identifier - 1;
    const fridgeB_0_Based_Index = fridgeB_1_Based_Identifier - 1;

    // Retrieve the base prices for the specific items targeted by this discount.
    const priceComponentA = pricesForFridgeAModels[fridgeA_0_Based_Index];
    const priceComponentB = pricesForFridgeBModels[fridgeB_0_Based_Index];

    // Calculate the original combined price for this specific pair of items.
    const originalCombinedPriceForOffer = priceComponentA + priceComponentB;

    // Apply the discount to get the new, reduced price for this specific offer.
    const discountedPriceForOffer = originalCombinedPriceForOffer - discountAmount;

    // Add this new discounted price to our collection of all potential costs.
    allEvaluatedCosts.push(discountedPriceForOffer);
  }

  // Step 8: Determine the absolute minimum cost from the entire collection of evaluated prices.
  // The spread operator (...) is used to pass all elements of the array as individual arguments to Math.min.
  const overallMinimumCost = Math.min(...allEvaluatedCosts);

  // Step 9: Output the final calculated minimum cost to the console.
  console.log(overallMinimumCost);
}

// This immediately-invoked function expression (IIFE) serves as the main entry point
// for the program, ensuring that the execution flow is clear and contained.
(function initializeProgramExecution() {
  // First, retrieve all input data from the system's standard input.
  const systemProvidedInput = acquireRawInput();

  // Then, pass this raw input data to the core logic function to compute the optimal cost.
  determineOptimalPurchaseCost(systemProvidedInput);
})();