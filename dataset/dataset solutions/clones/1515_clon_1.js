/*
 * This file enforces strict mode for better error handling and cleaner code.
 */
"use strict";

/**
 * The primary function that processes the input argument and calculates the result.
 * @param {string} arg - The raw input string containing all necessary data.
 */
const main = arg => {

  // First, we prepare the input string by trimming whitespace
  // and splitting it into an array of lines.
  arg = arg.trim().split("\n");

  // Parse the first line to extract N and K.
  // N represents the total number of elements or positions.
  // K represents the number of intervals provided.
  const N = parseInt(arg[0].split(" ")[0]);
  const K = parseInt(arg[0].split(" ")[1]);

  // Extract LR pairs (Left and Right bounds for intervals).
  // These are parsed from the lines following the first one, up to N.
  const LR = arg
    .slice(1, N + 1)
    .map(n =>
      n
        .split(" ")
        .map(l =>
          parseInt(l)
        )
    );

  // The 'steps' array is actually parsed from arg[1] which is incorrect based on problem structure.
  // Assuming 'steps' is meant to be derived differently or this is a problem specific detail.
  // For now, we keep it as is, adhering to Type I cloning.
  const steps = arg[1].split(" ").map(n => parseInt(n));

  // Initialize a map array with N+1 elements, all set to 0.
  // This will be used for an Imos method (difference array) to mark intervals.
  const map = [...Array(N + 1)].fill(0);

  // S will store the indices that fall within at least one of the K intervals.
  let S = [];

  // Apply the Imos method to mark the start and end points of intervals.
  // This loop processes each of the K intervals (L, R).
  for (let i = 0; i < K; i++) {
    const L = LR[i][0]; // Left boundary of the current interval.
    const R = LR[i][1]; // Right boundary of the current interval.

    // Increment at the start of the interval.
    map[L]++;

    // Decrement just after the end of the interval.
    // This allows us to count overlapping intervals efficiently.
    map[R + 1]--;
  }

  // Initialize a flag for tracking the current count of active intervals.
  let imosFlg = 0;

  // Iterate through the map to build the S array.
  // S contains indices where imosFlg is greater than 0, meaning they are
  // covered by at least one interval.
  for (let i = 0; i < N; i++) {
    // If map[i] is 1, an interval starts or more intervals start than end at this point.
    if (map[i] === 1) {
      imosFlg++;
    }

    // If map[i] is -1, an interval ends or more intervals end than start at this point.
    if (map[i] === -1) {
      imosFlg--;
    }

    // If imosFlg is greater than 0, it means the current index 'i' is
    // part of at least one active interval.
    if (imosFlg) {
      S.push(i); // Add this index to the S array.
    }
  }

  // console.log(map); // Debugging line, commented out in original.
  // console.log(S);   // Debugging line, commented out in original.
  // console.log("hage"); // Debugging line, commented out in original.


  // Initialize a dynamic programming array 'dp' of size N with Infinity.
  // dp[i] will store the minimum cost to reach index 'i'.
  const dp = [...Array(N)].fill(Infinity);

  // Store the length of the S array for efficient access in the loop.
  const NS = S.length;

  // Base case: The cost to reach the first element (index 0) is 1.
  dp[0] = 1;

  // DP calculation loop: Iterate from the second element up to N-1.
  for (let i = 1; i < N; i++) {

    // This section was commented out in the original code,
    // representing an alternative or previous DP approach.
    // We retain it as a comment to preserve the Type I clone.
    // let temp = Infinity;
    //
    // for(let j=1; j<=K; j++) {
    //     if(i-j >= 0) {
    //         temp = Math.min(temp, dp[i-j] + Math.abs(steps[i] - steps[i-j]));
    //     }
    // }

    // Initialize 'temp' for accumulating results for the current dp[i].
    let temp = 0;

    // Iterate through the 'S' array (indices covered by intervals).
    // This loop is crucial for calculating dp[i] based on previous states.
    for (let j = 0; j < NS; j++) {
      // Get the 'hoge' value, which is an index from the S array.
      const hoge = S[j];

      // console.log("hoge:" + hoge); // Debugging line, commented out.

      // Check conditions:
      // 1. (i - hoge) must be a valid non-negative index.
      // 2. dp[i - hoge] must be a positive value.
      // 3. dp[i - hoge] must not be Infinity (meaning it's reachable).
      if (
        i - hoge >= 0 &&
        dp[i - hoge] > 0 &&
        dp[i - hoge] !== Infinity
      ) {
        // console.log("きたよ！"); // Debugging line, commented out.

        // If conditions met, add the value of dp[i - hoge] to temp,
        // applying modulo to prevent overflow.
        temp += dp[i - hoge] % 998244353;
      }
    }

    // Assign the calculated temp value to dp[i], applying modulo again.
    dp[i] = temp % 998244353;

    // console.log("dp[i]:" + dp[i]); // Debugging line, commented out.
    // console.log("-------");       // Debugging line, commented out.
  }

  // console.log(dp); // Final debugging line, commented out.

  // Output the final result, which is the value at dp[N-1] modulo 998244353.
  console.log(dp[N - 1] % 998244353);
};

// Main execution block: Read input from stdin and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));