const file_system_utility = require('node:fs');

function create_input_parser(source_string_data) {
    const data_parts = source_string_data.trim().split(/\s+/);
    let current_position = 0;
    return function retrieve_next_segment() {
        if (current_position < data_parts.length) {
            return data_parts[current_position++];
        }
        return null; 
    };
}

function parse_segment_to_integer(segment_retriever) {
    const textual_segment = segment_retriever();
    if (textual_segment === null) {
        throw new Error("Input exhaustion: No more segments available for integer conversion.");
    }
    return parseInt(textual_segment, 10);
}

function find_fraction_components_recursively(current_multiplier_val, initial_number_val) {
    const primary_component_value = initial_number_val;
    const secondary_component_candidate = current_multiplier_val * initial_number_val;
    const tertiary_component_divisor = (3 * current_multiplier_val) - 1;

    // The condition (tertiary_component_divisor > 0) is always true since current_multiplier_val >= 1.
    // The condition (secondary_component_candidate > 0) is always true since current_multiplier_val >= 1 and initial_number_val >= 1.
    // Thus, if divisible, tertiary_component will always be positive.
    if (secondary_component_candidate % tertiary_component_divisor === 0) {
        const tertiary_component_value = secondary_component_candidate / tertiary_component_divisor;
        return [primary_component_value, secondary_component_candidate, tertiary_component_value];
    }
    
    return find_fraction_components_recursively(current_multiplier_val + 1, initial_number_val);
}

function process_challenge_entry() {
    const raw_input_from_std = file_system_utility.readFileSync("/dev/stdin", "utf8");
    const get_next_segment = create_input_parser(raw_input_from_std);
    const input_target_number = parse_segment_to_integer(get_next_segment);

    const [solution_part_h, solution_part_n, solution_part_w] = find_fraction_components_recursively(1, input_target_number);
    console.log(solution_part_h, solution_part_n, solution_part_w);
}

process_challenge_entry();