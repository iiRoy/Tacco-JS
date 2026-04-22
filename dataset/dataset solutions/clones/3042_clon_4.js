"use strict";

const MOD_VAL = 998244353;
const INVERSE_OF_TWO = (MOD_VAL + 1) / 2; // Modular multiplicative inverse of 2 modulo MOD_VAL

const add_mod = (first, second) => (first + second) % MOD_VAL;
const multiply_mod = (first, second) => (first * second) % MOD_VAL;
const exponentiate_mod = (base, power) => {
    let outcome = 1;
    base %= MOD_VAL;
    while (power > 0) {
        if (power % 2 === 1) outcome = multiply_mod(outcome, base);
        base = multiply_mod(base, base);
        power = Math.floor(power / 2);
    }
    return outcome;
};

// Replaces Inputer class with a functional approach
const acquire_data_elements = (raw_content) => {
    const segments = raw_content.split(/\n|\s/).filter(segment => segment.length > 0);
    let current_index = 0;

    const extract_numeric_value = () => parseInt(segments[current_index++], 10);
    const extract_numeric_list = (count) => {
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push(extract_numeric_value());
        }
        return list;
    };

    const count_of_items = extract_numeric_value();
    const item_values = extract_numeric_list(count_of_items);

    return {
        item_count: count_of_items,
        items: item_values
    };
};

function execute_computation(input_text) {
    const { item_count: initial_number_count, items: elements_list } = acquire_data_elements(input_text);

    // Sort the elements and prepend a zero for 1-based indexing logic
    const ordered_components = [0, ...elements_list.slice().sort((one, two) => one - two)];

    // Calculate prefix sums of the ordered components
    const cumulative_total_storage = new Array(initial_number_count + 1).fill(0);
    for (let current_pos = 1; current_pos <= initial_number_count; current_pos++) {
        cumulative_total_storage[current_pos] = cumulative_total_storage[current_pos - 1] + ordered_components[current_pos];
    }
    const final_overall_sum = cumulative_total_storage[initial_number_count];

    // Dynamic programming using a Map to store states
    // Each entry: sum_value -> [sum_of_2_power_diffs, count_of_subsets]
    let current_state_map = new Map();
    current_state_map.set(0, [exponentiate_mod(2, initial_number_count), 1]); // Base case: empty set sum is 0

    // Iterate through each component to update the DP states
    for (let component_idx = 1; component_idx <= initial_number_count; component_idx++) {
        const value_of_component = ordered_components[component_idx];
        // Create a new map for the next state, initialized with current states (representing not including value_of_component)
        const next_state_map = new Map(current_state_map);

        // Iterate over existing states to calculate new states by including value_of_component
        for (const [previous_sum, [dp_metric_one, dp_metric_two]] of current_state_map.entries()) {
            const new_achieved_sum = previous_sum + value_of_component;

            // Optimization: if new_achieved_sum exceeds the maximum possible, skip
            if (new_achieved_sum > final_overall_sum) {
                continue;
            }

            const [existing_metric_one, existing_metric_two] = next_state_map.get(new_achieved_sum) || [0, 0];

            const updated_metric_one = add_mod(existing_metric_one, multiply_mod(INVERSE_OF_TWO, dp_metric_one));
            const updated_metric_two = add_mod(existing_metric_two, dp_metric_two);

            next_state_map.set(new_achieved_sum, [updated_metric_one, updated_metric_two]);
        }
        current_state_map = next_state_map; // Update current state map for next iteration
    }

    // Final result aggregation
    let cumulative_answer = 0;
    const midpoint_sum_floor = Math.floor(final_overall_sum / 2);

    if (final_overall_sum % 2 === 0) {
        const values_at_midpoint = current_state_map.get(midpoint_sum_floor);
        if (values_at_midpoint) {
            cumulative_answer = add_mod(cumulative_answer, values_at_midpoint[0]);
            cumulative_answer = add_mod(cumulative_answer, MOD_VAL - values_at_midpoint[1]); // Equivalent to subtraction modulo p
        }
    }

    for (let s_val = midpoint_sum_floor + 1; s_val <= final_overall_sum; s_val++) {
        const entry_data = current_state_map.get(s_val);
        if (entry_data) {
            cumulative_answer = add_mod(cumulative_answer, entry_data[0]);
        }
    }

    cumulative_answer = multiply_mod(cumulative_answer, 3);
    const ultimate_result = add_mod(exponentiate_mod(3, initial_number_count), MOD_VAL - cumulative_answer);

    console.log(ultimate_result);
}

if (typeof window === "undefined") {
    execute_computation(require("fs").readFileSync("/dev/stdin", "utf8"));
}