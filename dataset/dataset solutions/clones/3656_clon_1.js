/*
 * This is a JavaScript program designed to process input lines
 * from the standard input stream. It leverages the 'readline' module
 * to handle asynchronous line-by-line input.
 *
 * The primary goal of this script is to compare two strings, S and T,
 * which are read as the first two lines of input. It attempts to
 * determine if S can be transformed into T by a series of right-rotations.
 *
 * However, it's crucial to note a potential logical flaw in the original
 * comparison: `S === T` when S and T are arrays of characters will
 * compare their references, not their actual content. This means the
 * condition will almost certainly never evaluate to true in a practical
 * scenario where S and T are distinct arrays created from string splits.
 *
 * Despite this, as per the Type I clone definition, the exact original
 * logic, including this comparison, must be preserved without alteration.
 */

// An array to store each line read from the standard input.
var lines = [ ] ;

// Require the built-in 'readline' module, which provides an interface
// for reading data from a Readable stream (like process.stdin)
// one line at a time.
var readline  =  require ( 'readline' ) ;

// Create an instance of the readline interface.
// This object will manage the input and output streams.
var rl = readline . createInterface ( {
      input   :   process . stdin  ,  // Set the input stream to standard input.
      output  :   process . stdout ,  // Set the output stream to standard output.
                                      // (Though this specific problem doesn't write to stdout directly via 'rl').
} ) ;


// Attach an event listener for the 'line' event.
// This function executes every time a new line of input is available.
rl . on ( 'line' ,
    function ( x )
    {
        // Add the received line (represented by 'x') to the 'lines' array.
        lines . push ( x ) ;
    }
) ;


// Attach an event listener for the 'close' event.
// This function executes once the input stream has ended, indicating
// that all input lines have been received.
rl . on ( 'close' ,
    function ( )
    {
        // Take the first line of input and split it into an array of characters.
        // This effectively converts the string into an array where each element
        // is a single character.
        var S = lines [ 0 ] . split ( "" )

        // Take the second line of input and perform the same character-split operation.
        var T = lines [ 1 ] . split ( "" )

        // Start a loop that will run for a number of iterations equal to the length
        // of the target string array, T.
        // In each iteration, we attempt a rotation on S and then compare S with T.
        for ( var i = 0 ; i < T . length ; i++ )
        {
            // Check if array S is strictly equal to array T.
            // As noted above, for arrays, '===' checks if they are the exact same object
            // in memory, not if their contents are identical.
            if ( S === T )
            {
                console . log ( "Yes" ) ; // If they are the same object, print "Yes".
                return ( 0 )              // Immediately exit the program.
            }

            // Perform a right-rotation operation on array S:
            // 1. Remove the last element from S. The 'pop()' method returns the removed element.
            var x = S . pop ( )

            // 2. Add the previously removed element (x) to the very beginning of S.
            // The 'unshift()' method adds one or more elements to the front of an array.
            S . unshift ( x ) ;
        }

        // If the loop completes without the `S === T` condition ever being met,
        // it means no rotation resulted in S being the exact same object as T.
        console . log ( "No" ) ;
    }
) ;