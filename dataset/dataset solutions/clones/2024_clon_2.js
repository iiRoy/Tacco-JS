function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  let parsedLines = rawData.split("\n");

  // Parse the first line as an integer, representing the main numeric value
  let initialValue = parseInt(parsedLines[0]);

  // Calculate the quotient when the initial value is divided by 500
  let firstQuotient = initialValue / 500;

  // Calculate the remainder of the initial value divided by 500, then divide that by 5
  let secondQuotient = (initialValue % 500) / 5;

  // Sum the floor of both calculated quotients and print the result
  console.log(Math.floor(firstQuotient) + Math.floor(secondQuotient));
}

// Read content from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
