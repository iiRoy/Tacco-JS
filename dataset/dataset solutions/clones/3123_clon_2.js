/*
 * This script provides functionality to process a given text string
 * by generating and evaluating specific patterns derived from binary representations.
 */

function calculateUniqueSubsequences ( originalText )
{
    // Ascertain the character count of the initial input string.
    let textLength = originalText.length;

    // This variable serves as a placeholder to maintain structural consistency
    // with the original design, despite not being actively utilized in computations.
    let unusedAccumulator = 0;

    // Transform the input string into an array of individual characters
    // to facilitate element-wise access and manipulation.
    originalText = originalText.split( "" );

    // Initialize a counter to track the quantity of distinct and valid
    // character sequences discovered during the pattern analysis.
    let validSequenceCount = 0;

    // Commence an extensive iterative process, generating binary patterns
    // from a broad spectrum of integer values up to the system's maximum.
    for ( let iterationValue = 0; iterationValue < Number.MAX_VALUE; iterationValue++ )
    {
        // Convert the current integer into its binary string equivalent,
        // then divide it into an array of '0' or '1' characters,
        // reverse their order, and finally cast each character to a numeric type.
        let binaryIndicator = iterationValue.toString( 2 ).split( "" ).reverse().map( Number );

        // A conditional check to bypass patterns that are shorter than
        // the required length for meaningful comparison with the text.
        if ( binaryIndicator.length < textLength + 1 )
        {
            continue;
        }

        // If the generated binary pattern exceeds the maximum relevant length,
        // it signals that further iterations would be unproductive, thus terminating the loop.
        if ( binaryIndicator.length > textLength + 1 )
        {
            break;
        }

        // Discard the final digit of the binary indicator; it's extraneous
        // for the purpose of character selection in this context.
        binaryIndicator.pop();


        // Instantiate an array to accumulate characters chosen based on
        // the current binary pattern's '1's.
        let selectedCharacters = new Array();

        // Traverse through the modified binary pattern.
        for ( let sequenceIndex = 0; sequenceIndex < binaryIndicator.length; sequenceIndex++ )
        {
            // When a '1' is encountered in the binary pattern, the character
            // at the corresponding position from the original text is added.
            if ( binaryIndicator[ sequenceIndex ] === 1 )
            {
                selectedCharacters.push( originalText[ sequenceIndex ] );
            }
        }


        // If the selection process yields an empty set of characters,
        // this particular pattern is deemed invalid; proceed to the next iteration.
        if ( selectedCharacters.length === 0 )
        {
            continue;
        }

        // Execute a filtering operation to identify any characters that appear
        // more than once within the 'selectedCharacters' array.
        let uniquenessCheck = selectedCharacters.filter( function ( itemValue, itemPosition, sourceArray )
        {
            // An item is considered a duplicate if its first occurrence index
            // does not match its last occurrence index within the array.
            return sourceArray.indexOf( itemValue ) !== sourceArray.lastIndexOf( itemValue );
        } );

        // If the 'uniquenessCheck' reveals any duplicate characters,
        // the current sequence is not considered unique; skip to the next pattern.
        if ( uniquenessCheck.length > 0 )
        {
            continue;
        }

        // Upon successfully passing all preceding validation steps,
        // increment the counter for genuinely valid and distinct sequences.
        validSequenceCount++;

    }
    // Conclude by returning the total tally of unique character sequences identified.
    return validSequenceCount;
}


/*
 * This is the primary entry point for the application, responsible for
 * handling program arguments and orchestrating the core logic execution.
 */
function executeProgram ( rawInput )
{
    // Divide the comprehensive raw input string into an array of discrete lines,
    // using the newline character as the delimiter.
    rawInput = rawInput.split( "\n" );

    // Extract the content of the first line from the input.
    // Note: This specific line's data is not subsequently used in the calculation logic.
    let firstLineContent = rawInput[ 0 ];

    // Obtain the target string from the second line of the input,
    // which will serve as the basis for pattern analysis.
    let targetString = rawInput[ 1 ];

    // Invoke the principal function to compute the unique subsequences
    // and display the resulting count to the standard output.
    console.log( calculateUniqueSubsequences( targetString ) );
}

// Initiate the program by reading all available data from the standard input stream,
// interpreting it as UTF-8 encoded text, and then passing it to the main execution routine.
executeProgram( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );