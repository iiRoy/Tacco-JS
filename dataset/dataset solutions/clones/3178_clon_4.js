function process_coordinates(data_source) {
    const data_lines = data_source.split("\n");

    const [type_one_count_str, type_two_count_str, query_iterations_str] = data_lines[0].split(" ");
    const type_one_count = parseInt(type_one_count_str, 10);
    const type_two_count = parseInt(type_two_count_str, 10);
    const query_iterations = parseInt(query_iterations_str, 10);

    let current_line_idx = 1;
    const all_points_data = [];
    const alpha_coordinates_raw = [];
    const beta_coordinates_raw = [];

    for (let i = 0; i < type_one_count; i++) {
        const position_val = parseInt(data_lines[current_line_idx++], 10);
        all_points_data.push({ position_value: position_val, category_id: 1, minimum_separation: Number.MAX_SAFE_INTEGER });
        alpha_coordinates_raw.push(position_val);
    }
    for (let i = 0; i < type_two_count; i++) {
        const position_val = parseInt(data_lines[current_line_idx++], 10);
        all_points_data.push({ position_value: position_val, category_id: 2, minimum_separation: Number.MAX_SAFE_INTEGER });
        beta_coordinates_raw.push(position_val);
    }

    const alpha_coordinates_sorted = alpha_coordinates_raw.sort((a, b) => a - b);
    const beta_coordinates_sorted = beta_coordinates_raw.sort((a, b) => a - b);

    const find_largest_le = (sorted_arr, target_val) => {
        let low_bound = 0;
        let high_bound = sorted_arr.length - 1;
        let result_idx = -1;

        while (low_bound <= high_bound) {
            const middle_idx = Math.floor((low_bound + high_bound) / 2);
            if (sorted_arr[middle_idx] <= target_val) {
                result_idx = middle_idx;
                low_bound = middle_idx + 1;
            } else {
                high_bound = middle_idx - 1;
            }
        }
        return result_idx;
    };

    all_points_data.forEach(point => {
        const opponent_coords = (point.category_id === 1) ? beta_coordinates_sorted : alpha_coordinates_sorted;
        if (opponent_coords.length === 0) {
            point.minimum_separation = Number.MAX_SAFE_INTEGER;
            return;
        }

        const current_pos = point.position_value;
        const left_idx = find_largest_le(opponent_coords, current_pos);
        let current_min_diff = Number.MAX_SAFE_INTEGER;

        if (left_idx !== -1) {
            current_min_diff = Math.min(current_min_diff, Math.abs(current_pos - opponent_coords[left_idx]));
        }

        const right_idx = left_idx + 1;
        if (right_idx < opponent_coords.length) {
            current_min_diff = Math.min(current_min_diff, Math.abs(current_pos - opponent_coords[right_idx]));
        }
        
        point.minimum_separation = current_min_diff;
    });

    all_points_data.sort((a, b) => a.position_value - b.position_value);

    const output_value = (val) => process.stdout.write(val + "\n");

    for (let q = 0; q < query_iterations; q++) {
        const query_location = parseInt(data_lines[current_line_idx++], 10);
        
        const target_index = find_largest_le(all_points_data, query_location);
        let calculated_outcome = Number.MAX_SAFE_INTEGER;

        if (target_index === -1) {
            const first_point = all_points_data[0];
            calculated_outcome = Math.abs(first_point.position_value - query_location) + first_point.minimum_separation;
        } 
        else if (target_index === all_points_data.length - 1) {
            const last_point = all_points_data[all_points_data.length - 1];
            calculated_outcome = Math.abs(last_point.position_value - query_location) + last_point.minimum_separation;
        } 
        else {
            const left_point = all_points_data[target_index];
            const right_point = all_points_data[target_index + 1];

            const option_one = Math.abs(left_point.position_value - query_location) + left_point.minimum_separation;
            const option_two = Math.abs(right_point.position_value - query_location) + right_point.minimum_separation;
            calculated_outcome = Math.min(option_one, option_two);
        }
        output_value(calculated_outcome);
    }
    return query_iterations;
}

process_coordinates(require('fs').readFileSync('/dev/stdin', 'utf8'));