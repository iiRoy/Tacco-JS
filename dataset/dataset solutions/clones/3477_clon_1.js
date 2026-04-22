/*
This section contains utility functions for input/output processing and other helper tasks.
It's generally not part of the main problem logic but supports its execution.
*/
// --- Start of boilerplate code, often hidden from view ---
 var read  =  require('readline') . createInterface ( {
    input:  process.stdin,
    output:  process.stdout
 } ) ;


 var obj ;
 var inLine = [ ] ;


// Event listener for each line of input received
 read . on ( 'line',  function ( input ) {
    inLine.push(input);
 } ) ;


// Event listener for when the input stream closes
 read . on ( 'close',  function ( ) {

    // Initialize the input object
    obj = init( inLine );

    // Output a newline for cleaner console output
    console.error( "\n" ) ;

    // Record the start time for performance measurement
    var start = Date.now ( ) ;

    // Execute the main logic of the program
    Main ( ) ;

    // Calculate elapsed time
    var end = Date.now ( )  -  start ;

    // Report execution time
    myerr ( "time : "  +  ( end )  +  "ms" ) ;

    // Report memory usage
    myerr ( "memory : "  +  Math.round ( process.memoryUsage ( ) . heapTotal  /  1024 )  +  "KB" ) ;
 } ) ;


// Helper function to create a deep clone of an object
 function makeClone ( obj ) {
    return  JSON.parse( JSON.stringify( obj ) ) ;
 }


// Functions to read various types of input from the processed stream
 function nextInt ( ) {
    return  myconv ( next ( ) , 1 ) ;
 }
 function nextStrArray ( ) {
    return  myconv ( next ( ) , 2 ) ;
 }


 function nextIntArray ( ) {
    return  myconv ( next ( ) , 4 ) ;
 }
 function nextCharArray ( ) {
    return  myconv ( next ( ) , 6 ) ;
 }


 function next ( ) {
    return  obj.next ( ) ;
 }
 function hasNext ( ) {
    return  obj.hasNext ( ) ;
 }


// Initializes the input object with helper methods
 function init ( input ) {

  return  {
    list : input,
    index : 0,
    max : input.length,

    // Checks if there's more input available
    hasNext : function ( ) {
        return  ( this.index  <  this.max ) ;
    },

    // Retrieves the next item from the input list
    next : function ( ) {
        if ( this.hasNext ( ) ) {
            return  this.list [ this.index++ ] ;
        } else {
            throw  "ArrayIndexOutOfBoundsException ‚There is no more input" ;
        }
    }
  } ;
 }


// Outputs data to standard output
 function myout ( s ) {
    console.log ( s ) ;
 }


// Outputs debug information to standard error
 function myerr ( s ) {
    console.error ( "debug:"  +  require ( "util" ) . inspect ( s , false , null ) ) ;
 }


// Parameter "no" defines the conversion type for input:
// - Default/unknown/outlier: returns input 'i' as is.
// - 1: Parses 'i' as an integer.
// - 2: Splits 'i' by spaces into an array of strings.
// - 4: Splits 'i' by spaces and converts each part to a number.
// - 6: Splits 'i' into an array of characters.
// - 7: Splits 'i' into characters and converts each to a number.
// - 8: Joins array 'i' with spaces.
// - 9: Joins array 'i' with newlines.
// - 0: Joins array 'i' with no separator.
 function myconv ( i , no ) {
    try {
        switch ( no ) {
            case  1 :
                return  parseInt ( i ) ;
            case  2 :
                return  i.split ( " " ) ;
            case  4 :
                return  i.split ( " " ) . map ( Number ) ;
            case  6 :
                return  i.split ( "" ) ;
            case  7 :
                return  i.split ( "" ) . map ( Number ) ;
            case  8 :
                return  i.join ( " " ) ;
            case  9 :
                return  i.join ( "\n" ) ;
            case  0 :
                return  i.join ( "" ) ;
            default :
                return  i ;
        }
    } catch ( e ) {
        return  i ;
    }
 }

// --- End of boilerplate code ---

/*
This is the main function where the core logic of the program resides.
It uses the utility functions defined above for input/output.
*/
function Main ( ) {

  myout ( "Yes" ) ;
  myout ( 4 ) ;
  myout ( "3 1 2 3" ) ;
  myout ( "3 1 4 5" ) ;
  myout ( "3 2 5 6" ) ;
  myout ( "3 3 4 6" ) ;
}