function Main ( input ) {
    // This function processes the given input string.
    // The input string is expected to contain multiple lines of data.

    // First line of input contains D and G, separated by a space.
    // D represents the number of problem types.
    // G represents the target score.
    var D = input.split( "\n" ) [ 0 ] .split( " " ) [ 0 ] ;
    var G = input.split( "\n" ) [ 0 ] .split( " " ) [ 1 ] ;

    // Initialize arrays to store problem points, bonus points, and combined scores.
    var p = new Array ( ) ; // p[i] will store the number of problems of type i+1.
    var c = new Array ( ) ; // c[i] will store the bonus points for completing all problems of type i+1.
    var comp = new Array ( ) ; // comp[i] will store the total score for completing all problems of type i+1 (including bonus).

    // Initialize variables for tracking scores and answers.
    var score = 0 ; // Current score during calculations.
    var answer = 10000000000 ; // Initialize with a very large number to find the minimum.

    /*
     * Loop through each problem type to parse its details from the input.
     * The input format is:
     * D G
     * p_0 c_0
     * p_1 c_1
     * ...
     * p_{D-1} c_{D-1}
     */
    for ( var i = 0 ; i < D ; i++ ) {
        p [ i ] = input . split ( "\n" ) [ i + 1 ] . split ( " " ) [ 0 ] ; // Number of problems for this type.
        c [ i ] = input . split ( "\n" ) [ i + 1 ] . split ( " " ) [ 1 ] ; // Completion bonus for this type.
        // Calculate the combined score for completing all problems of this type.
        // Problem type 'i' corresponds to 100 * (i+1) points per problem.
        comp [ i ] = Number ( 100 * ( i + 1 ) * p [ i ] ) + Number ( c [ i ] ) ;
    }

    // Convert all array elements to numbers explicitly, though they might be already due to arithmetic operations.
    // This step ensures consistent type for later numerical comparisons and calculations.
    p . map ( Number ) ;
    c . map ( Number ) ;
    comp . map ( Number ) ;

    // All preliminary data parsing and preparation is now complete.
    // The program is ready to proceed with the core logic.

    /*
     * Core Algorithm: Iterating through all possible combinations of "fully solved" problem types.
     *
     * The problem involves selecting a subset of problem types to solve completely (i.e., solve all 'p_i' problems
     * of type 'i' and get the 'c_i' bonus). For the remaining score needed, we pick individual problems from
     * the highest point-value problem types that were NOT fully solved.
     *
     * This outer loop explores all 2^D combinations of fully solved problem types.
     * Each 'l' represents a unique combination.
     */
    for ( var l = 0 ; l < Math . pow ( 2 , D ) ; l++ ) {
        var tmpscore = 0 ;      // Temporary score for the current combination.
        var tmpelements = 0 ;   // Temporary count of problems solved for the current combination.

        // Step 1: Construct a 'mask' to represent the current combination.
        // The 'l' variable (0 to 2^D - 1) is used as a bitmask.
        // A '1' at position 'i' in the mask means problem type 'i' is fully solved.
        // A '0' means problem type 'i' is not fully solved.
        var l_ = Math . pow ( 2 , D ) - l - 1 ; // Invert 'l' to make higher-index problems correspond to lower 'l' values if desired, or just for variation.
        var mask = l_ . toString ( 2 ) . split ( "" ) ; // Convert to binary string and then to an array of characters.

        // Pad the mask with leading zeros to ensure its length is D.
        while ( mask . length < D ) {
            mask . splice ( 0 , 0 , "0" ) ; // Insert '0' at the beginning.
        }

        // console.log("Current mask for combination:", mask); // Debugging output.

        // Step 2: Calculate the initial score and elements based on the fully solved problem types (where mask[j] is '1').
        // Iterate through each problem type 'j' as represented by the mask.
        for ( var j = 0 ; j < mask . length ; j++ ) {
            // If mask[j] is '1', it means we fully solved problem type 'j'.
            // Add its combined score (including bonus) and total problems 'p[j]' to the temporary totals.
            tmpscore += Number ( mask [ j ] * comp [ j ] ) ;
            tmpelements += Number ( mask [ j ] * p [ j ] ) ;
        }
        // console.log("Score from completed types:", tmpscore);    // Debugging output.
        // console.log("Elements from completed types:", tmpelements); // Debugging output.

        // Step 3: If the target score 'G' is not yet reached, try to achieve it by solving individual problems.
        // We prioritize problems from types that were NOT fully solved (mask[j] is '0'),
        // starting from the highest point-value types (i.e., largest 'j' index).
        // Find the index of the first '0' in the mask, starting from the right (highest index).
        var index = mask . lastIndexOf ( "0" ) ; // Find the highest index 'j' where mask[j] is '0'.

        // If there are any problem types that were not fully solved (i.e., '0' exists in the mask).
        if ( index !== -1 ) {
            // Iterate through the problems of this highest-point-value, non-fully-solved type.
            // We can solve up to 'p[index]' individual problems of this type.
            for ( var k = 0 ; k < p [ index ] ; k++ ) {
                // If the temporary score already meets or exceeds the target score G, we can stop adding problems.
                if ( tmpscore >= G ) {
                    break ; // Exit the inner loop as target is met.
                    // If tmpscore reaches G here, the 'answer' will be updated after this loop.
                    // If it doesn't reach G even after adding all 'p[index]' problems,
                    // this path won't update the 'answer' for this specific combination.
                }
                // Add points for one problem of type 'index'.
                // A problem of type 'index' is worth 100 * (index + 1) points.
                tmpscore += 100 * ( index + 1 ) ;
                tmpelements += 1 ; // Increment the count of solved problems.
            }
        }

        // Step 4: After potentially adding individual problems, check if the target score G has been reached.
        if ( tmpscore >= G ) {
            // If the target score is met, update the global minimum 'answer' with the current 'tmpelements'.
            answer = Math . min ( answer , tmpelements ) ;
        }

    } // End of the main loop iterating through combinations.

    // Finally, print the minimum number of problems required to achieve the target score G.
    console . log ( answer ) ;

}


// The following line is standard boilerplate for competitive programming in Node.js.
// It reads all input from stdin and passes it to the Main function.
// Do not modify this part.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;