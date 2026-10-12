function processData(rawData) {
  // Split the incoming string by spaces to get individual arguments.
  let parameters = rawData.split(" ");

  // Extract the first value from the parsed parameters.
  let firstVal = parameters[0];

  // Extract the same first value again, but assign it to a different variable name.
  let secondVal = parameters[0];

  // Perform a calculation and print the result to the console.
  // Note: Since firstVal and secondVal are identical, the result will always be 1.
  console.log(firstVal - secondVal + 1);
}

// Read input from standard input and pass it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
