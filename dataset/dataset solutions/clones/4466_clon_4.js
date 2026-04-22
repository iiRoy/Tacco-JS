"use strict";

const compute_pair_divisor = (param_a, param_b) => {
    while (param_b !== 0) {
        let temp_val = param_b;
        param_b = param_a % param_b;
        param_a = temp_val;
    }
    return param_a;
};

const derive_collection_divisor = (numeric_set) => {
    return numeric_set.reduce((accumulated_divisor, current_number) =>
        compute_pair_divisor(accumulated_divisor, current_number)
    );
};

const process_system_input = (source_data) => {
    const content_lines = source_data.trim().split("\n");

    const header_values = content_lines[0].split(" ").map(Number);
    const ignore_value = header_values[0]; 
    const target_value = header_values[1]; 

    const number_sequence = content_lines[1].split(" ").map(Number);
    
    const greatest_member = Math.max(...number_sequence);
    const final_common_divisor = derive_collection_divisor(number_sequence);
    
    const output_message = (greatest_member < target_value)
        ? "IMPOSSIBLE"
        : (target_value % final_common_divisor === 0 ? "POSSIBLE" : "IMPOSSIBLE");

    console.log(output_message);
};

process_system_input(require('fs').readFileSync('/dev/stdin', 'utf8'));