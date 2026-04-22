/*
 * This JavaScript code implements a Breadth-First Search (BFS) algorithm
 * to find the shortest path in a grid-like structure.
 * It's designed to solve a specific problem involving navigating a maze
 * and collecting items in a particular sequence.
 */
function   BFS(X, Y, S) {
 // Define movement vectors for 4 directions (up, down, left, right)
 var   dx = [0, -1, 1, 0]; // X-axis changes for movements
 var   dy = [-1, 0, 0, 1]; // Y-axis changes for movements

 // Initialize a memoization table (or visited array) to store
 // the minimum remaining string length to reach a cell.
 // This helps in pruning paths that are already longer than known paths.
 var   memo = [];
 for (var i = 0; i <= 1000; i++) {
  memo[i] = [];
  for (var j = 0; j <= 1000; j++) {
   // Initialize with the full length of the target string,
   // meaning no part of the string has been collected yet.
   memo[i][j] = S.length;
  } // End of inner loop for j
 } // End of outer loop for i

 // Initialize a counter for the number of steps taken.
 var   cnt = 0;

 // Initialize the BFS queue with the starting position,
 // initial step count, and the full target string.
 var   bfs = [[X, Y, cnt, S]];

 // Start the BFS loop. It continues until explicitly broken.
 while (true) {
  // If the queue is empty, no path was found, so set count to Infinity
  // and break the loop.
  if (bfs.length == 0) {
   cnt = Infinity;
   break;
  }

  // Dequeue the first element (leaf) from the BFS queue.
  var   leaf = bfs.shift();

  // Extract coordinates (x, y), current step count (c),
  // and remaining target string (s) from the dequeued element.
  var   x = leaf[0];
  var   y = leaf[1];
  var   c = leaf[2];
  var   s = leaf[3];

  // If the remaining string is empty, it means all items
  // in the sequence have been collected. This is a successful path.
  // Set the final count and break the loop.
  if (s == "") {
   cnt = c;
   break;
  }

  // Explore all 4 possible adjacent directions.
  for (var i = 0; i < 4; i++) {
   // Calculate new coordinates for the next step.
   var   xx = x + dx[i];
   var   yy = y + dy[i];

   // Keep a copy of the current remaining string for the next state.
   var   ss = s;

   // Check for boundary conditions: if the new coordinates are out of bounds,
   // skip this direction and continue to the next iteration.
   if (xx < 0 || yy < 0 || xx >= wh[0] || yy >= wh[1]) continue;

   // Check if the character at the new grid position matches
   // the first character of the remaining target string.
   // If it matches, "collect" it by slicing the string.
   if (YX[yy][xx] === s[0]) {
    ss = ss.slice(1);
   }

   // Memoization check: if we've found a path to this cell (xx, yy)
   // that results in a shorter or equal remaining string length,
   // there's no need to explore this path further as it's not optimal.
   if (memo[yy][xx] <= ss.length) {
    continue;
   }

   // If this path is better (results in a shorter remaining string),
   // update the memoization table for this cell.
   memo[yy][xx] = ss.length;

   // Enqueue the new state: new coordinates, incremented step count,
   // and the updated remaining target string.
   bfs.push([xx, yy, c + 1, ss]);
  } // End of movement loop
 } // End of BFS while loop

 // Return the minimum number of steps found, or Infinity if no path.
 return cnt;
} // End of BFS function definition


// Main program execution starts here.
// Read input from standard input.
var   input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split by newlines into an array.
var   Arr = (input.trim()).split("\n");

// Loop indefinitely until a specific termination condition is met.
while (true) {
 // Read the first line of the current test case, split by space,
 // and map to numbers to get width (wh[0]) and height (wh[1]).
 var   wh = (Arr.shift()).split(" ").map(Number);

 // Termination condition: if both width and height are 0, break the loop.
 if (wh[0] == 0 && wh[1] == 0) break;

 // Initialize arrays to store the grid (YX) and the starting position (start).
 var   YX = [];
 var   start = [];

 // Loop through each row of the grid.
 for (var i = 0; i < wh[1]; i++) {
  // Read a row, split it into individual characters.
  var   arr = (Arr.shift()).split("");
  // If the 'S' character (start) is found in this row,
  // record its coordinates [x, y].
  if (arr.indexOf("S") != -1) {
   start = [arr.indexOf("S"), i];
  }
  // Add the processed row to the grid array.
  YX.push(arr);
 } // End of grid parsing loop

 // Initialize an array to store the results of BFS for different sequences.
 var   ans = [];

 // Run BFS for each of the five target sequences and store the result
 // along with an identifier (1 through 5).
 ans.push([BFS(start[0], start[1], "2345G"), 1]);
 ans.push([BFS(start[0], start[1], "3451G"), 2]);
 ans.push([BFS(start[0], start[1], "4512G"), 3]);
 ans.push([BFS(start[0], start[1], "5123G"), 4]);
 ans.push([BFS(start[0], start[1], "1234G"), 5]);

 // Sort the results based on the number of steps (the first element of each sub-array).
 // The smallest number of steps will come first.
 ans.sort(function (a, b) {
  return a[0] - b[0];
 });

 // Output the result:
 // If the minimum steps is Infinity, print "NA".
 // Otherwise, print the identifier (ans[0][1]) and the minimum steps (ans[0][0]).
 console.log((ans[0][0] == Infinity) ? "NA" : ans[0][1] + " " + ans[0][0]);
} // End of main while loop for test cases