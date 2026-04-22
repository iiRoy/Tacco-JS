/*
 * This script processes a series of numerical inputs to determine a feasibility condition.
 * It reads sets of pairs and applies a specific sorting and summation algorithm.
 */

// Declare a variable to store the count of items for the current iteration.
var element_count;

// Initialize an array to hold the collected data pairs.
var collected_pairs = [];


function  initiate_processing ()
{
    // The main processing loop continues as long as valid input for element_count is provided.
    while ( ( element_count = retrieve_next_datum ( ) ) )
    {
        // Populate the 'collected_pairs' array with 'element_count' number of input pairs.
        apply_function_over_range ( element_count , function ( current_index )
        {
            collected_pairs [ current_index ] = [ retrieve_next_datum ( ) , retrieve_next_datum ( ) ] ;
        } ) ;

        // Sort the collected pairs based on their second element in ascending order.
        collected_pairs . sort ( function ( first_pair , second_pair )
        {
            return first_pair [ 1 ] - second_pair [ 1 ] ;
        } ) ;

        // The following line was for debugging purposes and is now commented out.
        // display_result(collected_pairs);

        // Flag to track if the feasibility condition is met.
        var is_condition_met = true ;

        // Accumulator for the first elements of the pairs.
        var accumulated_value = 0 ;

        // Iterate through the sorted pairs to check the condition.
        apply_function_over_range ( element_count , function ( loop_iterator )
        {
            accumulated_value += collected_pairs [ loop_iterator ] [ 0 ] ;
            // The condition checks if the accumulated value is less than or equal to the second element of the current pair.
            is_condition_met = accumulated_value <= collected_pairs [ loop_iterator ] [ 1 ] && is_condition_met ;
        } ) ;

        // Output "Yes" if the condition is met for all pairs, otherwise "No".
        display_result ( is_condition_met ? "Yes" : "No" ) ;
    }
}

/*
 * This utility function applies a given callback function over a specified numeric range.
 * It can be called with two or three arguments.
 * - If two arguments: `upper_bound`, `callback_function` (starts from 0).
 * - If three arguments: `lower_bound`, `upper_bound`, `callback_function`.
 */
function apply_function_over_range ( lower_bound , upper_bound , callback_function )
{
    // Adjust arguments if only two were provided (implying a 0-based start).
    if ( callback_function === undefined )
    {
        callback_function = upper_bound ;
        upper_bound = lower_bound ;
        lower_bound = 0 ;
    }

    // Loop from the lower bound up to (but not including) the upper bound.
    for ( var current_idx = lower_bound ; current_idx < upper_bound ; ++ current_idx )
    {
        // If the callback function returns 'false', break the iteration.
        if ( callback_function ( current_idx ) === false )
        {
            break ;
        }
    }
}


// Configure standard input for reading data.
process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;

// Buffer to store all incoming data from stdin.
var stream_data_buffer = '' ;

// Pointer to the current position within the 'stream_data_buffer' for reading.
var buffer_read_position = 0 ;

/*
 * Reads the next token from the input buffer.
 * It can optionally take a 'token_type' argument, though currently it primarily
 * distinguishes between numeric and non-numeric (string) tokens.
 */
function retrieve_next_datum ( token_type )
{
    // If the requested token_type is 'string', return the token as is.
    if ( token_type === 'string' )
    {
        return stream_data_buffer [ buffer_read_position ++ ] ;
    }
    // Otherwise, assume it's a number and convert it using the unary plus operator.
    else
    {
        return + stream_data_buffer [ buffer_read_position ++ ] ;
    }
}

// Outputs a value to the console, typically followed by a newline character.
function display_result ( output_content )
{
    console . log ( output_content ) ;
}

// Event listener for incoming data chunks from standard input.
process . stdin . on ( 'data' , function ( incoming_segment )
{
    stream_data_buffer += incoming_segment ;
} ) ;

// Event listener for the end of the standard input stream.
process . stdin . on ( 'end' , function ( )
{
    // Trim any leading/trailing whitespace and split the entire input into an array of tokens.
    stream_data_buffer = stream_data_buffer . trim ( ) . split ( / \s + / ) ;
    // Once all input is processed, initiate the main logic.
    initiate_processing ( ) ;
} ) ;