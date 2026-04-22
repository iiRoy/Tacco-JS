process.stdin.resume(); // Activate standard input stream for data capture.
process.stdin.setEncoding('utf8'); // Set character encoding to UTF-8 for input interpretation.

var entire_buffer_content = ''; // Initialize an empty string to accumulate all incoming data.

// Register a callback function for 'data' events from the input stream.
process.stdin.on('data', function(received_segment) {
    entire_buffer_content += received_segment; // Append each data segment to the buffer.
});

// Register a callback function for the 'end' event, signifying input completion.
process.stdin.on('end', function() {
    // Split the accumulated input into individual lines.
    var input_text_lines = entire_buffer_content.split('\n');

    // The first line contains the total count of items.
    var item_quantity = input_text_lines[0];
    // The second line contains space-separated values.
    var value_tokens = input_text_lines[1].split(' ');

    var original_items_collection = []; // Create an array to hold parsed numeric values.
    // Iterate through the value tokens and convert them to integers.
    for (var index_counter = 0; index_counter < item_quantity; index_counter++) {
        original_items_collection.push(parseInt(value_tokens[index_counter]));
    }

    // Create a copy of the original collection and sort it to get ordered values.
    var ordered_items_copy = original_items_collection.slice();
    ordered_items_copy.sort();

    // Initialize a map to store values and their original string-based indices.
    var value_to_positions_map = {};
    // Populate the map: key is the sorted value, value is an array of its original string indices.
    for (var current_key_str in original_items_collection) {
        var current_sorted_value = ordered_items_copy[current_key_str];
        if (current_sorted_value in value_to_positions_map) {
            value_to_positions_map[current_sorted_value].push(current_key_str);
        } else {
            value_to_positions_map[current_sorted_value] = [current_key_str];
        }
    }

    // Adjust the item quantity for zero-based indexing in the subsequent loop.
    item_quantity--;

    // Iterate through the original items to determine and output the required median.
    for (var output_idx = 0; output_idx <= item_quantity; output_idx++) {
        var original_item_at_idx = original_items_collection[output_idx];
        // Retrieve and remove the last original string index associated with the current value.
        var retrieved_position = value_to_positions_map[original_item_at_idx.toString()].pop();

        // Calculate the midpoint index for the sorted collection.
        var midpoint = Math.floor(item_quantity / 2);
        // Get the value at the lower median position.
        var lower_median = ordered_items_copy[midpoint];
        // Get the value at the upper median position.
        var upper_median = ordered_items_copy[midpoint + 1];

        var final_answer = 0; // Initialize the result variable.
        // Determine which median value to output based on the retrieved original index.
        if (retrieved_position <= midpoint) {
            final_answer = upper_median;
        } else {
            final_answer = lower_median;
        }
        // Output the calculated answer to the console.
        console.log(final_answer.toString());
    }
});