/* This is a generated Type I clone. Original logic is preserved. */
/* Start of utility functions and setup block. */
var read = require('readline').createInterface(
  {
    input:  process.stdin, /* Standard input stream */
    output: process.stdout /* Standard output stream */
  }
);


var obj; // Global object for input handling
var inLine = [ ]; // Array to store input lines


read.on(
  'line',
  function (input) {
    inLine.push(input);
  }
);


read.on(
  'close',
  function () {
    /* Process input and execute main logic */
    obj = init(inLine);

    console.error("\n"); // A blank line for console error output.

    var start = Date.now(); // Capture start time
    Main(); // Execute the primary application logic
    var end = Date.now() - start; // Calculate elapsed time

    myerr("time : " + (end) + "ms"); // Log execution time
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Log memory usage
  }
);


/* Utility function to create a deep clone of an object. */
function makeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


/* Input parsing helper functions. */
function nextInt() {
  return myconv(next(), 1);
}
function nextStrArray() {
  return myconv(next(), 2);
}
function nextIntArray() {
  return myconv(next(), 4);
}
function nextCharArray() {
  return myconv(next(), 6);
}

function next() {
  return obj.next();
}
function hasNext() {
  return obj.hasNext();
}


/* Initialization function for the input object. */
function init(input) {
  var returnObj = {
    list:    input,
    index:   0,
    max:     input.length, // Total number of input lines

    /* Checks if there are more lines to read. */
    hasNext: function () {
      return (this.index < this.max);
    },

    /* Retrieves the next line from input. */
    next:    function () {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input
      } else {
        var returnInput = this.list[this.index];
        this.index++;
        return returnInput;
      }
    }
  };
  return returnObj;
}


/* Standard output function. */
function myout(s) {
  console.log(s);
}


/* Error/debug output function. */
function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}


/*
 * Comprehensive conversion utility function.
 * [no] parameter determines conversion type:
 * 1: Convert to integer.
 * 2: Split by space into string array.
 * 4: Split by space into number array.
 * 6: Split by character into string array.
 * 7: Split by character into number array.
 * 8: Join array with space.
 * 9: Join array with newline.
 * 0: Join array without separator.
 * Default: Return input as is.
 * Handles errors by returning the original input.
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(Number);
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(Number);
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  } catch (e) {
    return i; // Return original on error
  }
}

/* End of utility functions. */

/* Main application logic starts here. */
function Main ( ) {

    var N = nextInt ( ) ; // Read the number of players.

    var list = new Array ( N + 1 ) ; // Create a list to store player data, 1-indexed.

    // Initialize player data.
    for ( var i = 0 ; i < N ; i ++ ) {
        list[ i + 1 ] = {
            next      : nextIntArray ( ) , // Opponents for player i+1
            lastIndex : 0                // Index for the current opponent in `next` array
        } ;
    }


    var count = 0 ; // Keeps track of the number of days passed.
    var end = new Set ( ) ; // Set of players who have finished all their matches.

    /* Main simulation loop. */
    while ( true ) {

        var battled = new Set ( ) ; // Players who have battled on the current day.
        var isBattled = false ;     // Flag to check if any battle occurred this day.

        // Iterate through all players to arrange matches for the current day.
        for ( var i = 1 ; i <= N ; i ++ ) {
            // Skip players who have finished or already battled today.
            if ( end.has ( i ) || battled.has ( i ) ) {
                continue ;
            }

            // Determine the next opponent for player 'i'.
            var aite = list[ i ].next[ list[ i ].lastIndex ] ;

            // Check if the opponent 'aite' is available and not already battled.
            if ( ! battled.has ( aite ) && ! end.has ( aite ) ) {

                // Verify if 'aite' also wants to play against 'i' as their next match.
                if ( list[ aite ].next[ list[ aite ].lastIndex ] == i ) {

                    // A valid match is found. Update indices and mark players as battled.
                    list[ i ].lastIndex ++ ;
                    list[ aite ].lastIndex ++ ;

                    battled.add ( i ) ;
                    battled.add ( aite ) ;

                    // Check if player 'i' has completed all their matches.
                    if ( list[ i ].lastIndex >= N - 1 ) {
                        end.add ( i ) ;
                    }
                    // Check if player 'aite' has completed all their matches.
                    if ( list[ aite ].lastIndex >= N - 1 ) {
                        end.add ( aite ) ;
                    }

                    isBattled = true ; // At least one battle occurred today.
                }
            }
        }

        /* After iterating through all players, check the day's outcome. */
        if ( ! isBattled ) {
            // If no battles occurred today, the simulation ends.
            if ( end.size == N ) {
                myout ( count ) ; // All players finished their matches successfully.
            } else {
                myout ( -1 ) ;    // Not all players finished, indicating a deadlock or invalid state.
            }
            return ; // Exit the Main function.
        }

        count ++ ; // Increment day count if battles occurred.

    } /* End of while loop. */

} /* End of Main function. */