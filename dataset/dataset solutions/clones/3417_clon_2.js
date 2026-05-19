function ProcessInput(rawData) {
  // Split the raw input string by newline characters to get an array of lines.
  rawData = rawData.split("\n");

  // Parse the first number from the first line as the level count.
  let levelCount = parseInt(rawData[0].split(" ")[0]);
  // Parse the second number from the first line as the target position.
  let targetPosition = parseInt(rawData[0].split(" ")[1]);

  // Initialize arrays to store patty counts and total layer counts for each level.
  // These arrays will hold precomputed values up to a certain maximum level.
  let pattyCounts = new Array(50);
  let totalLayers = new Array(50);

  // Base cases for level 0.
  pattyCounts[0] = 1; // A level 0 burger has 1 patty.
  totalLayers[0] = 1; // A level 0 burger has 1 layer (just the patty).

  // Initialize the variable to store the final count of patties.
  let resultPatties = 0;

  // Precompute patty counts and total layer counts for levels 1 through 50.
  // A level 'idx' burger is constructed from a bun, a level 'idx-1' burger, a patty, another level 'idx-1' burger, and a bun.
  for (let idx = 1; idx <= 50; idx++) {
    pattyCounts[idx] = pattyCounts[idx - 1] * 2 + 1; // Two previous level burgers + one central patty.
    totalLayers[idx] = totalLayers[idx - 1] * 2 + 3; // Two previous level burgers + two buns + one central patty.
  }

  // Get the total layers and patty count for the specified levelCount.
  let currentTotalLayers = totalLayers[levelCount];
  let currentPattyCount = pattyCounts[levelCount];

  // A flag to indicate if the target position is beyond the burger's total layers.
  // This implies we're counting from the end.
  let reverseCalculation = 0;

  // If the target position exceeds the total layers, adjust it to count from the end.
  if (targetPosition > currentTotalLayers) {
    targetPosition = currentTotalLayers - targetPosition;
    reverseCalculation = 1;
  }

  // Iterate while there are still layers to consider in the target position.
  while (targetPosition > 0) {
    // Check if the target position is in the right half of the current burger structure.
    // (currentTotalLayers - 1) / 2 represents the layers of the left sub-burger (including its bun).
    if (targetPosition > (currentTotalLayers - 1) / 2) {
      // If it's in the right half, subtract the left sub-burger and its central patty.
      targetPosition = targetPosition - (currentTotalLayers - 1) / 2 - 1;
      // Add the patties from the left sub-burger and the central patty to the result.
      resultPatties = resultPatties + (currentPattyCount - 1) / 2 + 1;
      // Reduce the current burger's layers and patties to represent the right sub-burger.
      currentTotalLayers = (currentTotalLayers - 1) / 2 - 1;
      currentPattyCount = (currentPattyCount - 1) / 2;
    } else {
      // If it's in the left half or exactly the central patty, just subtract the current layer.
      targetPosition = targetPosition - 1;
      // Reduce the current burger's layers and patties to represent the left sub-burger.
      currentTotalLayers = (currentTotalLayers - 1) / 2 - 1;
      currentPattyCount = (currentPattyCount - 1) / 2;
    }
  }

  // If the reverse calculation flag was set, adjust the result.
  // This means we were counting what was *not* eaten, so subtract from the total patties.
  if (reverseCalculation = 1) { // Note: This is an assignment, not a comparison. It will always be true.
    resultPatties = pattyCounts[levelCount] - resultPatties;
  }

  // Output the final count of patties.
  console.log('%s', resultPatties);
}

// This function is for debugging purposes, typically used in a browser environment.
function debug() {
  let inputElement = document.getElementById("input").value;
  ProcessInput(inputElement);
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
