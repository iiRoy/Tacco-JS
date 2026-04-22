/*
 * This module is designed to process a list of items and calculate the minimum cost
 * to reduce the number of unique item types to a specified threshold.
 * It reads input from standard input, parses item frequencies, and sums the
 * frequencies of the least common items until the unique item count target is met.
 */

// Acquire the file system module.
const file_system_utility = require ( 'fs' ) ;

// Read all incoming data from the standard input stream, interpreting it as UTF-8 text,
// then divide the entire content into an array of individual lines.
const input_stream_content_lines = file_system_utility . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ;

// Extract the initial line from the input array, which contains global configuration values,
// and then partition this line into distinct string segments based on space delimiters.
let primary_config_segments = input_stream_content_lines . shift ( ) . split ( ' ' ) ;

// Parse the first segment of the configuration line to determine the total quantity
// of items expected in the main data list.
const total_item_quantity = parseInt ( primary_config_segments [ 0 ] , 10 ) ;

// Parse the second segment of the configuration line to establish the desired
// maximum number of distinct item types to retain.
const target_unique_item_limit = parseInt ( primary_config_segments [ 1 ] , 10 ) ;

// Retrieve the next line from the input, which represents the core dataset of item
// identifiers, and split it into an array of individual item strings.
const main_item_identifier_list = input_stream_content_lines . shift ( ) . split ( ' ' ) ;

// Initialize a JavaScript object to function as a set for tracking all unique item
// identifiers encountered in the input list. The value '1' simply denotes presence.
let unique_elements_registry = { } ;

// Initialize a sparse array to serve as a frequency counter. Array indices will correspond
// to item identifiers (implicitly coerced to numbers), and values will store their counts.
let frequency_tally_array = [ ] ;

// Commence an iteration loop over each item in the main_item_identifier_list.
// The loop continues for the specified total_item_quantity.
for ( let current_data_index = 0 ; current_data_index < total_item_quantity ; current_data_index++ )
{
    // Obtain the identifier for the item at the current index.
    const current_item_id_string = main_item_identifier_list [ current_data_index ] ;

    // Coerce the item identifier string to a number for use as an array index.
    const numeric_item_id = Number ( current_item_id_string ) ;

    // Increment the count for the current item_id in the frequency_tally_array.
    // If the item_id has not been seen before, its count is initialized to 0 then incremented.
    frequency_tally_array [ numeric_item_id ] = ( frequency_tally_array [ numeric_item_id ] || 0 ) + 1 ;

    // Record the current item_id in the unique_elements_registry to mark its presence.
    unique_elements_registry [ current_item_id_string ] = 1 ;
}

// Extract an array of all unique item identifiers (as strings) that were recorded.
const distinct_keys_found = Object . keys ( unique_elements_registry ) ;

// Calculate the number of unique items that exceed the target_unique_item_limit.
// This represents the count of distinct items that need to be eliminated.
let excess_unique_count_to_reduce = distinct_keys_found . length - target_unique_item_limit ;

// Evaluate if there are more unique items than allowed by the target limit.
if ( excess_unique_count_to_reduce > 0 )
{
    // Sort the frequency_tally_array. For sparse arrays, this will arrange defined numeric
    // values in ascending order, pushing 'undefined' entries to the end.
    frequency_tally_array . sort ( ( val_a , val_b ) => val_a - val_b ) ;

    // Initialize an accumulator for the total frequency sum of items that will be removed.
    let total_elimination_sum = 0 ;

    // Iterate through the sorted frequencies. The loop will process numerical frequencies first.
    for ( const individual_frequency_value of frequency_tally_array )
    {
        // Add the current item's frequency to the running total.
        total_elimination_sum += individual_frequency_value ;

        // Decrement the counter for unique items that still require elimination.
        excess_unique_count_to_reduce-- ;

        // If the required number of unique items have been accounted for removal, exit the loop.
        if ( excess_unique_count_to_reduce === 0 )
        {
            break ;
        }
    }

    // Output the computed total frequency sum (cost) of the removed items to standard output.
    console . log ( total_elimination_sum ) ;
}
else // This block executes if no unique items need to be removed (count is within or below limit).
{
    // In this scenario, the cost of removal is zero.
    console . log ( 0 ) ;
}