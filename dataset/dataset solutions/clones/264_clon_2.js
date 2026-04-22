let permutation_counts = [];

// Initialize a 2D array to store calculated permutation frequencies.
// The outer loop handles the count dimension (up to 10 iterations for a total of 11 levels).
for (let iteration_a = 0; iteration_a <= 10; iteration_a++) {
  permutation_counts[iteration_a] = [];
  // The inner loop handles the sum dimension (up to 330).
  for (let iteration_b = 0; iteration_b <= 330; iteration_b++) {
    permutation_counts[iteration_a][iteration_b] = 0;
  }
}

let digit_availability = [];
// Initialize an array to track which digits (0-9) have been used in the current path.
for (let digit_index = 0; digit_index <= 9; digit_index++)
  digit_availability[digit_index] = false;

/**
 * Recursively calculates and stores the number of ways to form sums with digits.
 * This function explores different permutations of digits to build up sums.
 *
 * @param {number} current_total - The sum accumulated so far in the current recursive path.
 * @param {number} current_depth - The current depth of recursion, representing the number of digits placed.
 */
function compute_combinations(current_total, current_depth) {
  // Increment the counter for the specific sum and depth combination.
  permutation_counts[current_depth][current_total]++;
  current_depth++;

  // Base case: if we have placed 11 digits, stop the recursion.
  if (current_depth === 11) return;

  // Iterate through possible digits (0-9) to place next.
  for (let next_digit = 0; next_digit <= 9; next_digit++) {
    // If the digit is already used in the current path, skip it.
    if (digit_availability[next_digit]) continue;

    // Mark the digit as used.
    digit_availability[next_digit] = true;
    // Recursive call: update sum and depth, considering the new digit's contribution.
    compute_combinations(current_total + next_digit * current_depth, current_depth);
    // Backtrack: unmark the digit as used for other branches.
    digit_availability[next_digit] = false;
  }
}

// Start the recursive computation from an initial state (sum 0, depth 0).
compute_combinations(0, 0);

// Read input from standard input using Node.js file system module.
const input_data = require('node:fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: trim whitespace and split into an array of lines.
let input_lines = input_data.trim().split('\n');

// Iterate over each line of input.
input_lines.forEach(function(line_content) {
  // Parse numbers from the current line.
  const numerical_params = line_content.split(' ').map(Number);
  let param_n = numerical_params[0]; // First parameter (n)
  let param_s = numerical_params[1]; // Second parameter (s)

  // Output the pre-calculated count for the given n and s.
  // Note: The original logic uses n+1 for the first dimension.
  console.log(permutation_counts[param_n + 1][param_s]);
});