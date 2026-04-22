// This is the main function that processes the input data.
function    Main(input)
{
    // First, we split the entire input string by newline characters
    // to get an array of lines.
    input = input . split('\n');

    // The first line contains N and X. We split it by space
    // and convert each part to a number.
    var     NX    =    input[0] . split(' ') . map(Number);

    // X is the second element in the parsed first line.
    var X = NX[1]; // This is the target number X

    // The second line contains a list of numbers.
    // We split it by space, convert each to a number,
    // and then map each number to its absolute difference from X.
    var x = input[1] . split(' ') . map(Number) . map(function(value)
        {
            // Calculate the absolute difference between X and the current value.
            return Math . abs(X - value);
        }
    );


    // Finally, we calculate the Greatest Common Divisor (GCD) of the
    // array of absolute differences and print it to the console.
    console . log(gcd_arr(x));

} // End of Main function definition


// This helper function calculates the Greatest Common Divisor (GCD)
// for an array of numbers using a recursive approach.
function    gcd_arr(arr)
{
    // Base case 1: If the array contains only one element,
    // that element is its own GCD.
    if (arr . length == 1)
        {
            return arr[0];
        }

    // Base case 2: If the array contains exactly two elements,
    // calculate their GCD using the standard gcd function.
    if (arr . length == 2)
        {
            return gcd(arr[0], arr[1]);
        }

    // Recursive step:
    // Pop the last two elements from the array,
    // calculate their GCD, and push the result back onto the array.
    // Then, recursively call gcd_arr with the modified (smaller) array.
    arr . push(gcd(arr . pop(), arr . pop()));

    return gcd_arr(arr);
} // End of gcd_arr function definition


// This function calculates the Greatest Common Divisor (GCD) of two
// non-negative integers using the Euclidean algorithm.
function    gcd(a, b)
{
    // Ensure that 'a' is always greater than or equal to 'b'
    // for consistent application of the Euclidean algorithm.
    if (a < b)
        {
            return gcd(b, a);
        }

    // Base case: If 'b' is 0, then 'a' is the GCD.
    if (b == 0)
        {
            return a;
        }

    // Recursive step:
    // The GCD of (a, b) is the same as the GCD of (b, a % b).
    return gcd(b, a % b);
} // End of gcd function definition


// This is the entry point for the program execution.
// It reads the entire content of standard input as a UTF-8 string
// and passes it to the Main function for processing.
Main(require("fs") . readFileSync("/dev/stdin", "utf8"));