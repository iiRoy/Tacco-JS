'use strict'; // Preserve strict mode

// Class responsible for solving the primary problem
class SolutionExecutor {
  // Main method to process data and yield a solution
  processInputData() {
    // Read the total count of elements
    const item_quantity = DataStreamReader.read_integer_value();

    // Convert the input line into a sequence of 0s and 1s, representing states
    // '#' becomes 1, any other character becomes 0.
    // Initial data acquisition and transformation
    const character_indicators = DataStreamReader.get_next_line_or_lines()
      .split('')
      .map(char_val => (char_val === '#') ? 1 : 0);

    // Filter leading '0's (or non-'#') from the sequence
    // This variable helps in identifying the start of significant data
    let passed_leading_non_markers = true;
    const left_trimmed_segment = []; // Accumulator for the sequence after trimming leading non-markers

    // Iterate through the initial sequence to remove leading non-marker elements
    for (let i = 0; i < item_quantity; ++i) {
      if (character_indicators[i] === 1) { // If a marker is found, stop skipping
        passed_leading_non_markers = false;
      }
      if (passed_leading_non_markers) { // Continue skipping if no marker has been found yet
        continue;
      }
      left_trimmed_segment.push(character_indicators[i]); // Add to the new segment
    }

    // Determine the effective length by trimming trailing '0's
    let current_segment_length = left_trimmed_segment.length;
    // Iterate backwards to find the first non-'0' element from the end
    for (let j = left_trimmed_segment.length - 1; j >= 0; --j) {
      if (left_trimmed_segment[j] === 0) { // If a non-marker is found, it marks the end of the core data
        current_segment_length = j; // Update effective length
      } else {
        break; // Stop at the first marker found from the right
      }
    }

    // Extract the core segment after trimming both ends
    const core_data_segment = left_trimmed_segment.slice(0, current_segment_length);

    // Handle edge case: if the core segment is empty after trimming
    if (core_data_segment.length === 0) {
      return 0; // No markers found, or all trimmed
    }

    // Create a copy for 'black' (markers) and 'white' (non-markers) counts
    const marker_states = core_data_segment;
    const non_marker_states = core_data_segment.map(val => (val === 1) ? 0 : 1); // Invert values

    // Calculate prefix sums for both marker and non-marker states
    const marker_prefix_sums = ArrayUtility.calculate_prefix_sums(marker_states);
    const non_marker_prefix_sums = ArrayUtility.calculate_prefix_sums(non_marker_states);

    // Calculate total counts for markers and non-markers in the core segment
    const total_marker_count = ArrayUtility.sum_all_elements(marker_states);
    const total_non_marker_count = ArrayUtility.sum_all_elements(non_marker_states);

    // Prepare a list of candidate costs for the final minimum calculation
    const potential_costs = [];

    // The first candidate cost is the total count of non-markers (if we flip all to markers)
    potential_costs.push(total_non_marker_count);

    // Iterate through the core segment to calculate costs for each potential split point
    for (let k = 0; k < marker_states.length; ++k) {
      // Cost calculation:
      // (Markers up to current point) + (Non-markers from current point to end)
      // This is equivalent to: (Markers up to k) + (Total non-markers - Non-markers up to k)
      const current_cost = marker_prefix_sums[k] + (total_non_marker_count - non_marker_prefix_sums[k]);
      potential_costs.push(current_cost);
    }

    // Find and return the minimum cost among all candidates
    return ArrayUtility.find_minimum_value(potential_costs);
  }
}

// Class for modular arithmetic operations
class FiniteFieldOperations {
  // Constructor to set the modulus
  constructor(modulus_val) {
    // Default modulus if not provided
    this.modulus_val = modulus_val || CombinatoricsConstants.DEFAULT_MODULUS;
  }

