"use strict"; /* This directive enables strict mode for the entire script, enforcing stricter parsing and error handling. */

// Input handling section:
// This part of the code reads input from standard input (/dev/stdin)
// and prepares it for parsing.

var input = require("fs") . readFileSync ( "/dev/stdin", "utf8" ) ; /* Reads the entire content of stdin as a UTF-8 string. */
var cin   = input . split ( / |\n/ ) , /* Splits the input string by spaces or newlines into an array of strings. */
    cid   = 0 ;                          /* 'cid' (current index) keeps track of the current position in the 'cin' array. */

/**
 * Helper function to retrieve the next value from the input array.
 * @param {boolean} a - If true, returns the string value; otherwise, converts to a number.
 * @returns {string|number} The next value from the input.
 */
function next ( a ) {
    return a
           ? cin [ cid ++ ]           /* If 'a' is truthy, return the string and increment cid. */
           : + cin [ cid ++ ] ;       /* If 'a' is falsy, convert to number, return, and increment cid. */
}

/**
 * Helper function to retrieve an array of 'n' values from the input.
 * @param {number} n - The number of values to retrieve.
 * @param {boolean} a - If true, returns string values; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array containing the next 'n' values.
 */
function nexts ( n , a ) {
    return a
           ? cin . slice ( cid, cid += n )                               /* Returns a slice of string values. */
           : cin . slice ( cid, cid += n ) . map ( a => + a ) ;          /* Returns a slice of number values. */
}

