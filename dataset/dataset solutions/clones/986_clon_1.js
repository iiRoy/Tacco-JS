/*
 * This is a JavaScript program demonstrating the Insertion Sort algorithm.
 * It reads input from stdin, sorts an array of numbers, and prints
 * the array's state after each insertion step.
 */
function   Main   (   input   )
{
    // Split the entire input string by newline characters.
    input   =   input.split ( "\n" ) ;

    // The first line contains the count of numbers.
    var   count     =   Number ( input [ 0 ] ) ;

    // The second line contains space-separated numbers, convert them to an array of numbers.
    var   num_array =   input [ 1 ] . split ( " " ) . map ( Number ) ;

    // Declare a temporary variable for swapping elements.
    var   tmp   ;


    // Print the initial unsorted array.
    console . log ( num_array . join ( " " ) ) ;

    /*
     * Iterate through the array starting from the second element.
     * This is the main loop for Insertion Sort.
     */
    for   (   let   i   =   1   ;   i   <   count   ;   i ++   )
    {
        // Store the current element to be inserted in its correct position.
        tmp   =   num_array [ i ] ;

        // Initialize j to the index of the element just before the current one.
        let   j   =   i   -   1   ;

        /*
         * Move elements of num_array[0..i-1], that are greater than tmp,
         * to one position ahead of their current position.
         */
        while   (   j   >=   0   &&   num_array [ j ]   >   tmp   )
        {
            num_array [ j + 1 ]   =   num_array [ j-- ] ;
        }

        // Place the 'tmp' element at its correct sorted position.
        num_array [ j + 1 ]   =   tmp   ;

        // After each insertion, print the current state of the array.
        console . log ( num_array . join ( " " ) ) ;
    }
}

// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;