function ProcessInput(inputData) {
  // Split the entire input string into an array of lines.
  inputData = inputData.split('\n');

  // Parse the first line to get grid dimensions and color count.
  // Each element is converted to a number.
  inputData[0] = inputData[0].split(' ').map(val => +val);

  // Extract the grid size (N) and the number of distinct colors (C).
  const gridSize = inputData[0][0];
  const colorCount = inputData[0][1];

  // Initialize arrays to store the cost matrix and the actual color grid.
  let costMatrix = []; // Stores the cost of changing from one color to another.
  let colorGrid = [];  // Stores the initial color configuration of the grid.

  // Populate the cost matrix 'costMatrix'.
  // The next 'colorCount' lines represent the cost matrix.
  for (let rowIdx = 0; rowIdx < colorCount; rowIdx++) {
    costMatrix[rowIdx] = inputData[rowIdx + 1].split(' ').map(val => +val);
  }

  // Populate the color grid 'colorGrid'.
  // The lines after the cost matrix represent the grid itself.
  // Colors are 0-indexed, so subtract 1 from each value.
  for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
    colorGrid[rowIdx] = inputData[rowIdx + 1 + colorCount].split(' ').map(val => +val - 1);
  }

  // Initialize a 3x'colorCount' 2D array to count color occurrences
  // based on the (row + column) % 3 group.
  // colorGroupCounts[0] for (i+j)%3 == 0
  // colorGroupCounts[1] for (i+j)%3 == 1
  // colorGroupCounts[2] for (i+j)%3 == 2
  const colorGroupCounts = Array(3).fill(0).map(() => Array(colorCount).fill(0));

  // Iterate through the grid to populate 'colorGroupCounts'.
  for (let r = 0; r < gridSize; r++) {
    for (let c_idx = 0; c_idx < gridSize; c_idx++) {
      // Determine which group the current cell belongs to.
      const groupIndex = (r + c_idx) % 3;
      // Increment the count for the specific color in its corresponding group.
      colorGroupCounts[groupIndex][colorGrid[r][c_idx]]++;
    }
  }

  // Initialize the minimum total cost with a very large number.
  let minimumTotalCost = 9e9;

  // Iterate through all possible combinations of three distinct colors
  // for the three (i+j)%3 groups.
  // firstColorOption for group 0, secondColorOption for group 1, thirdColorOption for group 2.
  for (let firstColorOption = 0; firstColorOption < colorCount; firstColorOption++) {
    for (let secondColorOption = 0; secondColorOption < colorCount; secondColorOption++) {
      // Ensure the first two chosen colors are distinct.
      if (firstColorOption === secondColorOption) continue;

      for (let thirdColorOption = 0; thirdColorOption < colorCount; thirdColorOption++) {
        // Ensure all three chosen colors are distinct.
        if (firstColorOption === thirdColorOption || secondColorOption === thirdColorOption) continue;

        let currentCalculatedCost = 0; // Accumulator for the cost of this specific color combination.

        // Calculate the total cost for this combination of (firstColorOption, secondColorOption, thirdColorOption).
        // Iterate through all possible original colors.
        for (let originalColorValue = 0; originalColorValue < colorCount; originalColorValue++) {
          // Add cost for group 0: count of originalColorValue in group 0 * cost to change to firstColorOption.
          currentCalculatedCost += colorGroupCounts[0][originalColorValue] * costMatrix[originalColorValue][firstColorOption];
          // Add cost for group 1: count of originalColorValue in group 1 * cost to change to secondColorOption.
          currentCalculatedCost += colorGroupCounts[1][originalColorValue] * costMatrix[originalColorValue][secondColorOption];
          // Add cost for group 2: count of originalColorValue in group 2 * cost to change to thirdColorOption.
          currentCalculatedCost += colorGroupCounts[2][originalColorValue] * costMatrix[originalColorValue][thirdColorOption];
        }

        // Update the overall minimum total cost if the current combination is cheaper.
        minimumTotalCost = Math.min(minimumTotalCost, currentCalculatedCost);
      }
    }
  }

  // Output the final minimum total cost to the console.
  console.log(minimumTotalCost);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
