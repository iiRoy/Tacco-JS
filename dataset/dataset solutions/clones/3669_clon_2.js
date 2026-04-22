function acquireInputData( )
{
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult( message )
{
  console.log(message);
}

// This function processes an input string based on a specified transformation code.
//
// Parameter 'dataToProcess': The string to be modified.
// Parameter 'conversionType': An integer defining the type of transformation.
//
// Transformation Options:
//   0: Return the input string without any changes.
//   1: Convert the input string into a whole number.
//   2: Split the string into an array using space as a delimiter.
//   3: Split the string into an array using newline as a delimiter.
//   4: Split by spaces, then convert each segment to a numerical value.
//   5: Split by newlines, then convert each segment to a numerical value.
//   6: Break the string into an array of individual characters.
//   7: Break into characters, then convert each character to a numerical value.
//
function transformInput( dataToProcess, conversionType )
{
  switch(conversionType)
  {
    case 0: return dataToProcess;
    case 1: return parseInt(dataToProcess);
    case 2: return dataToProcess.split(" ");
    case 3: return dataToProcess.split("\n");
    case 4: return dataToProcess.split(" ").map( (numericStr) => Number(numericStr) );
    case 5: return dataToProcess.split("\n").map( (numericStr) => Number(numericStr) );
    case 6: return dataToProcess.split("");
    case 7: return dataToProcess.split("").map( (numericStr) => Number(numericStr) );
  }
}

/**
 * Executes the primary simulation logic based on provided system input.
 * This routine processes multiple scenarios, each defining a stock management problem.
 * @param {string} rawInputData - The complete string of input received from the system.
 */
function ProcessSimulation( rawInputData )
{
  // Parse the raw input into an array of strings, splitting by newline characters.
  let scenarioLines = transformInput(rawInputData, 3);

  // Remove the first line, which is assumed to be metadata (e.g., a count) and not part of scenario data.
  scenarioLines.shift();

  // An array to accumulate the "Yes" or "No" outcomes for each scenario.
  const finalResults = [];

  // Iterate over each line, processing it as an independent simulation scenario.
  for ( let scenarioIdx = 0; scenarioIdx < scenarioLines.length; scenarioIdx++ )
  {
    // Extract and convert the numeric parameters for the current simulation scenario.
    // Parameters are:
    //   - currentStock: The initial quantity of items available.
    //   - purchaseQuantity: The fixed number of items an entity attempts to acquire.
    //   - replenishmentThreshold: The stock level at which replenishment occurs.
    //   - dailyAdditionAmount: The quantity of items added to stock when replenishment is triggered.
    let currentScenarioValues = transformInput(scenarioLines[scenarioIdx], 4);

    let currentStock = currentScenarioValues[0];
    let originalStockValue = currentScenarioValues[0]; // Store the initial stock to detect cycles.
    let purchaseQuantity = currentScenarioValues[1];
    let replenishmentThreshold = currentScenarioValues[2];
    let dailyAdditionAmount = currentScenarioValues[3];
	
    // A boolean flag indicating if the stock ever becomes insufficient for a purchase.
    let insufficientStockFlag = false;
    
    // A counter to track the number of simulation cycles, used to prevent infinite loops.
    let cycleCounter = 0;

    // Main simulation loop for the current scenario.
    // It runs until a specific termination condition is met.
    while (true)
    {
      cycleCounter++; // Increment the cycle count for each pass.

      // If the available stock is less than the amount to be purchased,
      // the entity cannot make a purchase. Mark as insufficient and exit.
      if (currentStock < purchaseQuantity)
      {
        insufficientStockFlag = true;
        break;
      }
      
      // Update the current stock by taking the remainder after as many full purchases as possible.
      currentStock = currentStock % purchaseQuantity;

      // If the stock level falls to or below the defined threshold,
      // add the daily replenishment amount to the stock.
      if (currentStock <= replenishmentThreshold)
      {
        currentStock += dailyAdditionAmount;
      }

      // Termination conditions for the simulation loop:
      // 1. Stock returns to its initial value, indicating a stable cycle where purchases are always possible.
      // 2. A very large number of cycles have passed, suggesting an infinite loop or very long simulation.
      if (currentStock === originalStockValue || cycleCounter >= 10_000_000)
      {
        break;
      }
    }
    
    // Based on the outcome of the simulation loop, record the result for this scenario.
    if (insufficientStockFlag)
    {
      finalResults.push("No");
    }
    else
    {
      finalResults.push("Yes");
    }
  }
  
  // Format the collected results into a single string, with each result on a new line, and display it.
  displayResult(finalResults.join("\n"));
}

// Begin the program execution by calling the main processing function
// with the input data acquired from the system.
ProcessSimulation( acquireInputData() );