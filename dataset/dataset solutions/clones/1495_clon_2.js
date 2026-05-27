function ProcessInputData(rawData) {
  // Parse the raw input string into an array of arrays, splitting by newlines and spaces.
  const parsedLines = rawData.split("\n").map(lineStr => lineStr.split(" "));

  // Extract the total number of items from the first element of the first line.
  const totalItems = parsedLines[0][0];

  // Define a helper function to compute connections for a given point.
  const calculateConnections = (currentIdx, coordX, coordY) => {
    // Initialize a counter for connected points, starting at 1 to include the current point.
    let connectionCount = 1;

    // Iterate through all items from 1 up to totalItems.
    for (let idx = 1; idx <= totalItems; idx++) {
      // Skip the current item to avoid self-comparison.
      if (currentIdx === idx) {
        continue;
      }

      // Extract coordinates of the other point.
      const otherX = parsedLines[idx][0];
      const otherY = parsedLines[idx][1];

      // Check if the other point is "connected" based on the specific condition.
      // Connection means either both coordinates of the current point are less than the other,
      // or both coordinates of the other point are less than the current.
      if ((coordX < otherX && coordY < otherY) || (otherX < coordX && otherY < coordY)) {
        // Log the coordinates of the connected point.
        console.log(otherX, otherY);
        // Increment the connection counter.
        connectionCount++;
      }
    }
    // Return the total count of connections found for the current point.
    return connectionCount;
  };

  // Loop through each item from 1 to totalItems to process its connections.
  for (let idx = 1; idx <= totalItems; idx++) {
    // Output a separator string for visual clarity.
    console.log("xxxxxxx");
    // Call the helper function and log its returned connection count.
    console.log(calculateConnections(idx, parsedLines[idx][0], parsedLines[idx][1]));
  }
}

// Standard boilerplate for reading input from stdin in Node.js environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
