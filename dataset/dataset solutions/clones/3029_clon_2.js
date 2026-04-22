const processInputSequence = rawDataSource => { // Primary function for data handling
  let numericValues = rawDataSource.split(" "); /* Break the incoming string into segments by space */
  numericValues = numericValues.map( ( currentString ) => {
    return parseInt(currentString, 10); // Convert each string segment into an integer
  } );

  if  ( numericValues[0] < numericValues[2] && numericValues[2] < numericValues[1] )  {
    console.log("Yes"); // Condition met: values are in strictly ascending order
  }
  else if  ( numericValues[0] > numericValues[2] && numericValues[2] > numericValues[1] )  {
    console.log("Yes"); // Condition met: values are in strictly descending order
  }
  else {
    console.log("No"); // Neither strictly ascending nor strictly descending
  }
}; // End of the data processing function

processInputSequence( require("fs").readFileSync("/dev/stdin", "UTF-8") ); // Execute the handler with standard input from the system