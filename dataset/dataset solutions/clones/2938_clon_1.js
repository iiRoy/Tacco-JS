/*
 * This is the main entry point function for processing input.
 * It reads the input, performs calculations, and returns a result.
 */
function   Main  (  input  ) {
    // Split the entire input string by newline characters into an array of lines.
    input  =  input.split ( "\n" ) ;

    // Parse the first line to get N and M.
    // N is the first number, M is the second.
    var   N    =  parseInt ( input [ 0 ] .split ( " " ) [ 0 ] ) ; // Number of items
    var   M    =  parseInt ( input [ 0 ] .split ( " " ) [ 1 ] ) ; // Number of modification offers

    var   max  =  0 ; // This variable appears to be unused in the provided logic.
                      // Retaining it as per Type I clone definition.

    // Initialize an array 'A' to store item information.
    // Its size is N (initial items) + M (modification offers).
    var   A    =  new   Array ( N + M ) ;

    // Populate the first N elements of array A with initial item data.
    // Each item is represented as [count, value].
    for ( var   i  =  0 ;   i  <  N ;   i ++ ) {
        var   a  =  parseInt ( input [ 1 ] .split ( " " ) [ i ] ) ; // Value of the i-th initial item
        A [ i ]  =  [ 1 ,   a ] ; // Each initial item has a count of 1.
    }

    // Populate the next M elements of array A with modification offers.
    // Each offer is [count_to_change, new_value].
    for ( var   i  =  0 ;   i  <  M ;   i ++ ) {
        var   b  =  parseInt ( input [ i + 2 ] .split ( " " ) [ 0 ] ) ; // Count for the offer
        var   c  =  parseInt ( input [ i + 2 ] .split ( " " ) [ 1 ] ) ; // Value for the offer
        A [ i + N ]  =  [ b ,   c ] ; // Store the offer details.
    }

    // Sort array A in descending order based on the second element (value).
    // This prioritizes items/offers with higher values.
    A.sort ( function (   a  ,   b   ) {
        if (   a [ 1 ]   <   b [ 1 ]   )   return   1 ; // If 'a's value is less, 'b' comes first (descending)
        if (   a [ 1 ]   >   b [ 1 ]   )   return   -1 ; // If 'a's value is greater, 'a' comes first (descending)
        return   0 ; // Values are equal, maintain relative order.
    } ) ;

    var   ans  =  0 ; // Initialize total accumulated value.
    var   cnt  =  0 ; // Initialize count of items processed so far.

    // Iterate through the sorted items/offers to maximize the total value,
    // up to a total of N items.
    for ( var   i  =  0 ;   i  <  N ;   i ++ ) {
        // Check if adding the full current offer/item's count does not exceed N.
        if (   cnt  +  A [ i ] [ 0 ]   <=   N   ) {
            // If yes, add the full value of this offer/item and update the count.
            ans  +=  A [ i ] [ 1 ]  *  A [ i ] [ 0 ] ;
            cnt  +=  A [ i ] [ 0 ] ;
        }
        // If adding the full count exceeds N, but there's at least one slot left.
        else   if (   cnt  +  1   <=   N   ) {
            // Add value for the remaining slots (N - cnt) using the current item's value.
            ans  +=  A [ i ] [ 1 ]  *  ( N  -  cnt ) ;
            cnt  =  N ; // All N slots are now filled.
        }
        // If no slots are left (cnt is already N), stop processing.
        else {
            break ;
        }
    }


    // Output the final calculated answer to the console.
    console.log ( '%s' ,   ans ) ;
    // Return the calculated answer.
    return   ans ;
}

/*
 * This debug function is used for local testing within an HTML environment.
 * It retrieves input and expected output from HTML elements,
 * calls the Main function, and displays "AC" or "WA".
 */
function   debug (   n   ) {
    var   input  =  document.getElementById ( "input" + n ) .value ;
    var   ans    =  Main ( input ) ;
    var   result =  "WA" ; // Assume Wrong Answer initially.

    // Compare the calculated answer with the expected output.
    if (   ans  ==  document.getElementById ( "output" + n ) .value.split ( "\n" ) [ 0 ]   ) {
        result   =  "AC" ; // If they match, it's Accepted.
    }
    // Display the result ("AC" or "WA") in the corresponding HTML element.
    document.getElementById ( "result" + n ) .innerHTML  =  result ;
}

// This is the main execution block for typical competitive programming environments.
// It reads input from stdin, passes it to Main, and implicitly handles output via console.log.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;