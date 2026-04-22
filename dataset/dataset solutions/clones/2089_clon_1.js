// This section contains utility functions for input/output and data processing.
// It's usually part of a competitive programming template.
// ----------------------------------------------------------------------------------------------------------------------
var   read   =   require('readline') .createInterface (   {
  input:   process.stdin,
  output:   process.stdout
}   )   ;

// Declare global variables for input handling
var   obj   ;
var   inLine   =   [ ]   ;

// Event listener for each line of input
read .on (   'line'   ,   function(input)   {
  inLine .push (   input   )   ;
}   )   ;

// Event listener for the end of input
read .on (   'close'   ,   function (   )   {
  // Initialize the input object
  obj   =   init (   inLine   )   ;

  // Print a newline to stderr for visual separation (often for debug output)
  console .error (   '\n'   )   ;

  // Record the start time for performance measurement
  var   start   =   Date .now (   )   ;

  // Execute the main logic of the program
  Main (   )   ;

  // Calculate the elapsed time
  var   end   =   Date .now (   )   -   start   ;

  // Output performance metrics to stderr
  myerr (   'time   :   '   +   end   +   'ms'   )   ;
  myerr (   'memory   :   '   +   Math .round (   process .memoryUsage (   ) .heapTotal   /   1024   )   +   'KB'   )   ;
}   )   ;

/**
 * Creates a deep clone of an object or Set.
 * For Sets, it creates a new Set from the array representation.
 * For other objects, it uses JSON serialization/deserialization for a deep copy.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function   makeClone (   obj   )   {
  return   (   obj   instanceof   Set   )   ?   new   Set (   Array .from (   obj   )   )
                                      :   JSON .parse (   JSON .stringify (   obj   )   )   ;
}

// Convenience functions for reading different types of input
function   nextInt (   )   {
  return   myconv (   next (   )   ,   1   )   ;
}

function   nextStrArray (   )   {
  return   myconv (   next (   )   ,   2   )   ;
}

function   nextIntArray (   )   {
  return   myconv (   next (   )   ,   4   )   ;
}

function   nextCharArray (   )   {
  return   myconv (   next (   )   ,   6   )   ;
}

// Get the next input token/line
function   next (   )   {
  return   obj .next (   )   ;
}

// Check if there's more input available
function   hasNext (   )   {
  return   obj .hasNext (   )   ;
}

/**
 * Initializes an input reader object.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with methods to access input lines.
 */
function   init (   input   )   {
  return   {
    list   :   input   ,
    index   :   0   ,
    max   :   input .length   ,

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more input is available, false otherwise.
     */
    hasNext   :   function (   )   {
      return   (   this .index   <   this .max   )   ;
    }   ,

    /**
     * Retrieves the next line of input.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     */
    next   :   function (   )   {
      if   (   this .hasNext (   )   )   {
        return   this .list [   this .index++   ]   ;
      }   else   {
        throw   'ArrayIndexOutOfBoundsException ‚There is no more input'   ;
      }
    }
  }   ;
}

/**
 * Prints a value to standard output, followed by a newline.
 * @param {any} s - The value to print.
 */
function   myout (   s   )   {
  console .log (   s   )   ;
}

/**
 * Prints a debug message to standard error.
 * Uses util.inspect for pretty printing objects.
 * @param {any} s - The value to print as a debug message.
 */
function   myerr (   s   )   {
  console .error (   'debug:'   +   require('util') .inspect (   s   ,   false   ,   null   )   )   ;
}

// Documentation for the myconv function's 'no' parameter
// param "no" is
// unknown or outlier : return i. 1: parseInt.
// 2: split space. 4: split space and parseInt.
// 6: split 1 character. 7: split 1 character and parseInt.
// 8: join space. 9: join nextline. 0: join no character.
/**
 * Converts or processes input based on the 'no' parameter.
 * @param {string | string[]} i - The input string or array of strings.
 * @param {number} no - The conversion type identifier.
 * @returns {any} The converted or processed value.
 */
function   myconv (   i   ,   no   )   {
  try   {
    switch   (   no   )   {
      case   1   :
        return   parseInt (   i   )   ;
      case   2   :
        return   i .split (   ' '   )   ;
      case   4   :
        return   i .split (   ' '   ) .map (   Number   )   ;
      case   6   :
        return   i .split (   ''   )   ;
      case   7   :
        return   i .split (   ''   ) .map (   Number   )   ;
      case   8   :
        return   i .join (   ' '   )   ;
      case   9   :
        return   i .join (   '\n'   )   ;
      case   0   :
        return   i .join (   ''   )   ;
      default   :
        return   i   ;
    }
  }   catch   (   e   )   {
    return   i   ; // In case of error, return original input
  }
}
// ----------------------------------------------------------------------------------------------------------------------
// End of utility functions. The actual problem-solving code begins here.
// ----------------------------------------------------------------------------------------------------------------------

