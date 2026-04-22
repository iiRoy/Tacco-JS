/* This array stores a collection of numerical values */
let numSequence = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51];

// Fetch the third command-line argument, expected to be a numeric string
let position = process.argv[2];

/*
 * Validate that the provided position falls within the acceptable bounds.
 * The valid range for the input is from 1 up to (but not including) 32.
 */
if ( ( 1 <= position ) && ( position < 32 ) )

{

    // Print the element from the sequence at the calculated, zero-based array index.
    console.log( numSequence[ position - 1 ] );

}