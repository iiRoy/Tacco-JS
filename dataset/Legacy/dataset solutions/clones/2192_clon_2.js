function ProcessInput(rawData) {
  // This function takes raw input as a single string.
  // It then processes it to extract relevant information.

  const parsedLines = rawData.split("\n"); // Divide the input string into an array of lines.

  const firstSegment = parsedLines[0].split(" "); // Split the initial line by spaces.
  const secondSegment = parsedLines[1].split(' '); // Split the subsequent line by spaces.

  console.log(firstSegment); // Display the components of the first line.
  console.log(secondSegment); // Display the components of the second line.

  const numericStrings = secondSegment; // Assign the second segment's parts to a new variable.

  // Calculate the total value by summing up the elements in the numericStrings array.
  const totalValue = numericStrings.reduce(function (accumulator, currentElement) {
    return accumulator + currentElement; // Perform addition.
  });

  // Compare the calculated total with the first element of the first segment.
  if (totalValue > firstSegment[0]) {
    console.log("Yes"); // Output "Yes" if the total is greater.
  } else {
    console.log("No"); // Otherwise, output "No".
  }
}

// Do not modify this invocation line!
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
