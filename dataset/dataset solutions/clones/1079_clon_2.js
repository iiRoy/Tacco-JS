/**
 * This module contains algorithms for array sorting and cost calculation based on cyclic permutations.
 * The primary goal is to demonstrate a Type II code clone, meaning the logical structure is preserved
 * while all identifiers, whitespace, and comments are significantly altered.
 */

/**
 * Arranges elements within a provided array using a quicksort-like partitioning approach.
 * This function modifies the array in place to achieve a sorted order.
 *
 * @param {Array<number>} data_items - The collection of numerical data to be ordered.
 * @param {number} total_count - The total quantity of elements within the data_items array.
 * @param {Function} comparison_func - A callback function used to determine the relative order of two elements.
 *                                     It should return a negative value if the first element is smaller,
 *                                     zero if they are equal, or a positive value if the first is larger.
 */
const fast_arrange = (data_items, total_count, comparison_func) => {

    /**
     * A utility function to swap the positions of two elements in the data_items array.
     *
     * @param {number} idx_a - The index of the first element.
     * @param {number} idx_b - The index of the second element.
     */
    const exchange_elements = (idx_a, idx_b) => {
        let temp_val = data_items[idx_a];
        data_items[idx_a] = data_items[idx_b];
        data_items[idx_b] = temp_val;
    };


    /**
     * Partitions a segment of the array around a chosen pivot element.
     * Elements smaller than or equal to the pivot are moved to its left, and larger ones to its right.
     *
     * @param {number} start_idx - The starting index of the sub-array segment to partition.
     * @param {number} end_idx - The ending index of the sub-array segment (inclusive, also the pivot's initial position).
     * @returns {number} The final index of the pivot element after partitioning.
     */
    const divide_and_conquer = (start_idx, end_idx) => {
        let pivot_index_ref = { value: start_idx }; // Using an object to simulate a mutable reference for the pivot's position

        for (let current_idx = start_idx; current_idx <= end_idx - 1; current_idx++) {
            // Compare current element with the pivot (data_items[end_idx])
            if (comparison_func(data_items[current_idx], data_items[end_idx]) <= 0) {
                exchange_elements(pivot_index_ref.value, current_idx);
                pivot_index_ref.value++; // Advance the boundary for elements smaller than pivot
            }
        }
        // Place the pivot into its correct, sorted position
        exchange_elements(pivot_index_ref.value, end_idx);
        return pivot_index_ref.value; // Return the pivot's final index
    };

    /**
     * The core recursive function that applies the partitioning process to sub-arrays.
     *
     * @param {number} lower_bound - The starting index of the current sub-array.
     * @param {number} upper_bound - The ending index of the current sub-array.
     */
    const recursive_sort_procedure = (lower_bound, upper_bound) => {
        if (lower_bound >= upper_bound) {
            return; // Base condition: sub-array is empty or has a single element, thus sorted
        }

        // Perform partitioning and obtain the pivot's final location
        let pivot_point = divide_and_conquer(lower_bound, upper_bound);

        // Recursively sort the segment before the pivot
        recursive_sort_procedure(lower_bound, pivot_point - 1);
        // Recursively sort the segment after the pivot
        recursive_sort_procedure(pivot_point + 1, upper_bound);
    };

    // Initiate the sorting process on the complete array from index 0 to total_count - 1
    recursive_sort_procedure(0, total_count - 1);
};


/**
 * Determines the minimum cost required to transform an 'initial_sequence' into a sorted state
 * by analyzing its cycle decomposition. The cost is calculated based on specific swap rules.
 *
 * @param {Array<number>} initial_sequence - The original array whose cost needs to be computed.
 * @param {number} sequence_length - The number of elements present in the initial_sequence.
 * @returns {number} The total minimum cost accumulated across all cycles.
 */
