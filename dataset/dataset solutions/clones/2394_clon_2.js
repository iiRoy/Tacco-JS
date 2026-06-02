function processInputData(rawData) {
  // Initialize variables for graph processing
  var nodeCount = Number(rawData[0]); // Total number of nodes, parsed from the first line
  var colorAssignments = {}; // Stores arrays of colors assigned to each node
  var highestColor = 0; // Tracks the maximum color value used so far
  var assignedColors = []; // List to store the color assigned to each edge

  // Iterate through the input lines representing edges
  for (var idx = 1; idx < nodeCount; idx++) {
    // Parse the current edge's nodes
    var lineParts = rawData[idx].split(' ');
    var nodeA = Number(lineParts[0]); // First node of the edge
    var nodeB = Number(lineParts[1]); // Second node of the edge

    // Ensure color arrays exist for both nodes
    colorAssignments[nodeA] = colorAssignments[nodeA] || [];
    colorAssignments[nodeB] = colorAssignments[nodeB] || [];

    // Combine colors already assigned to both nodes
    var combinedColors = colorAssignments[nodeA].concat(colorAssignments[nodeB]);
    var currentColor = highestColor + 1; // Tentative new color

    // Check if there are any existing colors on the connected nodes
    if (combinedColors.length === 0) {
      // If no colors are assigned to either node, assign color 1
      colorAssignments[nodeA].push(1);
      colorAssignments[nodeB].push(1);
      currentColor = highestColor = 1; // Set current and highest color to 1
    } else {
      // If there are existing colors, find the smallest available color
      var existingColorsMap = {}; // Map to quickly check for used colors
      combinedColors.forEach(colorVal => {
        existingColorsMap[colorVal] = true;
      });

      // Find the smallest positive integer not in existingColorsMap
      for (var colorCandidate = 1; colorCandidate <= highestColor; colorCandidate++) {
        if (existingColorsMap[colorCandidate]) {
          continue; // This color is already used, try the next one
        } else {
          currentColor = colorCandidate; // Found an available color
          break; // Exit the loop
        }
      }

      // Assign the chosen color to both nodes
      colorAssignments[nodeA].push(currentColor);
      colorAssignments[nodeB].push(currentColor);
      // Update the highest color used if the current color is greater
      highestColor = Math.max(highestColor, currentColor);
    }
    // Store the color assigned to the current edge
    assignedColors.push(currentColor);
  }

  // Output the maximum color used
  console.log(highestColor);
  // Output each assigned edge color
  assignedColors.forEach(colorVal => {
    console.log(colorVal);
  });
}

// Read input from stdin, process it, and call the main function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
