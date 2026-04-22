/*
 * This file contains the solution logic for a programming problem.
 * It uses custom utility functions for input/output and type conversions.
 */

// Initialize the global input object
var obj = init( );


// Call the main execution function
Main( );


/**
 * Reads the next integer from the input stream.
 * @returns {number} The next integer.
 */
function nextInt( ) { return myconv( next( ), 1 ) ; }


/* A utility function to retrieve the next array of strings,
 * split by half-width spaces.
 */
function nextStrArray( ) {
    return myconv( next( ), 2 ) ; // Parses input line by splitting on spaces
}

/**
 * Retrieves the next array of integers,
 * splitting the input line by spaces and converting each part to a number.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray( ) {
    return myconv( next( ), 4 ) ; // Split by space and convert to numbers
}

/*
 * This function is designed to return the next input line
 * as an array of individual characters.
 */
function nextCharArray( ) {
    return myconv( next( ), 6 ) ; // Splits the input line into individual characters
}

/*
 * Internal helper to get the next raw input line from the initialized object.
 * @returns {string} The next raw input line.
 */
function next( ) {
    return obj.next( ) ;
}


// Checks if there is more input available.
function hasNext( ) { return obj.hasNext( ) ; }

/*
 * Reads all input from standard input, trims whitespace,
 * and splits it into an array of lines.
 * This function uses Node.js 'fs' module.
 */
function myin( ) {
    return require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim( ).split( "\n" ) ;
}


/**
 * Initializes the input reader object.
 * This object manages the input lines and provides methods to access them.
 * @returns {object} An object with list, index, max, hasNext, and next properties.
 */
function init( ) {
    var inputFile = myin( ) ; // Get all input lines
    var returnObj = {
        "list" : inputFile ,
        "index" : 0 ,
        "max" : inputFile.length ,
        "hasNext" : function( ) {
            return ( this.index < this.max ) ;
        } ,
        "next" : function( ) {
            // Check if there are more elements to process
            if ( ! this.hasNext( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ; // Error if no more input
            } else {
                var returnInput = this.list[ this.index ] ; // Retrieve current input line
                this.index++ ; // Move to the next line
                return returnInput ;
            }
        }
    } ;
    return returnObj ;
}


// Standard output function. Logs to console.
function myout( t ) {
    console.log( t ) ; // Prints the given argument to standard output
}


/*
 * Standard error output function. Logs to console.
 * Useful for debugging messages.
 */
function myerr( t ) {
    console.error( t ) ; // Prints the given argument to standard error
}

/*
 * myconv function: Handles various type conversions and array manipulations.
 *
 * [no] parameter values:
 *   - default: Returns input 'i' as is (unknown value or error).
 *   - 1: Converts 'i' to an integer.
 *   - 2: Splits 'i' by half-width spaces into a string array.
 *   - 4: Splits 'i' by half-width spaces and converts parts to a number array.
 *   - 6: Splits 'i' into a character array.
 *   - 7: Splits 'i' into a character array and converts parts to a number array.
 *   - 8: Joins 'i' (assumed to be an array) with half-width spaces.
 *   - 9: Joins 'i' (assumed to be an array) with newlines.
 *   - 0: Joins 'i' (assumed to be an array) without any separator.
 */
function myconv( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt( i ) ;
            case 2 :
                return i.split( " " ) ;
            case 4 :
                return i.split( " " ).map( ( a ) => Number( a ) ) ;
            case 6 :
                return i.split( "" ) ;
            case 7 :
                return i.split( "" ).map( ( a ) => Number( a ) ) ;
            case 8 :
                return i.join( " " ) ;
            case 9 :
                return i.join( "\n" ) ;
            case 0 :
                return i.join( "" ) ;
            default :
                return i ;
        }
    } catch ( e ) {
        // In case of any conversion error, return the original input.
        return i ;
    }
}


/**
 * The main function where the core logic of the program resides.
 * It solves a dynamic programming problem related to damage and magic points.
 */
function Main( ) {
    // Read the first line of input, containing H and N
    var one = nextIntArray( ) ;

    // H: Target damage value
    var H = one[ 0 ] ;
    // N: Number of available spells/attacks
    var N = one[ 1 ] ;

    // Initialize an array to store spell details
    var list = new Array( N ) ;

    // Populate the list with spell damage and magic cost
    for ( var i = 0 ; i < N ; i++ ) {
        var tmp = nextIntArray( ) ; // Read damage and maryoku for current spell
        list[ i ] = {
            "damage" : tmp[ 0 ] , // Damage dealt by the spell
            "maryoku" : tmp[ 1 ] // Magic points required for the spell
        } ;
    }

    // Initialize DP array. Size is (H+1)*2 to handle potential overflows or large indices.
    // The problem context implies H is the target, so indices up to H are needed.
    // The `* 2` might be a safety margin or specific problem requirement.
    var dp = new Array( ( H + 1 ) * 2 ) ;

    // Base case: 0 damage requires 0 magic points.
    dp[ 0 ] = 0 ;

    // Iterate through each spell (i)
    for ( var i = 0 ; i < N ; i++ ) {
        // Iterate through possible damage values (j) up to H
        for ( var j = 0 ; j < H ; j++ ) {
            // Only consider states that are reachable (not null)
            if ( dp[ j ] != null ) {
                // Calculate the new damage value after using spell 'i'
                var newDamage = j + list[ i ][ "damage" ] ;
                // Calculate the magic cost for this new state
                var newMaryoku = dp[ j ] + list[ i ][ "maryoku" ] ;

                // If this new damage state has not been reached before, or if
                // the current path offers a lower magic cost, update it.
                if ( ! dp[ newDamage ] ) {
                    dp[ newDamage ] = newMaryoku ;
                } else {
                    dp[ newDamage ] = Math.min( dp[ newDamage ] , newMaryoku ) ;
                }
            }
        }
    }

    // Define a large number for initialization or comparison
    var last = 1000000007 ; // A common large prime used in competitive programming

    // Initialize a specific DP state if it's not set.
    // The index H * 2 + 1 seems to be an upper bound or sentinel.
    if ( ! dp[ H * 2 + 1 ] ) {
        dp[ H * 2 + 1 ] = last ;
    }

    // Debugging line (commented out in original, can be re-added or left out):
    // myerr(dp); // This line was present in the original code, but commented.

    // Second pass: Propagate minimum magic cost backwards.
    // This handles cases where reaching a higher damage value
    // might be cheaper and can satisfy a lower target damage.
    for ( var i = H * 2 ; i >= 0 ; i-- ) {
        // If dp[i] is already set (reachable), compare it with dp[i+1]
        if ( dp[ i ] ) {
            dp[ i ] = Math.min( dp[ i ] , dp[ i + 1 ] ) ;
        } else {
            // If dp[i] is not set, it inherits the value from dp[i+1]
            // This assumes dp[i+1] is a valid or sentinel value.
            dp[ i ] = dp[ i + 1 ] ;
        }
    }

    // Output the minimum magic points required to reach exactly H damage.
    myout( dp[ H ] ) ;
}