const data_source_manager = {
  fetch_all_lines: () => require("fs").readFileSync("/dev/stdin", "utf8").split('\n'),
  extract_numbers: (text_line) => text_line.split(' ').map(Number),
  segment_string_data: (text_line) => text_line.split(' '),
};

const output_display_interface = {
  present_result: (final_value) => console.log(final_value),
};

class GridScoreOptimizer {
  calculate_peak_alignment() {
    const raw_record_lines = data_source_manager.fetch_all_lines();
    let current_line_index = 0;

    const [total_elements, pattern_segment_length] = data_source_manager.extract_numbers(raw_record_lines[current_line_index++]);
    const full_grid_dimension = 2 * pattern_segment_length;

    // Allocate a base grid to store point counts at each coordinate
    const point_tally_map = Array(full_grid_dimension).fill(null).map(() => Array(full_grid_dimension).fill(0));

    // Populate the point tally map from input records
    for (let i = 0; i < total_elements; ++i) {
      const current_record_parts = data_source_manager.segment_string_data(raw_record_lines[current_line_index++]);
      const initial_x_coordinate = parseInt(current_record_parts[0]);
      const initial_y_coordinate = parseInt(current_record_parts[1]);
      const point_category_char = current_record_parts[2];

      // Apply coordinate transformation and wrap around the grid dimension
      const transformed_x_coord = (initial_x_coordinate + (point_category_char === 'B' ? pattern_segment_length : 0)) % full_grid_dimension;
      const transformed_y_coord = initial_y_coordinate % full_grid_dimension;
      point_tally_map[transformed_x_coord][transformed_y_coord]++;
    }

    // Create two new grids based on the fixed checkerboard pattern:
    // Pattern Set A: points falling into quadrants (0,0)-(k-1,k-1) and (k,k)-(2k-1,2k-1)
    // Pattern Set B: points falling into quadrants (k,0)-(2k-1,k-1) and (0,k)-(k-1,2k-1)
    const pattern_set_A_distribution = Array(full_grid_dimension).fill(null).map(() => Array(full_grid_dimension).fill(0));
    const pattern_set_B_distribution = Array(full_grid_dimension).fill(null).map(() => Array(full_grid_dimension).fill(0));

    for (let r_idx = 0; r_idx < full_grid_dimension; ++r_idx) {
      for (let c_idx = 0; c_idx < full_grid_dimension; ++c_idx) {
        const in_first_x_segment = r_idx < pattern_segment_length;
        const in_first_y_segment = c_idx < pattern_segment_length;

        // The original `color` function (x<k?0:1)^(y<k?0:1) results in 0 if
        // (x<k AND y<k) OR (x>=k AND y>=k). This corresponds to `in_first_x_segment === in_first_y_segment`.
        if (in_first_x_segment === in_first_y_segment) {
          pattern_set_A_distribution[r_idx][c_idx] = point_tally_map[r_idx][c_idx];
        } else {
          pattern_set_B_distribution[r_idx][c_idx] = point_tally_map[r_idx][c_idx];
        }
      }
    }

    // To handle toroidal (wrapping) queries with 2D prefix sums,
    // we effectively double the grid dimensions by repeating the base patterns.
    const doubled_pattern_A_map = Array(2 * full_grid_dimension).fill(null).map(() => Array(2 * full_grid_dimension).fill(0));
    const doubled_pattern_B_map = Array(2 * full_grid_dimension).fill(null).map(() => Array(2 * full_grid_dimension).fill(0));

    for (let r_rep = 0; r_rep < 2 * full_grid_dimension; ++r_rep) {
      for (let c_rep = 0; c_rep < 2 * full_grid_dimension; ++c_rep) {
        doubled_pattern_A_map[r_rep][c_rep] = pattern_set_A_distribution[r_rep % full_grid_dimension][c_rep % full_grid_dimension];
        doubled_pattern_B_map[r_rep][c_rep] = pattern_set_B_distribution[r_rep % full_grid_dimension][c_rep % full_grid_dimension];
      }
    }

    // Utility function to compute 2D prefix sums for a given grid
    const compute_2d_prefix_sums = (source_grid_data) => {
      const num_rows = source_grid_data.length;
      const num_cols = source_grid_data[0].length;
      const prefix_sum_matrix = Array(num_rows).fill(null).map(() => Array(num_cols).fill(0));

      for (let r = 0; r < num_rows; ++r) {
        for (let c = 0; c < num_cols; ++c) {
          prefix_sum_matrix[r][c] = source_grid_data[r][c] +
                                     (r > 0 ? prefix_sum_matrix[r - 1][c] : 0) +
                                     (c > 0 ? prefix_sum_matrix[r][c - 1] : 0) -
                                     (r > 0 && c > 0 ? prefix_sum_matrix[r - 1][c - 1] : 0);
        }
      }
      return prefix_sum_matrix;
    };

    const prefix_sums_for_A = compute_2d_prefix_sums(doubled_pattern_A_map);
    const prefix_sums_for_B = compute_2d_prefix_sums(doubled_pattern_B_map);

    // Utility function to query the sum within a rectangular region using a prefix sum matrix
    const query_area_sum = (ps_matrix, r_start, c_start, r_end, c_end) => {
      let region_total = ps_matrix[r_end][c_end];
      if (r_start > 0) region_total -= ps_matrix[r_start - 1][c_end];
      if (c_start > 0) region_total -= ps_matrix[r_end][c_start - 1];
      if (r_start > 0 && c_start > 0) region_total += ps_matrix[r_start - 1][c_start - 1];
      return region_total;
    };

    let maximum_score_found = 0;

    // Iterate through all possible top-left corners for a `pattern_segment_length` x `pattern_segment_length` window
    // within the original `full_grid_dimension` x `full_grid_dimension` space.
    for (let window_row_origin = 0; window_row_origin < full_grid_dimension; ++window_row_origin) {
      for (let window_col_origin = 0; window_col_origin < full_grid_dimension; ++window_col_origin) {
        const window_row_terminus = window_row_origin + pattern_segment_length - 1;
        const window_col_terminus = window_col_origin + pattern_segment_length - 1;

        // Calculate the score for Pattern Set A within this window
        const current_score_A = query_area_sum(prefix_sums_for_A, window_row_origin, window_col_origin, window_row_terminus, window_col_terminus);
        // Calculate the score for Pattern Set B within this window
        const current_score_B = query_area_sum(prefix_sums_for_B, window_row_origin, window_col_origin, window_row_terminus, window_col_terminus);

        // The problem seeks to maximize points matching *either* of the two checkerboard patterns
        // (one where (0,0) is pattern A, or one where (0,0) is pattern B).
        // We update the maximum score with the better of the two for the current window.
        maximum_score_found = Math.max(maximum_score_found, current_score_A, current_score_B);
      }
    }

    return maximum_score_found;
  }
}

// Initiate the calculation and display the outcome
output_display_interface.present_result(new GridScoreOptimizer().calculate_peak_alignment());