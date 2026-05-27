process.stdin.resume();
process.stdin.setEncoding('utf-8');

let received_input_segments = [];
const line_processor_instance = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

line_processor_instance.on('line', (current_line_data) => {
    received_input_segments = current_line_data.split(' ');
});

// These variables capture the state of `received_input_segments` at the time of their declaration.
// Since the 'line' event is asynchronous, `received_input_segments` will be empty initially.
// Thus, `first_segment_value` and `second_segment_value` will be `undefined`,
// mirroring the exact behavior of the original code's `x` and `y`.
let first_segment_value = received_input_segments[0];
let second_segment_value = received_input_segments[1];

// Introduce constants for the magic numbers used in calculations.
const special_case_comparison_value = "1"; // String "1" for strict equality check
const base_unit_multiplier = 100000;
const special_case_term_factor_one = 3; // For 300000
const special_case_term_factor_two = 4; // For 400000
const constant_subtraction_operand = 4; // For (4 - x)

// Define a helper function to encapsulate the calculation logic.
// This function will be called with the captured `undefined` values for `val_a` and `val_b`
// when the 'close' event fires, ensuring the `NaN` output is preserved.
const compute_final_result = (val_a, val_b) => {
    // This condition will evaluate to `false` because `undefined === "1"` is `false`.
    if (val_a === special_case_comparison_value && val_b === special_case_comparison_value) {
        const term_part_one = special_case_term_factor_one * base_unit_multiplier * 2;
        const term_part_two = special_case_term_factor_two * base_unit_multiplier;
        return term_part_one + term_part_two;
    } else {
        // This branch will always be executed.
        // `parseInt(undefined, 10)` results in `NaN`.
        const numeric_val_a = parseInt(val_a, 10);
        const numeric_val_b = parseInt(val_b, 10);

        // `constant_subtraction_operand - NaN` results in `NaN`.
        const difference_a = constant_subtraction_operand - numeric_val_a;
        const difference_b = constant_subtraction_operand - numeric_val_b;

        // `NaN + NaN` results in `NaN`. `base_unit_multiplier * NaN` results in `NaN`.
        return base_unit_multiplier * (difference_a + difference_b);
    }
};

// The original code registers one of two 'close' event handlers based on the initial
// (undefined) values of `x` and `y`. This structure is maintained.
if (first_segment_value === special_case_comparison_value && second_segment_value === special_case_comparison_value) {
    // This 'if' branch will never be taken because `first_segment_value` and `second_segment_value` are `undefined`.
    line_processor_instance.on('close', () => {
        const calculated_special_output = compute_final_result(first_segment_value, second_segment_value);
        console.log(calculated_special_output);
    });
} else {
    // This 'else' branch will always be taken, registering its 'close' handler.
    line_processor_instance.on('close', () => {
        // When the 'close' event fires, `first_segment_value` and `second_segment_value`
        // remain `undefined` (as they are block-scoped `let` variables).
        // The `compute_final_result` function will correctly process these `undefined` inputs
        // to produce `NaN`, preserving the original behavior.
        const final_computed_value = compute_final_result(first_segment_value, second_segment_value);
        console.log(final_computed_value);
    });
}
