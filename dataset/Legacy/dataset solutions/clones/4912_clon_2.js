function ProcessInput(rawData) {
  // Trim leading/trailing whitespace and split the input string by spaces.
  rawData = rawData.trim().split(" ");

  // Parse the first part of the input as an integer, representing 'N'.
  var countVal = parseInt(rawData[0], 10);

  // Parse the second part of the input as an integer, representing 'K'.
  var factorVal = parseInt(rawData[1], 10);
 
  // Initialize a variable to store the cumulative result, starting with 'K'.
  var totalResult = factorVal;
 
  // Loop from 1 up to (but not including) 'N'.
  for (var idx = 1; idx < countVal; idx++) {
    // In each iteration, multiply the current total by (K - 1).
    totalResult *= factorVal - 1;
  }
 
  // Print the final calculated total to the console.
  console.log(totalResult);
}
 
// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
