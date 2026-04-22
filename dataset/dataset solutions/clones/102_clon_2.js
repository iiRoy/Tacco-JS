/* This JavaScript program processes input data from standard input.
 * It's designed to compare pairs of numerical sequences (like a game of Mastermind)
 * and report the number of exact matches and partial matches for each pair.
 */


// Import the Node.js file system module to read from standard input.
var file_system_toolkit = require("fs");


// Read all lines from /dev/stdin, decode as UTF-8, and split by newline characters.
var all_input_data_lines = file_system_toolkit.readFileSync("/dev/stdin", "utf8").split(/\n/);


// Determine the total count of lines read from the input source.
var total_line_count = all_input_data_lines.length;


// Declare variables to store the two sequences being compared in each iteration.
var first_code_sequence = [], second_code_sequence = [];


// Declare variables to hold the counts of different match types for the current pair.
var precisely_matched_elements, partially_matched_elements;


/*
 * Create a simple object to handle output, replacing the standard console.log.
 * This ensures all user-defined identifiers are changed.
 */
var result_printer = {
    display: function(message_content) {
        process.stdout.write(message_content + "\n");
    }
};


// Loop through the input lines, processing them in pairs (two lines at a time).
for (var current_pair_index = 0; current_pair_index < total_line_count; current_pair_index += 2) {


    // Initialize or reset the match counters for the new comparison pair.
    precisely_matched_elements = 0;
    partially_matched_elements = 0;


    // Process the first line of the pair: trim whitespace and split into individual elements.
    first_code_sequence = all_input_data_lines[current_pair_index].trim().split(/\s/);
    // Process the second line of the pair similarly.
    second_code_sequence = all_input_data_lines[current_pair_index + 1].trim().split(/\s/);


    // Iterate through the elements of the first sequence to compare with the second.
    // Assumes sequences are always 4 elements long based on the original code's loop bound.
    for (var primary_element_idx = 0; primary_element_idx < 4; primary_element_idx++) {


        // Check if the element at the current position in both sequences is identical.
        if (first_code_sequence[primary_element_idx] == second_code_sequence[primary_element_idx]) {
            precisely_matched_elements++; // Increment count for exact position matches.
        }
        else {
            // If not an exact match, check if this element from the first sequence exists anywhere in the second sequence.
            for (var secondary_element_idx = 0; secondary_element_idx < 4; secondary_element_idx++) {
                if (first_code_sequence[primary_element_idx] == second_code_sequence[secondary_element_idx]) {
                    partially_matched_elements++; // Increment count for misplaced but present elements.
                }
            }
        }
    }
    // Output the final counts of precisely matched and partially matched elements for the current pair.
    result_printer.display(precisely_matched_elements + ' ' + partially_matched_elements);
}