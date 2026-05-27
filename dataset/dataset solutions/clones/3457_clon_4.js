function Main(input){
  const parsedInput = input.split(" ").map(val => parseInt(val, 10));
	const heightVal = parsedInput[0];
  const widthVal = parsedInput[1];
  const targetCol = parsedInput[2];
  const modulus = 1000000007;
  
  if(widthVal === 1) return 1;
  
  // Helper function to generate all valid Amida ladder configurations as bitmasks.
  // A bitmask represents the presence of horizontal bars.
  // The k-th bit (0-indexed) is 1 if there's a bar between column k and k+1.
  // Constraint: No two consecutive bits can be 1 (no two adjacent bars).
  // `barPositionsCount` is W-1, representing the number of possible bar locations.
  function generateValidAmidaMasks(barPositionsCount) {
      const validMasks = [];
      function recurseGenerate(currentBarIndex, currentMask) {
          if (currentBarIndex >= barPositionsCount) {
              validMasks.push(currentMask);
              return;
          }
          // Option 1: Do NOT place a bar at currentBarIndex
          recurseGenerate(currentBarIndex + 1, currentMask);

          // Option 2: Place a bar at currentBarIndex
          // If a bar is placed here, we cannot place one at currentBarIndex + 1.
          // So, the next bar position to consider is currentBarIndex + 2.
          recurseGenerate(currentBarIndex + 2, currentMask | (1 << currentBarIndex));
      }
      recurseGenerate(0, 0);
      return validMasks;
  }

  const validLadderConfigurations = generateValidAmidaMasks(widthVal - 1);
  
  // Precompute how many valid configurations allow a path to column `j` from `j-1`, `j`, or `j+1`.
  // `columnPathCounts[j]` stores an object with counts for paths ending at `j`.
  const columnPathCounts = Array(widthVal).fill(0).map(() => ({ fromLeft: 0, fromSelf: 0, fromRight: 0 }));

  for (const configMask of validLadderConfigurations) {
      for (let j = 0; j < widthVal; j++) {
          // Check for a bar between column j-1 and j (corresponds to bit j-1 in the mask)
          const hasBarToLeft = (j > 0) && ((configMask >> (j - 1)) & 1);
          // Check for a bar between column j and j+1 (corresponds to bit j in the mask)
          const hasBarToRight = (j < widthVal - 1) && ((configMask >> j) & 1);

          if (hasBarToLeft && !hasBarToRight) { // Path from j-1 to j
              columnPathCounts[j].fromLeft++;
          } else if (!hasBarToLeft && hasBarToRight) { // Path from j+1 to j
              columnPathCounts[j].fromRight++;
          } else if (!hasBarToLeft && !hasBarToRight) { // Path from j to j
              columnPathCounts[j].fromSelf++;
          }
          // The case `hasBarToLeft && hasBarToRight` is impossible due to `generateValidAmidaMasks` logic.
      }
  }

  // Initialize dynamic programming table
  // `dpTable[i][j]` stores the number of ways to reach column `j` at row `i`.
  const dpTable = Array(heightVal + 1);
  for(let i = 0; i <= heightVal; i++){
  	dpTable[i] = Array(widthVal).fill(0);
  }
  dpTable[0][0] = 1; // Starting point: 1 way to be at column 0 at row 0.
  
  // Fill DP table row by row
  for(let i = 1; i <= heightVal; i++){
  	for(let j = 0; j < widthVal; j++){
        let currentWays = 0;

        // Add ways coming from the left column (j-1)
        if (j > 0) {
            currentWays = (currentWays + dpTable[i-1][j-1] * columnPathCounts[j].fromLeft) % modulus;
        }

        // Add ways coming from the same column (j)
        currentWays = (currentWays + dpTable[i-1][j] * columnPathCounts[j].fromSelf) % modulus;

        // Add ways coming from the right column (j+1)
        if (j < widthVal - 1) {
            currentWays = (currentWays + dpTable[i-1][j+1] * columnPathCounts[j].fromRight) % modulus;
        }
        dpTable[i][j] = currentWays;
    }
  }
  
  return dpTable[heightVal][targetCol - 1];
}

if(typeof require !== 'undefined')console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
