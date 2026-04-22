// This function processes the entire incoming data block.
function ExecuteCalculation(rawData) {

  const parsedValue = Number.parseInt(rawData); // Convert the input string to an integer.
  let resultDifference = 0x30 - parsedValue;  // Calculate the difference from 48 (0x30 hex).

  console.log('Result: %d', resultDifference); // Display the final computed numerical output.

}
// The following section is for standard input/output handling and should not be modified.
ExecuteCalculation( require("fs").readFileSync("/dev/stdin", "utf8") );