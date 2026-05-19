function ProcessInput(rawData) {
  // Split the raw input string by space to get individual components.
  let parsedValues = rawData.split(' ');

  // Calculate the result using Math.pow and integer conversions, then print it.
  console.log(Math.pow(100, parsedValues[0] >> 0) * (parsedValues[1] >> 0));
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
