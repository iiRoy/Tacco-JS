process.stdin.resume();
process.stdin.setEncoding("utf8");

// Initialize the interface for reading line-by-line input from standard input.
const ioInterface = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout, // Output stream is not directly used for writing, but required by createInterface.
});

// Buffer to accumulate all lines received from the input stream.
const receivedInputLines = [];

// Event listener: captures each line of input as it becomes available.
ioInterface.on("line", (segmentOfLine) => {
  receivedInputLines.push(segmentOfLine);
});

// Event listener: triggered when the input stream concludes, signaling
// that all data has been received and processing can begin.
ioInterface.on("close", () => {
  // Validate if any input was actually provided.
  if (receivedInputLines.length === 0) {
    console.error("Error: No input data received. Please provide a terrain profile.");
    return; // Exit if no input.
  }

  // The first line of input is treated as the terrain profile string.
  const terrainShapeDefinition = receivedInputLines[0];

  // Stack to store the indices of encountered descending slopes ('\').
  const descendingSlopeIndices = [];
  // Stack to hold data about detected water basins (pools), including their volume and left boundary.
  const waterBasinRecords = [];

  // Iterate over each character in the terrain definition string.
  // Using a traditional for loop for precise index management.
  for (let currentCharacterIndex = 0; currentCharacterIndex < terrainShapeDefinition.length; ++currentCharacterIndex) {
    const currentTerrainSymbol = terrainShapeDefinition[currentCharacterIndex];

    // Process the symbol to determine its effect on water basins.
    switch (currentTerrainSymbol) {
      case "\\":
        // A backslash signifies the start of a potential basin. Store its index.
        descendingSlopeIndices.push(currentCharacterIndex);
        break;

      case "/":
        // A forward slash signifies an ascending slope, potentially closing a basin.
        const lastDescendingSlopeStart = descendingSlopeIndices.pop();

        // If a matching descending slope was found (i.e., the stack was not empty):
        if (lastDescendingSlopeStart !== undefined) {
          // Calculate the initial volume of the newly formed basin segment.
          let calculatedBasinVolume = currentCharacterIndex - lastDescendingSlopeStart;

          // Merge the current basin with any preceding basins that are now fully
          // enclosed or extended by the current basin's depth.
          // This loop continues as long as there are basins in storage and
          // the top basin's left boundary is to the right of the current basin's start.
          while (
            waterBasinRecords.length > 0 &&
            waterBasinRecords[waterBasinRecords.length - 1].leftEdge > lastDescendingSlopeStart
          ) {
            const enclosedBasin = waterBasinRecords.pop();
            calculatedBasinVolume += enclosedBasin.volume; // Add its volume to the current.
          }

          // Store the consolidated basin's information.
          waterBasinRecords.push({ volume: calculatedBasinVolume, leftEdge: lastDescendingSlopeStart });
        }
        break;

      default:
        // Any other character (e.g., '_') is considered flat ground and doesn't
        // directly affect basin formation, so it's simply skipped.
        // No action needed for these symbols.
        break;
    }
  }

  // Calculate the grand total volume of all accumulated water basins.
  const totalAccumulatedVolume = waterBasinRecords.reduce(
    (totalSum, basinEntry) => totalSum + basinEntry.volume,
    0
  );
  console.log(totalAccumulatedVolume);

  // Construct the second output line: count of individual basins followed by their respective volumes.
  let formattedOutputLine = "" + waterBasinRecords.length; // Start with the total count of basins.

  // If there are any basins, append their individual volumes, space-separated.
  if (waterBasinRecords.length > 0) {
    const individualVolumesString = waterBasinRecords.map((basinEntry) => basinEntry.volume).join(" ");
    formattedOutputLine += " " + individualVolumesString;
  }

  // Print the final formatted output line.
  console.log(formattedOutputLine);
});