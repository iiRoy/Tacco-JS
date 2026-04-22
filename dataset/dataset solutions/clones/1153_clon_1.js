/* This is a Type I clone generated for demonstration purposes.
 * It maintains exact logical and structural identity with the original code,
 * differing only in whitespace and comments.
 *
 * The original code implements a Disjoint Set Union (DSU) data structure
 * and uses it to process queries from standard input.
 */

// Declare the parent array for the DSU structure.
var par = [];

/**
 * Initializes the DSU structure for 'n' elements.
 * Each element is initially its own parent.
 * @param {number} n - The number of elements to initialize.
 */
function init(n) {
  // Loop through each element from 0 to n-1.
  for (var i = 0; i < n; i++) {
    /* Set the parent of element 'i' to 'i' itself.
     * This establishes 'i' as the representative of its own set.
     */
    par[i] = i;
  } // End of for loop for initialization.
} // End of init function definition.


/**
 * Finds the representative (root) of the set containing element 'x'.
 * Uses path compression for optimization.
 * @param {number} x - The element to find the representative for.
 * @returns {number} The representative of the set containing 'x'.
 */
function find(x) {
  // If 'x' is its own parent, it is the representative.
  if (par[x] == x)
    return x;

  // Otherwise, recursively find the representative and apply path compression.
  // The parent of 'x' is updated to be the root of its set.
  return par[x] = find(par[x]);
} // End of find function.


/**
 * Checks if two elements 'x' and 'y' belong to the same set.
 * @param {number} x - The first element.
 * @param {number} y - The second element.
 * @returns {boolean} True if 'x' and 'y' are in the same set, false otherwise.
 */
function isSame(x, y) {
  // Elements are in the same set if their representatives are identical.
  return find(x) == find(y);
} // End of isSame function.


/**
 * Merges the sets containing elements 'x' and 'y'.
 * If 'x' and 'y' are already in the same set, nothing happens.
 * @param {number} x - The first element.
 * @param {number} y - The second element.
 */
function union(x, y) {
  // Find the representatives of the sets containing 'x' and 'y'.
  x = find(x);
  y = find(y);

  // If they are already in the same set (have the same representative), do nothing.
  if (x == y)
    return;

  // Otherwise, merge the sets by making the representative of 'x' point to the representative of 'y'.
  par[x] = y;
} // End of union function.


// Main execution block starts here.

// Read the entire standard input, decode as UTF-8, and remove leading/trailing whitespace.
var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Split the input string into an array of lines.
var lines = input.split('\n');

/* Process the first line of input.
 * It contains two space-separated integers: n (number of elements) and q (number of queries).
 */
var items = lines.shift().trim().split(' ');
var n = +items[0]; // Convert the first item to a number for 'n'.
var q = +items[1]; // Convert the second item to a number for 'q'.


// Initialize the DSU structure with 'n' elements.
init(n);


// Declare a variable to hold each line read from input.
var line;

// Loop through the remaining lines, processing each query.
// This loop continues as long as there are lines to shift and process.
while (line = lines.shift()) {
  // Trim whitespace from the current line and split it by spaces to get command parts.
  var com = line.trim().split(' ');

  // Check the first part of the command to determine the operation.
  if (com[0] == 0) {
    // If the command is '0', it's a union operation.
    // Call union with the second and third parts of the command (converted to numbers implicitly by find).
    union(com[1], com[2]);
  } else {
    // If the command is not '0' (implicitly '1' based on problem context), it's a query for sameness.
    // Check if the second and third parts of the command are in the same set.
    // Print 1 if true, 0 if false.
    console.log(isSame(com[1], com[2]) ? 1 : 0);
  } // End of if-else for command processing.
} // End of while loop for processing queries.

// End of the JavaScript program.
// This concludes the Type I clone generation.