/*
 * This section handles input/output operations.
 * It's a common setup for competitive programming in Node.js.
 */
var read = require('readline').createInterface(
 {
    input : process.stdin,
    output: process.stdout
 }
);

var obj;
var inLine = [];

/* Event listener for each line of input. */
read.on('line', function ( input ) {
   inLine.push(input);
});

/* Event listener for when input stream closes. */
read.on('close', function ( ) {
   // Initialize the custom input object
   obj = init(inLine);

   // Print a debug message to stderr
   console.error('\n↑入力 ↓出力');

   // Execute the main logic of the program
   Main();
});


/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the object.
 */
function makeClone( obj ) {
   return ( obj instanceof Set )
      ? new Set( Array.from(obj) )
      : JSON.parse( JSON.stringify(obj) );
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The next integer.
 */
function nextInt( ) {
   return myconv( next( ), 1 );
}

/**
 * Retrieves the next line as an array of strings, split by space.
 * @returns {string[]} An array of strings.
 */
function nextStrArray( ) {
   return myconv( next( ), 2 );
}

/**
 * Retrieves the next line as an array of integers, split by space.
 * @returns {number[]} An array of integers.
 */
function nextIntArray( ) {
   return myconv( next( ), 4 );
}

/**
 * Retrieves the next line as an array of characters.
 * @returns {string[]} An array of characters.
 */
function nextCharArray( ) {
   return myconv( next( ), 6 );
}

/**
 * Retrieves the next raw input string.
 * @returns {string} The next input string.
 */
function next( ) {
   return obj.next();
}

/**
 * Checks if there is more input available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext( ) {
   return obj.hasNext();
}

/**
 * Initializes the custom input reader object.
 * @param {string[]} input - Array of input lines.
 * @returns {object} An object with list, index, max, hasNext, and next methods.
 */
function init( input ) {
   return {
      list : input,
      index : 0,
      max : input.length,

      hasNext : function ( ) {
         return ( this.index < this.max );
      },

      next : function ( ) {
         if ( this.hasNext( ) ) {
            return this.list[this.index++];
         } else {
            throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
         }
      }
   };
}

/**
 * Prints output to the console.
 * @param {any} s - The value to print.
 */
function myout( s ) {
   console.log(s);
}

/**
 * Prints debug information to stderr.
 * @param {any} s - The value to debug print.
 */
function myerr( s ) {
   console.error( 'debug:' + require('util').inspect(s, false, null) );
}

/*
 * myconv function parameters:
 *  - no = 1: parseInt
 *  - no = 2: split by space
 *  - no = 4: split by space and map to Number
 *  - no = 6: split by character
 *  - no = 7: split by character and map to Number
 *  - no = 8: join with space
 *  - no = 9: join with newline
 *  - no = 0: join without character
 *  - default: return original input
 */
function myconv( i, no ) {
   try {
      switch ( no ) {
         case 1:
            return parseInt(i);
         case 2:
            return i.split(' ');
         case 4:
            return i.split(' ').map(Number);
         case 6:
            return i.split('');
         case 7:
            return i.split('').map(Number);
         case 8:
            return i.join(' ');
         case 9:
            return i.join('\n');
         case 0:
            return i.join('');
         default:
            return i;
      }
   } catch ( e ) {
      return i;
   }
}

/* End of utility functions. */

function Main( ) {
   // Read the first line of input, which contains N and K
   var one = nextIntArray();
   var N = one[0];
   var K = one[1];

   // Initialize an array of N nodes for the tree structure
   var list = new Array(N);

   // Populate each node with its properties
   for ( var i = 0; i < N; i++ ) {
      list[i] = {
         child : [],    // Array to store children (adjacent nodes)
         no : i,        // Original index of the node
         count : 0,     // Placeholder for color count
         access : false // Flag to track if node has been visited
      };
   }

   // Read N-1 lines to build the tree (adjacency list)
   for ( var i = 0; i < N - 1; i++ ) {
      var tmp = nextIntArray();
      // Adjust for 0-based indexing
      list[tmp[0] - 1].child.push(tmp[1] - 1);
      list[tmp[1] - 1].child.push(tmp[0] - 1);
   }

   // Initialize output and modulo constant
   var output = 1;
   var mod = 1000000007;

   // Mark the root node (node 0) as accessed
   list[0].access = true;

   // Use a stack for iterative DFS/BFS-like traversal
   // Each element: [parentNodeCount, availableColors, currentNodeIndex]
   var stack = [[0, K, 0]];

   // Process nodes while the stack is not empty
   while ( stack.length > 0 ) {
      var tmp = stack.pop(); // Get the current node's state
      var parentNodeCount = tmp[0];
      var color = tmp[1];
      var now = tmp[2];

      // Assign the calculated color count to the current node
      list[now].count = color;

      // Increment parentNodeCount if less than 2 (for root/first child handling)
      if ( parentNodeCount < 2 ) {
         parentNodeCount++;
      }

      var child = list[now].child;
      var successCount = 0; // Counter for successfully colored children

      // Iterate through children of the current node
      for ( var i = 0; i < child.length; i++ ) {
         // If a child has not been accessed yet
         if ( !list[child[i]].access ) {
            list[child[i]].access = true; // Mark as accessed
            // Push child onto stack with updated color calculation
            stack.push([parentNodeCount, K - successCount - parentNodeCount, child[i]]);
            successCount++; // Increment count of successfully processed children
         }
      }
   }

   // Calculate the final output by multiplying color counts and applying modulo
   for ( var i = 0; i < N; i++ ) {
      output *= list[i].count;
      output %= mod;
   }

   // Print the final result
   myout(output);


   // This DFS function is defined but not called in the provided Main logic.
   // It seems to be an alternative or leftover implementation for a similar problem.
   function dfs( parentNodeCount, color, now, constK ) {
      list[now].count = color;
      if ( parentNodeCount < 2 ) {
         parentNodeCount++;
      }
      var child = list[now].child;
      var successCount = 0;
      for ( var i = 0; i < child.length; i++ ) {
         if ( !list[child[i]].access ) {
            list[child[i]].access = true;
            dfs( parentNodeCount, constK - successCount - parentNodeCount, child[i], constK );
            successCount++;
         }
      }
   }
}