const acquire_data_source = require('fs').readFileSync('/dev/stdin', 'utf8');
const processed_input_lines = acquire_data_source.trim().split('\n');

const execute_main_logic = (input_records) => {
    let current_record_index = 0;
    const fetch_next_record = () => input_records[current_record_index++];

    const evaluate_partition_feasibility = (data_sequence, maximum_allowed_partitions, segment_sum_limit) => {
        const segment_accumulator_logic = (current_status, numerical_component) => {
            if (numerical_component > segment_sum_limit) {
                // If any single component exceeds the limit, this limit is impossible
                return { partition_count: Number.MAX_SAFE_INTEGER, current_partition_total: 0 };
            }
            if (current_status.current_partition_total + numerical_component > segment_sum_limit) {
                // Current partition would exceed the limit, start a new one
                return { partition_count: current_status.partition_count + 1, current_partition_total: numerical_component };
            } else {
                // Add to the current partition
                return { partition_count: current_status.partition_count, current_partition_total: current_status.current_partition_total + numerical_component };
            }
        };

        const final_partition_state = data_sequence.reduce(segment_accumulator_logic, { partition_count: 1, current_partition_total: 0 });
        return final_partition_state.partition_count <= maximum_allowed_partitions;
    };

    const find_optimal_segment_ceiling = (lower_bound_candidate, upper_bound_candidate, item_array, partition_quantity_cap) => {
        if (lower_bound_candidate > upper_bound_candidate) {
            // This indicates the smallest value that satisfies the condition
            return lower_bound_candidate;
        }

        const probe_value = Math.floor((lower_bound_candidate + upper_bound_candidate) / 2);
        const can_be_segmented = evaluate_partition_feasibility(item_array, partition_quantity_cap, probe_value);

        if (can_be_segmented) {
            // `probe_value` is a possible answer, try to find a smaller one
            return find_optimal_segment_ceiling(lower_bound_candidate, probe_value - 1, item_array, partition_quantity_cap);
        } else {
            // `probe_value` is too small, need a larger one
            return find_optimal_segment_ceiling(probe_value + 1, upper_bound_candidate, item_array, partition_quantity_cap);
        }
    };

    while (true) {
        const configuration_string = fetch_next_record();
        if (configuration_string === "0 0") break;

        const [max_components, element_count] = configuration_string.split(" ").map(Number);
        const numerical_item_list = [];
        for (let k = 0; k < element_count; k++) {
            numerical_item_list.push(Number(fetch_next_record()));
        }

        const minimum_possible_ceiling = 0;
        const maximum_possible_ceiling = 1500000;
        const computed_optimal_value = find_optimal_segment_ceiling(minimum_possible_ceiling, maximum_possible_ceiling, numerical_item_list, max_components);
        console.log(computed_optimal_value);
    }
};

execute_main_logic(processed_input_lines);