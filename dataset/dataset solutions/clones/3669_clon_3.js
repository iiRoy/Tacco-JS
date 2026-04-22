const acquireRawInput = () => {
  try {
    const fileSystemModule = require("fs");
    const inputPath = "/dev/stdin";
    // Read synchronously, specifying UTF-8 encoding, and remove leading/trailing whitespace.
    return fileSystemModule.readFileSync(inputPath, { encoding: "utf8" }).trim();
  } catch (dataReadError) {
    // In case of an error during file reading, log it and return an empty string
    // to prevent further processing with invalid data.
    console.error("Failed to read input data:", dataReadError.message);
    return "";
  }
};

const outputProcessedResults = (finalDisplayContent) => {
  // Simple validation to ensure content is not null or undefined before logging.
  if (finalDisplayContent === null || finalDisplayContent === undefined) {
    console.warn("Attempted to output empty or invalid content. Skipping.");
    return;
  }
  console.log(finalDisplayContent);
};

// This object centralizes all input parsing and data transformation strategies.
// It replaces the original 'myconv' function's magic numbers with descriptive keys.
const DataTransformationStrategies = {
  // Strategy 0: Return the content without any modifications.
  identity: (inputContent) => inputContent,
  
  // Strategy 1: Convert the content to an integer. Explicitly use radix 10.
  toInteger: (inputContent) => parseInt(inputContent, 10),
  
  // Strategy 2: Split the content by single space characters into an array of strings.
  splitBySpace: (inputContent) => inputContent.split(" "),
  
  // Strategy 3: Split the content by newline characters into an array of strings.
  splitByNewline: (inputContent) => inputContent.split("\n"),
  
  // Strategy 4: Split by space, then convert each resulting string segment to a number.
  splitBySpaceThenParseNumbers: (inputContent) => inputContent.split(" ").map((segment) => Number(segment)),
  
  // Strategy 5: Split by newline, then convert each resulting string segment to a number.
  splitByNewlineThenParseNumbers: (inputContent) => inputContent.split("\n").map((segment) => Number(segment)),
  
  // Strategy 6: Split the content into an array of individual characters.
  splitIntoCharacters: (inputContent) => inputContent.split(""),
  
  // Strategy 7: Split into characters, then convert each character (if numeric) to a number.
  splitIntoCharacterNumbers: (inputContent) => inputContent.split("").map((char) => Number(char)),
};

// A higher-level function to apply a chosen data transformation strategy.
// This abstracts the direct call to DataTransformationStrategies.
const applyDataTransformation = (inputSegment, strategyIdentifier) => {
  const selectedStrategy = DataTransformationStrategies[strategyIdentifier];
  if (typeof selectedStrategy === 'function') {
    return selectedStrategy(inputSegment);
  }
  // Log a warning and return the original segment if an unrecognized strategy is requested.
  console.warn(`Unrecognized data transformation strategy: '${strategyIdentifier}'. Returning original content.`);
  return inputSegment;
};

