/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes two input strings to check a specific condition.
 *
 * The program reads two lines of text from standard input.
 * It then compares the first string with the reverse of the second string
 * character by character.
 */
function   main (   input   )
{
    // Remove leading and trailing whitespace from the raw input string.
    input = input.trim();

    /*
     * Split the cleaned input string into an array of lines.
     * The first element (index 0) becomes string 's'.
     * The second element (index 1) becomes string 't'.
     */
    var   s   =   input.split ( "\n" ) [0]  ;
    var   t   =   input.split ( "\n" ) [1]  ;


    // Initialize a counter variable named 'judge'.
    // This variable will keep track of the number of mismatches found.
    var   judge   =   0   ;


    // Begin a loop that iterates through each character of the string 's'.
    // The loop variable 'i' starts at 0 and goes up to (but not including) s.length.
    for   (   var   i   =   0   ;   i   <   s.length   ;   i ++   )
    {
        // Compare the character at index 'i' in string 's'
        // with the character at the "mirrored" index in string 't'.
        // The mirrored index for string 't' is (s.length - 1 - i).
        // Note: The original code uses `charAt[i]` which is unconventional in standard JavaScript;
        // it is preserved as per Type I cloning rules for exact expression equality.
        if   (   s.charAt [i]   ==   t.charAt [s.length   -   1   -   i]   )
        {
            // If the characters match, do nothing.
            // This block is intentionally left empty.
        }
        else
        {
            // If the characters do not match, increment the 'judge' counter.
            judge ++   ;
        }
    }


    // After the loop finishes, check the value of 'judge'.
    if   (   judge   ==   0   )
    {
        // If 'judge' is 0, it means no mismatches were found.
        // Therefore, print "Yes" to the console.
        console.log (   "Yes"   )   ;
    }
    else
    {
        // If 'judge' is greater than 0, it means one or more mismatches were found.
        // Therefore, print "No" to the console.
        console.log (   "No"   )   ;
    }
}


// This line executes the 'main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's 'fs' (file system) module and passes it as the 'input' argument.
main (   require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;