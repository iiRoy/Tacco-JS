/*
 * This is an example program demonstrating basic input/output
 * and conditional logic in C++.
 *
 * It reads several values from standard input, performs a comparison,
 * and then prints two integer values to standard output.
 */

// Include necessary header files for input/output and string manipulation.
#include <iostream> /* Standard input/output stream library */
#include <string>   // String class library

// Use the standard namespace to avoid prefixing std::
using namespace std; // This line makes it easier to refer to standard library components.

/*
 * The main function is the entry point of every C++ program.
 */
int main( )
{
    // Declare three string variables to hold text inputs.
    string s , t , u ;

    // Declare two integer variables to hold numeric inputs.
    int a , b ;

    // Read five values from standard input:
    // a string 's', a string 't', an integer 'a', an integer 'b', and a string 'u'.
    cin >> s
        >> t
        >> a
        >> b
        >> u ; // Input operation finishes here.

    // Check if the first string 's' is equal to the third string 'u'.
    if ( s == u )
    {
        // If 's' and 'u' are equal, decrement the integer 'a'.
        a -- ; // Equivalent to a = a - 1;
    }
    else // If the condition (s == u) is false.
    {
        // If 's' and 'u' are not equal, decrement the integer 'b'.
        b -- ; // Equivalent to b = b - 1;
    }

    // Output the final values of 'a' and 'b' to standard output,
    // separated by a space, followed by a newline character.
    cout << a << ' ' << b << endl ;

    // The main function typically returns 0 to indicate successful execution.
    // However, for simplicity, it's often omitted in basic programs as the
    // compiler implicitly adds it.
} // End of the main function.