/*
 * This JavaScript program reads specific input data from standard input,
 * processes it to determine frequencies of elements, and then applies
 * a sorting and summation logic based on a given threshold.
 *
 * It's designed to calculate a particular sum based on element counts.
 */

// Initialize a variable to hold the raw input, read from standard input.
// The input is read as a UTF-8 string and then split into an array of lines.
inp = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ;

// Extract the first line of input and split it by spaces.
// This line typically contains configuration parameters N and K.
l = inp . shift ( ) . split ( ' ' ) ;

// Assign the first part of the split line to N (number of elements).
N = l[0] ;

// Assign the second part of the split line to K (a threshold value).
K = l[1] ;

// Read the next line of input, which contains the actual elements,
// and split it by spaces into an array A.
A = inp . shift ( ) . split ( ' ' ) ;

// Initialize an empty object 'o' to keep track of unique elements encountered.
// This will be used to determine the count of distinct elements.
o = { } ;

// Initialize an empty array 'a'. This array will effectively store the frequencies
// of elements, using the element values themselves as indices (or keys).
a = [ ] ;

// Loop through each element in array A from index 0 up to N-1.
for ( i = 0 ; i < N ; i ++ )
{
    // For the current element A[i], increment its count in array 'a'.
    // If A[i] has not been encountered before (i.e., a[A[i]] is undefined or 0),
    // it defaults to 0 before adding 1.
    a[A[i]] = ( a[A[i]] || 0 ) + 1 ;

    // Mark the current element A[i] as seen in object 'o' by assigning it a value (e.g., 1).
    // The specific value doesn't matter, only its presence as a key.
    o[A[i]] = 1 ;
}

// Obtain an array of all unique keys (element values) from the object 'o'.
// The length of this array represents the total number of distinct elements.
keys = Object . keys( o ) ;

// Calculate 'c', which is the difference between the total number of unique elements
// and the threshold K. This value indicates how many "extra" unique elements exist.
c = keys . length - K ;

// Begin a conditional block: if 'c' is greater than 0, meaning there are
// more unique elements than the allowed threshold K.
if ( c > 0 )
{
    // Sort the 'a' array. Note that 'a' contains frequency counts, not the elements themselves.
    // The default sort order for numbers will be ascending.
    a . sort ( ) ;

    // Initialize a counter variable 'cnt' to accumulate the sum.
    cnt = 0 ;

    // Iterate through the sorted frequency counts stored in 'a'.
    // 'k' will represent each frequency count.
    for ( k of a )
    {
        // Add the current frequency count 'k' to the total sum 'cnt'.
        cnt += k ;

        // Decrement 'c'. This 'c' tracks how many more "extra" elements
        // (represented by their frequencies) we still need to process/remove.
        c -- ;

        // Check if 'c' has reached 0. If so, we have processed enough
        // frequencies to account for the excess unique elements.
        if ( c === 0 )
        {
            // Exit the loop as the required sum has been calculated.
            break ;
        }
    }

    // Output the final calculated sum 'cnt' to the console.
    console . log( cnt ) ;
}
// If 'c' is not greater than 0 (i.e., c <= 0), it means the number of unique elements
// is already less than or equal to K.
else
{
    // In this scenario, no elements need to be "removed" or processed for their sum.
    // Therefore, output 0 to the console.
    console . log( 0 ) ;
}

// End of the program execution path.