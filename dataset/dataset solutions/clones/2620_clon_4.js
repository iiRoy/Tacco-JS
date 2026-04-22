(function() {
    const modulus_prime = 1000000007;

    const acquire_input_text = () => {
        const buffer_allocation_unit = 4096; // Use a common buffer size, e.g., 4KB
        let collected_fragments = [];
        let total_bytes_accumulated = 0;
        let bytes_read_current_op;

        do {
            const temporary_buffer = Buffer.alloc(buffer_allocation_unit);
            // Utilize Node.js 'fs' module for low-level synchronous file descriptor operations
            bytes_read_current_op = require('fs').readSync(process.stdin.fd, temporary_buffer, 0, buffer_allocation_unit, null);
            collected_fragments.push(temporary_buffer.slice(0, bytes_read_current_op));
            total_bytes_accumulated += bytes_read_current_op;
        } while (bytes_read_current_op === buffer_allocation_unit);

        // Concatenate all buffered chunks and convert to UTF-8 string
        return Buffer.concat(collected_fragments, total_bytes_accumulated).toString('utf8');
    };

    const raw_source_material = acquire_input_text();
    const line_segments = raw_source_material.trim().split('\n');

    const primary_configuration_elements = line_segments[0].split(' ');
    const sequence_length_indicator = +primary_configuration_elements[0]; // Unary plus for numeric conversion
    const repetition_factor = +primary_configuration_elements[1];

    const numerical_entries = line_segments[1].split(' ').map(Number); // Map to Number constructor for conversion

    let cumulative_summation = 0;

    // Employ Array.prototype.forEach for iterating through the primary sequence
    numerical_entries.forEach((current_value_element, current_position_index, entire_data_set) => {
        // Determine 'leading_lesser_count' (analogous to 'u' in original)
        // Using Array.prototype.reduce for counting elements that satisfy a condition
        let leading_lesser_count = entire_data_set.reduce((accumulator_val, inspected_val, inspected_idx) => {
            return (inspected_idx > current_position_index && inspected_val < current_value_element) ? accumulator_val + 1 : accumulator_val;
        }, 0);

        // Determine 'overall_lesser_count' (analogous to 'v' in original)
        let overall_lesser_count = entire_data_set.reduce((accumulator_val, inspected_val) => {
            return (inspected_val < current_value_element) ? accumulator_val + 1 : accumulator_val;
        }, 0);

        // First component of contribution: within-block inversions
        let first_contribution = (leading_lesser_count * repetition_factor);
        cumulative_summation = (cumulative_summation + first_contribution) % modulus_prime;

        // Second component of contribution: cross-block inversions
        // Calculate the triangular number (N-1)*N/2 for sum of series
        let cross_block_series_sum = (repetition_factor - 1) * repetition_factor / 2;
        let second_contribution = (overall_lesser_count * cross_block_series_sum);
        cumulative_summation = (cumulative_summation + second_contribution) % modulus_prime;
    });

    // Write the final result to standard output, diverging from console.log
    process.stdout.write(cumulative_summation.toString() + '\n');
})();