"use strict"; //  Enforce strict mode for cleaner code.


var input = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all input from standard input as a UTF-8 string.

var cin = input.split(/ |\n/), cid = 0; // Split input by spaces or newlines, initialize current index to 0.


function next() { // Function to read the next number from the input array.
   return +cin[cid++]; // Convert the string to a number using unary plus operator, then increment index.
}


function nextstr() { // Function to read the next string token.
   return cin[cid++]; // Return the string token and advance the index.
}


function nextbig() { // Function to read the next BigInt token.
   return BigInt(cin[cid++]); // Convert the string to a BigInt and advance the index.
}


function nexts(n, a) { // Function to read 'n' tokens. If 'a' is true, return strings; otherwise, return numbers.
   return a
      ? cin.slice(cid, cid += n) // If 'a' is true, slice 'n' string tokens.
      : cin.slice(cid, cid += n).map(a => +a); // If 'a' is false, slice 'n' tokens and map them to numbers.
}


function nextm(h, w, a) { // Function to read a 2D matrix of 'h' rows and 'w' columns.
   var r = [], i = 0; // Initialize result array and row counter.
   if (a) { // If 'a' is true, read as strings.
      for (; i < h; i++) { // Loop through each row.
         r.push(cin.slice(cid, cid += w)); // Push a slice of 'w' string tokens into the result.
      }
   } else { // Otherwise, read as numbers.
      for (; i < h; i++) { // Loop through each row.
         r.push(cin.slice(cid, cid += w).map(a => +a)); // Push a slice of 'w' numeric tokens into the result.
      }
   }
   return r; // Return the 2D array.
}


function xArray(v) { // Dynamically create a multi-dimensional array initialized with value 'v'.
   var a = arguments, l = a.length, r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Start with innermost array.
   while (--l) { // Loop backwards through dimensions.
      r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"; // Wrap with outer array creation.
   }
   return eval(r); // Evaluate the constructed string to create the array.
}


var myOut = main(); // Execute the main function and store its result.

if (myOut !== undefined) { // If main function returns a value.
   console.log(String(myOut)); // Print the result to standard output.
}


function main() { // The primary logic function.

   var n = next(); // Read the first integer 'n'.

   var dp = xArray(-1, n, n), mx = 0, add = 0; // Initialize a 2D DP array with -1, max value 'mx', and 'add' counter.

   var a = nexts(2).sort((a, b) => a - b); // Read two numbers, sort them, and store in 'a'.

   var q = []; // Initialize an empty array 'q' for queue-like operations.

   dp[a[0] - 1][a[1] - 1] = 0; // Initialize DP state based on the first pair.

   for (var i = 1; i < n; i++) { // Loop 'n-1' times for subsequent inputs.

      a = nexts(3).sort((a, b) => a - b).map(a => a - 1); // Read three numbers, sort them, map to 0-indexed, store in 'a'.

      if (a[0] === a[2]) { // If the first and third elements are identical.
         add++; // Increment 'add' counter.
         continue; // Skip to the next iteration.
      }

      q = []; // Clear the queue 'q'.

      solve(a[0], a[0], a[1], a[2]); // Call solve with specific indices.

      if (a[0] !== a[1]) { // If the first and second elements are different.
         solve(a[1], a[1], a[0], a[2]); // Call solve with a different set of indices.
      } else { // If the first and second elements are identical.
         for (var j = 0; j < a[0]; j++) { // Loop from 0 up to 'a[0]'.
            solve(j, a[0], j, a[2]); // Call solve.
         }
         for (var j = a[0] + 1; j < a[2]; j++) { // Loop from 'a[0]+1' up to 'a[2]'.
            solve(a[0], j, j, a[2]); // Call solve.
         }
         for (var j = a[2]; j < n; j++) { // Loop from 'a[2]' up to 'n'.
            solve(a[0], j, a[2], j); // Call solve.
         }
      }

      if (a[1] !== a[2]) { // If the second and third elements are different.
         solve(a[2], a[2], a[0], a[1]); // Call solve with another set of indices.
      } else { // If the second and third elements are identical.
         for (var j = 0; j < a[0]; j++) { // Loop from 0 up to 'a[0]'.
            solve(j, a[1], j, a[0]); // Call solve.
         }
         for (var j = a[0]; j < a[2]; j++) { // Loop from 'a[0]' up to 'a[2]'.
            solve(j, a[2], a[0], j); // Call solve.
         }
         for (var j = a[2] + 1; j < n; j++) { // Loop from 'a[2]+1' up to 'n'.
            solve(a[2], j, a[0], j); // Call solve.
         }
      }

      while (q.length) { // While there are elements in the queue.
         var w = q.pop(), v = q.pop(), u = q.pop(); // Pop three elements (w, v, u) from the queue.
         dp[u][v] = Math.max(dp[u][v], w); // Update DP table with the maximum value.
      }
   }

   a = next() - 1; // Read the final number, convert to 0-indexed, and store in 'a'.

   solve(a, a, a, a); // Call solve one last time with all 'a'.

   return mx + add; // Return the sum of maximum value and 'add' counter.


   function solve(t, u, v, w) { // Helper function 'solve'.
      var x = Math.max(dp[v][w], dp[t][u] + 1); // Calculate 'x' based on DP values.
      q.push(v, w, x); // Push 'v', 'w', and 'x' onto the queue.
      mx = Math.max(mx, x); // Update the global maximum value 'mx'.
   }
}