function processInputData( initialString )
{
  // Parse the incoming string of numbers into an array of integers.
  let numericValues = initialString.split(" ").map( currentString => Number(currentString) );
  
  // Verify that the first numerical component does not exceed the maximum allowed value.
  if ( numericValues[0] > 8 )
  {
    return ":(";
  }
  
  // Verify that the second numerical component also does not exceed the maximum allowed value.
  if ( numericValues[1] > 8 )
  {
    return ":(";
  }
  
  // If both conditions are satisfied, return a positive confirmation message.
  return "Yay!";
}

// This self-executing anonymous function orchestrates the application's startup,
// handling environment-specific data processing and output mechanisms.
( ( sourceData, processOutput, outputType ) => {
  // Check if the script is operating within a Node.js runtime environment.
  if ( typeof require !== "undefined" ) {
    // In a Node.js context, retrieve input from standard input stream,
    // process it using the main logic, and display the final result to the console.
    console.log(
      processInputData(
        require("fs").readFileSync(
          "/dev/stdin",
          "utf8"
        )
      )
    );
  } else {
    // For browser-based execution, prepare the initial data by trimming
    // extraneous lines, then proceed with the main processing routine.
    sourceData = sourceData.split("\n").slice(1, -1).join("\n");
    
    // Execute the core processing function within a try-catch block
    // to gracefully handle and report any exceptions that may occur.
    processOutput = (function() {
      try {
        return processInputData(sourceData);
      } catch (caughtError) {
        return caughtError.stack || caughtError.message;
      }
    })();
    
    // Determine the data type of the computed result.
    outputType = typeof processOutput;
    
    // If the outcome is not already a string, convert it into a JSON string
    // for consistent display across various data types.
    if ( "string" !== outputType ) {
      processOutput = JSON.stringify(processOutput);
    }
    
    // Utilize jQuery to dynamically construct and append a form-like
    // structure to the document body, displaying the processed data
    // and its type within text area elements.
    $("<fieldset>")
      .append(
        [
          [10, sourceData],
          0,
          [1, outputType],
          0,
          [10, processOutput]
        ].map( itemDetails =>
          $(
            itemDetails ? "<textarea>" : "<br>",
            itemDetails && {
              rows: itemDetails[0],
              cols: 40,
              text: itemDetails[1]
            }
          )
        )
      )
      .appendTo("body");
  }
})(
  `
  8 8
  `
);