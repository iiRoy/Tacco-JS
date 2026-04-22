function maximizeValue (   ) {
   // This table stores the maximum worth for each combination of artifact count and weight capacity.
   let valueTable = [];

   // Initialize rows for the dynamic programming table.
   for ( let artifactIndex = 0 ; artifactIndex <= totalArtifacts ; artifactIndex++ ) {
      valueTable[artifactIndex] = [];
   }

   // Base case: If no capacity is available, the worth is zero.
   for ( let weightCapacity = 0 ; weightCapacity <= maxWeightLimit ; weightCapacity++ ) {
      valueTable[0][weightCapacity] = 0;
   }

   // Base case: If no artifacts are considered, the worth is zero.
   for ( let artifactIndex = 0 ; artifactIndex <= totalArtifacts ; artifactIndex++ ) {
      valueTable[artifactIndex][0] = 0;
   }

   // Populate the DP table using a bottom-up approach.
   for ( let artifactIndex = 1 ; artifactIndex <= totalArtifacts ; artifactIndex++ ) {
      for ( let weightCapacity = 1 ; weightCapacity <= maxWeightLimit ; weightCapacity++ ) {
         // Check if the current artifact's mass is less than or equal to the overall maximum weight limit.
         // NOTE: The original code had 'items[i].w <= W'. This logic is preserved as per Type II cloning rules,
         // even if typically for knapsack, it would be 'items[i].w <= j' (current subproblem capacity).
         if ( artifacts[artifactIndex].mass <= maxWeightLimit ) {
            // Option 1: Include the current artifact.
            // Check if including it yields a higher worth.
            if ( artifacts[artifactIndex].worth + valueTable[artifactIndex - 1][weightCapacity - artifacts[artifactIndex].mass] > valueTable[artifactIndex - 1][weightCapacity] ) {
               valueTable[artifactIndex][weightCapacity] = artifacts[artifactIndex].worth + valueTable[artifactIndex - 1][weightCapacity - artifacts[artifactIndex].mass];
            }
            // Option 2: Exclude the current artifact.
            else {
               valueTable[artifactIndex][weightCapacity] = valueTable[artifactIndex - 1][weightCapacity];
            }
         }
         // If the current artifact's mass exceeds the overall maximum weight limit, it cannot be included.
         else {
            valueTable[artifactIndex][weightCapacity] = valueTable[artifactIndex - 1][weightCapacity];
         }
      }
   }
   // The final result is stored at the bottom-right corner of the DP table.
   return valueTable[totalArtifacts][maxWeightLimit];
}

// --- Main Program Execution ---

// Retrieve raw input data from standard input, encoded as UTF-8.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw data: trim whitespace and split into individual lines.
let lineFragments = (rawData.trim()).split("\n");

// Parse the first line to get the number of distinct artifact types and the overall weight limit.
let initialParams = (lineFragments.shift()).split(" ").map(Number);

// Extract the count of distinct artifact types.
let distinctTypes = initialParams[0];

// Extract the maximum allowed weight for the knapsack.
let maxWeightLimit = initialParams[1];

// Initialize a counter for the total number of individual artifacts generated.
let totalArtifacts = 0;

// Prepare an array to store all individual artifacts (with a null placeholder at index 0 for 1-based indexing).
let artifacts = [ null ];

// Iterate through each distinct artifact type provided in the input.
for ( let typeIterator = 1 ; typeIterator <= distinctTypes ; typeIterator++ ) {
   // Parse details for the current artifact type (value and weight per unit).
   let typeDetails = (lineFragments.shift()).split(" ").map(Number);

   // Initialize a multiplier for generating multiple units of the same artifact type.
   let unitMultiplier = 1;

   // Generate multiple instances of the current artifact type as long as their cumulative mass fits within the limit.
   do {
      // Add a new artifact instance with scaled worth and mass.
      artifacts.push({ worth: typeDetails[0] * unitMultiplier, mass: typeDetails[1] * unitMultiplier });
      // Increment the global count of artifacts.
      totalArtifacts++;
      // Increase the multiplier for the next instance.
      unitMultiplier++;
   } while ( typeDetails[1] * unitMultiplier <= maxWeightLimit ); // Condition to continue generating units.
}

// Calculate the optimal worth using the dynamic programming function.
let optimalWorth = maximizeValue();

// Display the calculated optimal worth to the console.
console.log(optimalWorth);