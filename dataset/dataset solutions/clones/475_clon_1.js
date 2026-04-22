/* This script processes input from stdin to find the shortest path
   between 'S' (start) and 'G' (goal) through a sequence of 'elements' (1-5).
   The path must visit elements in a specific cyclic order (e.g., S -> 1 -> 2 -> 3 -> 4 -> G,
   or S -> 2 -> 3 -> 4 -> 5 -> G, etc.).
   It uses dynamic programming to calculate distances.
*/

var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size
  , buffer = new Buffer(length)
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , input = buffer.toString('utf8', 0, bytesRead).split('\n');

main(); /* Entry point for the program */


function main() {
  var readLines = 0; // Tracks current line being read from input array

  while ( true ) {
    // Read field dimensions from the current line
    var fieldInfo = input[readLines].split(' ');
    var width     = fieldInfo[0] - 0; /* Convert string to integer for width */
    var height    = fieldInfo[1] - 0; /* Convert string to integer for height */

    // Termination condition: if width and height are both zero
    if ( ! width && ! height ) {
      break;
    }

    // Declare all variables at the top of the function due to hoisting and for performance (old JS engines)
    var start;
    var goal;
    var elem = [ [], [], [], [], [] ]; /* Stores positions of elements grouped by their type (1-5) */
    var c;                             /* Character from the input grid */
    var rowData;                       /* String representation of the current row */
    var elemCache;                     /* Temporary cache for an element array */
    var y;                             /* Y-coordinate (row index) */
    var x;                             /* X-coordinate (column index) */

    // Process the grid from bottom-right to top-left (reverse loops)
    for ( y = height; y--; ) { // Loop for rows
      readLines++; // Move to the next input line
      rowData = input[readLines]; // Get the current row string

      for ( x = width; x--; ) { // Loop for columns
        c = rowData[x]; // Get character at current position

        if ( c == '.' ) {
          // This is a blank space, no action needed for pathfinding
        } else if ( c == '1' || c == '2' || c == '3' || c == '4' || c == '5' ) {
          // This is an element (1-5), store its position
          elemCache = elem[c - 1]; // Get the array for this element type
          elemCache[elemCache.length] = pos(x, y); // Add position to the array
        } else if ( c == 'S' ) {
          start = pos(x, y); // Store start position
        } else {
          goal = pos(x, y); // Store goal position
        }
      }
    }

    // Variables for dynamic programming pathfinding
    var INF             = 1 << 30; /* Represents infinity for distance calculations */
    var bestElement     = -1;      /* Stores the starting element type for the shortest path */
    var currentDistance;           /* Distance for the current path being evaluated */
    var nearestDistance = INF;     /* Stores the overall shortest distance found */
    var dp;                        /* Dynamic programming table: dp[element_type][instance_index] = min_distance */
    var i;                         /* Loop counter */
    var j;                         /* Another loop counter */
    var e;                         /* Loop counter for path segments (e.g., S->1, 1->2, 2->3, etc.) */
    var len;                       /* Length variable for array initialization */
    var dpCache;                   /* General DP array cache */
    var dpCacheNow;                /* Cache for dp[now] */
    var dpCacheNowi;               /* Cache for dp[now][i] */
    var dpCacheNext;               /* Cache for dp[next] */
    var elemCacheNow;              /* Cache for elem[now] */
    var elemCacheNowi;             /* Cache for elem[now][i] */
    var elemCacheNext;             /* Cache for elem[next] */
    var now;                       /* Current element type index */
    var nowLength;                 /* Length of elem[now] */
    var next;                      /* Next element type index */
    var nextLength;                /* Length of elem[next] */

    // Iterate through all possible starting element types (0 to 4)
    for ( var selectElem = 0; selectElem < 5; selectElem++ ) {
      // Initialize DP table for each starting element choice
      dp = [ [], [], [], [], [] ];

      // Populate DP table with INF values
      for ( i = 5; i--; ) { // Reverse loop for efficiency
        len          = elem[i].length;
        dp[i].length = len; // Pre-allocate array length
        dpCache      = dp[i];

        while ( len-- ) { // Initialize all distances for this element type to infinity
          dpCache[len] = INF;
        }
      }

      now          = (selectElem + 1) % 5; // Determine the first actual element type to visit (e.g., if selectElem=0, then first is type 1)
      nowLength    = elem[now].length;
      dpCacheNow   = dp[now];
      elemCacheNow = elem[now];

      // Calculate distances from 'S' (start) to each instance of the 'now' element type
      for ( i = 0; i < nowLength; i++ ) {
        dpCacheNow[i] = dist(start, elemCacheNow[i]);
      }

      // Main DP loop: S -> E1 -> E2 -> E3 -> E4 -> G
      // 'e' iterates 3 times to cover the 4 transitions (S->E1, E1->E2, E2->E3, E3->E4)
      // The last transition E4->G is handled inside the loop for 'e == 2'
      for ( e = 0; e < 3; e++ ) {
        next          = (now + 1) % 5; // Calculate the next element type in the cyclic sequence
        dpCacheNext   = dp[next];
        elemCacheNext = elem[next];
        nextLength    = elemCacheNext.length;

        for ( i = 0; i < nowLength; i++ ) {
          dpCacheNowi   = dpCacheNow[i];
          elemCacheNowi = elemCacheNow[i];

          // Optimization: If current path already exceeds the best found distance, skip further calculation
          if ( dpCacheNowi >= nearestDistance ) {
            continue;
          }

          for ( j = 0; j < nextLength; j++ ) {
            var elemCacheNextj = elemCacheNext[j];
            // Update dp[next][j] with the minimum distance from start to elemCacheNextj via elemCacheNowi
            var newDist = dpCacheNowi + dist(elemCacheNowi, elemCacheNextj);
            dpCacheNext[j] = min(dpCacheNext[j], newDist); // Store the minimum of existing and new path

            // If this is the last intermediate element (e.g., E4 in S->E1->E2->E3->E4->G)
            if ( e == 2 ) { // This means we are calculating distances to the 4th element in the sequence
              currentDistance = dpCacheNext[j] + dist(elemCacheNextj, goal); // Add distance from last element to goal

              // Update overall shortest path if current path is better
              if ( currentDistance < nearestDistance ) {
                nearestDistance = currentDistance;
                bestElement     = selectElem;
              }
            }
          }
        }

        // Move to the next element type for the next iteration
        now          = next;
        dpCacheNow   = dpCacheNext;
        elemCacheNow = elemCacheNext;
        nowLength    = nextLength;
      }
    }

    // Output the result
    if ( nearestDistance == INF ) {
      console.log("NA"); // No path found
    } else {
      // Output the best starting element type (1-indexed) and the shortest distance
      console.log((bestElement + 1) + " " + nearestDistance);
    }

    readLines++; // Advance to the next field definition in the input
  }
}


