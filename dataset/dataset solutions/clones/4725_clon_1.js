function Main ( input )
{
    // The main function begins here. It takes a single string 'input' as its argument.

    // First, we split the incoming 'input' string by newline characters.
    // This typically separates the input into individual lines.
    input = input.split( "\n" ) ;

    // Next, we process the second line of the input (at index 1, as arrays are 0-indexed).
    // This line is expected to contain a space-separated list of numbers.
    // We split this line by spaces, and then use 'map(Number)' to convert each resulting string
    // fragment into an actual number. This array of numbers is stored in 'arr'.
    var arr = input[ 1 ] . split( " " ) . map( Number ) ;

    // We initialize two counter variables:
    // 'n' will count the number of even integers.
    var n = 0 ;
    // 'm' will count the number of odd integers.
    var m = 0 ;

    // Now, we iterate through each element of the 'arr' array.
    // The loop runs from the first element (index 0) up to, but not including, the array's length.
    for ( var i = 0 ; i < arr . length ; i++ )
    {
        // Inside the loop, we check if the current array element (arr[i]) is even or odd.
        // The modulo operator (%) gives the remainder of a division.
        // If a number divided by 2 has a remainder of 0, it's even.
        if ( arr[ i ] % 2 == 0 )
        {
            // If the number is even, we increment our even counter 'n'.
            n++ ;
        }
        else
        {
            // Otherwise (if the number is odd), we increment our odd counter 'm'.
            m++ ;
        }
    }

    // After iterating through all numbers and counting evens and odds,
    // we determine the final output based on the parity of the odd numbers count ('m').
    // If 'm' (the count of odd numbers) is even, we print "YES".
    // If 'm' is odd, we print "NO".
    // The ternary operator (condition ? value_if_true : value_if_false) is used here.
    console.log( m % 2 == 0 ? "YES" : "NO" ) ;
}

// This is the entry point of the script.
// It reads the input from standard input (/dev/stdin), which is common in competitive programming.
// 'require("fs")' imports the Node.js file system module.
// '.readFileSync("/dev/stdin", "utf8")' reads the entire file synchronously as a UTF-8 string.
// '.trim()' removes any leading or trailing whitespace (like extra newlines).
// Finally, this processed input string is passed to our 'Main' function for execution.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) . trim( ) ) ;