/*
 * This section contains utility functions for input/output handling and
 * other common operations. It's generally not part of the core algorithm.
 */
var     read    =   require('readline')   .createInterface({
  input    :   process.stdin,
  output   :   process.stdout
});


var   obj;
var   inLine = [];


read.on   (   'line',
  function (input) {
    inLine.push   (   input   );
  }
);


read.on('close',
  function   ()   {
    obj   =   init(inLine);

    console.error('\n'); // Separator for debug output.

    var   start   =   Date.now();

    Main();

    var   end   =   Date.now()   -   start;
    myerr('time : '   +   end   +   'ms');
    myerr('memory : '   +   Math.round(process.memoryUsage().heapTotal   /   1024)   +   'KB');
  }
);


/**
 * Creates a deep clone of an object or Set.
 * Supports Set and plain JSON-serializable objects.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the object.
 */
function   makeClone   (obj)   {
  return   (obj   instanceof   Set)
    ?   new   Set(Array.from(obj))
    :   JSON.parse(JSON.stringify(obj));
}


// Input parsing utility functions.
function   nextInt   ()   {
  return   myconv   (next(),   1);
}

function   nextStrArray   ()   {
  return   myconv   (next(),   2);
}

function   nextIntArray   ()   {
  return   myconv   (next(),   4);
}

function   nextCharArray   ()   {
  return   myconv   (next(),   6);
}


function   next   ()   {
  return   obj.next();
}

function   hasNext   ()   {
  return   obj.hasNext();
}


/*
 * Initializes the input reader object.
 * This function creates an object that manages reading lines
 * from the 'inLine' array, acting as a custom iterator.
 */
