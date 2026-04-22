// Begin script execution.
// This section handles file system interactions.
var fileSystemUtility = require('fs');

// Acquire the entire raw content from the standard input stream.
// The content is assumed to be encoded in UTF-8 format.
var incomingData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Parse the acquired data, splitting it into individual lines.
// Each line is treated as a separate processing unit.
var dataLines = incomingData.split("\n");

// Initialize a mutable buffer to accumulate all processed results.
var resultAccumulator = "";

// Iterate through each parsed line using an index-based loop.
for (  var currentLineIndex = 0  ;  currentLineIndex < dataLines.length  ;  currentLineIndex++  )  {
    // Deconstruct the current line into its operational components.
    // Components are separated by a single space character.
    var currentOperationParts = dataLines[currentLineIndex].split(" ");

    // Convert the first component to a numerical value; this serves as the first operand.
    var primaryValue = Number(currentOperationParts[0]);

    // Extract the second component, which represents the mathematical operator.
    var operationSymbol = currentOperationParts[1];

    // Convert the third component to a numerical value; this serves as the second operand.
    var secondaryValue = Number(currentOperationParts[2]);

    // Check for a termination condition: if the operator is a question mark.
    if  (  operationSymbol  ===  "?"  )  {
        break; // Terminate the processing loop immediately.
    }

    // Process based on the identified operation symbol.
    // Each operator is handled by an independent conditional block.
    if  (  operationSymbol  ===  "+"  )  {
        resultAccumulator += primaryValue + secondaryValue;
    }
    if  (  operationSymbol  ===  "-"  )  {
        resultAccumulator += primaryValue - secondaryValue;
    }
    if  (  operationSymbol  ===  "*"  )  {
        resultAccumulator += primaryValue * secondaryValue;
    }
    if  (  operationSymbol  ===  "/"  )  {
        // For division, ensure the result is an integer by taking the floor.
        resultAccumulator += Math.floor(primaryValue / secondaryValue);
    }

    // Append a newline character to the accumulator after each operation's result.
    resultAccumulator += "\n";
}

// Output the final accumulated results to the console.
// Any extraneous leading or trailing whitespace is removed prior to display.
console.log(resultAccumulator.trim());