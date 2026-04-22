/*
 * This is a JavaScript function designed to
 * analyze an input string for the presence
 * and frequency of digits.
 *
 * It checks if any digit from 1 to 9 appears
 * more than twice in the given input string.
 */
function     Main(   input   )
{

    // Start of the main loop: iterating through digits 1 to 9
    for (  var   i   =   1;   i   <   10;   i++   )
    {
        // Create a new regular expression for the current digit 'i'
        // The 'g' flag ensures all occurrences are matched.
        var     re     =     new     RegExp(   String(i)   ,   'g'   )   ;

        // Attempt to match all occurrences of the digit in the input string
        var     arr     =     input.match(   re   )   ;

        // Check if the regular expression found any match in the input
        if   (   re.test(   input   )   )
        {
            // If matches were found, check the count of occurrences
            if   (   arr.length     >     2   )
            {
                // If a digit appears more than twice, print 'Yes' and exit
                console.log(   'Yes'   )   ;
                return   ; // Terminate execution of the Main function
            }
        }
    }

    // If no digit from 1 to 9 was found more than twice after checking all, print 'No'
    console.log(   'No'   )   ;
}

// --- Function Call Section ---
// This part reads input from standard input and passes it to the Main function.
Main(   require(   "fs"   )   .readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;