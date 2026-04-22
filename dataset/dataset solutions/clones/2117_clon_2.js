// This function processes all incoming raw data.
function ProcessInput(rawDataString)
{

  // Separate the entire input string into individual lines.
  let lineArray = rawDataString.split("\n");

  // Extract the very first line, which contains configuration details.
  const firstLineContent = lineArray.shift();

  // Parse the desired length from the first part of the configuration line.
  const targetLength = parseInt(firstLineContent.split(" ")[0]);

  // The second part of the configuration line (number of rules) is stored,
  // although it's not directly used in the subsequent logic.
  const numConditions = firstLineContent.split(" ")[1];

  // The remaining lines represent the specific conditions or rules.
  const conditionLines = lineArray;

  // Initialize an array with 'x' characters, representing unknown digits.
  // Its size is determined by the 'targetLength'.
  let resultArray = Array(targetLength).fill('x');

  // A boolean indicator to track if any inconsistencies are found.
  let isValidSolution = true;

  // Iterate through each of the provided condition strings.
  conditionLines.forEach( ( currentConditionStr ) => {
    // Parse the current condition into two integer values.
    const parsedCondition = currentConditionStr.split(" ").map(element => parseInt(element));

    // Check if a digit has already been assigned to this position,
    // and if the new digit conflicts with it.
    if (resultArray[parsedCondition[0] - 1] !== 'x' && resultArray[parsedCondition[0] - 1] !== parsedCondition[1]) {
      isValidSolution = false; // Mark as invalid if a conflict arises.
    }

    // Assign the new digit to its specified position.
    resultArray[parsedCondition[0] - 1] = parsedCondition[1];
  });

  // Convert the array of characters back into a single string.
  let finalStringRepresentation = resultArray.join("");

  // Apply a series of replacements to handle leading 'x' characters,
  // prioritizing longer sequences for specific initial values.
  finalStringRepresentation = finalStringRepresentation.replace(/^xxx/, "100");
  finalStringRepresentation = finalStringRepresentation.replace(/^xx([0-9])/, "10$1");
  finalStringRepresentation = finalStringRepresentation.replace(/^x([0-9])/, "1$1");

  // Replace any remaining 'x' characters with '0'.
  finalStringRepresentation = finalStringRepresentation.replace(/x/g, "0");

  // Convert the processed string into an integer.
  const finalNumericValue = parseInt(finalStringRepresentation);

  // Determine the final output based on validity and length constraints.
  if ( isValidSolution && (finalNumericValue + "").length === targetLength ) {
    console.log(finalNumericValue); // Output the derived number.
  } else {
    console.log(-1); // Output -1 if no valid solution could be formed.
  }
}

// --- Do not modify the following section. It handles standard input/output and function invocation. ---
ProcessInput( require("fs") . readFileSync( "/dev/stdin" , "utf8" ) );