/**
 * Main function containing the problem's logic.
 * This function reads graph input, performs a BFS, and assigns values based on depth.
 */
function   Main (   )   {
  // Read the number of nodes in the graph
  var   N   =   nextInt (   )   ;

  // Initialize an array to store node properties
  var   list   =   new   Array (   N   )   ;

  // Initialize an array to store the final output values
  var   output   =   new   Array (   N   )   ;

  // Populate the list with initial node objects
  for   (   var   i   =   0   ;   i   <   N   ;   i++   )   {
    list [   i   ]   =   {
      depth   :   null   ,   // Depth from the starting node (root)
      access   :   false   ,   // Flag to track if node has been visited
      child   :   [ ]   ,      // List of connected children/neighbors
      value   :   -1         // Final assigned value for the node
    }   ;
  }

  // Initialize counters for value assignment
  var   one   =   1   ;
  var   two   =   2   ;
  var   three   =   3   ;

  // Read N-1 edges to build the graph (adjacency list)
  for   (   var   i   =   0   ;   i   <   N   -   1   ;   i++   )   {
    var   tmp   =   nextIntArray (   )   ; // Read two connected nodes
    // Adjust to 0-based indexing and add to adjacency lists
    list [   tmp [   0   ]   -   1   ] .child .push (   tmp [   1   ]   -   1   )   ;
    list [   tmp [   1   ]   -   1   ] .child .push (   tmp [   0   ]   -   1   )   ;
  }

  // Initialize a queue for Breadth-First Search (BFS)
  var   queue   =   [   0   ]   ; // Start BFS from node 0

  // Mark the starting node as accessed and set its depth
  list [   0   ] .access   =   true   ;
  list [   0   ] .depth   =   1   ;

  // Counters for nodes at odd and even depths
  var   oddDepth   =   0   ;
  var   evenDepth   =   0   ;

  // Perform BFS to calculate depths and count nodes at odd/even depths
  while   (   queue .length   >   0   )   {
    var   now   =   queue .shift (   )   ; // Dequeue the current node

    // Increment appropriate depth counter
    if   (   list [   now   ] .depth   %   2   ==   1   )   {
      oddDepth++   ;
    }   else   {
      evenDepth++   ;
    }

    // Get children/neighbors of the current node
    var   child   =   list [   now   ] .child   ;

    // Iterate through children
    for   (   var   i   =   0   ;   i   <   child .length   ;   i++   )   {
      // If a child has not been accessed yet
      if   (   ! list [   child [   i   ]   ] .access   )   {
        list [   child [   i   ]   ] .access   =   true   ; // Mark as accessed
        list [   child [   i   ]   ] .depth   =   list [   now   ] .depth   +   1   ; // Set its depth
        queue .push (   child [   i   ]   )   ; // Enqueue the child for further exploration
      }
    }
  }

  // Decision logic for assigning values based on depth counts
  if   (   oddDepth   >   (   N   /   3   )   &&   evenDepth   >   (   N   /   3   )   )   {
    // Case 1: Both odd and even depths have a significant number of nodes
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )   {
      if   (   list [   i   ] .depth   %   2   ==   1   )   {
        // Assign values 1, 4, 7... to odd depth nodes
        if   (   one   <=   N   )   {
          list [   i   ] .value   =   one   ;
          one   +=   3   ;
        }
      }   else   {
        // Assign values 2, 5, 8... to even depth nodes
        if   (   two   <=   N   )   {
          list [   i   ] .value   =   two   ;
          two   +=   3   ;
        }
      }
    }
  }   else   {
    // Case 2: One of the depth counts is not significantly large
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )   {
      if   (   oddDepth   <   evenDepth   )   {
        // If odd depth nodes are fewer, assign values 3, 6, 9... to them
        if   (   list [   i   ] .depth   %   2   ==   1   )   {
          list [   i   ] .value   =   three   ;
          three   +=   3   ;
        }
      }   else   {
        // If even depth nodes are fewer (or equal), assign values 3, 6, 9... to them
        if   (   list [   i   ] .depth   %   2   ==   0   )   {
          list [   i   ] .value   =   three   ;
          three   +=   3   ;
        }
      }
    }
  }

  // Fill in any remaining unassigned values (-1)
  for   (   var   i   =   0   ;   i   <   N   ;   i++   )   {
    if   (   list [   i   ] .value   ==   -1   )   {
      if   (   one   <=   N   )   {
        list [   i   ] .value   =   one   ;
        one   +=   3   ;
      }   else   if   (   two   <=   N   )   {
        list [   i   ] .value   =   two   ;
        two   +=   3   ;
      }   else   if   (   three   <=   N   )   {
        list [   i   ] .value   =   three   ;
        three   +=   3   ;
      }
    }
    // Store the final assigned value in the output array
    output [   i   ]   =   list [   i   ] .value   ;
  }

  // Output the results, joined by spaces
  myout (   myconv (   output   ,   8   )   )   ;
}