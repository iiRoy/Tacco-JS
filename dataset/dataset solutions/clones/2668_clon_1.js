/*
 *  This is a Type I code clone generated according to the specified rules.
 *  Only whitespace and comments have been altered.
 *  All identifiers, operators, and expressions are strictly identical to the original.
 */


function   Main (   input   )
{
    // The primary function for processing the input data.
    // It takes a single string 'input' as its argument.
    input  =  input . split ( "\n" ) ; /* Split the entire input string by newline characters
                                         to get an array of individual lines. */


    var   n   =   Number (   input [ 0 ] . split ( " " ) [ 0 ]   ) ; // Extract the first number from the first line.
    var   m   =   Number (   input [ 0 ] . split ( " " ) [ 1 ]   ) ; // Extract the second number from the first line.


    input . shift ( ) ; // Remove the first line (which contained n and m) from the input array.

    var   sum   =   0 ; // Initialize a variable 'sum' to store the cumulative maximums found.


    // Begin the main processing loop. This loop iterates 'm' times.
    for ( var   k   =   0 ;   k   <   m ;   k ++ )
    {
        // This array will temporarily hold elements from 'input' that meet certain criteria.
        var   tempArray   =   [ ] ;

        // Variables to track the maximum value found in tempArray for the current iteration.
        var   max        =   0       ;
        var   maxIndex   =   0       ;


        // Iterate through the current 'input' array to filter elements.
        input . forEach ( function (   value   ,   index   )
        {
            // Check if the lead time (first part of the value) is less than or equal to the remaining days (m-k).
            // This condition filters out tasks that cannot be completed within the remaining time.
            if (   value . split ( " " ) [ 0 ]   <=   m - k   )
            {
                tempArray . push ( value ) ; // Add the valid element to our temporary array.
            }
        } ) ; /* End of the first forEach loop.
               * At this point, tempArray contains only relevant items for the current 'k' iteration. */


        // Now, iterate through the filtered 'tempArray' to find the element with the maximum profit.
        tempArray . forEach (   function (   value2   ,   index2   )
        {
            // Parse the second part of the string (profit) to a number and compare it with the current 'max'.
            if (   Number (   value2 . split ( " " ) [ 1 ]   )   >   max   )
            {
                max        =   Number (   value2 . split ( " " ) [ 1 ]   ) ; // Update 'max' with the new highest profit.
                maxIndex   =   index2 ; // Store the index of this maximum profit item within 'tempArray'.
            }
        }   ) ; // End of the second forEach loop.

        // Remove the selected item (the one with the maximum profit) from the tempArray.
        // This simulates 'taking' the task, so it cannot be considered again.
        tempArray . splice (   maxIndex   ,   1   ) ;

        // The remaining items in tempArray become the new 'input' for the next iteration.
        input   =   tempArray ;

        // Add the maximum profit found in this iteration to the total sum.
        sum   =   sum   +   max ;
    } // End of the main 'for' loop.


    // Finally, print the total accumulated sum of maximum profits.
    console . log (   sum   ) ;
}


// Call the Main function with input read from standard input.
// This is typical for competitive programming environments.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;