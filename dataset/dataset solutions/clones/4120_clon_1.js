/*
 * This is a JavaScript file demonstrating a simple input processing function.
 * The 'main' function takes standard input as a string and processes it.
 */

const   main    =   (   stdin   )   =>  {
    // First, we process the raw input string.
    // It's trimmed to remove leading/trailing whitespace, then split by newlines.
    const   input   =   stdin .   trim (  ) .   split (  '\n'  ) ;

    // The first line of input contains two space-separated numbers, A and B.
    // These are destructured from the array obtained by splitting the first line.
    const   [   A   ,   B   ]   =   input [ 0 ] .   split (  ' '  ) ;

    // The second line of input is the string S, which we need to validate.
    const   S   =   input [ 1 ] ;

    // A regular expression is constructed dynamically using A and B.
    // It looks for a sequence of 'A' digits, followed by a hyphen, then 'B' digits.
    // The 'g' flag ensures global matching, though not strictly necessary for a single match check.
    const   pattern   =   new   RegExp (
        '\\d{'  +   A   +   '}'   +   '-'   +   '\\d{'   +   B   +   '}'   ,
        'g'
    ) ;

    // Now, we check if the string S matches the constructed pattern.
    // The 'match' method returns an array of matches or null if no match is found.
    if   (   S .   match (   pattern   )   )
    {
        // If a match is found, print "Yes" to the console.
        console .   log (   'Yes'   ) ;
    }
    else
    {
        // Otherwise, if no match is found, print "No".
        console .   log (   'No'   ) ;
    }
}


/*
 * This section handles reading from standard input and invoking the main function.
 * It uses Node.js's 'fs' module to read '/dev/stdin' synchronously.
 * The content is read as UTF-8 encoded text.
 */
main (   require ( "fs" ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;

// End of script.