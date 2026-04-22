/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been extensively modified.
 */

// Define the Scanner constructor function
function   Scanner ( input )
{
    // Store a reference to the current object instance
    var   self = this ;

    // Initialize the item number counter
    self.itemNo = 0 ;

    // Store the original input string
    self.orgStr = input ;

    /*
     * Initialize splitedStrs using an Immediately Invoked Function Expression (IIFE).
     * This processes the input string into an array of cleaned tokens.
     */
    self.splitedStrs = ( function ( target )
    {
        // Array to hold the resulting cleaned strings
        var   result = [ ] ;

        // Replace multiple newlines, spaces, and tabs with a single space
        var   target = target . replace ( /[\n \t]+/g , " " ) ;

        // Split the cleaned target string by spaces
        var   strs = target . split ( " " ) ;

        // Iterate through the split strings and push them to the result array
        for ( var i = 0 , len = strs . length ; i < len ; i++ )
        {
            result . push ( strs [ i ] ) ;
        }

        // Return the array of processed strings
        return result ;
    } ( input ) ) ; // Pass the original input to the IIFE

    // Define the next method to get the next string token
    self.next = function ( )
    {
        // Get the current item from the splitedStrs array
        var   result = self . splitedStrs [ self . itemNo ] ;

        // Increment the item counter for the next call
        self . itemNo ++ ;

        // Return the result if it's not null, otherwise return null
        return ( result != null ) ? result : null ;
    }

    /*
     * Define the nextInt method.
     * This method retrieves the next token and attempts to parse it as an integer.
     */
    self.nextInt = function ( )
    {
        // Retrieve the next string token
        var   result = self . splitedStrs [ self . itemNo ] ;

        // Advance the item pointer
        self . itemNo ++ ;

        // If the token exists, parse it as an integer; otherwise, return null
        return ( result != null ) ? parseInt ( result ) : null ;
    }

    /**
     * Define the nextBigDecimal method.
     * This method fetches the next token and converts it to a floating-point number.
     */
    self.nextBigDecimal = function ( )
    {
        // Get the string token at the current position
        var   result = self . splitedStrs [ self . itemNo ] ;

        // Move to the next position
        self . itemNo ++ ;

        // Parse the token as a float if it's not null, else return null
        return ( result != null ) ? parseFloat ( result ) : null ;
    }

    // Define the nextByte method.
    // This method is intended to return a byte representation, though Int8Array might not be the direct equivalent for a single byte.
    self.nextByte = function ( )
    {
        // Fetch the string token
        var   result = self . splitedStrs [ self . itemNo ] ;

        // Increment the internal counter
        self . itemNo ++ ;

        // If a result exists, create an Int8Array from it; otherwise, return null
        return ( result != null ) ? new Int8Array ( result ) : null ;
    }

} // End of Scanner function definition


/*
 * Main function containing the core logic of the program.
 * It takes a Scanner instance as input to process data.
 */
function   Main ( sc )
{

    // Read the first integer N from the scanner
    var   N = sc . nextInt ( ) ;
    // Read the second integer K from the scanner
    var   K = sc . nextInt ( ) ;
    // Initialize an empty object to serve as a lookup table (TBL)
    var   TBL = { } ;

    // Populate the TBL object with N integer values from the scanner
    for ( var i = 0 ; i < N ; i++ )
    {
        TBL [ i + 1 ] = sc . nextInt ( ) ;
    }

    // Initialize the answer variable to 1
    var   ans = 1 ;
    // Initialize an empty object to detect duplicates in the sequence
    var   dupli = { } ;

    // Loop to find cycles in the sequence defined by TBL
    for ( var i = 0 ; i < N ; i++ )
    {
        // Update 'ans' by looking up its current value in TBL
        ans = TBL [ ans ] ;
        // Check if the current 'ans' has been encountered before
        if ( dupli [ ans ] != null )
            break ; // If yes, a cycle is detected, so break the loop
        // If not, record the current 'ans' and the iteration count 'i'
        dupli [ ans ] = i ;
    }

    // Check if the loop was broken early due to a duplicate (i.e., a cycle was found)
    if ( i < N )
    {
        // Calculate the length of the detected loop
        var   loopDis = i - dupli [ ans ] ;
        // Calculate the number of steps taken before entering the loop
        var   beforeLoop = dupli [ ans ] - 1 ;

        // Adjust K based on the cycle.
        // (K - beforeLoop) gives steps remaining after reaching the pre-loop state.
        // % loopDis handles full cycles.
        // + beforeLoop brings it back to the correct offset within the sequence.
        K = ( ( K - beforeLoop ) % loopDis ) + beforeLoop ;
    }

    // Reset 'ans' to 1 for the final calculation
    var   ans = 1 ;
    // Perform K steps in the TBL sequence to find the final answer
    for ( var i = 0 ; i < K ; i++ )
    {
        ans = TBL [ ans ] ;
    }

    // Output the final calculated answer to the console
    console . log ( ans ) ;
}

// Call the Main function, initializing Scanner with input from /dev/stdin
Main ( new Scanner ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;

// Example usage of Scanner with a hardcoded string input (commented out)
// Main ( new Scanner ( "10 1 2 5 3 4 6 7 3 2 4 1 2 2 3 3 4 4 5 3 6 6 7 1 8 8 9 9 10" ) ) ;

/*
 * Various commented-out examples showing how to use the Scanner methods.
 * These are for reference and do not affect the program's execution.
 */
// var str1 = sc . next ( ) ;           // Example: Get a string token
// var int1 = sc . nextInt ( ) ;         // Example: Get an integer token
// var bd1 = sc . nextBigDecimal ( ) ;   // Example: Get a BigDecimal (float) token
// var byte1 = sc . nextByte ( ) ;       // Example: Get a byte token

/*
 * This commented loop is for creating an artificial delay.
 * It's currently not used in the active code path.
 */
// for ( var i = 0 ; i < 1000000000 ; i++ ) var toDelay = "aaa" ; // ~1000ms delay

// console . log ( wrtnNos ) ; // Example of logging a variable, likely for debugging
// return ; // Example of an early return statement