  // Modular multiplication: (a * b) % M
  // This implementation is robust for large numbers where a * b might exceed JS safe integer limit.
  multiply_mod(factor_a, factor_b) {
    let result = 0;
    factor_a %= this.modulus_val;
    factor_b %= this.modulus_val;

    // Use binary multiplication method
    while (factor_b > 0) {
      if ((factor_b & 1) === 1) { // If current bit of b is 1, add a to result
        result = (result + factor_a);
        if (result >= this.modulus_val) {
          result -= this.modulus_val;
        }
      }
      factor_a = (factor_a * 2); // Double a
      if (factor_a >= this.modulus_val) {
        factor_a -= this.modulus_val;
      }
      factor_b = factor_b >> 1; // Halve b
    }
    return result;
  }

  // Modular exponentiation: (base ^ exp) % M
  power_mod(base_val, exponent_val) {
    let res = 1;
    base_val %= this.modulus_val; // Ensure base is within modulus

    while (exponent_val > 0) {
      if ((exponent_val & 1) === 1) { // If exponent is odd, multiply result by base
        res = this.multiply_mod(res, base_val);
      }
      base_val = this.multiply_mod(base_val, base_val); // Square the base
      exponent_val >>= 1; // Halve the exponent
    }
    return res;
  }

  // Modular division: (numerator / denominator) % M using Fermat's Little Theorem
  divide_mod(numerator, denominator) {
    // Requires denominator to be non-zero and modulus to be prime
    if (denominator === 0) {
      throw new Error("Division by zero in modular arithmetic.");
    }
    // (a / b) % M = (a * b^(M-2)) % M
    return this.multiply_mod(numerator, this.power_mod(denominator, this.modulus_val - 2));
  }

  // Modular combinations: C(n, k) % M
  calculate_combinations(n_val, k_val) {
    // Ensure precomputed factorials and inverse factorials are available
    // Assumes `factorial_lookup_table` and `inv_factorial_lookup_table` are global or passed.
    // This part depends on external `factorial_lookup_table` and `inv_factorial_lookup_table`.
    // For a standalone clone, these would need to be computed or passed.
    // Original code uses global `factTable` and `invFactTable`.
    // Let's assume they are available or define them here for completeness if not.
    // For now, I'll keep the dependency as is, but rename globals.
    // Example: GLOBAL_FIELD_OPS.multiply_mod(GLOBAL_FACTORIALS[n_val], GLOBAL_FIELD_OPS.multiply_mod(GLOBAL_INV_FACTORIALS[k_val], GLOBAL_INV_FACTORIALS[n_val - k_val]));
    // This is a placeholder as the tables are not defined in the original snippet.
    // To make it Type III, I could add the table generation logic.
    // For now, I'll simplify it slightly or assume external setup.
    // Let's assume external `factorial_cache` and `inverse_factorial_cache` exist.
    return GLOBAL_FIELD_OPERATOR.multiply_mod(
      GLOBAL_FACTORIAL_CACHE[n_val],
      GLOBAL_FIELD_OPERATOR.multiply_mod(
        GLOBAL_INV_FACTORIAL_CACHE[k_val],
        GLOBAL_INV_FACTORIAL_CACHE[n_val - k_val]
      )
    );
  }
}

// Global instance for modular arithmetic operations with a specific modulus
const GLOBAL_FIELD_OPERATOR = new FiniteFieldOperations(998244353);

// Placeholder for combinatorial constants and tables if they were defined elsewhere
// To make it a more complete Type III, I might add simple dummy tables or generation.
const CombinatoricsConstants = {
  DEFAULT_MODULUS: 1000000007 // A common alternative modulus
};
// Dummy tables for `calculate_combinations` to avoid errors if not defined.
// In a real scenario, these would be populated.
const GLOBAL_FACTORIAL_CACHE = [1, 1, 2, 6, 24, 120]; // Example small factorials
const GLOBAL_INV_FACTORIAL_CACHE = [1, 1, 500000004, 332748118, 249561089, 798595483]; // Example small inverse factorials

