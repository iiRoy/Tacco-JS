"use strict"; /* This directive enforces strict mode for the entire script.
                       * It helps catch common coding errors and "unsafe" actions. */


// --- Input/Output Utility Functions Section ---
// This section handles reading input from /dev/stdin and parsing it efficiently.

var input = require("fs").readFileSync("/dev/stdin", "utf8"); // Reads the entire content of standard input synchronously as UTF-8.

var cin = input.split(/ |\n/), // Splits the input string by spaces or newlines into an array of strings.
    cid = 0;                  // cid serves as an index for the 'cin' array, tracking the current position.

/**
 * @function next
 * @description Retrieves the next token from the input array and converts it to a number.
 * @returns {number} The next numerical token.
 */
function next ( ) {
  return +cin[cid++]; // The unary plus operator converts the string token to a number.
}


/*
 * @function nextstr
 * @description Retrieves the next token from the input array as a string.
 * @returns {string} The next string token.
 */
function nextstr( ) {
  return cin[cid++];
}


// A function to read a BigInt value.
function  nextbig ( ) {
  return BigInt(cin[cid++]);
}


/*
 * @function nexts
 * @description Reads 'n' tokens from the input.
 *              Optionally converts them to numbers if 'a' is falsy.
 * @param {number} n The number of tokens to read.
 * @param {boolean} [a] If true, returns strings; otherwise, returns numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function nexts ( n, a ) {
  return a ? cin.slice(cid, cid += n) // If 'a' is true, return string slices.
           : cin.slice(cid, cid += n).map( a => +a ); // Otherwise, map to numbers.
}


/**
 * @function nextm
 * @description Reads a 2D matrix of dimensions h x w from the input.
 *              Optionally converts elements to numbers.
 * @param {number} h The number of rows (height).
 * @param {number} w The number of columns (width).
 * @param {boolean} [a] If true, returns string arrays; otherwise, returns number arrays.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function nextm ( h, w, a ) {
  var r = [ ], // Initialize an empty array for rows.
      i = 0;   // Loop counter.

  if ( a ) {
    for ( ; i < h ; i++ ) {
      r.push(cin.slice(cid, cid += w)); // Add string slices for each row.
    }
  } else {
    for ( ; i < h ; i++ ) {
      r.push(cin.slice(cid, cid += w).map( a => +a )); // Add number-converted slices for each row.
    }
  }
  return r; // Return the constructed matrix.
}


/*
 * @function xArray
 * @description Creates a multi-dimensional array initialized with a given value.
 *              Utilizes eval for dynamic array creation, which can be risky in other contexts.
 * @param {*} v The value to initialize array elements with.
 * @param {...number} dimensions The dimensions of the array (e.g., d1, d2, d3).
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments, // 'a' holds all arguments passed to xArray.
      l = a.length,  // 'l' is the total number of arguments.
      r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Innermost array creation string.

  while ( --l ) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"; // Build up outer array creation strings.
  }
  return eval(r); // Execute the dynamically created array creation string.
}


// --- Main Program Execution Block ---

// Call the main logic function and store its result.
var myOut = main();

// If main() returns a value (i.e., not undefined), print it to standard output.
if ( myOut !== undefined ) {
  console.log( String(myOut) ); // Ensure the output is a string.
}


// --- The Core Logic: main function ---

/**
 * @function main
 * @description Contains the primary algorithm logic for the problem.
 * @returns {number} The final calculated result.
 */
