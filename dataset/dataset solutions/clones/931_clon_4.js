const raw_source_stream = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const segment_list = raw_source_stream.split('\n');

const matrix_count = Number(segment_list.shift());

const dimension_array_for_calc = [];

// Process the dimensions for the first matrix (M0)
const first_line_parts = segment_list.shift().split(' ');
dimension_array_for_calc.push(Number(first_line_parts[0])); // p0
dimension_array_for_calc.push(Number(first_line_parts[1])); // p1

// For subsequent matrices (M1 to M_{matrix_count-1}), only the column dimension (p_{k+1}) is new
for (let current_matrix_index = 1; current_matrix_index < matrix_count; ++current_matrix_index) {
    const current_line_parts = segment_list.shift().split(' ');
    dimension_array_for_calc.push(Number(current_line_parts[1])); // p_{current_matrix_index+1}
}

// `dimension_array_for_calc` now holds [p0, p1, ..., p_matrix_count]

// Initialize a cache for memoization, filled with null to indicate uncomputed states
const computed_results_cache = Array.from({ length: matrix_count }, () => Array(matrix_count).fill(null));

function calculateMinScalarProducts(start_segment_idx, end_segment_idx) {
    // Base case: A segment containing a single matrix requires zero scalar products
    if (start_segment_idx === end_segment_idx) {
        return 0;
    }

    // If the result for this segment is already cached, return it
    if (computed_results_cache[start_segment_idx][end_segment_idx] !== null) {
        return computed_results_cache[start_segment_idx][end_segment_idx];
    }

    let segment_minimum_products = Number.MAX_SAFE_INTEGER;

    // Iterate through all possible division points for the current segment
    // `division_idx` represents the last matrix index in the first sub-segment
    for (let division_idx = start_segment_idx; division_idx < end_segment_idx; ++division_idx) {
        const products_first_subsegment = calculateMinScalarProducts(start_segment_idx, division_idx);
        const products_second_subsegment = calculateMinScalarProducts(division_idx + 1, end_segment_idx);

        // Calculate the cost of multiplying the two resulting matrices from the split:
        // (Matrix_start_segment_idx ... Matrix_division_idx) has dimensions p_start_segment_idx x p_{division_idx+1}
        // (Matrix_{division_idx+1} ... Matrix_end_segment_idx) has dimensions p_{division_idx+1} x p_{end_segment_idx+1}
        const current_multiplication_products =
            dimension_array_for_calc[start_segment_idx] *
            dimension_array_for_calc[division_idx + 1] *
            dimension_array_for_calc[end_segment_idx + 1];

        const total_products_for_this_division = products_first_subsegment + products_second_subsegment + current_multiplication_products;

        segment_minimum_products = Math.min(segment_minimum_products, total_products_for_this_division);
    }

    // Cache the computed minimum products for future use
    computed_results_cache[start_segment_idx][end_segment_idx] = segment_minimum_products;
    return segment_minimum_products;
}

// Initiate the calculation for the entire chain of matrices (from index 0 to matrix_count - 1)
const final_optimal_products = calculateMinScalarProducts(0, matrix_count - 1);

// Output the final computed result
console.log(final_optimal_products);