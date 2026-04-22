/*
 * This JavaScript program processes input data
 * to calculate a specific count based on array elements.
 * It reads from standard input.
 */


inp   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( '\n' )


// The first line of input provides the total number of elements, N.
// We parse it as a number.

N    =    inp . shift ( )    *    1


  // The second line contains space-separated numbers, forming array A.
  A   =   inp . shift ( ) . split ( ' ' )


/*
 * 'o' is an object used as a hash map.
 * It stores key-value pairs to track certain relationships
 * between array elements and their indices.
 */
o    =    { }


// 'cnt' is a counter that increments when a specific condition is met.
cnt    =    0


// Start of the main loop.
// This loop iterates N times, processing each element of array A.
for ( i = 0 ; i < N ; i++ )
{

    // Convert the current array element A[i] to a number.
    u    =    A [ i ]    *    1


    // Check if the numerical value 'u' exists as a key in the object 'o'.
    if  (  o [ u ]  )
    {
        // If 'u' is found as a key,
        // compare its associated value with (current index + 1).
        if  (  o [ u ]    ==    i + 1  )
        {
            // If the values match, increment our counter.
            cnt++
        }
    }
    else // If 'u' is not found as a key in 'o'.
    {
        // Add a new entry to the object 'o'.
        // The key will be (current index + 1), and its value will be 'u'.
        o [ i + 1 ]    =    u
    }
}
// End of the processing loop.


// Output the final calculated count to the console.
console . log ( cnt )