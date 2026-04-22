/*
 * This is a highly optimized JavaScript program for a specific calculation.
 * It processes numerical input, computes prefix sums, and then calculates
 * a final result using a custom multiplication function, all under a modulo.
 */

// Original input reading mechanism, commented out for direct string input.
// const input = require("fs").readFileSync("/dev/stdin", "utf8")

 var input = `4
 3 5 6 4` // A placeholder input example, which is subsequently overwritten.

var input  =  `4
141421356 17320508 22360679 244949`; /* The actual problem input string.
                                        It contains the number of elements N on the first line
                                        and the array elements A on the second line. */

const lines = input.split('\n') ; // Split the multi-line input string into an array of strings.

let N = lines[0] - 0 ; // Parse the first line to get the integer value for N (number of elements).
                       // The '- 0' is a common trick to ensure numeric conversion.

let A = lines[1].split(' ').map(Number) ; // Parse the second line: split by space, then map each part to a Number.
                                         // This creates the array A of integers.

 const mod = 1000000007 ; // Define the modulo constant. This is a large prime number.

/*
 * Initialize the 'sum' array to store prefix sums.
 * sum[i] will store the sum of A[0]...A[i-1].
 * sum[0] is intentionally set to 0.
 */
const sum = [0] ;

 for (let i = 0; i < N; i++)
 {
  sum[i + 1] = (sum[i] + A[i]) % mod ; // Calculate the prefix sum for the current element, apply modulo.
 }


// Custom multiplication function 'mul'.
// This function performs (a * b) % mod efficiently,
// potentially handling intermediate products that might exceed standard integer limits
// by breaking 'a' into two parts using bitwise operations.
function mul (a, b)
{
    return ( ( a >> 16 ) * b % mod * 65536 + ( a & 65535 ) * b ) % mod ;
}

let ans = 0 ; // Initialize the answer variable to zero.

// Iterate through the prefix sums and original array elements.
// The loop starts from index 1 and goes up to 'sum.length - 2' (which corresponds to N-1).
for ( let i = 1; i < sum.length - 1; i++ )
{
    ans += mul(sum[i], A[i]) ; // Accumulate the result of 'mul' function.
}

console.log(ans % mod) ; // Finally, print the accumulated answer, ensuring it's within the modulo range.