const compute_minimum_swaps = (initial_sequence, sequence_length) => {
    // Create an ordered duplicate of the input sequence.
    const sorted_sequence = [...initial_sequence];
    fast_arrange(sorted_sequence, sequence_length, (val_a, val_b) => val_a - val_b); // Utilize a standard numeric comparison

    // Construct a mapping from element value to its correct sorted index.
    // E.g., position_map[value] will give the index where 'value' should be in a sorted array.
    const position_map = Array(sorted_sequence[sequence_length - 1] + 1).fill(0);
    sorted_sequence.forEach((element_value, element_index) => {
        position_map[element_value] = element_index;
    });

    // A boolean array to keep track of elements that have already been included in a cycle.
    const visited_flags = Array(sequence_length).fill(false);

    /**
     * Recursively traces a cycle within the permutation, collecting its elements.
     *
     * @param {number} current_element_idx - The current index in the initial_sequence being examined.
     * @param {Array<number>} current_cycle_elements - An accumulator for elements found in the current cycle.
     * @returns {Array<number>} A list of numbers forming the complete cycle.
     */
    const trace_cycle_elements = (current_element_idx, current_cycle_elements) => {
        visited_flags[current_element_idx] = true; // Mark this element as part of a cycle

        // Determine the next element in the cycle by looking up where the current element's value *should* be.
        let next_element_idx = position_map[initial_sequence[current_element_idx]];

        if (visited_flags[next_element_idx]) {
            // If the next element has been visited, the cycle is closed.
            return [initial_sequence[current_element_idx], ...current_cycle_elements];
        } else {
            // Otherwise, continue traversing the cycle.
            return trace_cycle_elements(next_element_idx, [initial_sequence[current_element_idx], ...current_cycle_elements]);
        }
    };

    /**
     * Initiates the tracing of a cycle from a given starting index.
     *
     * @param {number} start_node_index - The index from which to begin tracing a cycle.
     * @returns {Array<number>} An array containing all elements of the traced cycle.
     */
    const get_cycle_nodes = (start_node_index) => trace_cycle_elements(start_node_index, []);


    /**
     * Iterates through the array, identifies cycles, calculates their costs, and sums them up.
     *
     * @param {number} loop_idx - The current index in the initial_sequence being processed.
     * @param {number} total_cost_accumulator - The running sum of costs for all processed cycles.
     * @returns {number} The final accumulated cost once all elements are processed.
     */
    const iterate_and_sum_costs = (loop_idx, total_cost_accumulator) => {
        if (loop_idx === sequence_length) {
            return total_cost_accumulator; // All elements have been checked
        } else if (visited_flags[loop_idx]) {
            // If the element at loop_idx is already part of a cycle, skip it.
            return iterate_and_sum_costs(loop_idx + 1, total_cost_accumulator);
        } else {
            // An unvisited element indicates the start of a new cycle.
            const current_cycle_nodes = get_cycle_nodes(loop_idx);
            const cycle_size = current_cycle_nodes.length;
            const cycle_sum = current_cycle_nodes.reduce((sum, val) => sum + val, 0);
            const min_cycle_val = current_cycle_nodes.reduce((min_val, val) => Math.min(min_val, val), Number.MAX_SAFE_INTEGER);

            // Calculate cost using two different strategies and select the minimum.
            // Strategy 1: Swapping elements only within the current cycle.
            const cost_strategy_1 = cycle_sum + (cycle_size - 2) * min_cycle_val;
            // Strategy 2: Swapping elements using the globally smallest element (sorted_sequence[0])
            // to temporarily facilitate swaps, then restoring it.
            const cost_strategy_2 = cycle_sum + min_cycle_val + (cycle_size + 1) * sorted_sequence[0];

            return iterate_and_sum_costs(
                loop_idx + 1,
                total_cost_accumulator + Math.min(cost_strategy_1, cost_strategy_2)
            );
        }
    };

    // Initiate the iterative cost calculation from the beginning of the array with zero initial cost.
    return iterate_and_sum_costs(0, 0);
};


// This is the main entry point of the script, simulating program execution.
const main_routine = () => {
    // In a real application, 'input_size' and 'initial_data_array' would typically
    // be populated from user input or a data source.
    // For this demonstration, we'll use hardcoded values.
    const input_size = 5; // The quantity of elements to process.
    const initial_data_array = [1, 5, 2, 4, 3]; // An example array to compute cost for.

    // Execute the cost computation and display the final result.
    const final_computed_cost = compute_minimum_swaps(initial_data_array, input_size);
    console.log(final_computed_cost);
};

// Invoke the primary execution function to start the program.
main_routine();