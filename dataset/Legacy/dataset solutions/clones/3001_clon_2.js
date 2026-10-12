// This function processes the raw input string to calculate a specific value.
function ProcessInput(rawData) {
  // Split the incoming string by space to obtain individual numeric components.
  const dataParts = rawData.split(" ");

  // Convert the first part to an integer, representing the 'a' value from the original problem.
  let firstVal = parseInt(dataParts[0]);

  // Convert the second part to an integer, representing the 'b' value.
  let secondVal = parseInt(dataParts[1]);

  // Convert the third part to an integer, representing the 't' value (time limit).
  let timeLimit = parseInt(dataParts[2]);

  // Perform the calculation: (timeLimit + 0.5) / firstVal, then take the floor, and multiply by secondVal.
  // The result is then printed to the standard output.
  console.log(Math.floor((timeLimit + 0.5) / firstVal) * secondVal);
}

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
