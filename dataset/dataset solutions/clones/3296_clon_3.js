function ProcessInput(rawData) {
  // Input processing: Splitting the raw data string into individual lines.
  const lineSegments = rawData.trim().split("\n");

  // Parsing the first line to extract problem parameters.
  const firstLineTokens = lineSegments[0].split(" ");
  // 'numPlatforms' represents N, the total count of platforms (0-indexed).
  const numPlatforms = parseInt(firstLineTokens[0], 10);
  // 'maxReach' represents K, the maximum number of steps one can jump forward.
  const maxReach = parseInt(firstLineTokens[1], 10);

  // Parsing the second line to get the height values for each platform.
  // The .map(Number) efficiently converts all string tokens to numeric values.
  const heightValues = lineSegments[1].split(" ").map(Number);

  // --- Robustness Check (Type III Addition) ---
  // A guard clause to handle potentially invalid input scenarios,
  // although competitive programming problems usually guarantee valid input.
  if (numPlatforms <= 0 || maxReach <= 0 || heightValues.length !== numPlatforms) {
    console.error("Error: Invalid input parameters provided. Please check platform count, max jump, and height array consistency.");
    // In a production system, one might throw an exception or return a specific error code.
    return;
  }

  // --- Dynamic Programming Core Logic ---

  // Initialize a data structure to store the minimum cost required to reach each platform.
  // 'costRegistry' will hold the solution for subproblems.
  // All initial costs are set to 'Infinity' to ensure that any valid path will be a minimum.
  const costRegistry = new Array(numPlatforms).fill(Infinity);

  // The cost to reach the starting platform (platform 0) is always zero, as no jumps are needed.
  costRegistry[0] = 0;

  // Iterate through each platform, starting from the second one (index 1),
  // up to the very last platform (index numPlatforms - 1).
  for (let currentPlatformIndex = 1; currentPlatformIndex < numPlatforms; currentPlatformIndex++) {
    // For the 'currentPlatformIndex', we need to consider all possible preceding platforms
    // from which a jump could have been made.
    // 'jumpDistance' represents how many steps back we are looking.
    for (let jumpDistance = 1; jumpDistance <= maxReach; jumpDistance++) {
      // Calculate the index of the potential previous platform.
      const previousPlatformIndex = currentPlatformIndex - jumpDistance;

      // --- Boundary Condition (Type III Update/Rewrite) ---
      // If 'previousPlatformIndex' is less than 0, it means we are trying to jump
      // from a non-existent platform before the start.
      // Since 'jumpDistance' only increases, further iterations for this 'currentPlatformIndex'
      // will also result in invalid previous indices, so we can break the inner loop.
      if (previousPlatformIndex < 0) {
        break;
      }

      // Retrieve the height of the platform we are currently trying to reach.
      const currentPlatformHeight = heightValues[currentPlatformIndex];
      // Retrieve the height of the platform from which we are considering jumping.
      const previousPlatformHeight = heightValues[previousPlatformIndex];

      // Calculate the cost incurred by making this specific jump.
      // The cost is the absolute difference in heights.
      const jumpCost = Math.abs(currentPlatformHeight - previousPlatformHeight);

      // Calculate the total accumulated cost to reach 'currentPlatformIndex' via 'previousPlatformIndex'.
      // This is the minimum cost to reach 'previousPlatformIndex' plus the cost of the current jump.
      const potentialTotalCost = costRegistry[previousPlatformIndex] + jumpCost;

      // Update the minimum cost for 'currentPlatformIndex' if this newly calculated path is cheaper.
      costRegistry[currentPlatformIndex] = Math.min(costRegistry[currentPlatformIndex], potentialTotalCost);
    }
  }

  // After processing all platforms, the minimum cost to reach the very last platform
  // will be stored at the final index of the 'costRegistry'.
  const finalMinimumCost = costRegistry[numPlatforms - 1];

  // Output the calculated minimum cost to the console.
  console.log(finalMinimumCost);
}

// The entry point for execution: Reads input from standard input and invokes the processing function.
// This part is typically external to the core algorithm function and handles environment specifics.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));