/**
 * Helper function to retrieve a 2D array (matrix) of values from the input.
 * @param {number} h - The number of rows (height) of the matrix.
 * @param {number} w - The number of columns (width) of the matrix.
 * @param {boolean} a - If true, returns string values; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {
    var r = [ ] ,                                /* Initialize an empty array to store rows. */
        i = 0 ;                                  /* Loop counter for rows. */

    if ( a ) {
        for ( ; i < h ; i ++ ) {                 /* Loop for 'h' rows, storing string values. */
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    } else {
        for ( ; i < h ; i ++ ) {                 /* Loop for 'h' rows, storing number values. */
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }
    return r ;                                   /* Return the constructed 2D array. */
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This function uses 'eval' and is generally considered unsafe for untrusted input.
 * @param {any} v - The value to initialize the innermost array elements with.
 * @returns {Array<any>} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,                          /* Get all arguments passed to the function. */
        l = a . length ,                         /* Get the number of dimensions. */
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; /* Innermost array creation string. */

    while ( -- l ) {                             /* Loop to build up outer dimensions. */
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval ( r ) ;                          /* Evaluate the constructed string to create the array. */
}

// Global variables declaration:
// These variables will be used across different functions, primarily 'main' and 'dfs'.
var n ,                                          /* 'n': Stores the number of nodes in the graph. */
    graph ,                                      /* 'graph': Adjacency list representation of the tree. */
    depth ,                                      /* 'depth': Array to store the depth of each node from the root. */
    ans ;                                        /* 'ans': Array to store the final assigned values for each node. */


// The following block was commented out in the original code,
// perhaps for testing or alternative execution flows.
// var myOut = main ( ) ;
// if ( myOut !== undefined ) console.log ( myOut ) ;


/**
 * The main function where the core logic of the program resides.
 * It reads graph input, performs DFS, and assigns values based on node depths.
 * @returns {string} A space-separated string of assigned values.
 */
function main ( ) {

  n = next ( ) ;                                 /* Read the number of nodes 'n'. */
  graph = xArray ( "[]" , n ) ;                  /* Initialize an adjacency list 'graph' for 'n' nodes. */
  depth = Array ( n ) ;                          /* Initialize 'depth' array of size 'n'. */
  ans = Array ( n ) ;                            /* Initialize 'ans' array of size 'n'. */

  // Loop to read edges and build the graph (adjacency list).
  // The graph is a tree, so 'n-1' edges are expected.
  for ( var i = 1 ; i < n ; i ++ ) {
    var a = next ( ) - 1 ,                       /* Read node 'a', adjust to 0-indexed. */
        b = next ( ) - 1 ;                       /* Read node 'b', adjust to 0-indexed. */

    graph [ a ] . push ( b ) ;                   /* Add 'b' to 'a's adjacency list. */
    graph [ b ] . push ( a ) ;                   /* Add 'a' to 'b's adjacency list (undirected graph). */
  }

  // Perform Depth First Search (DFS) starting from node 0.
  // -1 is used as the parent for the root, and 0 is its initial depth.
  dfs ( 0 , -1 , 0 ) ;

  var odd  = 0 ,                                 /* Counter for nodes at odd depth. */
      even = 0 ;                                 /* Counter for nodes at even depth. */

  // Iterate through nodes to calculate their depth parity and count odd/even depths.
  for ( var i = 0 ; i < n ; i ++ ) {
    ans [ i ] = depth [ i ] % 2 ;                /* Store 0 for even depth, 1 for odd depth. */
    if ( ans [ i ] ) {
        odd ++ ;                                 /* Increment odd count if depth is odd. */
    } else {
        even ++ ;                                /* Increment even count if depth is even. */
    }
  }

  // Calculate target counts for value groups (1, 2, 3 modulo 3).
  // n1, n2, n3 represent the ideal distribution of numbers.
  var n1 = Math . ceil ( n / 3 ) ,               /* Target count for numbers congruent to 1 mod 3. */
      n3 = n / 3 | 0 ,                           /* Target count for numbers congruent to 0 mod 3. */
      n2 = n - n1 - n3 ;                         /* Target count for numbers congruent to 2 mod 3. */

  // Initialize current values for each group, starting from 1, 2, 3.
  var a1 = 1 ,                                   /* Current number for group 1 (1, 4, 7...). */
      a2 = 2 ,                                   /* Current number for group 2 (2, 5, 8...). */
      a3 = 3 ;                                   /* Current number for group 3 (3, 6, 9...). */

  // Logic to assign numbers to nodes based on depth parity, aiming for balanced distribution.
  // The goal is to assign numbers 1, 2, 3 (and then 4, 5, 6, etc.) such that
  // nodes with odd depth mostly get one group of numbers, and even depth get another.

  if ( odd <= n3 ) {                             /* Case 1: If there are few odd-depth nodes. */
    for ( var i = 0 ; i < n ; i ++ ) {
      if ( ans [ i ] ) {                         /* If node 'i' has odd depth (ans[i] is 1). */
          ans [ i ] = a3 ;                       /* Assign a number from group 3. */
          a3 += 3 ;                              /* Increment group 3 counter. */
      } else {                                   /* If node 'i' has even depth (ans[i] is 0). */
        if ( a1 <= n ) {                         /* Try to assign from group 1. */
            ans [ i ] = a1 ;
            a1 += 3 ;
        } else if ( a2 <= n ) {                  /* Else, try to assign from group 2. */
            ans [ i ] = a2 ;
            a2 += 3 ;
        } else {                                 /* Else, assign from group 3 (fallback). */
            ans [ i ] = a3 ;
            a3 += 3 ;
        }
      }
    }
  } else if ( even <= n3 ) {                     /* Case 2: If there are few even-depth nodes. */
    for ( var i = 0 ; i < n ; i ++ ) {
      if ( ans [ i ] === 0 ) {                   /* If node 'i' has even depth (ans[i] is 0). */
          ans [ i ] = a3 ;                       /* Assign a number from group 3. */
          a3 += 3 ;
      } else {                                   /* If node 'i' has odd depth (ans[i] is 1). */
        if ( a1 <= n ) {                         /* Try to assign from group 1. */
            ans [ i ] = a1 ;
            a1 += 3 ;
        } else if ( a2 <= n ) {                  /* Else, try to assign from group 2. */
            ans [ i ] = a2 ;
            a2 += 3 ;
        } else {                                 /* Else, assign from group 3 (fallback). */
            ans [ i ] = a3 ;
            a3 += 3 ;
        }
      }
    }
  } else {                                       /* Case 3: Both odd and even counts are relatively high. */
    for ( var i = 0 ; i < n ; i ++ ) {
      if ( ans [ i ] ) {                         /* If node 'i' has odd depth. */
        if ( a1 <= n ) {                         /* Try to assign from group 1. */
          ans [ i ] = a1 ;
          a1 += 3 ;
        } else {                                 /* Else, assign from group 3. */
          ans [ i ] = a3 ;
          a3 += 3 ;
        }
      } else {                                   /* If node 'i' has even depth. */
        if ( a2 <= n ) {                         /* Try to assign from group 2. */
          ans [ i ] = a2 ;
          a2 += 3 ;
        } else {                                 /* Else, assign from group 3. */
          ans [ i ] = a3 ;
          a3 += 3 ;
        }
      }
    }
  }
  
  return ans . join ( " " ) ;                    /* Return the final assigned values as a space-separated string. */
}

/**
 * Depth First Search (DFS) function to traverse the graph and calculate node depths.
 * @param {number} v - The current node being visited.
 * @param {number} p - The parent of the current node (to avoid going back).
 * @param {number} d - The depth of the current node from the root.
 */
function dfs ( v , p , d ) {
  depth [ v ] = d ;                              /* Store the depth of the current node. */

  // Iterate through all neighbors of the current node.
  for ( var i = 0 ; i < graph [ v ] . length ; i ++ ) {
    var V = graph [ v ] [ i ] ;                  /* Get the neighbor node. */
    if ( V === p ) {                             /* If the neighbor is the parent, skip (avoid infinite loop). */
        continue ;
    }
    dfs ( V , v , d + 1 ) ;                      /* Recursively call DFS for the neighbor, incrementing depth. */
  }
}

// Conditional execution block:
// This part handles how the script is executed, potentially for competitive programming environments.
// It might fork a new process with increased stack size if executed directly.
if ( process . argv . length <= 2 ) {
    // If fewer than 2 command-line arguments (i.e., script run directly without args),
    // fork a new child process with a larger stack size.
    require ( "child_process" ) . fork ( "Main.js" , [ "1" ] , { execArgv : [ "--stack-size=240000" ] } ) ;
}
else {
  // If command-line arguments are present (e.g., indicating it's a forked child process),
  // execute the main logic.
  var myOut = main ( ) ;                         /* Call the main function. */
  if ( myOut !== undefined ) {                   /* If main returns a value (not undefined), print it. */
      console . log ( myOut ) ;
  }
}