function main ( ) {

  // Read the initial integer 'n' from input.
  var n = next();

  /*
   * Initialize a 2D dynamic programming array 'dp' of size (n+1) x (n+1).
   * All elements are initialized to -1.
   * 'add' is a counter, possibly for special cases.
   */
  var dp = xArray(-1, n + 1, n + 1),
      add = 0;

  /*
   * Read the first two numbers into array 'a', then sort them in ascending order.
   * 'q' is declared here but initialized later within the 'solve' function;
   * it likely acts as a queue or temporary storage.
   */
  var a = nexts(2).sort((a, b) => a - b),
      q;

  // Initialize specific base cases in the DP table to 0.
  // These likely represent initial states or conditions.
  dp[0][0]     = 0;
  dp[0][a[0]]  = 0;
  dp[0][a[1]]  = 0;
  dp[a[0]][a[1]] = 0;


  // Loop 'n-1' times to process subsequent sets of input.
  for ( var i = 1 ; i < n ; i++ ) {

    // Read three more numbers, sort them, and update 'a'.
    a = nexts(3).sort((a, b) => a - b);

    // Call the 'solve' function with the three sorted numbers.
    solve(...a);
  }

  // Read one final number into 'a' (reusing the variable name).
  a = next();

  // Calculate and return the final result.
  // It's the maximum of two DP states, plus the accumulated 'add' value.
  return Math.max( dp[0][0], dp[a][a] + 1 ) + add;


  // --- Nested Helper Functions for DP State Transitions ---

  /**
   * @function solve
   * @description Processes a triplet of numbers (u, v, w) to update DP states.
   *              This is the main recursive-like function that orchestrates DP updates.
   * @param {number} u First number of the triplet.
   * @param {number} v Second number of the triplet.
   * @param {number} w Third number of the triplet.
   */
  function solve ( u, v, w ) {

    // Base case or special condition: if u and w are equal, increment 'add' and return.
    if ( u === w ) {
      return add++;
    }

    // Initialize 'q' as an empty array (acting as a stack/queue for updates).
    q = [ ];

    // Call solve1 with 'u'.
    solve1(u);

    // Conditionally call solve1 with 'v' if u < v.
    if ( u < v ) {
      solve1(v);
    }

    // Conditionally call solve1 with 'w' if v < w.
    if ( v < w ) {
      solve1(w);
    }

    // Call solve2 with (u, v).
    solve2(u, v);

    // Conditionally call solve2 with (u, w) if v < w.
    if ( v < w ) {
      solve2(u, w);
    }

    // Conditionally call solve2 with (v, w) if u < v.
    if ( u < v ) {
      solve2(v, w);
    }

    // Call solve3 with the full triplet (u, v, w).
    solve3(u, v, w);

    /*
     * After all calls to solve1, solve2, solve3 (which push potential updates to 'q'),
     * process the 'q' to apply the updates to the 'dp' table.
     * Elements are popped in triplets: z (value), y (column), x (row).
     */
    while ( q.length ) {
      var x = q.pop(), // Row index.
          y = q.pop(), // Column index.
          z = q.pop(); // New DP value.

      // If the new value 'z' is greater than the current DP state, update it.
      if ( dp[x][y] < z ) {
        dp[x][y] = z;
      }
    }
  }


  /**
   * @function solve1
   * @description Handles specific DP transitions related to a single value 'u'.
   * @param {number} u The value to process.
   */
  function solve1 ( u ) {
    // Call f1 with specific indices, possibly a base case for this type of update.
    f1(0, 0, u, u);

    // Loop from 0 up to (but not including) 'u'.
    for ( var i = 0 ; i < u ; i++ ) {
      f0(i, u, 0, i);
    }

    // Loop from 'u' up to 'n'.
    for ( var i = u ; i <= n ; i++ ) {
      f0(u, i, 0, i);
    }
  }


  /**
   * @function solve2
   * @description Handles DP transitions related to a pair of values (u, v).
   * @param {number} u First value of the pair.
   * @param {number} v Second value of the pair.
   */
  function solve2 ( u, v ) {
    // Call f0 for (u, v) and (0, 0).
    f0(u, v, 0, 0);

    // Call f1 for (0, v) and (u, u).
    f1(0, v, u, u);

    // Conditional logic based on whether u is less than v.
    if ( u < v ) {
      f1(0, u, v, v);
    } else { // This block executes if u === v.
      // Specific loops for the u=v case.
      for ( var i = 0 ; i < u ; i++ ) {
        f1(0, i, i, u);
      }
      for ( var i = u ; i <= n ; i++ ) {
        f1(0, i, u, i);
      }
    }
  }


  /**
   * @function solve3
   * @description Handles DP transitions related to a triplet of values (u, v, w).
   * @param {number} u First value of the triplet.
   * @param {number} v Second value of the triplet.
   * @param {number} w Third value of the triplet.
   */
  function solve3 ( u, v, w ) {
    // Call f1 for (v, w) and (u, u).
    f1(v, w, u, u);

    // Conditional logic based on u < v.
    if ( u < v ) {
      f1(u, w, v, v); // Call f1 for (u, w) and (v, v).

      // Nested conditional logic based on v < w.
      if ( v < w ) {
        f1(u, v, w, w); // Call f1 for (u, v) and (w, w).
      } else { // This block executes if v === w.
        // Specific loops for the v=w case.
        for ( var i = 0 ; i < u ; i++ ) {
          f1(i, u, i, w);
        }
        for ( var i = u ; i < w ; i++ ) {
          f1(u, i, i, w);
        }
        for ( var i = w ; i <= n ; i++ ) {
          f1(u, i, w, i);
        }
      }
    } else { // This block executes if u === v.
      // Specific logic for the u=v case.
      f1(u, u, w, w); // Call f1 for (u, u) and (w, w).

      for ( var i = 0 ; i < u ; i++ ) {
        f1(i, w, i, u);
      }
      for ( var i = u ; i < w ; i++ ) {
        f1(i, w, u, i);
      }
      for ( var i = w ; i <= n ; i++ ) {
        f1(w, i, u, i);
      }
    }
  }


  /**
   * @function f0
   * @description A helper function to push potential DP updates to 'q' without incrementing value.
   *              It compares dp[a][b] with dp[c][d] and queues an update if dp[c][d] is greater.
   * @param {number} a Row index for the target DP state.
   * @param {number} b Column index for the target DP state.
   * @param {number} c Row index for the source DP state.
   * @param {number} d Column index for the source DP state.
   */
  function f0 ( a, b, c, d ) {
    // If the source DP value is greater than the target, queue an update.
    if ( dp[a][b] < dp[c][d] ) {
      q.push(dp[c][d], b, a); // Push value, column, row.
    }
  }


  /**
   * @function f1
   * @description A helper function to push potential DP updates to 'q' with an incremented value.
   *              It compares dp[a][b] with dp[c][d]+1 and queues an update if dp[c][d]+1 is greater.
   * @param {number} a Row index for the target DP state.
   * @param {number} b Column index for the target DP state.
   * @param {number} c Row index for the source DP state.
   * @param {number} d Column index for the source DP state.
   */
  function f1 ( a, b, c, d ) {
    // If the incremented source DP value is greater than the target, queue an update.
    if ( dp[a][b] < dp[c][d] + 1 ) {
      q.push(dp[c][d] + 1, b, a); // Push value+1, column, row.
    }
  }

} // End of main function.