// This is the main routine that executes the stock simulation logic.
// It takes the raw problem input as a string.
const executeStockCycleSimulation = (rawInputPayload) => {
  // First, parse the entire input payload into an array of individual scenario lines.
  let allScenarioLines = applyDataTransformation(rawInputPayload, 'splitByNewline');

  // The first line often contains metadata (like the total count of scenarios),
  // which is typically removed if not directly used in the loop.
  // Add a guard for empty input array.
  if (allScenarioLines.length === 0) {
    outputProcessedResults("No simulation scenarios provided. Exiting.");
    return;
  }
  allScenarioLines.shift(); // Remove the first line.

  // An array to collect the "Yes" or "No" outcome for each processed scenario.
  const accumulatedSimulationOutcomes = [];

  // Define a safety limit for the number of simulation cycles to prevent infinite loops.
  // This value is significant and mirrors the original problem's safeguard.
  const CYCLE_LIMIT_FOR_STABILITY_CHECK = 10000000;

  // Iterate over each line, treating it as a distinct simulation scenario.
  for (const currentScenarioEntry of allScenarioLines) {
    // Skip any lines that are empty or contain only whitespace to avoid processing errors.
    if (!currentScenarioEntry || currentScenarioEntry.trim() === '') {
      continue;
    }

    // Parse the four numerical parameters for the current scenario from the line.
    // This is a Type III change: parsing once and destructuring the array.
    const parsedParameters = applyDataTransformation(currentScenarioEntry, 'splitBySpaceThenParseNumbers');

    // Perform validation on the parsed parameters.
    // Ensure exactly four numbers were parsed and none of them are NaN.
    if (parsedParameters.length !== 4 || parsedParameters.some(isNaN)) {
      console.error(`Error: Invalid numeric parameters in scenario line: '${currentScenarioEntry}'. Skipping.`);
      accumulatedSimulationOutcomes.push("Error: Invalid scenario parameters");
      continue;
    }

    // Destructure the parameters for clearer variable names.
    let [initialAvailableStock, customerPurchaseQuantity, replenishmentThresholdValue, replenishmentAdditionAmount] = parsedParameters;

    // Store the initial stock level to later detect if a cycle brings it back to this point.
    const scenarioStartingStockLevel = initialAvailableStock;
    let currentSimulationCycleCount = 0;
    let stockDepletedDuringCycle = false;

    // Implement a guard clause for invalid purchase quantities.
    // A non-positive purchase quantity would lead to incorrect modulo behavior or an illogical scenario.
    if (customerPurchaseQuantity <= 0) {
      // If purchase quantity is zero or negative, it's not a valid "buying" scenario
      // or implies an immediate failure to purchase.
      accumulatedSimulationOutcomes.push("No");
      continue;
    }

    // The core simulation loop for a single scenario.
    // It continues until stock runs out, a cycle is detected, or the iteration limit is reached.
    while (true) {
      currentSimulationCycleCount++; // Increment the counter for the current simulation step.

      // Check if the current stock is insufficient to meet the customer's purchase.
      if (initialAvailableStock < customerPurchaseQuantity) {
        stockDepletedDuringCycle = true;
        break; // Stock is too low, the scenario fails.
      }

      // Calculate the remaining stock after the purchase.
      // The modulo operator effectively simulates repeated purchases until no more full purchases can be made.
      initialAvailableStock %= customerPurchaseQuantity;

      // Check if the remaining stock level triggers an automatic replenishment.
      if (initialAvailableStock <= replenishmentThresholdValue) {
        initialAvailableStock += replenishmentAdditionAmount;
      }

      // Condition 1: Check for a stable cycle.
      // If the stock level returns to its initial state, it implies a repeating pattern
      // where stock never ran out, thus guaranteeing continued operation ("Yes").
      if (initialAvailableStock === scenarioStartingStockLevel) {
        break; // Cycle detected, the simulation is stable.
      }

      // Condition 2: Safety break for long-running simulations.
      // If the simulation runs for an excessive number of cycles without
      // either depleting stock or detecting a cycle, assume it's stable ("Yes").
      if (currentSimulationCycleCount >= CYCLE_LIMIT_FOR_STABILITY_CHECK) {
        break; // Max iterations reached, assume stability.
      }
    }

    // Based on the simulation outcome, record "Yes" or "No" for the current scenario.
    if (stockDepletedDuringCycle) {
      accumulatedSimulationOutcomes.push("No");
    } else {
      accumulatedSimulationOutcomes.push("Yes");
    }
  }

  // Join all the recorded outcomes with newline characters and display them.
  outputProcessedResults(accumulatedSimulationOutcomes.join("\n"));
};

// Entry point for the program execution.
// It first acquires the raw input data and then passes it to the main simulation function.
executeStockCycleSimulation(acquireRawInput());