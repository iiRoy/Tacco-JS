/* This section handles the input/output setup for the program.
 * It uses Node.js's 'readline' module to process input line by line.
 * The 'obj' variable will store an iterator-like object for input consumption.
 */
var    read    =   require   (   'readline'   )   .   createInterface   (   {
                                                                         input   :   process.stdin,
                                                                         output  :   process.stdout
                                                                       }   )   ;

// Declare global variables for input handling
var obj   ;
var inLine   =   [   ]   ;

/* Event listener for each line of input received.
 * Pushes the received line into the 'inLine' array.
 */
read   .   on   (   'line'   ,   function   (   input   )   {
                                                     inLine   .   push   (   input   )   ;
                                                   }   )   ;

/* Event listener for when the input stream is closed.
 * This is where the main processing logic begins after all input is gathered.
 */
read   .   on   (   'close'   ,   function   (   )   {

                                               // Initialize the input object
                                               obj   =   init   (   inLine   )   ;

                                               // Output a newline to stderr for visual separation
                                               console   .   error   (   '\n'   )   ;

                                               // Record the start time for performance measurement
                                               var   start   =   Date   .   now   (   )   ;

                                               // Execute the main program logic
                                               Main   (   )   ;

                                               // Calculate elapsed time
                                               var   end   =   Date   .   now   (   )   -   start   ;

                                               // Log execution time to stderr
                                               myerr   (   'time   :   '   +   end   +   'ms'   )   ;

                                               // Log memory usage to stderr
                                               myerr   (   'memory   :   '   +   Math   .   round   (   process.memoryUsage   (   )   .   heapTotal   /   1024   )   +   'KB'   )   ;
                                             }   )   ;


/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization/deserialization.
 *
 * @param   {*}   obj   The object to be cloned.
 * @returns {*}         A deep clone of the input object.
 */
function   makeClone   (   obj   )   {
                                     return   (   obj   instanceof   Set   )
                                            ?   new   Set   (   Array   .   from   (   obj   )   )
                                            :   JSON   .   parse   (   JSON   .   stringify   (   obj   )   )   ;
                                   }


/**
 * Retrieves the next integer from the input stream.
 * Uses 'myconv' helper with conversion type 1 (parseInt).
 * @returns {number} The next integer.
 */
function   nextInt   (   )   {   return   myconv   (   next   (   )   ,   1   )   ;   }

/**
 * Retrieves the next string array from the input stream.
 * Uses 'myconv' helper with conversion type 2 (split by space).
 * @returns {string[]} The next string array.
 */
function   nextStrArray   (   )   {   return   myconv   (   next   (   )   ,   2   )   ;   }

/**
 * Retrieves the next integer array from the input stream.
 * Uses 'myconv' helper with conversion type 4 (split by space and map to Number).
 * @returns {number[]} The next integer array.
 */
function   nextIntArray   (   )   {   return   myconv   (   next   (   )   ,   4   )   ;   }

/**
 * Retrieves the next character array from the input stream.
 * Uses 'myconv' helper with conversion type 6 (split by character).
 * @returns {string[]} The next character array.
 */
function   nextCharArray   (   )   {   return   myconv   (   next   (   )   ,   6   )   ;   }

/**
 * Retrieves the next item from the input object.
 * @returns {string} The next raw input string.
 */
function   next   (   )   {   return   obj   .   next   (   )   ;   }

/**
 * Checks if there are more items in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function   hasNext   (   )   {   return   obj   .   hasNext   (   )   ;   }


/**
 * Initializes an input iterator object from an array of input lines.
 *
 * @param   {string[]}   input   An array of strings, where each string is a line of input.
 * @returns {object}             An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
function   init   (   input   )   {

  return   {
             list   :   input   ,
             index   :   0   ,
             max   :   input   .   length   ,

             /**
              * Checks if there are more elements to iterate over.
              * @returns {boolean} True if the current index is less than the maximum length, false otherwise.
              */
             hasNext   :   function   (   )   {
                                           return   (   this   .   index   <   this   .   max   )   ;
                                         }   ,

             /**
              * Returns the next element in the input list and advances the index.
              * Throws an error if no more input is available.
              * @returns {string} The next input line.
              * @throws   {string} 'ArrayIndexOutOfBoundsException ‚There is no more input' if no more input.
              */
             next   :   function   (   )   {
                                         if   (   this   .   hasNext   (   )   )   {
                                                                               return   this   .   list   [   this   .   index   ++   ]   ;
                                                                             }   else   {
                                                                                         throw   'ArrayIndexOutOfBoundsException ‚There is no more input'   ;
                                                                                       }
                                       }
           }   ;
}


/**
 * Outputs a string to standard output, followed by a newline.
 *
 * @param   {*}   s   The value to be printed.
 */
function   myout   (   s   )   {
                             console   .   log   (   s   )   ;
                           }


/**
 * Outputs debug information to standard error.
 * Uses Node.js's 'util.inspect' for detailed object inspection.
 *
 * @param   {*}   s   The value to be debug-printed.
 */
