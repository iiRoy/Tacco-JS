'use strict';

/**
 * Main entry point for processing input data.
 * This function orchestrates the calculation of a specific combinatorial pattern.
 * @param {string} data_string - The raw input string containing space-separated numbers.
 */
function ProcessInput ( data_string ) {
  // Parse the various numerical components from the input string.
  const components = data_string.split(" ");
  const total_items = parseInt(components[0]); // Represents 'N'
  const first_val = parseInt(components[1]);   // Represents 'red'
  const second_val = parseInt(components[2]);  // Represents 'blue'

  // Calculate the combined value of the first and second elements.
  const combined_val = first_val + second_val; // Represents 'green'

  const target_sum = parseInt(components[3]);  // Represents 'K'

  // Determine the larger and smaller parts for subsequent calculations.
  const larger_part = Math.max(first_val, second_val); // Represents 'second'
  const smaller_part = Math.min(first_val, second_val); // Represents 'third' (unused in original, but preserved structure)

  // Initialize a counter for the final combinatorial pattern.
  let final_count = 0;

  /**
   * Computes the number of arrangements (permutations) of 'selection' items
   * chosen from 'total' distinct items.
   * @param {number} total - The total number of items available.
   * @param {number} selection - The number of items to choose and arrange.
   * @returns {number} The permutation value.
   */
  function calculate_arrangements( total, selection ) {
    let result_val = 1;
    // Loop 'selection' times to multiply descending values.
    for ( let counter = 0; counter < selection; counter++ ) {
      result_val = ( result_val * ( total - counter ) );
    }
    return result_val;
  }

  /**
   * Computes the number of combinations of 'choose_count' items
   * chosen from 'total_options' distinct items.
   * Uses the formula C(n, k) = P(n, k) / P(k, k).
   * @param {number} total_options - The total number of items available.
   * @param {number} choose_count - The number of items to choose.
   * @returns {number} The combination value.
   */
  function compute_combinations( total_options, choose_count ) {
    // Optimization: C(n, k) = C(n, n-k)
    let effective_choose = Math.min(choose_count, total_options - choose_count);
    return calculate_arrangements(total_options, effective_choose) / calculate_arrangements(effective_choose, effective_choose);
  }

  // Calculate the maximum possible units of 'combined_val' that can fit into 'target_sum'.
  const max_combined_units = Math.floor(target_sum / combined_val);

  // Outer loop: Iterate downwards from the maximum possible 'combined_val' units.
  for ( let primary_idx = max_combined_units; primary_idx >= 0; primary_idx-- ) {
    // Calculate the remaining sum after accounting for 'primary_idx' units of 'combined_val'.
    let remaining_after_primary = target_sum - ( primary_idx * combined_val );

    // Calculate the maximum possible units of 'larger_part' that can fit into the remainder.
    let max_larger_parts = Math.floor( remaining_after_primary / larger_part );

    // Inner loop: Iterate downwards from the maximum possible 'larger_part' units.
    for ( let secondary_idx = max_larger_parts; secondary_idx >= 0; secondary_idx-- ) {
      // Calculate the final remainder after accounting for both primary and secondary units.
      let final_remainder = target_sum - ( primary_idx * combined_val ) - ( secondary_idx * larger_part );

      // Check if the sum of all three types of units does not exceed the total available items.
      if ( primary_idx + secondary_idx + final_remainder <= total_items ) {
        // If valid, calculate the combinatorial pattern and add it to the running total.
        // This involves two combination calculations:
        // 1. Choosing positions for the sum of all parts from total_items.
        // 2. Arranging the individual parts within that chosen sum.
        final_count = final_count + ( compute_combinations(total_items, primary_idx + secondary_idx + final_remainder) * compute_combinations(primary_idx + secondary_idx + final_remainder, Math.max(primary_idx, secondary_idx, final_remainder)) );
      }
    }
  }

  // Output the final computed pattern count to the console.
  console.log(final_count);
}

// Read input from standard input, decode as UTF-8, and trim whitespace.
// Then, pass the processed string to the main processing function.
ProcessInput( require("node:fs").readFileSync("/dev/stdin", "utf8").trim() );