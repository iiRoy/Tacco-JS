/*
 * This JavaScript file demonstrates a simple program
 * that reads two numbers from standard input,
 * calculates their product, and then determines
 * if the product is an even or an odd number.
 *
 * This particular version is heavily commented and
 * uses varied whitespace to illustrate a Type I clone.
 * All core logic and identifiers remain completely identical.
 */
function    main   (  input  )
{
    // Declare a constant variable named 'args'.
    // It stores an array of strings obtained by splitting the 'input' string
    // based on space characters as delimiters.
    const   args    =    input.split(' ');


    // Declare a constant variable 'a'.
    // It stores the integer representation of the first element of 'args'.
    // The parseInt function is used with a radix of 10 to ensure base-10 parsing.
    const   a   =   parseInt(args[0],10);

    // Declare a constant variable 'b'.
    // It stores the integer representation of the second element of 'args'.
    // Again, parseInt is used with a radix of 10.
    const   b   =   parseInt(args[1],10);


    // Begin a conditional block to check the parity of the product.
    // The product of 'a' and 'b' is calculated.
    // The modulo operator (%) is used to find the remainder when divided by 2.
    // If the remainder is strictly equal (===) to 0, the product is even.
    if  ( (  a  *  b  )  %  2  ===  0  )
    {
        // If the product is even, print the string 'Even' to the console.
        console.log('Even');
    }
    else
    {
        // Otherwise (if the product is not even, meaning it's odd),
        // print the string 'Odd' to the console.
        console.log('Odd');
    }
} // End of the 'main' function definition.

// --- Program execution starts here ---

// This line invokes the 'main' function.
// The argument passed to 'main' is the content read from standard input.
// 'require('fs')' imports the Node.js file system module.
// '.readFileSync('/dev/stdin', 'utf8')' reads the entire content of
// the standard input file descriptor as a UTF-8 encoded string.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )  ) ;