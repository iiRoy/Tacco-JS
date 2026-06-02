function ProcessInput(rawData) {
  // Process the incoming raw data string
  let parsedData = rawData.split(" ");

  // Extract numerical components from the parsed array
  let firstValue = parsedData[0];
  let secondValue = parsedData[1];

  // Evaluate a specific condition based on the extracted values
  if (firstValue * 500 >= secondValue) {
    console.log("YES"); // Output for the true branch
  } else {
    console.log("NO"); // Output for the false branch
  }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
