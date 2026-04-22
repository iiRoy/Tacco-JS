/*
 * This is a JavaScript function designed to check for a specific string pattern.
 * It determines if one string (a) can be cyclically shifted to match another string (b).
 *
 * Type I clone: Preserving all identifiers, operators, and expressions.
 * Only whitespace and comments are altered extensively.
 */

// Define the main function that processes the input
function main (  input  )
{
    // Retrieve the first string from the input array
    var a     =     input[0];


    // Retrieve the second string from the input array
    var b     =     input[1];


    // Initialize a boolean variable to store the result.
    // Default to false, assuming no match until proven otherwise.
    var ans   =   false;


    /*
     * First, a quick check: if the lengths of the two strings are different,
     * they cannot possibly be cyclic permutations of each other.
     * In this case, the answer remains false.
     */
    if  (  a.length   !=   b.length  )
    {
        ans   =   false; // Explicitly setting ans to false, though it's already false.
    }

    else
    {
        // If lengths are equal, we proceed to check for cyclic permutations.
        // We use a labeled loop ('start') to allow breaking out of the outer loop
        // directly from the inner loop when a mismatch is found for a given shift.

        start: for  (  var   i = 0;   i  <  a.length;   i++  ) // Outer loop: iterates through all possible starting points for string 'a'
        {
            // Inner loop: compares 'a' (with cyclic shift 'i') against 'b'
            for  (  var   j = 0;   j  <  b.length;   j++  )
            {
                // Calculate the effective index for string 'a' considering the cyclic shift 'i'.
                // The modulo operator ensures that the index wraps around to the beginning of 'a'.
                if  (  a[  (  i  +  j  )  %  a.length  ]   !=   b[j]  )
                {
                    // If a character mismatch is found at any position 'j' for the current shift 'i',
                    // this particular shift 'i' is not a match.
                    // We need to try the next possible shift 'i', so we continue to the 'start' label.
                    continue   start;
                }
            }

            // If the inner loop completes without any 'continue start' being triggered,
            // it means that for the current shift 'i', all characters of 'a' matched 'b'.
            // Therefore, 'a' is a cyclic permutation of 'b'.
            ans   =   true;

            // Since we found a match, there's no need to check further shifts.
            // We can exit the outer loop.
            break;
        }
    }


    /*
     * Finally, print the result to the console.
     * If 'ans' is true, print "Yes"; otherwise, print "No".
     * This uses a ternary operator for concise output.
     */
    console.log  (  ans  ?  "Yes"  :  "No"  )  ;
}

// Call the main function with input from standard input.
// The input is read as a UTF-8 string, trimmed, and then split by newlines.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin',  'utf8'  )  .  trim  (  )  .  split  (  "\n"  )  )