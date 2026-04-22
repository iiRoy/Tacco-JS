var     read    =   require('readline') .   createInterface({


    input   :   process .   stdin,

    output  :   process .   stdout

}); /*   End   of   readline   interface   creation.   */



var     obj; /* This will hold our custom input object. */


var     inLine  =   []; // Array to store all input lines from stdin.



// Event listener for each line of input received.
read.on (   'line'  ,   function (  input   )   {

    inLine.push (   input   );

}   );


/*
 * Event listener for when the input stream closes.
 * This is where the main processing begins.
 */
read.on (   'close' ,   function (  )   {

    obj = init( inLine );


    myerr (   "-----start-----"   ); // Log start of execution.


    var start   =   new Date (  ); /* Capture start time. */

    Main (  ); // Invoke the primary logic function.

    var end     =   new Date (  )   -   start; // Calculate elapsed time.


    myerr (   "----- end -----"   ); // Log end of execution.


    myerr (   "time : "   +   (   end )   +   "ms"    ); // Display execution time.


}   );



/* Function to parse the next input as an integer. */
function nextInt   (   )   {   return  myconv (    next (  )   ,   1   );  }


/* Function to parse the next input as an array of strings (space-separated). */
function nextStrArray  (   )   {   return  myconv (    next (  )   ,   2   );  }


/* Function to parse the next input as an array of integers (space-separated). */
function nextIntArray  (   )   {   return  myconv (    next (  )   ,   4   );  }


/* Function to parse the next input as an array of characters. */
function nextCharArray (   )   {   return  myconv (    next (  )   ,   6   );  }


/* Function to retrieve the next raw input string. */
function next  (   )   {   return  obj .   next (  );  }


/* Function to check if there are more inputs available. */
function hasNext   (   )   {   return  obj .   hasNext (   );  }



/*
 * Initializes and returns an object for managing input lines.
 * This object provides methods to check for next input and retrieve it.
 */
function init  (   input   )   {

        var     returnObj   =   {

            list    :   input,

            index   :   0,

            max     :   input.length,

            // Checks if there are more elements in the input list.
            hasNext :   function (  )   {

                return  (   this.index  <   this.max    );

            },

            // Retrieves the next element from the input list.
            next    :   function (  )   {

                if  (   !   this.hasNext (  )   )   {

                    throw   "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input.

                }   else    {

                    var     returnInput =   this.list [   this.index   ];

                    this.index++; // Increment index for the next call.

                    return  returnInput;

                }

            }

        };

        return  returnObj;

}



/* Simple function to output a string to standard output. */
function myout (   s   )   {

    console.log (   s   );

}


/*
 * Function to output debug messages to standard error.
 * Uses Node.js 'util' module for inspection.
 */
function myerr (   s   )   {

    console.error (   "debug:"    +   require("util").inspect (   s   ,   false   ,   null    )   );

}


/*
 * [no]  Handling   of   elements.   Numeric   type.
 *
 * Unidentified value, on error: return argument as is.
 * 1: Convert to number.
 * 2: Split by half-width space.
 * 4: Split by half-width space and convert to number array.
 * 6: Split by character.
 * 7: Split by character and convert to number array.
 * 8: Join with half-width space.
 * 9: Join with newline.
 * 0: Join without characters (empty string).
 */
function myconv(    i   ,   no  )   {

    try {

        switch  (   no  )   {

            case    1   :   return  parseInt (  i   );

            case    2   :   return  i.split (   " " );

            case    4   :   return  i.split (   " " ).map ( Number );

            case    6   :   return  i.split (   ""  );

            case    7   :   return  i.split (   ""  ).map ( Number );

            case    8   :   return  i.join  (   " " );

            case    9   :   return  i.join  (   "\n"    );

            case    0   :   return  i.join  (   ""  );

            default :   return  i;

        }

    }   catch   (   e   )   {

        return  i; // Return original input on error.

    }

}



