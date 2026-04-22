var read = require( 'readline' ) .createInterface( {
    input : process.stdin,
    output: process.stdout
} ); // Initialize readline interface for input/output operations

var obj; // Object to manage input line processing
var inLine = [ ] ; // Array to store all input lines

// Event listener for each line of input
read.on(
    'line',
    function ( input ) {
        inLine.push( input ) ;
    }
);

// Event listener for when input stream closes
read.on( 'close', function ( ) {
    obj = init( inLine ) ; // Process all collected input lines
    myerr( "-----start-----" ) ; // Log start time marker
    var start = new Date( ) ; // Capture start timestamp

    Main( ) ; // Execute the main logic of the program

    var end = new Date( ) - start ; // Calculate elapsed time
    myerr( "----- end -----" ) ; // Log end time marker
    myerr( "time : " + ( end ) + "ms" ) ; // Display execution time
    myerr( "memory : " + Math.round( process.memoryUsage().heapTotal / 1024 ) + "KB" ) ; // Display memory usage
} ) ;

// Helper functions for parsing input
function nextInt ( ) { return myconv( next( ), 1 ) ; }
function nextStrArray ( ) { return myconv( next( ), 2 ) ; }
function nextIntArray ( ) { return myconv( next( ), 4 ) ; }
function nextCharArray ( ) { return myconv( next( ), 6 ) ; }
function next ( ) { return obj.next( ) ; }
function hasNext ( ) { return obj.hasNext( ) ; }

// Initializes an object to manage reading from input lines
function init( input ) {
    var returnObj = {
        list : input,
        index : 0,
        max : input.length,

        // Checks if there are more lines to read
        hasNext : function ( ) {
            return ( this.index < this.max ) ;
        },

        // Retrieves the next line from input
        next : function ( ) {
            if ( ! this.hasNext( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
            } else {
                var returnInput = this.list[ this.index ] ;
                this.index ++ ;
                return returnInput ;
            }
        }
    } ;
    return returnObj ;
}

// Function to output to standard console
function myout(s) {
    console.log(s);
}

// Function to output debug messages to standard error
function myerr(s) {
    console.error( "debug:" + require( "util" ).inspect( s, false, null ) ) ;
}

// Utility function for type conversion and string manipulation
// Cases: 1: parseInt, 2: split by space, 4: split by space and map to Number
// 6: split by char, 7: split by char and map to Number, 8: join by space
// 9: join by newline, 0: join without separator
function myconv( i, no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt( i ) ;
            case 2 :
                return i.split( " " ) ;
            case 4 :
                return i.split( " " ).map( Number ) ;
            case 6 :
                return i.split( "" ) ;
            case 7 :
                return i.split( "" ).map( Number ) ;
            case 8 :
                return i.join( " " ) ;
            case 9 :
                return i.join( "\n" ) ;
            case 0 :
                return i.join( "" ) ;
            default :
                return i ; // Return input as-is for unknown cases
        }
    } catch ( e ) {
        return i ; // In case of error during conversion, return original input
    }
}


function Main( ) {
    // Read four integer values from a single line of input
    var one = nextIntArray( ) ;
    var A = one[ 0 ] ;
    var B = one[ 1 ] ;
    var C = one[ 2 ] ;
    var D = one[ 3 ] ;

    // Initialize an array of size 101 with all zeros
    // This array will be used to track overlaps
    var list = new Array( 101 ).fill( 0 ) ;

    // Mark the first interval [A, B]
    // For each point in this interval, increment its count in 'list'
    for ( var i = A ; i <= B ; i ++ ) {
        list[ i ] += 1 ;
    }

    // Mark the second interval [C, D]
    // For each point in this interval, increment its count in 'list'
    for ( var i = C ; i <= D ; i ++ ) {
        list[ i ] += 1 ;
    }

    var output = 0 ; // Initialize counter for overlapping points

    // Iterate through the 'list' array to find points with count 2
    // A count of 2 indicates that the point is part of both intervals
    for ( var i = 0 ; i < 101 ; i ++ ) {
        if ( list[ i ] == 2 ) {
            output ++ ; // Increment if an overlap is found
        }
    }

    // The problem asks for the length of the overlapping segment.
    // If 'output' is the number of overlapping points, the length is 'output - 1'.
    // Ensure the result is not negative (e.g., if no overlap, output - 1 would be -1).
    myout( Math.max( output - 1, 0 ) ) ;
}