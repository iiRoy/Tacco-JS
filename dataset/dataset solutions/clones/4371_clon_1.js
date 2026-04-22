// This is a JavaScript program designed to process a list of numbers.
// It simulates a set operation, adding numbers if they are not present,
// and removing them if they are.

function Main( input )
{
    // The input string is first split by newlines and each part converted to a number.
    input = input . split ( "\n" ) . map ( Number ) ;

    // The first element of the input array is assigned to variable N.
    // However, N is not used later in the original logic.
    var N = input [ 0 ] ;

    // Remove the last element from the input array.
    input . pop ( ) ;

    // Remove the first element from the input array (which was N).
    input . shift ( ) ;

    // Initialize 'now_j' with the new first element of the modified input array.
    var now_j = [ input [ 0 ] ] ;

    // Remove the element that was just used to initialize 'now_j'.
    input . shift ( ) ;

    // Iterate over the remaining elements in the 'input' array.
    input . forEach ( i =>
    {
        // Check if the current number 'i' is already present in 'now_j'.
        if ( now_j . some ( inp => inp == i ) )
        {
            // If 'i' is found, remove its first occurrence from 'now_j'.
            now_j . splice ( now_j . indexOf ( i ) , 1 ) ;
        }
        else
        {
            // If 'i' is not found, add it to 'now_j'.
            now_j . push ( i ) ;
        }
    } ) ;

    // Log the final count of elements remaining in 'now_j'.
    console . log ( now_j . length ) ;
}

// Invoke the Main function, reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;