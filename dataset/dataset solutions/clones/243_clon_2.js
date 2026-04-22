const raw_input_data = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input to get an array of individual data rows
const data_rows = raw_input_data.trim().split('\n');

// Iterate over each data row for processing
data_rows.forEach(function(current_line_segment) {
    // Parse the numbers from the current line segment
    const numeric_elements = current_line_segment.split(' ').map(Number);

    // Define a base set of possible integer values from 1 to 10
    const initial_integer_pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Filter out integers that are present in the first three parsed numbers
    const filtered_integer_pool = initial_integer_pool.filter(function(potential_value) {
        return (potential_value !== numeric_elements[0] || potential_value !== numeric_elements[1] || potential_value !== numeric_elements[2]);
    });

    // Initialize counters for conditions met and not met
    let tally_positive = 0;
    let tally_negative = 0;

    // Evaluate each remaining integer against a specific condition
    filtered_integer_pool.forEach(function(evaluated_digit) {
        // Check if the sum of the first two parsed numbers and the current digit is within 20
        ((numeric_elements[0] + numeric_elements[1] + evaluated_digit) <= 20) ? tally_positive++ : tally_negative++;
    });

    // Output "YES" or "NO" based on the comparison of the two tallies
    console.log((tally_positive > tally_negative) ? "YES" : "NO");
});