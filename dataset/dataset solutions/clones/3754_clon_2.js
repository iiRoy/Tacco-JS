function ProcessInput(rawData) {
  // Split the incoming text into individual lines
  let linesOfText = rawData.split("\n");

  // Parse the second line of input into an array of numbers
  // The first line is typically metadata, we're interested in the actual data.
  let numericValues = linesOfText[1].split(" ").map((val) => Number(val));

  // Initialize a counter for the total number of divisions by two
  let totalDivisions = 0;

  // Iterate through each number in our parsed array
  for (let currentNumber of numericValues) {
    // While the current number is even, keep dividing it by two
    // and increment our division counter.
    while (currentNumber % 2 === 0) {
      currentNumber = currentNumber / 2;
      totalDivisions++; // Increment the count of successful divisions
    }
  }

  // Output the final accumulated count of divisions
  console.log(totalDivisions);
}

// Read input from standard input and pass it to our processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
