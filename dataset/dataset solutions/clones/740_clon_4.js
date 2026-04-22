#!/usr/bin/node
const file_system = require('fs');

// A utility function to acquire all content from standard input synchronously.
const obtain_stream_data = () => {
    // File descriptor 0 corresponds to stdin.
    return file_system.readFileSync(0, 'utf8');
};

// A recursive function that computes a specific sequence result,
// analogous to the Josephus problem variation in the original code.
// It replaces the original's 'for(;++i<n;r%=i)r+=k;' loop.
const calculate_sequence_result = (limit_count_N, increment_value_K) => {
    // This inner function performs the recursive steps.
    const perform_iteration = (current_step_index, accumulated_remainder) => {
        // Base case: if the current index reaches or exceeds the limit, return the accumulated result.
        if (current_step_index >= limit_count_N) {
            return accumulated_remainder;
        }
        // Recursive step: update the remainder based on the formula
        // (current_remainder + K) % current_index
        const next_remainder_value = (accumulated_remainder + increment_value_K) % current_step_index;
        // Proceed to the next step with an incremented index and the new remainder.
        return perform_iteration(current_step_index + 1, next_remainder_value);
    };

    // Start the recursive process with an initial index of 1 and an initial remainder of 0,
    // mirroring the original loop's initialization.
    return perform_iteration(1, 0);
};

// Main execution block, wrapped in an Immediately Invoked Function Expression (IIFE).
(() => {
    // Retrieve all input data from stdin.
    let full_textual_input = obtain_stream_data();

    // Process the raw input:
    // 1. Split into lines.
    // 2. Trim whitespace from each line.
    // 3. Filter out any lines that become empty after trimming.
    let structured_input_entries = full_textual_input
        .split('\n')
        .map(segment => segment.trim())
        .filter(segment => segment.length > 0);

    // Crucially, the original code discards the very last processed line.
    // This step replicates that specific behavior.
    if (structured_input_entries.length > 0) {
        structured_input_entries.pop();
    }

    // Iterate over each remaining input entry and perform the required computation.
    structured_input_entries.forEach(single_data_line => {
        const components_as_strings = single_data_line.split(' ');
        
        // Convert string components to numerical values.
        // Using the Number() constructor for type conversion, distinct from parseInt().
        const param_N = Number(components_as_strings[0]);
        const param_K = Number(components_as_strings[1]);
        const param_M = Number(components_as_strings[2]);

        // Execute the core sequence calculation.
        const computed_intermediate_result = calculate_sequence_result(param_N, param_K);

        // Apply the final transformation and output the result to stdout.
        const final_computed_value = (computed_intermediate_result + param_M) % param_N + 1;
        console.log(final_computed_value);
    });
})();