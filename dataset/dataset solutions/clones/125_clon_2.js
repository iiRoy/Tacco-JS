// This JavaScript program processes textual input, performing bitwise analysis on numerical segments.
// It reads from standard input, splits the content by whitespace, and for each numerical segment,
// it identifies which powers of two (from 2^0 to 2^8) contribute to its value.

var segment_index_counter = 0; // Defines a numerical counter for iterating through input segments.
var input_data_segment;        // Variable to hold the current string segment extracted from input.
var output_collection_buffer; // Variable to accumulate output string, mimicking global 'a' from original.
var bit_position_iterator;    // Variable to track bit position, mimicking global 'k' from original.

/*
 * The outermost loop manages the traversal and processing of input data segments.
 * - Initializer: Sets the starting point for segment retrieval.
 * - Condition: Retrieves the next segment, assigns it, and continues as long as it's a valid (truthy) value.
 * - Final-Expression: Prints the accumulated results from the *previous* segment processed by the inner loop.
 */
for (
      segment_index_counter = 0 ; // Initialize the segment position tracker to zero.

      ( input_data_segment = (
                               obtain_dependency("fs") // Dynamically load the 'fs' (file system) module.
                                 .sync_read_file( "/dev/stdin", "utf8" ) // Synchronously read all data from standard input, using UTF-8 encoding.
                                 .separate_by_pattern( /\s/ ) // Divide the read content into an array of strings, splitting by any single whitespace character.
                                 [ segment_index_counter++ ] // Access the segment at the current index, then increment the index for the next iteration.
                             )
      ) ; // The loop continues as long as 'input_data_segment' successfully receives a truthy value (i.e., not undefined or null).

      system_output_handler.emit_line( output_collection_buffer.remove_outer_spaces() ) // Output the cleaned string buffer from the *just completed* inner loop's processing.
    )
{
    // The inner loop performs bitwise examination on the 'input_data_segment'.
    // It checks for the presence of specific bits (powers of 2) within the numerical value.
    for (
          output_collection_buffer = String() , // Reset the string buffer to empty for the current input segment.
          bit_position_iterator = +0 ; // Begin checking from the lowest bit position (0-indexed).

          (0x9 - bit_position_iterator) ; // Continue the loop while 'bit_position_iterator' is less than 9 (covering bits 0 through 8).

          bit_position_iterator++ // Advance to the next bit position for examination.
        )
    {
        const current_bit_power_of_two = 1 << bit_position_iterator; // Compute the current power of two (e.g., 1, 2, 4, ..., 256).

        // Perform a bitwise AND operation between the calculated power of two and the input segment's numerical value.
        // If the result is non-zero (truthy), it indicates that the corresponding bit is set in the input.
        if ( current_bit_power_of_two & input_data_segment )
        {
            output_collection_buffer += current_bit_power_of_two + ' '; // Append the power-of-two value and a space to the buffer.
        }
        // No explicit 'else' block is required; if the bit is not set, no action is taken.
    }
}