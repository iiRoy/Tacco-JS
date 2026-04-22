function      main  (  input  )   {
    // This is the main function that processes the input data.
    // It takes an array of strings as 'input'.

    /*
     * The first line of input contains N, D, and A.
     * N: Number of items.
     * D: Some distance parameter.
     * A: Some attack power parameter.
     */
    var   N    =   input[0] .split( " " )[0] - 0   ; // Parse N as an integer.
    var   D    =   input[0] .split( " " )[1] - 0   ; // Parse D as an integer.
    var   A    =   input[0] .split( " " )[2] - 0   ; // Parse A as an integer.

    // Initialize an empty list to store subsequent data.
    var   list   =   [ ]   ;

    // Loop through the remaining N lines of input.
    for  ( var  i = 1 ;  i <= N ;  i++ )  {
        // For each line, split by space, map to numbers, and push to the list.
        list.push(  input[i] .split( " " ) .map( v => v - 0 )  )   ;
    }

    // Sort the list based on the first element of each sub-array (e.g., coordinate).
    list   =   list .sort(  ( a, b )   =>   a[0] - b[0]  )   ;


    // Initialize the answer variable to zero. This will accumulate the result.
    var   ans   =   0   ;

    // Main loop to process each item in the sorted list.
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )   {
        // Get the current item 'x' from the list.
        var   x   =   list[i]   ;

        // Check if the second element of 'x' (e.g., HP/value) is greater than 0.
        if   (   x[1]   >   0   )   {
            // Calculate 'time' needed based on current item's value and 'A'.
            // Math.ceil ensures we always take a full 'attack' even if a fraction is needed.
            var   time   =   Math.ceil(  x[1] / A  )   ;

            // Add the calculated 'time' to the total answer.
            ans   +=   time   ;

            // Inner loop: iterate from the current item 'i' to the end of the list.
            for   (   var   j   =   i   ;   j   <   N   ;   j++   )   {
                // Get the item 'y' from the list at index 'j'.
                var   y   =   list[j]   ;

                // Check if 'y' is within the effective range of 'x' + D*2 + 1.
                // This condition defines the area of effect.
                if   (   y[0]   <=   x[0]   +   D   *   2   +   1   )   {
                    // If within range, reduce 'y's value by A multiplied by 'time'.
                    y[1]   -=   A   *   time   ;
                }   else   {
                    // If 'y' is out of range, we can stop checking further items
                    // because the list is sorted by x[0].
                    break   ;
                }
            }
        }
    }

    // Output the final calculated answer to the console.
    console.log(   ans   )   ;
}

// This section handles reading input from stdin and calling the main function.
// It reads the entire file, decodes it as UTF-8, and splits it by newlines.
main(   require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) .split( "\n" )   )   ;