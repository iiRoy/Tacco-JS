/*
 * This module is responsible for setting up the standard input stream
 * to receive and process incoming textual data from the operating system.
 */
process.stdin.resume( );

// Configure the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );


// Establish an event listener for 'data' events on the standard input stream.
// This callback function will be invoked whenever a new chunk of data is received.
process.stdin.on (
    'data',

    function (   input_segment   )
    {
        // Before processing, leading and trailing whitespace is removed from the input segment.
        // The cleaned segment is then passed to the primary data processing function.
        processInputString(   input_segment.trim()   );
    }

);


/**
 * Core function to meticulously process a provided string block.
 * The processing involves an iterative removal of specific predefined patterns
 * until the length of the string stabilizes, indicating no further patterns
 * can be removed.
 *
 * @param {string} input_data_block - The string data block to be processed.
 */
function  processInputString (   input_data_block   )
{
    // A local variable to hold characters from the input block.
    // In the original design, this variable was declared but its value was not
    // subsequently used in the pattern reduction logic. It's retained for structural
    // equivalence, but its direct utility in the reduction is minimal.
    let  character_sequence  =  input_data_block.split(  ''  );


    // Initialize a variable to track the length of the string block from the previous iteration.
    // This is critical for determining when the pattern removal process has converged.
    let    previous_size    =  0;


    // Execute an initial replacement for the "ST" pattern.
    // This pre-loop replacement is consistent with the original logic's flow.
    input_data_block  =  input_data_block.replace(  "ST"  ,  ""  );


    // The primary processing loop. It continues as long as the length of the
    // data block changes after an iteration of pattern removals.
    while (   previous_size   !==   input_data_block.length   )
    {
        // Update the 'previous_size' with the current length before attempting
        // new replacements. This enables comparison for the next loop iteration.
        previous_size  =  input_data_block.length;


        // Perform a series of pattern replacements.
        // The 'replace' method in JavaScript only affects the first occurrence.
        // The iterative nature of the 'while' loop ensures that all occurrences
        // of these patterns are eventually removed if they appear.
        input_data_block  =  input_data_block.replace(  "ST"  ,  ""  );
        input_data_block  =  input_data_block.replace(  "SSTT"  ,  ""  );
        input_data_block  =  input_data_block.replace(  "SSSTTT"  ,  ""  );
        input_data_block  =  input_data_block.replace(  "SSSSTTTT"  ,  ""  );
    }

    // After the loop terminates, the final length of the processed string block
    // is outputted to the standard console.
    console.log(   input_data_block.length   );
}