const input_chunks_storage = [];
const input_stream_handler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

input_stream_handler.on('line', (current_line_text) => {
    input_chunks_storage.push(current_line_text);
});

input_stream_handler.on('close', () => {
    process_input_and_calculate_results();
});

function compute_permutations(total_items, chosen_items) {
    let product_accumulator = 1;
    for (let idx = 0; idx < chosen_items; idx++) {
        product_accumulator *= (total_items - idx);
    }
    return product_accumulator;
}

function compute_factorial(value_to_factorize) {
    let result_product = 1;
    for (let current_factor = 2; current_factor <= value_to_factorize; current_factor++) {
        result_product *= current_factor;
    }
    return result_product;
}

function compute_n_choose_k(total_items, chosen_items) {
    if (chosen_items < 0 || chosen_items > total_items) {
        return 0;
    }
    return compute_permutations(total_items, chosen_items) / compute_factorial(chosen_items);
}

function process_input_and_calculate_results() {
    // Parse initial parameters from the first line
    const initial_parameters_string = input_chunks_storage.shift();
    const [total_elements_str, min_selection_str, max_selection_str] = initial_parameters_string.split(" ");
    const total_elements = Number(total_elements_str);
    const min_selection = Number(min_selection_str);
    const max_selection = Number(max_selection_str);

    // Parse numeric data array from the second line, sort descending
    const raw_data_string = input_chunks_storage.shift();
    const numeric_data_array = raw_data_string.split(" ").map(Number).toSorted((val_a, val_b) => val_b - val_a);

    // Count frequencies of each number using a Map
    const value_counts_map = new Map();
    for (const data_item of numeric_data_array) {
        value_counts_map.set(data_item, (value_counts_map.get(data_item) || 0) + 1);
    }

    // Calculate the highest possible average value
    const top_min_selection_sum = numeric_data_array.slice(0, min_selection).reduce((acc, current) => acc + current, 0);
    const highest_average_value = top_min_selection_sum / min_selection;
    console.log(highest_average_value);

    let total_selection_options;

    // Compare the largest element with the (min_selection + 1)-th largest element
    const largest_element_val = numeric_data_array[0];
    const element_at_min_selection_plus_one_idx = numeric_data_array[min_selection]; // This is v[A] in 0-indexed original

    if (largest_element_val !== element_at_min_selection_plus_one_idx) {
        // This branch corresponds to the original's `if (v[0] !== v[A])`
        // It calculates C(count_of_target, required_from_target) for K=A
        const target_value_for_k_equals_a = numeric_data_array[min_selection - 1]; // This is v[A-1] in 0-indexed original
        const count_of_target_value = value_counts_map.get(target_value_for_k_equals_a);

        let count_of_strictly_greater = 0;
        for (let idx = 0; idx < min_selection; idx++) {
            if (numeric_data_array[idx] > target_value_for_k_equals_a) {
                count_of_strictly_greater++;
            }
        }
        const required_from_target_value = min_selection - count_of_strictly_greater;

        total_selection_options = compute_n_choose_k(count_of_target_value, required_from_target_value);

    } else {
        // This branch corresponds to the original's `else` (v[0] === v[A])
        // It sums combinations with a hardcoded 'n' value of 50
        total_selection_options = 0;
        for (let current_choice_count = 1; current_choice_count <= max_selection; current_choice_count++) {
            total_selection_options += compute_n_choose_k(50, current_choice_count);
        }
    }
    console.log(total_selection_options);
}