function dist(from, to) {
  // Calculates Manhattan distance between two points represented as integers.
  // The 'pos' function encodes (x,y) into a single integer: (x << 11) + y
  // x is extracted by right-shifting 11 bits.
  // y is extracted by ANDing with 2047 (0b11111111111, which is 2^11 - 1).
  return abs((from >> 11) - (to >> 11)) + abs((from & 2047) - (to & 2047));
}


function min(a, b) {
  // Returns the minimum of two numbers using bitwise operations for speed.
  // This avoids a branch prediction penalty compared to a simple 'if' statement.
  return b + ((a - b) & ((a - b) >> 31));
}


function pos(a, b) {
  // Encodes x and y coordinates into a single integer.
  // This avoids creating objects (e.g., {x: a, y: b}) which can be slower.
  // x is stored in higher bits (shifted by 11), y in lower 11 bits.
  // This assumes max coordinate is less than 2^11 - 1 (2047).
  return (a << 11) + b;
}


function abs(a) {
  // Calculates the absolute value of a number using bitwise operations.
  // Also avoids branching.
  // If 'a' is negative, (a >> 31) will be -1 (all ones in 2's complement).
  // If 'a' is positive, (a >> 31) will be 0.
  return (a ^ (a >> 31)) - (a >> 31);
}