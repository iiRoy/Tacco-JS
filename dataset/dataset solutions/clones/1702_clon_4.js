function processInput(input_data_string) {
    const MODULUS_CONSTANT = 1000000000 + 7;
    const SPLIT_FACTOR = 100000;

    let lines = input_data_string.trim().split("\n");
    let first_line_parts = lines[0].split(" ").map(Number);
    let array_size = first_line_parts[0];
    let target_k = first_line_parts[1];
    let data_array = lines[1].split(" ").map(Number);

    const modularMultiplier = (val_a, val_b, modulus, divider) => {
        let q_val = Math.floor(val_b / divider);
        let r_val = val_b - (q_val * divider);
        // Use BigInt for intermediate products to prevent overflow before modulo
        let interim_result = (BigInt(val_a) * BigInt(q_val) % BigInt(modulus)) * BigInt(divider) % BigInt(modulus) + (BigInt(val_a) * BigInt(r_val));
        // Ensure result is non-negative
        return Number(((interim_result % BigInt(modulus)) + BigInt(modulus)) % BigInt(modulus));
    };

    const calculateOptimalProduct = (elements_list, desired_count, mod_val, div_factor) => {
        if (desired_count === 0) return 1;

        let positive_entries = elements_list.filter(item => item > 0).sort((a, b) => b - a); // Sort positive numbers descending
        let negative_entries = elements_list.filter(item => item < 0).sort((a, b) => a - b); // Sort negative numbers ascending (largest absolute first, e.g., [-10, -5, -2])
        let contains_zero = elements_list.includes(0);

        // If K equals N, multiply all elements
        if (desired_count === elements_list.length) {
            let current_aggregate = 1;
            for (let item of elements_list) {
                current_aggregate = modularMultiplier(current_aggregate, item, mod_val, div_factor);
            }
            return current_aggregate;
        }

        // If K is greater than available non-zero numbers and a zero is present, product is 0
        if (desired_count > positive_entries.length + negative_entries.length && contains_zero) {
            return 0;
        }

        // Special case: All numbers are negative
        if (positive_entries.length === 0 && desired_count > 0) {
            let current_aggregate = 1;
            if (desired_count % 2 !== 0) { // If desired_count is odd, product will be negative. To maximize (least negative), pick smallest absolute values.
                // negative_entries is sorted [-10, -5, -2]. Smallest absolute values are at the end.
                for (let i = 0; i < desired_count; ++i) {
                    current_aggregate = modularMultiplier(current_aggregate, negative_entries[negative_entries.length - 1 - i], mod_val, div_factor);
                }
            } else { // If desired_count is even, product will be positive. Pick largest absolute values.
                // negative_entries is sorted [-10, -5, -2]. Largest absolute values are at the beginning.
                for (let i = 0; i < desired_count; ++i) {
                    current_aggregate = modularMultiplier(current_aggregate, negative_entries[i], mod_val, div_factor);
                }
            }
            return current_aggregate;
        }

        // Combine positive and negative entries into a single list, sorted by absolute value descending.
        // This mimics the initial sorting step of the original code.
        let sorted_by_abs_desc = [];
        let pos_ptr = 0;
        let neg_ptr = 0;
        while (pos_ptr < positive_entries.length || neg_ptr < negative_entries.length) {
            let next_positive = (pos_ptr < positive_entries.length) ? positive_entries[pos_ptr] : -Infinity;
            let next_negative = (neg_ptr < negative_entries.length) ? negative_entries[neg_ptr] : -Infinity;

            if (Math.abs(next_positive) >= Math.abs(next_negative)) {
                if (next_positive !== -Infinity) {
                    sorted_by_abs_desc.push(next_positive);
                    pos_ptr++;
                } else if (next_negative !== -Infinity) {
                    sorted_by_abs_desc.push(next_negative);
                    neg_ptr++;
                } else break; // Both lists exhausted
            } else {
                if (next_negative !== -Infinity) {
                    sorted_by_abs_desc.push(next_negative);
                    neg_ptr++;
                } else if (next_positive !== -Infinity) {
                    sorted_by_abs_desc.push(next_positive);
                    pos_ptr++;
                } else break; // Both lists exhausted
            }
        }

        // Select the first K elements from the absolute-value-sorted list
        let initial_chosen_elements = [];
        let current_negative_count = 0;
        let smallest_abs_positive_in_chosen = { value: -1, index: -1 }; // Value and index within initial_chosen_elements
        let smallest_abs_negative_in_chosen = { value: -1, index: -1 }; // Value and index within initial_chosen_elements

        for (let i = 0; i < desired_count; ++i) {
            let elem = sorted_by_abs_desc[i];
            initial_chosen_elements.push(elem);
            if (elem < 0) {
                current_negative_count++;
                if (smallest_abs_negative_in_chosen.index === -1 || Math.abs(elem) < Math.abs(smallest_abs_negative_in_chosen.value)) {
                    smallest_abs_negative_in_chosen = { value: elem, index: i };
                }
            } else if (elem > 0) {
                if (smallest_abs_positive_in_chosen.index === -1 || elem < smallest_abs_positive_in_chosen.value) {
                    smallest_abs_positive_in_chosen = { value: elem, index: i };
                }
            }
        }

        let current_final_product = 1;
        for (let elem of initial_chosen_elements) {
            current_final_product = modularMultiplier(current_final_product, elem, mod_val, div_factor);
        }

        if (current_final_product === 0) return 0;
        if (current_negative_count % 2 === 0) return current_final_product; // Product is positive, no need to swap

        // If product is negative (odd number of negatives), attempt to swap one element
        // Find suitable candidates from the remaining elements (not in initial_chosen_elements)
        let largest_abs_positive_in_remaining = { value: -1, index: -1 };
        let largest_abs_negative_in_remaining = { value: -1, index: -1 };

        for (let i = desired_count; i < sorted_by_abs_desc.length; ++i) {
            let elem = sorted_by_abs_desc[i];
            if (elem > 0) {
                if (largest_abs_positive_in_remaining.index === -1 || elem > largest_abs_positive_in_remaining.value) {
                    largest_abs_positive_in_remaining = { value: elem, index: i };
                }
            } else if (elem < 0) {
                if (largest_abs_negative_in_remaining.index === -1 || Math.abs(elem) > Math.abs(largest_abs_negative_in_remaining.value)) {
                    largest_abs_negative_in_remaining = { value: elem, index: i };
                }
            }
        }

        // Compare two swap options using cross-products, as done in the original code.
        // Option 1: Replace smallest_abs_negative_in_chosen (NegOut) with largest_abs_positive_in_remaining (PosIn)
        // Option 2: Replace smallest_abs_positive_in_chosen (PosOut) with largest_abs_negative_in_remaining (NegIn)
        
        let product_of_positives_in_swap = -Infinity; // PosIn * PosOut
        let product_of_negatives_in_swap = -Infinity; // NegIn * NegOut

        if (smallest_abs_negative_in_chosen.index !== -1 && largest_abs_positive_in_remaining.index !== -1) {
            if (smallest_abs_positive_in_chosen.index !== -1) { // Need PosOut to calculate PosIn*PosOut
                product_of_positives_in_swap = BigInt(largest_abs_positive_in_remaining.value) * BigInt(smallest_abs_positive_in_chosen.value);
            }
        }
        if (smallest_abs_positive_in_chosen.index !== -1 && largest_abs_negative_in_remaining.index !== -1) {
            if (smallest_abs_negative_in_chosen.index !== -1) { // Need NegOut to calculate NegIn*NegOut
                product_of_negatives_in_swap = BigInt(largest_abs_negative_in_remaining.value) * BigInt(smallest_abs_negative_in_chosen.value);
            }
        }

        let final_product_after_swap = 1;

        if (product_of_negatives_in_swap === -Infinity && product_of_positives_in_swap === -Infinity) {
            // No suitable swap found, return the current negative product
            return current_final_product;
        } else if (product_of_negatives_in_swap === -Infinity) {
            // Only Option 1 (replace NegOut with PosIn) is possible
            initial_chosen_elements[smallest_abs_negative_in_chosen.index] = largest_abs_positive_in_remaining.value;
        } else if (product_of_positives_in_swap === -Infinity) {
            // Only Option 2 (replace PosOut with NegIn) is possible
            initial_chosen_elements[smallest_abs_positive_in_chosen.index] = largest_abs_negative_in_remaining.value;
        } else {
            // Both swaps are possible, choose the one that yields a greater product
            // Condition: (NegIn * NegOut) >= (PosIn * PosOut)
            if (product_of_negatives_in_swap >= product_of_positives_in_swap) {
                // Choose Option 2: Replace smallest_abs_positive_in_chosen (PosOut) with largest_abs_negative_in_remaining (NegIn)
                initial_chosen_elements[smallest_abs_positive_in_chosen.index] = largest_abs_negative_in_remaining.value;
            } else {
                // Choose Option 1: Replace smallest_abs_negative_in_chosen (NegOut) with largest_abs_positive_in_remaining (PosIn)
                initial_chosen_elements[smallest_abs_negative_in_chosen.index] = largest_abs_positive_in_remaining.value;
            }
        }

        // Recalculate product after the chosen swap
        for (let elem of initial_chosen_elements) {
            final_product_after_swap = modularMultiplier(final_product_after_swap, elem, mod_val, div_factor);
        }
        return final_product_after_swap;
    };

    let final_result = calculateOptimalProduct(data_array, target_k, MODULUS_CONSTANT, SPLIT_FACTOR);
    console.log(final_result);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));