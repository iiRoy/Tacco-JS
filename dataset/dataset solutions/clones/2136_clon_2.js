// This function receives all raw incoming textual data.
function ProcessData(rawData) {

  let firstLine = rawData.split('\n')[0]; // Extract the initial line of the input stream.

  const baseNumber = parseInt(firstLine.split(' ')[0]); // Parse the first numerical value.
  const targetBase = parseInt(firstLine.split(' ')[1]); // Parse the second numerical value, representing the desired numeral system base.

  console.log( (baseNumber.toString(targetBase)).length ); // Output the digit count when the first number is converted to the specified base.

}

/* Do not modify the following line; it handles reading from standard input and invoking the primary routine. */
ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") );