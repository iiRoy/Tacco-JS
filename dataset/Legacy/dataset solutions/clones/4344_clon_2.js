const processInput = (rawData) => {
  // Split the raw input string into an array of lines
  const parsedLines = rawData.trim().split('\n');

  // Parse the first line as an integer
  const firstNum = parseInt(parsedLines[0]);

  // Parse the second line as an integer
  const secondNum = parseInt(parsedLines[1]);

  // Calculate the result and print it to the console
  console.log(firstNum * firstNum - secondNum);
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
