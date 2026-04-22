function     Main(s) /* This is the main processing function */
{
    // The input 's' is expected to be a multi-line string.
    // We split it by newline characters to get an array of lines.
    s   =   s.split("\n");

    /* The first line contains the number of queries.
     * We convert it to a number using the unary plus operator. */
    const   q   =   +s[0];

    // Loop through each query.
    for  ( var i  =  0;  i < q;  i++ )
    {
        // Each subsequent line contains two numbers 'a' and 'b' for the current query.
        // Split the line by spaces, then map each part to a number.
        var   a   =   s[i+1].split(" ") .map ( a => +a );

        // Determine the maximum of the two input numbers.
        var   b   =   Math.max(a[0], a[1]);

        // Reassign 'a' to be the minimum of the two original numbers.
        a   =   Math.min(a[0], a[1]);

        // Calculate 'c' using custom `sqrt64` and `kakeru32` functions.
        // It involves multiplication and then square root, minus one.
        var   c   =   sqrt64(kakeru32(a,b)) - 1;

        // Initialize the answer based on 'a'.
        var   ans   =   (a - 1) * 2;

        // Conditional increment to 'ans'.
        if (a < b - 1)
        {
            ans++; // Increment if 'a' is less than 'b - 1'.
        }

        // Add to 'ans' based on the difference between 'c' and 'a'.
        ans   +=   Math.max(c - a, 0) * 2;

        // Another conditional decrement.
        // This checks a specific mathematical condition involving 'a', 'b', and 'c'.
        if (Math.floor(a / c * b) === c)
        {
            ans--; // Decrement 'ans' if the condition holds true.
        }

        // Output the calculated answer for the current query.
        console.log(ans);
    }
}


function    sqrt64(a) /* Custom square root function for large numbers represented as strings. */
{
    const   al   =   a.length; // Length of the input string 'a'.

    var   b,   c; // Declare variables 'b' and 'c'.

    // Determine the initial 'b' value based on the length parity.
    if  (al & 1) // If length is odd (al % 2 !== 0)
    {
        b   =   +a[0]; // Take the first digit.
    }
    else // If length is even
    {
        b   =   +(a[0]+a[1]); // Take the first two digits.
    }

    // Calculate the integer part of the square root of 'b'.
    c   =   Math.sqrt(b)|0;

    // Update 'b' by subtracting the square of 'c'.
    b   -=   c * c;

    var   d   =   c; // Initialize 'd' with 'c'.

    // Loop through the rest of the digits, taking two at a time.
    for  ( var i  =  2 - (al & 1);  i < al ;  i += 2 )
    {
        // Update 'd' for the next iteration step.
        d   =   (d + d % 10) * 10;

        // Append the next two digits from 'a' to 'b'.
        b   =   +(b + a[i] + a[i+1]);

        // Find the largest digit 'j' such that (d + j) * j does not exceed 'b'.
        for  ( var j  =  1;  j <= 9;  j++ )
        {
            if  (b - (d + j) * j < 0)
            {
                break; // Break if the subtraction would result in a negative number.
            }
        }

        // Adjust 'j' and append it to 'c'.
        c   =   c * 10 + --j;

        // Update 'b' by subtracting the found term.
        b   -=   (d + j) * j;

        // Update 'd' for the next iteration.
        d   +=   j;
    }

    // If there's a remainder 'b', increment 'c'.
    if  (b)
    {
        c++;
    }

    return   c; // Return the calculated square root.
}


function kakeru32(a,b) /* Custom multiplication function for numbers up to 2^32. */
{
    // The original comment indicated a,b < 2^32.
    // This function performs multiplication by splitting numbers to handle potential overflow.

    var   c   =   a % 1e5 * b; // Multiply the lower 5 digits of 'a' by 'b'.

    // Multiply the higher part of 'a' by 'b' and add carry from 'c'.
    var   d   =   Math.floor(a / 1e5) * b + Math.floor(c / 1e5);

    c   %=   1e5; // Keep only the lower 5 digits of 'c'.

    // If 'd' (the higher part of the result) is greater than 0,
    // format 'c' with leading zeros to ensure 5 digits.
    if  (d > 0)
    {
        c   =   ("00000" + c).slice(-5);
    }
    else
    {
        // If 'd' is 0, then 'c' doesn't need leading zeros for concatenation.
        d   =   "";
    }

    // Concatenate the higher part (d) and the lower part (c) to form the final result string.
    return   d   +   c;
}


// This line reads input from standard input, decodes it as UTF-8,
// and passes it to the Main function for processing.
Main(require("fs").readFileSync("/dev/stdin","utf8"));