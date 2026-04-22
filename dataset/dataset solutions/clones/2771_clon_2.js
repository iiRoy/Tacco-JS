// This module processes a given input string to solve a specific problem.
function ProcessInput(raw_data) {
  // The raw_data is initially a single string, we split it into an array of lines.
  let line_array = raw_data.split("\n");

  // The second line (index 1) contains space-separated numbers as strings.
  let string_numbers = line_array[1].split(" ");

  // For converting string representations to numerical integers, Number.parseInt is used with base 10.
  const element_count = Number.parseInt(line_array[0], 10);

  // Convert all string numbers from the second line into an array of integers.
  let data_points = convertStringsToIntegers(string_numbers);

  // Initialize variables to find the maximum value and its position within the data_points array.
  let peak_value = Number.NEGATIVE_INFINITY; // Represents negative infinity for initial comparison.
  let peak_index = 0;
  let total_sum_data = 0; // Accumulator for the sum of all data points.

  // Iterate through the data_points to find the highest value and its index, and calculate the total sum.
  for (let idx_a = 0; idx_a < data_points.length; idx_a++) {
    if (data_points[idx_a] > peak_value) {
      peak_index = idx_a;
      peak_value = data_points[idx_a];
    }

    total_sum_data += data_points[idx_a];
  }

  let total_sum_calc = 0; // Sum calculated during the hypothesis testing.
  let first_calc_idx = peak_index;
  // Calculate the second index, wrapping around using the modulo operator if it exceeds array bounds.
  let second_calc_idx = (peak_index + 1) % element_count;
  let hypo_array; // Array to store hypothetical calculated values.
  let found_inconsistency = true; // Flag to track if the current hypothesis leads to a contradiction.

  // Loop through possible initial values for the first hypothetical point, based on the peak_value.
  for (let hypo_iter = 0; hypo_iter <= peak_value; hypo_iter++) {
    // Reset for each new hypothesis.
    hypo_array = [];
    total_sum_calc = 0;

    // Set the initial two hypothetical values based on the current iteration.
    hypo_array[first_calc_idx] = hypo_iter * 2;
    hypo_array[second_calc_idx] = (peak_value - hypo_iter) * 2;

    total_sum_calc = hypo_array[first_calc_idx] + hypo_array[second_calc_idx];

    // Propagate the hypothesis around the circular array.
    for (let current_idx = (first_calc_idx + 1) % element_count; ; current_idx = (current_idx + 1) % element_count) {
      let next_idx = (current_idx + 1) % element_count;
      // Calculate the next hypothetical value based on the current data point and the previous hypothetical value.
      let calculated_val = (data_points[current_idx] - (hypo_array[current_idx] / 2)) * 2;

      // Check for an invalid state: a calculated value cannot be negative.
      if (calculated_val < 0) {
        found_inconsistency = true; // This hypothesis is invalid.
        break;
      }

      // If we haven't completed a full cycle back to the starting point.
      if (next_idx !== first_calc_idx) {
        hypo_array[next_idx] = calculated_val; // Assign the calculated value.
        total_sum_calc += hypo_array[next_idx]; // Add to the running total.
        // If the calculated sum exceeds the known total sum from the input, it's an inconsistency.
        if (total_sum_calc > total_sum_data) {
          found_inconsistency = true;
          break;
        }
      }
      // We have completed a full cycle.
      else {
        // Verify if the final calculated value matches the initial hypothetical value for the starting point.
        if (calculated_val === hypo_array[first_calc_idx]) {
          // No contradiction found, this hypothesis is valid.
          found_inconsistency = false;
          break;
        } else {
          // Contradiction detected.
          found_inconsistency = true;
          break;
        }
      }
    }
    // If a consistent hypothesis was found, exit the outer loop.
    if (found_inconsistency === false) break;
  }
  // Display the final consistent set of hypothetical values.
  console.log('%s', formatOutputString(hypo_array));
}

// Utility function to convert an array of string numbers into an array of integers.
function convertStringsToIntegers(str_array) {
  let integer_list = []; // Initialize an empty array for the results.
  for (let str_idx = 0; str_idx < str_array.length; str_idx++) {
    integer_list[str_idx] = Number.parseInt(str_array[str_idx], 10); // Convert each string to an integer.
  }
  return integer_list; // Return the array of integers.
}

// Helper function to format an array of values into a space-delimited string with a trailing newline.
function formatOutputString(value_array) {
  let formatted_string = value_array.join(' '); // Join array elements with spaces.
  formatted_string += '\n'; // Append a newline character.
  return formatted_string; // Return the formatted string.
}

// Do not modify the following section (standard input/output handling).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));