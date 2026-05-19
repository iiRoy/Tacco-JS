function processInputData() {
  // Declare all variables used within this processing function
  let outerIdx, innerIdx, widthVal, heightVal, rowCoord, colCoord;
  let currentLineParts, visitedCells, gridMap, hasCycle;
  const totalLines = rawDataBuffer.length; // Store the total number of input lines

  // Iterate through each line of the input buffer
  for (outerIdx = 0; outerIdx < totalLines; outerIdx++) {
    // Split the current line by space to get width and height values
    currentLineParts = rawDataBuffer[outerIdx].split(' ');
    widthVal = parseInt(currentLineParts[0], 10); // Parse width as an integer
    heightVal = parseInt(currentLineParts[1], 10); // Parse height as an integer

    // Check for the termination condition (0 0)
    if (widthVal === 0 && heightVal === 0) {
      break; // Exit the loop if termination condition is met
    }

    // Initialize data structures for the current grid
    gridMap = []; // Array to store the grid rows
    visitedCells = {}; // Object to keep track of visited cells (for loop detection)

    // Populate the grid map with subsequent input lines
    for (innerIdx = 0; innerIdx < heightVal; innerIdx++) {
      gridMap[innerIdx] = rawDataBuffer[++outerIdx]; // Increment outerIdx to read next line
    }

    // Initialize current position and loop flag
    rowCoord = 0;
    colCoord = 0;
    hasCycle = false;

    // Simulate movement through the grid until an exit point ('.') is found or a loop is detected
    while (gridMap[rowCoord].charAt(colCoord) !== '.') {
      // Mark the current cell as visited
      visitedCells[[rowCoord, colCoord]] = true;

      // Determine the next movement based on the character at the current cell
      switch (gridMap[rowCoord].charAt(colCoord)) {
        case '>':
          colCoord += 1; // Move right
          break;
        case '<':
          colCoord -= 1; // Move left
          break;
        case 'v':
          rowCoord += 1; // Move down
          break;
        case '^':
          rowCoord -= 1; // Move up
          break;
      }

      // Check if the next cell has already been visited, indicating a loop
      if (visitedCells[[rowCoord, colCoord]] === true) {
        hasCycle = true; // Set loop flag
        break; // Exit the movement simulation loop
      }
    }

    // Output the result: 'LOOP' if a cycle was detected, otherwise the final coordinates
    console.log(hasCycle ? 'LOOP' : [colCoord, rowCoord].join(' '));
  }
}

// Global variable to accumulate raw input data
let rawDataBuffer = '';

// Set up standard input processing
process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf8'); // Specify input encoding

// Event listener for incoming data chunks
process.stdin.on('data', function(dataSegment) {
  rawDataBuffer += dataSegment; // Append data chunks to the buffer
});

// Event listener for the end of input stream
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines
  rawDataBuffer = rawDataBuffer.split('\n');
  // Call the main processing function once all input is received
  processInputData();
});
