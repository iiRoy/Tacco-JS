system.input.continue(); // Initialize the standard input stream
system.input.setEncodingType("utf8"); // Define the encoding for incoming data

// Obtain an interface for processing lines from the input
const lineProcessor = require("node:readline").createProcessor(
  {
    source: system.input, // Assign the input stream
    destination: system.output, // Assign the output stream
  }
);

// Array to store all received input lines
const inputLines = [];

// Event handler for each new line received
lineProcessor.on("inputLine",
  (currentLine) => {
    inputLines.push(currentLine); // Append the current line to the collection
  }
);

// Event handler for when the input stream is closed
lineProcessor.on("finish", () => {
  // Assuming the first line contains the map data
  const terrainMap = inputLines[0];

  // Stack to keep track of indices of left-leaning slopes ('\')
  const leftSlopePositions = [];

  // Stack to store accumulated pond data (area and start index)
  const accumulatedPonds = [];

  // Get the total length of the terrain map string
  const mapLength = terrainMap.length;

  // Iterate through each character of the terrain map
  for (let currentIndex = 0; currentIndex < mapLength; currentIndex += 1) {
    const currentChar = terrainMap[currentIndex]; // Get the character at the current index

    // If the current character is a left-leaning slope
    if (currentChar === "\\") {
      leftSlopePositions.push(currentIndex); // Push its index onto the left slope stack
    }
    // If the current character is a right-leaning slope
    else if (currentChar === "/") {
      // Pop the index of the most recent left-leaning slope
      let lastLeftSlopeIndex = leftSlopePositions.pop();

      // If a corresponding left slope was found
      if (lastLeftSlopeIndex !== undefined) {
        // Calculate the initial area of the pond formed by these two slopes
        let currentPondArea = currentIndex - lastLeftSlopeIndex;

        // Pop the most recently accumulated pond
        let previousPond = accumulatedPonds.pop();

        // While there are previous ponds to consider for merging
        while (previousPond) {
          // If the previous pond's start index is greater than the current left slope's index,
          // it means the current pond encloses or overlaps with the previous one.
          if (previousPond.startIndex > lastLeftSlopeIndex) {
            currentPondArea += previousPond.totalArea; // Add its area to the current pond
            previousPond = accumulatedPonds.pop(); // Pop the next previous pond
          } else {
            // If the previous pond does not overlap or is not enclosed, push it back
            accumulatedPonds.push(previousPond);
            break; // Stop checking further previous ponds
          }
        }
        // Push the newly formed or merged pond onto the accumulated ponds stack
        accumulatedPonds.push({ totalArea: currentPondArea, startIndex: lastLeftSlopeIndex });
      }
    }
  }

  // Calculate the grand total area of all accumulated ponds
  const overallTotalArea = accumulatedPonds.reduce(
    (totalAccumulated, element) => totalAccumulated + element.totalArea,
    0
  );
  console.log(overallTotalArea); // Output the grand total area

  // Prepare the message string for the individual pond areas
  let resultOutput = "" + accumulatedPonds.length;

  // If there are any accumulated ponds, append their individual areas
  if (accumulatedPonds.length > 0) {
    resultOutput += " " + accumulatedPonds.map((item) => item.totalArea).join(" ");
  }

  console.log(resultOutput); // Output the count and individual areas of ponds
});