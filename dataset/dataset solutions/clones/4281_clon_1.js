/*
 * This JavaScript file defines a primary function
 * that processes an input string based on a regular expression.
 */
function         Main    (input)        {
    // This line declares a variable 'n'.
    // It attempts to find a pattern within the 'input' string.
    // The pattern looks for the substring "AC", potentially
    // preceded or followed by up to three characters of any kind.
    var   n   =   input   .   match   (/.?.?.?AC.?.?.?/);


    // This conditional statement checks if the regular expression match was successful.
    // If 'n' is not null or undefined (meaning a match was found), the 'if' block executes.
    if     (     n     )      {
        // If the pattern "AC" was found in the input,
        // this line prints "Yes" to the standard output.
        console   .   log   ("Yes");
    }

    // If the 'if' condition is false (i.e., no match was found),
    // the code execution proceeds to the 'else' block.
    else

    {
        // In the case that the pattern "AC" was not found in the input,
        // this line prints "No" to the standard output.
        console   .   log   ("No");
    }
}

// Immediately invoke the 'Main' function with processed input.
// This part reads the content of '/dev/stdin' (standard input),
// decodes it as UTF-8, removes any leading or trailing whitespace,
// and then passes the resulting string to the 'Main' function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;