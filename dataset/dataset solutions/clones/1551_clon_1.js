/*
 * This JavaScript code defines a function 'Main' that processes input data.
 * It's designed to find the minimum number of differing characters
 * between a string 't' and all possible substrings of 's'
 * that have the same length as 't'.
 *
 * The problem is essentially finding the minimum Hamming distance
 * between 't' and its matching-length substrings within 's'.
 */

function   Main  (  input  )
{
    // The input string is typically multi-line. We split it into an array of lines.
    const   inputLines   =   input.split ( "\n" ) ;

    // The first line of input represents string 's'.
    const   s   =   inputLines[ 0 ] ;

    // The second line of input represents string 't'.
    const   t   =   inputLines[ 1 ] ;


    // Initialize 'result' with the length of 't'.
    // This value will store the minimum difference found.
    var   result   =   t.length ;

    // Edge case: if 't' is an empty string, the difference is 0.
    if  (  t.length   ===   0  )
    {
        return   console.log (  0  ) ;
    }

    // Loop through all possible starting positions in 's' for a substring
    // that has the same length as 't'.
    // The loop runs from i = 0 up to (s.length - t.length).
    for  (  var   i   =   0 ;   i   <=   s.length   -   t.length ;   i++  )
    {
        // 'current' will store the number of differences for the current substring.
        var   current   =   0 ;

        // Compare the current substring of 's' (starting at index 'i')
        // with the target string 't' character by character.
        for  (  var   j   =   0 ;   j   <   t.length ;   j++  )
        {
            // Get the character from 's' at the current comparison position.
            const   a   =   s.substr (  i   +   j ,   1  ) ;

            // Get the character from 't' at the current comparison position.
            const   b   =   t.substr (  j ,   1  ) ;


            // If the characters do not match, increment the 'current' difference count.
            if  (  a   !==   b  )
            {
                current   +=   1 ;
            }
        }

        // After comparing one full substring, check if 'current' differences
        // is less than the previously recorded minimum 'result'.
        if  (  current   <   result  )
        {
            // If it is, update 'result' to this new minimum.
            result   =   current ;
        }
    }

    // Output the final minimum number of differences found.
    console.log (  result  ) ;

    // The following lines are commented out as they appear to be remnants
    // from a different problem or debugging context.
    // var tmp_old = input[1].split(" ");
    // var a_old = parseInt(input[0], 10);
    // var b_old = parseInt(tmp_old[0], 10);
    // var c_old = parseInt(tmp_old[1], 10);
    // var s_old = input[2];
    // console.log('%d %s', a_old + b_old + c_old, s_old);
}

// This section handles standard input/output.
// It reads the entire input from stdin and passes it to the Main function.
// Please do not modify the code below this line, as it is crucial for execution
// in typical competitive programming environments.
Main (  require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" )  ) ;