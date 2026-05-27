process.stdin.resume();

process.stdin.setEncoding("utf8"); // Configure input stream encoding

const inputHandler = require("readline").createInterface({
  input: process.stdin, // Assign standard input
  output: process.stdout, // Assign standard output (for readline internal use)
});

const inputLines = []; // Collection for all received input lines

inputHandler.on("line", (currentLine) => {
  inputLines.push(currentLine); // Store each line as it arrives
});

inputHandler.on("close", () => {
  // Once input stream is closed, process the data
  const terrainMap = inputLines[0]; // The first line is the terrain description

  const leftSlopeIndices = []; // Stack to track indices of '\' characters
  const waterBodies = []; // Stack to store calculated pond areas and their starting indices

  const mapLength = terrainMap.length; // Total length of the terrain string

  // Iterate through the terrain map character by character
  for (let idx = 0; idx < mapLength; idx++) {
    const charType = terrainMap[idx]; // Current character being examined

    if (charType === "\\") {
      // If it's a left slope, push its current index onto the stack
      leftSlopeIndices.push(idx);
    } else if (charType === "/") {
      // If it's a right slope, attempt to form or extend a pond
      let startIdx = leftSlopeIndices.pop(); // Get the most recent left slope index

      if (startIdx !== undefined && startIdx !== null) {
        // If a matching left slope was found
        let currentArea = idx - startIdx; // Calculate the basic area of this new pond segment
        let lastPond = waterBodies.pop(); // Retrieve the last pond from the stack

        // Check for overlapping ponds that started after the current left slope
        while (lastPond) {
          if (lastPond.initialIndex > startIdx) {
            currentArea += lastPond.totalArea; // Add the area of the overlapping pond
            lastPond = waterBodies.pop(); // Continue checking with the next pond
          } else {
            waterBodies.push(lastPond); // If it doesn't overlap, push it back and stop
            break;
          }
        }
        // Push the newly formed or extended pond onto the waterBodies stack
        waterBodies.push({ totalArea: currentArea, initialIndex: startIdx });
      }
    }
  }

  // Calculate the sum of all water areas
  const totalWaterArea = waterBodies.reduce((accumulator, element) => accumulator + element.totalArea, 0);
  console.log(totalWaterArea); // Output the total water area

  // Prepare the second line of output
  let outputMessage = "" + waterBodies.length; // Start with the count of individual water bodies

  if (waterBodies.length > 0) {
    // If there are water bodies, append their individual areas
    outputMessage += " " + waterBodies.map((element) => element.totalArea).join(" ");
  }
  console.log(outputMessage); // Output the count and individual areas
});
