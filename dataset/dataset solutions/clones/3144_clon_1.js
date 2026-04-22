const BKRT = "\n"; // Newline character constant
const SPAC = " "; // Space character constant
const NOSP = ""; // Empty string constant - not used, but kept for completeness.

// Main function that processes the input string.
function Main(input) {
  // Split the input string by newline, then each line by space.
  // This creates a 2D array of strings.
  input = input.split(BKRT).map(a => a.split(SPAC));

  // Helper function to shift a string value from the processed input.
  const strShift = () => {
    // Get the first array (line) from the input.
    var a = input.shift();
    // Get the first element (word) from that array.
    var b = a.shift();

    // If there are still elements left in the current line,
    // put the modified line back at the beginning of the input array.
    if (a.length) {
      input.unshift(a);
    }

    // Return the shifted string.
    return b;
  };

  // Helper function to shift an integer value.
  // It uses the strShift and then converts the result to an integer
  // using the bitwise NOT operator twice (~~).
  const intShift = () => ~~strShift();

  // Read the number of items (N) and the initial budget (M).
  var N = intShift();
  var M = intShift();

  // Initialize an empty array to store the item details.
  var o = [];

  // Loop N times to read N items.
  for (var i = 0; i < N; i++) {
    // Each item has a price and a quantity.
    o.push([intShift(), intShift()]);
  }

  // Sort the items by price in ascending order.
  o.sort((a, b) => a[0] - b[0]);

  // Initialize the total cost (ans).
  var ans = 0;

  // Continue as long as there is budget (M > 0).
  while (M) {
    // Get the cheapest item available.
    var b = o.shift();

    // Check if the remaining budget (M) is enough to buy all of this item.
    if (M >= b[1]) {
      // If yes, subtract the item's quantity from the budget.
      M -= b[1];
      // Add the total cost of this item to the answer.
      ans += b[0] * b[1];
    } else {
      // If no, buy as much as the budget allows.
      // Add the cost of the partial purchase to the answer.
      ans += b[0] * M;
      // Set budget to 0 as it's fully spent.
      M = 0;
    }
  }

  // Return the calculated total minimum cost.
  return ans;
}

// This section handles environment-specific execution.
// It checks if 'require' is defined (Node.js environment).
// If in Node.js, it reads from stdin, calls Main, and prints to console.
// Otherwise (e.g., browser), it defines a self-invoking function
// that processes a hardcoded input string, similar to a testing harness.
((b, c, d) => "undefined" != typeof require ? console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8"))) : [b = b.split("\n").slice(1, -1).join("\n"), c = function() {
  try {
    return Main(b)
  } catch (f) {
    return f.stack || f.message
  }
}(), d = typeof c, "string" == d || (c = JSON.stringify(c)), $("<form>").append([[10, b], 0, [1, d], 0, [10, c]].map(f => $(f ? "<textarea>" : "<br>", f && {
  rows: f[0],
  cols: 40,
  text: f[1]
}))).appendTo("body")])(`
4 30
6 18
2 5
3 10
7 9
`);
// The input data for the browser environment is provided here.