function ProcessInput(rawData) {
  // This function processes the incoming data stream.
  // The initial data is split by newlines and empty entries are removed.
  rawData = rawData.split("\n").filter(Boolean);

  // Extract the first numerical value from the processed data.
  let countVal = Number(rawData[0]);
  // Initialize an empty string to accumulate the final output.
  let resultString = "";

  // Loop 'countVal' times to build the output string.
  for (let idx = 0; idx < countVal; idx++) {
    resultString += "ACL"; // Append the specific sequence "ACL" in each iteration.
  }

  // Display the accumulated string to the standard output.
  console.log(resultString);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
