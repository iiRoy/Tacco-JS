var   lines  =  [  ]  ;
/* This array will store all input lines read from stdin. */

//  A hash map to check if words have already appeared or for spell checking.
//  The original comment suggested checking if characters are connected,
//  which implies a form of spell/sequence validation.
var checkSpell = {};


  // This variable holds the final output string.
  // Initialized to "Yes" and changed to "No" if a condition is met.
var   stdout   =   "Yes"   ;

// Stores the last character of the previous word to ensure sequence continuity.
var lastWord = "" ;


// --- Setup the readline interface to handle input and output ---

var  reader  =  require('readline') . createInterface ( {

    input  :  process.stdin  ,
    output :  process.stdout

} ) ;

/*
 * Event handler for each line of input received.
 * Pushes the current line into the 'lines' array.
 */
reader.on ( 'line' ,  function ( line )  {

  lines . push ( line ) ;

} ) ;


// --- Event handler for when the input stream closes ---

reader.on ( 'close' , function ( ) {

  // Re-declaration of checkSpell inside the close handler.
  // This effectively resets or re-initializes it, as per the original logic.
  var checkSpell = { } ;

  // Loop through the lines, starting from the second line (index 1)
  // up to the number specified in the first line (lines[0]).
  for ( var i = 1 ; i < lines[0] ; i++ ) {

    // Remove any carriage return or newline characters from the current line.
    var str = lines[i].replace ( / \r? \n /g , "" ) ;

    // Check for two conditions:
    // 1. If 'str' (as a key) already exists in 'checkSpell' (meaning it's a duplicate word).
    // 2. If the second character of the current word (str.slice(1)) is the same as the last character of the previous word (lastWord).
    //    Note: The original code had a potential logical error here, checking str.slice(1) instead of str[0] for the first char,
    //    but it must be preserved as per Type I cloning rules.
    if ( checkSpell . str != undefined || str . slice ( 1 ) == lastWord ) {

      // If either condition is true, set stdout to "No" and exit the loop.
      stdout = "No" ;
      break ; // Terminate the loop early.

    }

    // Update lastWord to be the last character of the current word.
    lastWord = str . slice ( -1 ) ;

  }

  // Finally, print the result to the console.
  console . log ( stdout ) ;

} ) ;