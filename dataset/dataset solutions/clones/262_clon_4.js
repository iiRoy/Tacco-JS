const MAX_DIGITS_CONSIDERED = 11; // For counts 0 through 10
const MAX_AGGREGATED_VALUE = 331; // For sums 0 through 330

// Initialize a 2D array to store frequency counts of (digit_count, aggregated_value) pairs
// Corresponds to 'dp' in the original code
const aggregated_value_counts = Array.from({ length: MAX_DIGITS_CONSIDERED }, () =>
  Array.from({ length: MAX_AGGREGATED_VALUE }, () => 0)
);

// The initial state: 0 digits considered, 0 aggregated value, occurs once.
// This corresponds to the original's dp[0][0]++ from bomb(0,0)
aggregated_value_counts[0][0] = 1;

const available_numerals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Function to generate all permutations of the numerals and update the counts
function process_numeral_sequences() {
    // Recursive helper to build permutations
    function generate_permutations_and_tally(current_selection, remaining_numerals) {
        // Base case: a full sequence of 10 distinct numerals has been formed
        if (current_selection.length === available_numerals.length) {
            let cumulative_sum = 0;
            // Iterate through the completed permutation
            for (let current_position = 0; current_position < current_selection.length; current_position++) {
                const chosen_numeral = current_selection[current_position];
                const position_weight = current_position + 1; // 1-indexed position
                cumulative_sum += chosen_numeral * position_weight;

                const count_of_digits_used = current_position + 1;
                // Increment the count for this specific (digits_used, cumulative_sum) pair
                aggregated_value_counts[count_of_digits_used][cumulative_sum]++;
            }
            return;
        }

        // Recursive step: for each remaining numeral, add it to the current selection
        // and recurse with updated selection and remaining numerals
        for (let idx = 0; idx < remaining_numerals.length; idx++) {
            const next_numeral = remaining_numerals[idx];
            const next_selection = current_selection.concat(next_numeral);
            const remaining_after_selection = remaining_numerals.slice(0, idx).concat(remaining_numerals.slice(idx + 1));
            generate_permutations_and_tally(next_selection, remaining_after_selection);
        }
    }

    // Start the permutation generation with an empty selection and all numerals available
    generate_permutations_and_tally([], available_numerals);
}

// Execute the permutation processing to fill the aggregated_value_counts table
process_numeral_sequences();

// --- Input/Output processing ---
const raw_input_data = require('fs').readFileSync('/dev/stdin', 'utf8');
const input_lines = raw_input_data.trim().split("\n");

input_lines.forEach(function(line_content) {
    const parsed_values = line_content.split(" ").map(Number);
    const requested_digit_count = parsed_values[0];
    const target_aggregated_sum = parsed_values[1];

    // Retrieve the count from the pre-calculated table
    // If indices are out of bounds or value is not set, it will be 0 due to initialization.
    const result_count = aggregated_value_counts[requested_digit_count][target_aggregated_sum];
    console.log(result_count);
});