/*
 * The main function containing the core logic of the program.
 */
function Main  (   )   {

    var     N       =   nextInt (   ); // Read the number of elements.

    var     list    =   new Array ( N ); // Initialize an array of size N.

    var     output  =   0; // Initialize output accumulator.

    var     queue   =   []; // Initialize a queue (used as a deque).


    // Populate the list with N integers.
    for (   var     i   =   0;  i   <   N;  i++ )   {

        list [  i   ]   =   nextInt (   );

    }


    // Sort the list in ascending order.
    list.sort ( function (  a   ,   b   )   {

        return  a   -   b; // Standard numeric sort.

    }   );


    // Initialize the queue with the smallest element from the sorted list.
    queue.push (    list.shift (    )   );


    // Main loop: continues as long as there are elements in the list.
    while   (   list.length >   0   )   {

        // Elements at the front and back of the queue.
        var     useMae  =   queue [ 0 ];

        var     useAto  =   queue [ queue.length    -   1   ];

        // Elements at the front and back of the remaining list.
        var     inMae   =   list  [ 0 ];

        var     inAto   =   list  [ list.length   -   1   ];


        // Case 1: Both queue ends and list ends are identical.
        if  (   useMae  ==  useAto  &&  inMae   ==  inAto   )   {

            queue.push (    list.pop (  )   ); // Add the largest remaining element to the back.

        }   // Case 2: Queue ends are identical.
        else    if  (   useMae  ==  useAto  )   {

            // Decide whether to take from front or back of the list based on absolute difference.
            if  (   Math.abs (  useMae  -   inMae   )   >=  Math.abs (  useMae  -   inAto   )   )   {

                queue.push (    list.shift (    )   ); // Add the smallest remaining element to the back.

            }   else    {

                queue.push (    list.pop (  )   ); // Add the largest remaining element to the back.

            }

        }   // Case 3: List ends are identical.
        else    if  (   inMae   ==  inAto   )   {

            // Decide whether to add to front or back of the queue.
            if  (   Math.abs (  useMae  -   inMae   )   >=  Math.abs (  useAto  -   inMae   )   )   {

                queue.unshift ( list.shift (    )   ); // Add the smallest remaining element to the front.

            }   else    {

                queue.push (    list.shift (    )   ); // Add the smallest remaining element to the back.

            }

        }   // Case 4: All four elements are potentially different.
        else    {

            // Calculate absolute differences for all four possible placements.
            var     res1    =   Math.abs (  inMae   -   useMae  );

            var     res2    =   Math.abs (  inMae   -   useAto  );

            var     res3    =   Math.abs (  inAto   -   useMae  );

            var     res4    =   Math.abs (  inAto   -   useAto  );


            // Find the maximum difference and place the element accordingly.
            if  (   res1    >=  res2    &&  res1    >=  res3    &&  res1    >=  res4    )   {

                queue.unshift ( list.pop (  )   ); // Place largest list element at queue front.

                continue;

            }

            if  (   res2    >=  res1    &&  res2    >=  res3    &&  res2    >=  res4    )   {

                queue.push (    list.shift (    )   ); // Place smallest list element at queue back.

                continue;

            }

            if  (   res3    >=  res1    &&  res3    >=  res2    &&  res3    >=  res4    )   {

                queue.unshift ( list.pop (  )   ); // Place largest list element at queue front.

                continue;

            }

            if  (   res4    >=  res1    &&  res4    >=  res2    &&  res4    >=  res3    )   {

                queue.push (    list.pop (  )   ); // Place largest list element at queue back.

            }

        }

    }


    // Calculate the total absolute difference between adjacent elements in the final queue.
    for (   var     i   =   1;  i   <   N;  i++ )   {

        output  +=  Math.abs (    queue [ i   -   1   ]   -   queue [ i   ]   );

    }


    myout (   output  ); // Output the final calculated value.

}