function   init   (input)   {
  return   {
    list   :   input,
    index   :   0,
    max   :   input.length,

    hasNext   :   function   ()   {
      return   (this.index   <   this.max);
    },

    next   :   function   ()   {
      if   (this.hasNext())   {
        return   this.list[this.index++];
      }   else   {
        throw   'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}


/**
 * Outputs a string to the console.
 * @param {string} s - The string to be printed.
 */
function   myout   (s)   {
  console.log   (s);
}


/**
 * Outputs debug information to the error stream.
 * Uses Node.js's util.inspect for detailed object logging.
 * @param {any} s - The data to be logged.
 */
function   myerr   (s)   {
  console.error   (   'debug:'   +   require('util').inspect(s,   false,   null)   );
}


// Description of 'no' parameter for myconv function.
// --------------------------------------------------
// no = 1: Parse string as integer.
// no = 2: Split string by spaces into an array of strings.
// no = 4: Split string by spaces and map to numbers (integers).
// no = 6: Split string into an array of characters.
// no = 7: Split string into an array of characters and map to numbers.
// no = 8: Join array elements with spaces.
// no = 9: Join array elements with newlines.
// no = 0: Join array elements with no character (concatenate).
// Default: Return input as is.
function   myconv   (i,   no)   {
  try   {
    switch   (no)   {
      case   1:   return   parseInt(i);
      case   2:   return   i.split(' ');
      case   4:   return   i.split(' ').map(Number);
      case   6:   return   i.split('');
      case   7:   return   i.split('').map(Number);
      case   8:   return   i.join(' ');
      case   9:   return   i.join('\n');
      case   0:   return   i.join('');
      default:   return   i;
    }
  }   catch   (e)   {
    // In case of conversion error, return the original input.
    return   i;
  }
}

/*
 * End of common utility functions.
 * The core logic of the problem starts here.
 */


function   Main   ()   {
  // Read the number of nodes in the graph.
  var   N   =   nextInt();

  // Initialize an array to store node properties.
  var   list   =   new   Array(N);
  // Initialize an array for the final output values.
  var   output   =   new   Array(N);

  // Populate the list with initial node objects.
  for   (var   i   =   0;   i   <   N;   i++)   {
    list[i]   =   {
      depth   :   null, // Depth in BFS tree.
      access   :   false, // Visited status for BFS.
      child   :   [], // Adjacency list for neighbors.
      value   :   -1 // Final assigned value.
    };
  }

  // Variables for assigning values based on odd/even properties.
  var   one   =   1;
  var   two   =   2;
  var   three   =   3;

  // Read edges and build the adjacency list.
  // The graph is undirected, so add edges in both directions.
  for   (var   i   =   0;   i   <   N   -   1;   i++)   {
    var   tmp   =   nextIntArray();
    // Adjust to 0-based indexing.
    list[tmp[0]   -   1].child.push(tmp[1]   -   1);
    list[tmp[1]   -   1].child.push(tmp[0]   -   1);
  }

  // Initialize a queue for Breadth-First Search (BFS).
  // The size N + 5 is a common heuristic for array-based queues.
  var   queue   =   new   Array(N   +   5);
  var   maeIndex   =   0; // Front of the queue.
  var   atoIndex   =   1; // Rear of the queue.

  // Start BFS from node 0.
  queue[0]   =   0;
  list[0].access   =   true; // Mark as visited.
  list[0].depth   =   1; // Set initial depth.

  var   oddDepth   =   0; // Count of nodes at odd depths.
  var   evenDepth   =   0; // Count of nodes at even depths.

  // Perform BFS traversal.
  while   (maeIndex   !=   atoIndex)   {
    var   now   =   queue[maeIndex++]; // Dequeue current node.

    // Categorize node based on its depth parity.
    if   (list[now].depth   %   2   ==   1)   {
      oddDepth++;
    }   else   {
      evenDepth++;
    }

    var   child   =   list[now].child; // Get neighbors.
    // Iterate through neighbors.
    for   (var   i   =   0;   i   <   child.length;   i++)   {
      // If neighbor hasn't been accessed yet.
      if   (!list[child[i]].access)   {
        list[child[i]].access   =   true; // Mark as visited.
        list[child[i]].depth   =   list[now].depth   +   1; // Set its depth.
        queue[atoIndex++]   =   child[i]; // Enqueue neighbor.
      }
    }
  }

  // Decision logic based on the distribution of odd and even depth nodes.
  // This part attempts to assign values efficiently.
  if   (oddDepth   >   (N   /   3)   &&   evenDepth   >   (N   /   3))   {
    // Case 1: Both odd and even depths are significantly populated.
    // Assign values 1, 4, 7... to odd depth nodes.
    // Assign values 2, 5, 8... to even depth nodes.
    for   (var   i   =   0;   i   <   N;   i++)   {
      if   (list[i].depth   %   2   ==   1)   {
        if   (one   <=   N)   {
          list[i].value   =   one;
          one   +=   3;
        }
      }   else   {
        if   (two   <=   N)   {
          list[i].value   =   two;
          two   +=   3;
        }
      }
    }
  }   else   {
    // Case 2: One of the depth parities is less populated.
    // Assign values 3, 6, 9... to nodes of the less populated depth parity (or a specific one if counts are similar).
    for   (var   i   =   0;   i   <   N;   i++)   {
      if   (oddDepth   <   evenDepth)   {
        // If odd depth count is smaller, assign 'three' sequence to odd depth nodes.
        if   (list[i].depth   %   2   ==   1)   {
          list[i].value   =   three;
          three   +=   3;
        }
      }   else   {
        // If even depth count is smaller or equal, assign 'three' sequence to even depth nodes.
        if   (list[i].depth   %   2   ==   0)   {
          list[i].value   =   three;
          three   +=   3;
        }
      }
    }
  }

  // Fill in any remaining unassigned nodes (value == -1).
  // This uses the remaining numbers from the one, two, or three sequences.
  for   (var   i   =   0;   i   <   N;   i++)   {
    if   (list[i].value   ==   -1)   {
      if   (one   <=   N)   {
        list[i].value   =   one;
        one   +=   3;
      }   else   if   (two   <=   N)   {
        list[i].value   =   two;
        two   +=   3;
      }   else   if   (three   <=   N)   {
        list[i].value   =   three;
        three   +=   3;
      }
    }
    // Store the assigned value in the output array.
    output[i]   =   list[i].value;
  }

  // Output the final assigned values, joined by spaces.
  myout(myconv(output,   8));
}