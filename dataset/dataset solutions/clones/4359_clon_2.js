/* This function processes raw input data to find an optimal solution */
function ProcessData(rawData) {
  /* Helper function for numerical sorting in ascending order */
  function numericSort(valA, valB) {
    return valA - valB;
  }

  // Pre-process the input string: trim, split by lines, then split each line by spaces.
  rawData = rawData
    .trim()
    .split("\n")
    .map(function (lineStr) {
      return lineStr.split(" ");
    });

  // Parse the first line of numerical parameters
  let firstLineNums = rawData[0].map((strVal) => parseInt(strVal, 10));

  // Assign parameters to semantically distinct variables
  const componentA = firstLineNums[0] * 100; // Value A, scaled
  const componentB = firstLineNums[1] * 100; // Value B, scaled
  const ingredientC = firstLineNums[2]; // Value C
  const ingredientD = firstLineNums[3]; // Value D
  const maxConcentration = firstLineNums[4]; // Value E (max density percentage)
  const totalVolumeLimit = firstLineNums[5]; // Value F (total capacity)

  // Array to store combinations of A and B components
  let abCombinations = [];
  let currentSum; // Temporary variable for sums

  // Generate all possible sums of A and B components within the total volume limit
  for (let idxA = 0; idxA < totalVolumeLimit / componentA; idxA++) {
    currentSum = componentA * idxA; // Calculate current sum from component A
    for (
      let idxB = 0;
      idxB < (totalVolumeLimit - currentSum) / componentB;
      idxB++
    ) {
      abCombinations.push(currentSum + componentB * idxB); // Add combination to list
    }
  }

  // Sort the combinations and remove duplicates
  abCombinations.sort(numericSort);
  abCombinations = abCombinations.filter(function (uniqueVal, idx, arrRef) {
    return arrRef.indexOf(uniqueVal) === idx;
  });

  // Calculate the maximum possible solute amount based on total volume and max concentration
  const maxSoluteAmount = Math.floor(
    (totalVolumeLimit * maxConcentration) / (100 + maxConcentration)
  );

  // Array to store combinations of C and D ingredients
  let cdCombinations = [];

  // Generate all possible sums of C and D ingredients within the max solute amount
  for (let idxC = 0; idxC < maxSoluteAmount / ingredientC; idxC++) {
    currentSum = ingredientC * idxC; // Calculate current sum from ingredient C
    for (
      let idxD = 0;
      idxD < (maxSoluteAmount - currentSum) / ingredientD;
      idxD++
    ) {
      cdCombinations.push(currentSum + ingredientD * idxD); // Add combination to list
    }
  }

  // Sort the ingredient combinations and remove duplicates
  cdCombinations.sort(numericSort);
  cdCombinations = cdCombinations.filter(function (
    uniqueItem,
    itemIndex,
    fullArray
  ) {
    return fullArray.indexOf(uniqueItem) === itemIndex;
  });

  // Create a bitmap (boolean array) to quickly check for valid solute amounts
  let solutePresenceMap = [];
  for (let mapIndex = 0; mapIndex <= maxSoluteAmount; mapIndex++) {
    solutePresenceMap.push(0); // Initialize all entries to 0 (false)
  }

  // Mark all valid solute amounts in the bitmap
  for (let soluteAmount of cdCombinations) {
    solutePresenceMap[soluteAmount] = 1; // Mark as present (true)
  }

  // Variables to track the best density and corresponding solution
  let currentDensity = 0;
  let bestSolution = [0, 0]; // Stores [total_volume, solute_amount]

  // Initialize maximum solute bound for the inner loop
  let maxSoluteBound = maxSoluteAmount;

  // Iterate through all possible water+sugar combinations (from A and B)
  for (let waterSugarSum of abCombinations) {
    // Calculate the lower bound for solute amount based on current best density
    let minSoluteBound = Math.round(waterSugarSum * currentDensity);

    // Calculate the upper bound for solute amount, considering max concentration and total volume limit
    maxSoluteBound = Math.min(
      Math.floor((waterSugarSum * maxConcentration) / 100),
      totalVolumeLimit - waterSugarSum
    );

    // Iterate through possible solute amounts (from C and D) within the calculated bounds
    for (let soluteIter = minSoluteBound; soluteIter <= maxSoluteBound; soluteIter++) {
      // Check if the current solute amount is valid (exists in cdCombinations)
      if (solutePresenceMap[soluteIter] === 1) {
        // If a new, higher density is found
        if (soluteIter / waterSugarSum > currentDensity) {
          bestSolution[0] = waterSugarSum + soluteIter; // Update total volume
          bestSolution[1] = soluteIter; // Update solute amount
          currentDensity = soluteIter / waterSugarSum; // Update best density
        }
        // Mark this solute amount as 'used' to optimize future checks
        solutePresenceMap[soluteIter] = 0;
      }
    }
  }

  // Output the final best solution (total volume and solute amount), rounded
  console.log(
    "%d %d",
    Math.round(bestSolution[0]),
    Math.round(bestSolution[1])
  );
}

// Read input from standard input and pass it to the processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));