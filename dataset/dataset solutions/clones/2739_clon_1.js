// This function processes the entire input data provided.
function Main(  input  ) {

    // Split the input string into an array of lines.
    // The first line is inputs[0], the second is inputs[1], and so on.
    inputs = input . split (  "\n"  ) ;


    var N = parseInt (  inputs[0] , 10  ) ; // Parse the first line as an integer N.

    var boxes = new Array ( N ) ; // Initialize an array named 'boxes' with N elements.
    var inputArray = [ ] ;       // Create an empty array to store selected indices.
    var inputCounter = 0 ;       // Counter for the number of selected indices.


    // Iterate backwards from N down to 1.
    for ( var i = N ; i > 0 ; i-- )
    {
        var index = i - 1 ; // Calculate the 0-based index for the 'boxes' array.

        // Parse the i-th line of input (inputs[i]) as an integer.
        var tmp = parseInt ( inputs[i] , 10 ) ;

        var sum = 0 ; // Initialize sum for current calculation.
        var counter = 2 ; // Start checking multiples from 2.

        // Loop through multiples of 'i' that are within the bounds of N.
        while ( i * counter <= N )
        {
            // Add the value from 'boxes' at the corresponding multiple index to sum.
            sum += boxes [ i * counter - 1 ] ;
            counter++ ; // Move to the next multiple.
        }


        // Check if the sum modulo 2 matches the temporary value.
        if (  sum % 2 == tmp  )
        {
            boxes [ index ] = 0 ; // If they match, set the box value to 0.
        }
        else
        {
            // If they don't match, set the box value to 1.
            boxes [ index ] = 1 ;
            inputCounter++ ;        // Increment the counter.
            inputArray . push ( i ) ; // Add the current 'i' to the inputArray.
        }

    }


    // After the loop, check if any items were added to inputArray.
    if ( inputCounter > 0 )
    {
        // Output the total count of selected items.
        console . log ( '%d' , inputCounter ) ;

        var str = '' ; // Initialize an empty string for output.

        // Iterate through the inputArray in reverse order.
        for ( var i = inputCounter - 1 ; i >= 0 ; i-- )
        {
            str += inputArray[i] ; // Append the current item to the string.

            // Conditional formatting for spacing.
            if ( i == 0 )
            {
                // If it's the last item, append it without a trailing space.
                str += '' + inputArray[i] ;
            }
            else
            {
                // Otherwise, append the item followed by a space.
                str += '' + inputArray[i] ;
                str += ' ' ;
            }
        }
        console . log ( str ) ; // Output the formatted string.
    }
    else
    {
        // If no items were selected, output 0.
        console . log ( '%d' , 0 ) ;
    }

}
/*
 *  This section is for standard input/output handling and should not be modified.
 *  It reads the entire input from /dev/stdin and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;