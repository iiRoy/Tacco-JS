// This script processes input data to calculate an expected value based on a probabilistic state machine.

// Define constants for clarity and maintainability.
const standard_input_path = '/dev/stdin'; /* Path to read input from */
const text_encoding = 'utf8'; /* Encoding for file reading */
const termination_string = "0 0 0"; /* String that signals the end of input blocks */
const max_k_value = 5000; /* Maximum value for the second dimension in the probability matrix */
const initial_probability = 1; /* Starting probability for the initial state */
const event_type_code_1 = 1; /* Identifier for event type 1: modifies Y position */
const event_type_code_2 = 2; /* Identifier for event type 2: modifies K value (increase) */
const event_type_code_3 = 3; /* Identifier for event type 3: modifies K value (decrease) */

// Alias for the file system module.
const file_system_module = require('fs');

// Alias for the console logging object.
const console_logger = console;

// Read the entire input data synchronously from the specified path.
let data_source_content = file_system_module.readFileSync(standard_input_path, text_encoding);

// Process the raw input: remove leading/trailing whitespace and split into individual lines.
let input_lines_list = data_source_content.strip_whitespace().divide_by_newline();

// Main processing loop: continues until a specific termination sequence is encountered.
while (true) {
    // Extract the first line, split by space, and convert segments to numbers.
    let current_values = input_lines_list.extract_first().parse_space_separated().convert_to_numbers();

    // Check if the current line represents the termination condition.
    if (current_values.combine_with_spaces() === termination_string) {
        break; // Exit the main processing loop.
    }

    // Assign the extracted values to descriptive dimension variables.
    let dimension_x_val = current_values[0]; /* Represents the number of movement choices */
    let dimension_y_val = current_values[1]; /* Represents the target Y position or max Y dimension */
    let special_events_count = current_values[2]; /* Number of special event definitions to follow */

    // Read the next line for movement steps.
    let movement_steps = input_lines_list.extract_first().parse_space_separated().convert_to_numbers();

    // Initialize a map to store details of special events.
    let event_details_map = [];

    // Loop through to populate the event_details_map based on special_events_count.
    for (let iter_idx_a = 0; iter_idx_a < special_events_count; iter_idx_a++) {
        // Read an event entry, split, and convert to numbers.
        let event_entry_data = input_lines_list.extract_first().parse_space_separated().convert_to_numbers();
        
        // Store event type and magnitude at the specified event index.
        event_details_map[event_entry_data[0]] = [event_entry_data[1], event_entry_data[2]];
    }

    // Initialize the probability matrix (dynamic programming table).
    // The matrix stores probabilities `P(Y, K)` of reaching state `(Y, K)`.
    let probability_matrix = [];

    // Populate the probability matrix with initial zero values.
    for (let row_idx = 0; row_idx <= dimension_y_val; row_idx++) {
        probability_matrix[row_idx] = []; // Initialize inner array for each row.
        for (let col_idx = 0; col_idx <= max_k_value; col_idx++) {
            probability_matrix[row_idx][col_idx] = 0; // Set initial probability to zero.
        }
    }

    // Set the initial state probability: P(0, 0) = 1.
    probability_matrix[0][0] = initial_probability;

    // Main dynamic programming loop to calculate probabilities.
    // Iterates through each possible Y position up to dimension_y_val - 1.
    for (let current_y_pos = 0; current_y_pos < dimension_y_val; current_y_pos++) {
        // Iterates through each possible K value.
        for (let current_k_val = 0; current_k_val <= max_k_value; current_k_val++) {
            // If the current state has zero probability, skip it to optimize.
            if (probability_matrix[current_y_pos][current_k_val] === 0) continue;

            // Iterate through each possible movement choice.
            for (let step_choice_idx = 0; step_choice_idx < dimension_x_val; step_choice_idx++) {
                // Calculate the next Y position, ensuring it does not exceed dimension_y_val.
                let next_y_position = Math.min(dimension_y_val, current_y_pos + movement_steps[step_choice_idx]);

                // Check if there's a special event associated with the next Y position.
                if (event_details_map[next_y_position] !== undefined) {
                    // Extract event type and effect magnitude.
                    let current_event_type = event_details_map[next_y_position][0];
                    let current_event_amount = event_details_map[next_y_position][1];

                    // Apply event specific logic based on its type.
                    if (current_event_type === event_type_code_1) {
                        // Event type 1: modifies Y position further.
                        probability_matrix[Math.min(dimension_y_val, next_y_position + current_event_amount)][current_k_val] += probability_matrix[current_y_pos][current_k_val] / dimension_x_val;
                    } else if (current_event_type === event_type_code_2) {
                        // Event type 2: increases K value.
                        probability_matrix[next_y_position][Math.min(max_k_value, current_k_val + current_event_amount)] += probability_matrix[current_y_pos][current_k_val] / dimension_x_val;
                    } else if (current_event_type === event_type_code_3) {
                        // Event type 3: decreases K value, ensuring it doesn't go below zero.
                        probability_matrix[next_y_position][Math.max(0, current_k_val - current_event_amount)] += probability_matrix[current_y_pos][current_k_val] / dimension_x_val;
                    }
                } else {
                    // No special event: simply move to the next Y position with the same K value.
                    probability_matrix[next_y_position][current_k_val] += probability_matrix[current_y_pos][current_k_val] / dimension_x_val;
                }
            }
        }
    }

    // Calculate the expected value by summing (K * P(dimension_y_val, K)) for all K.
    let expected_value_total = 0;
    for (let final_k_idx = 0; final_k_idx <= max_k_value; final_k_idx++) {
        expected_value_total += final_k_idx * probability_matrix[dimension_y_val][final_k_idx];
    }

    // Output the floor of the calculated expected value to the console.
    console_logger.log(Math.floor(expected_value_total));
}

// Custom String prototype methods for cleaner code, mimicking original behavior.
// These are added at the end to avoid cluttering the main logic.
String.prototype.strip_whitespace = function() {
    return this.trim();
};

String.prototype.divide_by_newline = function() {
    return this.split("\n");
};

Array.prototype.extract_first = function() {
    return this.shift();
};

String.prototype.parse_space_separated = function() {
    return this.split(" ");
};

Array.prototype.convert_to_numbers = function() {
    return this.map(Number);
};

Array.prototype.combine_with_spaces = function() {
    return this.join(" ");
};