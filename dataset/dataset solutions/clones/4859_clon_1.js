var    input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;


var obj = {

  "list"  :  input ,
  "index" :  0     ,
  "max"   :  input . length ,

  "hasNext" : function ( ) {
    return ( this . index < this . max ) ;
  },


  "next" : function ( ) {
    if ( ! this . hasNext ( ) ) {
      return "" ;
    }
    var returnObj = this . list [ this . index ] ;
    this . index ++ ;
    return returnObj ;
  }
} ;


Main ( ) ;


function next ( ) {
  return obj . next ( ) ;
}


function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}


function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ;
} //  This function splits the input string by half-width spaces


function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ;
} //  Splits by half-width spaces and then converts each part to a number


function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ;
} //  Splits the input string into an array of individual characters


function hasNext ( ) {
  return obj . hasNext ( ) ;
}


function myout ( t ) {
  console . log ( t ) ;
} //  Function to print to standard output


function myerr ( t ) {
  console . error ( t ) ;
} //  Function to print to standard error output


/*
 * This is a utility function named `myconv` for various
 * input conversions and manipulations.
 *
 * The second argument `no` determines the type of conversion:
 * 1: Convert to integer.
 * 2: Split by space into a string array.
 * 4: Split by space and convert to a number array.
 * 6: Split into a character array.
 * 7: Split into a character array and convert to numbers (not used in Main).
 * 8: Join an array with spaces (not used in Main).
 * 9: Join an array with newlines (not used in Main).
 * 0: Join an array without any separator (not used in Main).
 * Default: Return the input `i` as is.
 *
 * Includes error handling to return the original input on failure.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt ( i ) ;
      case 2 : return i . split ( " " ) ;
      case 4 : return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 : return i . split ( "" ) ;
      case 7 : return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 : return i . join ( " " ) ;
      case 9 : return i . join ( "\n" ) ;
      case 0 : return i . join ( "" ) ;
      default : return i ;
    }
  } catch ( e ) {
    return i ; // Return original input if an error occurs during conversion
  }
}


function Main ( ) {

  var N = nextInt ( ) ; // Read the initial integer N from input


  var list = new Array ( Math . pow ( 2 , N ) ) ; // Initialize a new array with size 2^N


  // Populate the list with integers read from input
  for ( var i = 0 ; i < list . length ; i ++ ) {
    list [ i ] = nextInt ( ) ;
  }


  var ato ; // Declare a temporary array `ato`


  // Main processing loop, iterates N times
  for ( var i = 0 ; i < N ; i ++ ) {

    // Create a new `ato` array, half the size of the current `list`
    ato = new Array ( Math . pow ( 2 , N - i - 1 ) ) ;

    // Process pairs of elements in the `list`
    for ( var j = 0 ; j < list . length ; j = j + 2 ) {

      if ( list [ j ] > list [ j + 1 ] ) {
        ato [ j / 2 ] = list [ j ] - list [ j + 1 ] ; // Store difference if first is greater
      } else if ( list [ j ] < list [ j + 1 ] ) {
         ato [ j / 2 ] = list [ j + 1 ] - list [ j ] ; // Store difference if second is greater
      } else {
         ato [ j / 2 ] = list [ j ] ; // Store one of them if they are equal
      }
    }
    list = ato ; // Update `list` with the processed `ato` array for the next iteration

    // myerr(list); // This line was commented out in the original code, likely for debugging
  }

  myout ( list [ 0 ] ) ; // Output the final remaining element in the list
}