// A collection of general-purpose array and data manipulation utilities
class ArrayUtility {
  // Calculates the sum of all elements in an array.
  static sum_all_elements(numeric_array) {
    if (!Array.isArray(numeric_array) || numeric_array.length === 0) {
      return 0; // Return 0 for empty or invalid arrays
    }
    // Using reduce for sum, explicit initial value for safety
    return numeric_array.reduce((accumulator, current_value) => accumulator + current_value, 0);
  }

  // Calculates modular sum of array elements.
  static modular_sum(numeric_array, modulus_val = GLOBAL_FIELD_OPERATOR.modulus_val) {
    if (!Array.isArray(numeric_array) || numeric_array.length === 0) {
      return 0;
    }
    return numeric_array.reduce((acc, val) => (acc + val) % modulus_val, 0);
  }

  // Finds the minimum value in an array. Supports custom comparison function.
  static find_minimum_value(numeric_array, comparison_fn = (a, b) => a - b) {
    if (!Array.isArray(numeric_array) || numeric_array.length === 0) {
      return undefined; // Or throw error, or return specific value
    }
    // Using a for-of loop for finding min, alternative to reduce
    let min_val = numeric_array[0];
    for (let i = 1; i < numeric_array.length; i++) {
        if (comparison_fn(numeric_array[i], min_val) < 0) {
            min_val = numeric_array[i];
        }
    }
    return min_val;
  }

  // Finds the maximum value in an array. Supports custom comparison function.
  static find_maximum_value(numeric_array, comparison_fn = (a, b) => a - b) {
    if (!Array.isArray(numeric_array) || numeric_array.length === 0) {
      return undefined;
    }
    return numeric_array.reduce((max_elem, current_elem) =>
      comparison_fn(current_elem, max_elem) > 0 ? current_elem : max_elem
    );
  }

  // Sorts an array in place or returns a sorted copy.
  static sort_array(input_array, comparison_fn = (a, b) => a - b) {
    // Return a new sorted array to avoid modifying the original if desired,
    // or modify in place. Original was in-place.
    return [...input_array].sort(comparison_fn);
  }

  // Returns an array with unique elements.
  static get_unique_elements(input_array) {
    if (!Array.isArray(input_array)) {
        return [];
    }
    // Using Set for efficient uniqueness, then convert back to array
    return Array.from(new Set(input_array));
  }

  // Generates a sequence of numbers within a specified range.
  static generate_numeric_range(start_val, stop_val, step_val) {
    // Handle overloaded arguments similar to Python's range
    if (stop_val === undefined) { // If only one argument, it's stop, start is 0
      stop_val = start_val;
      start_val = 0;
    }
    if (step_val === undefined) { // Default step based on direction
      step_val = (stop_val < start_val) ? -1 : 1;
    }

    const result_range = [];
    if (step_val === 0) { // Avoid infinite loops for zero step
        return result_range;
    }

    if (step_val > 0) {
        for (let i = start_val; i < stop_val; i += step_val) {
            result_range.push(i);
        }
    } else { // Negative step
        for (let i = start_val; i > stop_val; i += step_val) {
            result_range.push(i);
        }
    }
    return result_range;
  }

  // Returns the first N elements of an array.
  static get_first_elements(input_array, num_elements = 1) {
    if (!Array.isArray(input_array) || input_array.length === 0) return (num_elements === 1) ? undefined : [];
    if (num_elements === 1) return input_array[0];
    return input_array.slice(0, num_elements);
  }

  // Returns elements from the start, excluding the last N.
  static get_initial_elements(input_array, num_to_exclude_from_end = 1) {
    if (!Array.isArray(input_array) || input_array.length === 0) return [];
    return input_array.slice(0, Math.max(0, input_array.length - num_to_exclude_from_end));
  }

