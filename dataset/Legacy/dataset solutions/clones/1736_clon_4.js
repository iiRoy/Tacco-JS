"use strict";

const data_source_content = require('fs').readFileSync(0, 'utf8').trim();
const input_token_array = data_source_content.split(/\s+/).reverse();

const retrieve_next_input_item = () => input_token_array.pop();
const convert_to_big_int = () => BigInt(retrieve_next_input_item());

function perform_main_calculation() {
    const total_quantity = BigInt(retrieve_next_input_item());
    let primary_value = convert_to_big_int();
    let secondary_value = convert_to_big_int();

    let cumulative_xor_operand = 0n;
    for (let counter_variable = 2n; counter_variable < total_quantity; ++counter_variable) {
        cumulative_xor_operand ^= convert_to_big_int();
    }

    const recursive_operation_solver = (current_primary, current_secondary, target_xor_component, total_cost_incurred) => {
        if (current_primary === 1n) {
            return -1n;
        }

        const current_xor_divergence = current_primary ^ current_secondary ^ target_xor_component;

        if (current_xor_divergence === 0n) {
            return total_cost_incurred;
        }

        const highest_active_bit_index = BigInt(current_xor_divergence.toString(2).length - 1);
        const bit_power_of_two_at_index = 1n << highest_active_bit_index;

        const prospective_adjustment_option_one = (current_primary & (bit_power_of_two_at_index - 1n)) + 1n;
        const prospective_adjustment_option_two = bit_power_of_two_at_index - (current_secondary & (bit_power_of_two_at_index - 1n));

        const chosen_transfer_amount = (prospective_adjustment_option_one < prospective_adjustment_option_two)
            ? prospective_adjustment_option_one
            : prospective_adjustment_option_two;

        if (chosen_transfer_amount >= current_primary) {
            return -1n;
        }

        return recursive_operation_solver(
            current_primary - chosen_transfer_amount,
            current_secondary + chosen_transfer_amount,
            target_xor_component,
            total_cost_incurred + chosen_transfer_amount
        );
    };

    return recursive_operation_solver(primary_value, secondary_value, cumulative_xor_operand, 0n);
}

const final_computation_result = perform_main_calculation();
console.log(String(final_computation_result));