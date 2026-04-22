// This script processes input data to solve a specific problem.
// It reads from standard input, parses numerical data, and performs calculations.

var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from stdin as a UTF-8 string.

var Arr = (input.trim()).split("\n"); // Trim whitespace from input and split into an array of lines.

var I = 0; // Initialize an index to keep track of the current line being processed in Arr.

while (true) { // Main loop to process multiple test cases until a termination condition is met.

  // Parse the N and M values for the current test case.
  var NM = Arr[I].split(" ").map(Number);
  I++; // Increment the line index for the next read.

  var N = NM[0]; // N represents the number of nodes or elements.
  var M = NM[1]; // M represents the number of relationships or operations.

  // Check for the termination condition (N=0 and M=0).
  if (N == 0 && M == 0) {
    break; // Exit the loop if both N and M are zero.
  }

  // Initialize an array 'n' to keep track of certain states for N elements.
  // By default, all elements are considered 'true' (e.g., accessible, unblocked).
  var n = [];
  for (var i = 0; i < N; i++) {
    n[i] = true;
  }
  n[0] = false; // The first element (index 0) is specifically marked as 'false' (e.g., inaccessible, blocked).

  // Initialize an array 'tsd' to store parsed relationship data.
  var tsd = [];
  // Loop M times to read M relationships.
  for (var i = 0; i < M; i++) {
    // Parse each relationship line into three numbers.
    var v = Arr[I].split(" ").map(Number);
    I++; // Increment the line index.
    // Store the relationship: v[0] (time/priority), v[1]-1 (source node, 0-indexed), v[2]-1 (destination node, 0-indexed).
    tsd.push([v[0], v[1] - 1, v[2] - 1]);
  }

  // Sort the 'tsd' array based on the first element (v[0]), which typically represents time or priority.
  tsd.sort(function (a, b) {
    return a[0] - b[0];
  });

  // Process each relationship in the sorted 'tsd' array.
  tsd.forEach(function (v) {
    var s = v[1]; // Source node index.
    var d = v[2]; // Destination node index.
    // If the source node 's' is marked as 'false' (inaccessible/blocked),
    // then the destination node 'd' also becomes 'false'.
    if (!n[s]) {
      n[d] = false;
    }
  });

  // Count the number of elements in 'n' that are marked as 'false'.
  var cnt = 0;
  n.forEach(function (v) {
    if (!v) { // If an element's state is 'false'.
      cnt++; // Increment the counter.
    }
  });

  // Output the final count for the current test case.
  console.log(cnt);
}

// End of script.