function   myerr   (   s   )   {
                             console   .   error   (   'debug:'   +   require   (   'util'   )   .   inspect   (   s   ,   false   ,   null   )   )   ;
                           }


/*
 * Helper function for various data conversions.
 * The 'no' parameter determines the conversion type:
 *
 * no: 1  -> Parse as integer (parseInt).
 * no: 2  -> Split string by space into an array of strings.
 * no: 4  -> Split string by space and convert each part to a number (map(Number)).
 * no: 6  -> Split string into an array of individual characters.
 * no: 7  -> Split string into characters and convert each character to a number.
 * no: 8  -> Join array elements with a space.
 * no: 9  -> Join array elements with a newline character.
 * no: 0  -> Join array elements with no separator.
 * Default -> Return the input 'i' as is.
 */
function   myconv   (   i   ,   no   )   {
                                     try   {
                                           switch   (   no   )   {
                                                                 case   1   :
                                                                               return   parseInt   (   i   )   ;
                                                                 case   2   :
                                                                               return   i   .   split   (   ' '   )   ;
                                                                 case   4   :
                                                                               return   i   .   split   (   ' '   )   .   map   (   Number   )   ;
                                                                 case   6   :
                                                                               return   i   .   split   (   ''   )   ;
                                                                 case   7   :
                                                                               return   i   .   split   (   ''   )   .   map   (   Number   )   ;
                                                                 case   8   :
                                                                               return   i   .   join   (   ' '   )   ;
                                                                 case   9   :
                                                                               return   i   .   join   (   '\n'   )   ;
                                                                 case   0   :
                                                                               return   i   .   join   (   ''   )   ;
                                                                 default   :
                                                                               return   i   ;
                                                               }
                                         }   catch   (   e   )   {
                                                                 // In case of conversion error, return the original input
                                                                 return   i   ;
                                                             }
                                   }

/* Don't have to see. end------------------------------------------ */


/**
 * The main function containing the core logic of the program.
 * It processes input to fill a square matrix-like structure.
 */
function   Main   (   )   {

  // Read the integer N, which defines the size of the square (N x N)
  var   N   =   nextInt   (   )   ;

  // Read a list of integers
  var   list   =   nextIntArray   (   )   ;

  // Initialize an output array of size N*N, which will represent the flattened grid
  var   output   =   new   Array   (   N   *   N   )   ;

  /*
   * First pass: Initialize positions based on the 'list' array.
   * Places values (i + 1) at specific indices determined by list[i] - 1.
   */
  for   (   var   i   =   0   ;   i   <   N   ;   i   ++   )   {
    output   [   list   [   i   ]   -   1   ]   =   i   +   1   ;
  }

  /*
   * Second pass: Fill in null positions with values from 2 to N.
   * This loop attempts to place numbers in decreasing order of frequency (initially).
   * It also checks for conflicts (if a position already contains the current number 'i').
   */
  for   (   var   i   =   2   ;   i   <=   N   ;   i   ++   )   {

    // 'count' represents how many instances of the current number 'i' still need to be placed
    var   count   =   i   -   1   ;

    // Iterate through the entire output array
    for   (   var   j   =   0   ;   j   <   N   *   N   ;   j   ++   )   {

      // If the current position is empty (null)
      if   (   output   [   j   ]   ==   null   )   {
        count   --   ;                       // Decrement the count of numbers to place
        output   [   j   ]   =   i   ;         // Place the current number 'i'

        // If all instances of 'i' have been placed, break from the inner loop
        if   (   count   ==   0   )   {
          break   ;
        }
      }   else   if   (   output   [   j   ]   ==   i   )   {
        // If a position already contains the current number 'i', it's a conflict, print "No" and exit
        myout   (   "No"   )   ;
        return   ;
      }
    }
  }

  /*
   * Third pass: Fill in remaining null positions with values from 1 to N-1.
   * This loop iterates through a specific range for 'j' based on 'list[i-1]'.
   */
  for   (   var   i   =   1   ;   i   <   N   ;   i   ++   )   {

    // 'count' for this pass is N - i
    var   count   =   N   -   i   ;

    // Iterate from a specific starting point in the output array
    for   (   var   j   =   list   [   i   -   1   ]   ;   j   <   N   *   N   ;   j   ++   )   {

      // If the current position is empty (null)
      if   (   output   [   j   ]   ==   null   )   {
        count   --   ;                       // Decrement the count
        output   [   j   ]   =   i   ;         // Place the current number 'i'

        // If all required instances for this 'i' are placed, break
        if   (   count   ==   0   )   {
          break   ;
        }
      }
    }
  }

  /*
   * Final check: Ensure all positions in the output array are filled.
   * If any position is still null, it means a valid arrangement couldn't be found.
   */
  for   (   var   i   =   0   ;   i   <   N   *   N   ;   i   ++   )   {
    if   (   output   [   i   ]   ==   null   )   {
      myout   (   "No"   )   ; // Output "No" if an empty spot is found
      return   ;             // Exit the function
    }
  }

  // If all checks pass and the array is fully populated, output "Yes"
  myout   (   "Yes"   )   ;

  // Output the final array, joined by spaces
  myout   (   myconv   (   output   ,   8   )   )   ;
}