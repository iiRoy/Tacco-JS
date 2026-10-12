function ProcessInput(rawData) {
  // Divide the incoming data into separate lines.
  let linesOfData = rawData.split("\n");

  // Extract the first line and break it into string tokens using space as a delimiter.
  let parsedLine = linesOfData[0].split(" ");

  // Convert the string tokens into integer values for processing.
  const widthVal = Number.parseInt(parsedLine[0]);
  const heightVal = Number.parseInt(parsedLine[1]);
  const coordX = Number.parseInt(parsedLine[2]);
  const coordY = Number.parseInt(parsedLine[3]);

  // Compute a specific area value, which is one-fourth of the total area.
  let areaQuarter = (widthVal / 2) * (heightVal / 2);

  // Determine if the provided coordinates (coordX, coordY) correspond to the exact center.
  if (coordX === widthVal / 2 && coordY === heightVal / 2) {
    // If the coordinates are central, print the calculated area and a flag indicating centrality.
    console.log(areaQuarter, 1);
  } else {
    // Otherwise, print the calculated area and a flag indicating non-centrality.
    console.log(areaQuarter, 0);
  }
}

// Invoke the primary data processing routine, reading content from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
