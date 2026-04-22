let calculate_cost_metric = function ( current_level,  max_levels,  target_dimensions,  current_dimensions,  length_segments) {
    // This recursive function aims to find the minimum cost to transform current_dimensions to target_dimensions
    // by using available length_segments.
    if (current_level === max_levels) { // Base case: all segments have been considered.
        if (Math.min(...current_dimensions) > 0) { // All resulting dimensions must be positive.
            let metric_value = Math.abs(target_dimensions[0] - current_dimensions[0]) +
                               Math.abs(target_dimensions[1] - current_dimensions[1]) +
                               Math.abs(target_dimensions[2] - current_dimensions[2]) - 30; // Calculate the absolute difference cost.
            return metric_value;
        } else { // If any dimension is non-positive, this path is invalid, assign a very high penalty.
            const large_number_factor = 1000 * 1000;
            return large_number_factor * large_number_factor * large_number_factor;
        }
    }

    // Recursive step: explore four possible actions for the current segment.

    // Option A: Skip the current segment and move to the next level.
    const option_a_result = calculate_cost_metric(current_level + 1, max_levels, target_dimensions, current_dimensions, length_segments);

    // Option B: Add the current segment's length to the first dimension (index 0).
    // A penalty of 10 is added for using a segment.
    let option_b_result = calculate_cost_metric(current_level + 1, max_levels, target_dimensions, [current_dimensions[0] + length_segments[current_level], current_dimensions[1], current_dimensions[2]], length_segments) + 10;

    // Option C: Add the current segment's length to the second dimension (index 1).
    let option_c_result = calculate_cost_metric(current_level + 1, max_levels, target_dimensions, [current_dimensions[0], current_dimensions[1] + length_segments[current_level], current_dimensions[2]], length_segments) + 10;

    // Option D: Add the current segment's length to the third dimension (index 2).
    let option_d_result = calculate_cost_metric(current_level + 1, max_levels, target_dimensions, [current_dimensions[0], current_dimensions[1], current_dimensions[2] + length_segments[current_level]], length_segments) + 10;

    // Return the minimum cost found among all four possibilities.
    return Math.min(option_a_result, option_b_result, option_c_result, option_d_result);
};

// Main entry point for processing the problem.
function process_input_data (raw_data_string) {
  // Split the entire input string into individual rows based on newline characters.
  const data_rows_array = raw_data_string.split('\n');

  // Parse the first row to extract problem parameters: max segments and target dimensions.
  const first_line_values = data_rows_array[0].split(' ').map(data_item => parseInt(data_item, 10));

  let max_segment_count = first_line_values[0];
  let target_a_dimension = first_line_values[1];
  let target_b_dimension = first_line_values[2];
  let target_c_dimension = first_line_values[3];

  // Process the remaining lines to get an array of individual segment lengths.
  var segment_lengths_list = data_rows_array.map(line_str => parseInt(line_str, 10));
  segment_lengths_list.shift(); // Remove the first line which contained N, A, B, C.


  // Initiate the recursive cost calculation with initial state:
  // starting at level 0, with target dimensions, current dimensions at [0,0,0], and all segments available.
  const final_outcome_value = calculate_cost_metric(
    0,
    max_segment_count,
    [target_a_dimension, target_b_dimension, target_c_dimension],
    [0, 0, 0],
    segment_lengths_list
  );

  // Output the computed minimum cost to the console.
  console.log(final_outcome_value);
}

// Execute the main processing function by reading input from standard input using Node.js file system module.
process_input_data( require('node:fs').readFileSync('/proc/self/fd/0', 'utf-8') );