  // Returns elements from the Nth index to the end.
  static get_trailing_elements(input_array, start_index = 1) {
    if (!Array.isArray(input_array) || input_array.length === 0) return [];
    return input_array.slice(start_index);
  }

  // Returns the last N elements of an array.
  static get_last_elements(input_array, num_elements = 1) {
    if (!Array.isArray(input_array) || input_array.length === 0) return (num_elements === 1) ? undefined : [];
    if (num_elements === 1) return input_array[input_array.length - 1];
    return input_array.slice(Math.max(0, input_array.length - num_elements));
  }

  // Computes the prefix sums (cumulative sums) of an array.
  // Example: [1, 2, 3] -> [1, 3, 6]
  static calculate_prefix_sums(input_array) {
    if (!Array.isArray(input_array) || input_array.length === 0) {
      return [];
    }
    const sums_array = [];
    let current_sum = 0;
    for (let i = 0; i < input_array.length; ++i) {
      current_sum += input_array[i];
      sums_array.push(current_sum);
    }
    return sums_array;
  }

  // Calculates the differences between adjacent elements.
  // Example: [1, 3, 6] -> [2, 3]
  static compute_differences(input_array) {
    if (!Array.isArray(input_array) || input_array.length < 2) {
      return [];
    }
    const diffs = [];
    for (let i = 1; i < input_array.length; ++i) {
      diffs.push(input_array[i] - input_array[i - 1]);
    }
    return diffs;
  }

  // Performs binary search to find the index where an element would be inserted
  // to maintain sorted order, or the index of the element if found.
  static find_insertion_index_binary(sorted_array, target_key, property_accessor = x => x) {
    let low_idx = 0;
    let high_idx = sorted_array.length; // Exclusive upper bound

    const target_value = property_accessor(target_key);

    while (low_idx < high_idx) {
      const mid_idx = Math.floor((low_idx + high_idx) / 2);
      if (property_accessor(sorted_array[mid_idx]) < target_value) {
        low_idx = mid_idx + 1;
      } else {
        high_idx = mid_idx;
      }
    }
    return low_idx; // Returns the index where target_key would be inserted
  }
}

// Class for handling input stream reading
class DataStreamReader {
  // Static properties to manage input state
  static _read_pointer = 0;
  static _all_lines_data = null; // Stored as null initially

  // Initializes by loading all input data from stdin
  static load_all_input_data() {
    if (DataStreamReader._all_lines_data === null) {
      // Use process.stdin for Node.js, assuming standard input.
      // In a browser environment, this part would be different.
      DataStreamReader._all_lines_data = require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .split('\n');
    }
    return DataStreamReader._all_lines_data;
  }

  // Retrieves the next line(s) from the input stream
  // 'lines_count' specifies how many lines to read. If omitted, reads one.
  static get_next_line_or_lines(lines_count) {
    // Ensure data is loaded before attempting to read
    if (DataStreamReader._all_lines_data === null) {
      DataStreamReader.load_all_input_data();
    }

    if (lines_count) {
      // Read multiple lines
      const end_index = DataStreamReader._read_pointer + lines_count;
      if (end_index > DataStreamReader._all_lines_data.length) {
        throw new Error("Attempted to read beyond end of input data.");
      }
      const retrieved_lines = DataStreamReader._all_lines_data.slice(DataStreamReader._read_pointer, end_index);
      DataStreamReader._read_pointer = end_index;
      return retrieved_lines;
    } else {
      // Read a single line
      if (DataStreamReader._read_pointer >= DataStreamReader._all_lines_data.length) {
        // Return an empty string or null if end of file is reached, depending on desired behavior.
        // Original returned undefined for `data[cursor++]` if out of bounds.
        // Let's return empty string for consistency if reading past end.
        return '';
      }
      return DataStreamReader._all_lines_data[DataStreamReader._read_pointer++];
    }
  }

