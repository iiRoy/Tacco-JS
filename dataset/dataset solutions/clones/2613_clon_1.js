/*
 * This is a modified version of the original source code.
 * All functional aspects, variable names, and expressions are
 * preserved exactly as they were in the original.
 * Only whitespace and comments have been altered significantly
 * to create a Type I code clone.
 */
var   read  =   require (   'readline'   ) .   createInterface({
  // Configuration for the readline interface
  input :   process.stdin,
  output :  process.stdout
});



var  obj ;
var  inLine  =   [ ] ; // Array to store input lines


read . on (   'line' , function (   input   )   {
  inLine . push (   input   ) ; // Store each line as it's read
});



read . on (   'close' ,   function   (   )   {
  obj   =   init (   inLine   ) ; // Initialize the input object
  console . error (   '\n↑入力 ↓出力'   ) ; // Debug message
  Main (   ) ; // Execute the main logic after all input is received
}   ) ;

/*
 * Function to create a deep clone of an object.
 * Handles Sets specifically, otherwise uses JSON serialization.
 */
function   makeClone (   obj   )   {
  return   (   obj   instanceof   Set   )   ?   new   Set (   Array . from (   obj   )   )   :   JSON . parse (   JSON . stringify (   obj   )   ) ;
}

// Utility functions for parsing various input types
function nextInt ( ) { return myconv ( next ( ) , 1 ) ; }
function nextStrArray ( ) { return myconv ( next ( ) , 2 ) ; }
function nextIntArray ( ) { return myconv ( next ( ) , 4 ) ; }
function nextCharArray ( ) { return myconv ( next ( ) , 6 ) ; }
function next ( ) { return obj . next ( ) ; } // Retrieves the next input line
function hasNext ( ) { return obj . hasNext ( ) ; } // Checks if there's more input

/*
 * Initializes an object to manage input lines.
 * Provides methods to check for next line and retrieve it.
 */
function   init (   input   )   {
  return   {
    list   :   input , // The array of input lines
    index   :   0 , // Current position in the input array
    max   :   input . length , // Total number of input lines

    // Checks if there are more lines to read
    hasNext   :   function   (   )   {
      return   (   this . index   <   this . max   ) ;
    } ,

    // Retrieves the next line from the input
    next   :   function   (   )   {
      if   (   this . hasNext (   )   )   {
        return   this . list [   this . index ++   ] ;
      }   else   {
        throw   'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}

function   myout (   s   )   {
  console . log (   s   ) ; // Outputs to console
}

function   myerr (   s   )   {
  console . error (   'debug:'   +   require (   'util'   ) . inspect (   s , false , null   )   ) ; // Debug output
}

/*
 * This function converts input 'i' based on the 'no' parameter.
 * 'no' determines the conversion type:
 * 1: parseInt (integer conversion)
 * 2: split by space (string array)
 * 4: split by space and map to Number (integer array)
 * 6: split by character (char array)
 * 7: split by character and map to Number (integer char array)
 * 8: join by space
 * 9: join by newline
 * 0: join without character
 * Default: return original 'i'
 */
function   myconv (   i , no   )   {
  try   {
    switch   (   no   )   {
      case   1   :   return   parseInt (   i   ) ;
      case   2   :   return   i . split (   ' '   ) ;
      case   4   :   return   i . split (   ' '   ) . map (   Number   ) ;
      case   6   :   return   i . split (   ''   ) ;
      case   7   :   return   i . split (   ''   ) . map (   Number   ) ;
      case   8   :   return   i . join (   ' '   ) ;
      case   9   :   return   i . join (   '\n'   ) ;
      case   0   :   return   i . join (   ''   ) ;
      default   :   return   i ;
    }
  }   catch   (   e   )   {
    return   i ;
  }
}

/*
 * End of boilerplate code.
 * The actual problem-solving logic begins here.
 */
function   Main (   )   {

  var   one   =   nextIntArray (   ) ; // Read the first line as an array of integers

  var   M   =   one [   0   ] ; // Extract M from the input
  var   D   =   one [   1   ] ; // Extract D from the input

  var   output   =   0 ; // Initialize the counter for valid dates

  // Loop through months from 1 to M
  for   (   var   i   =   1 ;   i   <=   M ;   i ++   )   {

    // Loop through days from 22 to D
    for   (   var   j   =   22 ;   j   <=   D ;   j ++   )   {

      var   L   =   Math . floor (   j   /   10   ) ; // Get the tens digit of the day
      var   R   =   j   %   10 ; // Get the units digit of the day

      // Check the conditions: L and R must be >= 2, and their product must equal the month 'i'
      if   (   L   >=   2   &&   R   >=   2   &&   L   *   R   ==   i   )   {
        output ++ ; // Increment the counter if conditions are met
      }
    }
  }
  myout (   output   ) ; // Output the final count
}