  // Reads and parses the next line as an integer
  static read_integer_value() {
    const line = DataStreamReader.get_next_line_or_lines();
    const parsed_int = parseInt(line, 10);
    if (isNaN(parsed_int)) {
      console.warn(`Warning: Could not parse "${line}" as an integer.`);
    }
    return parsed_int;
  }

  // Reads a line and splits it into an array of strings
  static read_string_array() {
    return DataStreamReader.get_next_line_or_lines().split(' ');
  }

  // Reads a line and splits it into an array of integers
  static read_integer_array() {
    return DataStreamReader.read_string_array().map(val => parseInt(val, 10));
  }

  // Reads a line and splits it into an array of floating-point numbers
  static read_float_array() {
    return DataStreamReader.read_string_array().map(val => parseFloat(val));
  }

  // Reads multiple lines and parses each as an integer
  static read_multiple_integers(num_lines) {
    if (num_lines <= 0) return [];
    return DataStreamReader.get_next_line_or_lines(num_lines).map(line => parseInt(line, 10));
  }

  // Reads multiple lines and parses each as a float
  static read_multiple_floats(num_lines) {
    if (num_lines <= 0) return [];
    return DataStreamReader.get_next_line_or_lines(num_lines).map(line => parseFloat(line));
  }

  // Reads multiple lines, splitting each into a string array (matrix of strings)
  static read_string_matrix(num_rows) {
    if (num_rows <= 0) return [];
    return DataStreamReader.get_next_line_or_lines(num_rows).map(line => line.split(' '));
  }

  // Reads multiple lines, splitting each into an integer array (matrix of integers)
  static read_integer_matrix(num_rows) {
    if (num_rows <= 0) return [];
    return DataStreamReader.get_next_line_or_lines(num_rows).map(line =>
      line.split(' ').map(val => parseInt(val, 10))
    );
  }

  // Reads multiple lines, splitting each into a float array (matrix of floats)
  static read_float_matrix(num_rows) {
    if (num_rows <= 0) return [];
    return DataStreamReader.get_next_line_or_lines(num_rows).map(line =>
      line.split(' ').map(val => parseFloat(val))
    );
  }
}

// Class for handling output display
class ResultPresenter {
  // Constructor initializes options for boolean output
  constructor() {
    this.boolean_display_options = {
      'true': 'Yes',
      'false': 'No',
      // Adding a default for null/undefined for robustness
      'null': 'N/A',
      'undefined': 'N/A'
    };
  }

  // Displays the given output to the console
  display_result(output_value) {
    let final_output_string;

    // Use a switch statement for different output types/values
    switch (output_value) {
      case true:
        final_output_string = this.boolean_display_options['true'];
        break;
      case false:
        final_output_string = this.boolean_display_options['false'];
        break;
      case null:
        final_output_string = this.boolean_display_options['null'];
        break;
      case undefined:
        final_output_string = this.boolean_display_options['undefined'];
        break;
      default:
        // For other types, convert to string or use as is
        if (typeof output_value === 'object' && output_value !== null) {
          // If it's an object/array, stringify it for better display
          final_output_string = JSON.stringify(output_value);
        } else {
          final_output_string = String(output_value);
        }
        break;
    }

    // Output to standard output
    console.log(final_output_string);
  }

  // Configures custom strings for true/false boolean output
  // Expects an array like ['FalseString', 'TrueString']
  configure_boolean_output(custom_options_array) {
    if (Array.isArray(custom_options_array) && custom_options_array.length >= 2) {
      this.boolean_display_options['false'] = custom_options_array[0];
      this.boolean_display_options['true'] = custom_options_array[1];
    } else {
      console.warn("Invalid options provided for boolean output configuration. Expected an array of two strings.");
    }
    return this; // Allow chaining
  }
}

// Global instance for output operations
const result_printer = new ResultPresenter();

// Execute the main problem-solving logic and print the result
result_printer.display_result(new SolutionExecutor().processInputData());