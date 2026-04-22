// This file orchestrates the processing of graph data from standard input
// and calculates a specific metric based on path redundancies in the given matrix.

// Global instance for handling sequential input lines from the standard input stream.
// This variable is initialized once at the start of the application.
let input_data_handler;

// Kicks off the entire application flow by setting up the input system and
// then executing the primary graph processing algorithm.
initiate_processing();

/**
 * Acquires raw input lines from the file system, typically from /dev/stdin in a Unix-like environment.
 * It reads the entire content, trims whitespace, and splits it into an array of strings by newline characters.
 * @returns {string[]} An array of strings, where each string represents a line from the input source.
 */
function acquire_raw_input_lines() {
  // Using Node.js 'fs' module to synchronously read the input file.
  // The 'utf8' encoding ensures proper character interpretation.
  const file_content = require("fs").readFileSync("/dev/stdin", "utf8");
  // Trim leading/trailing whitespace from the entire content, then split into lines.
  const lines_array = file_content.trim().split("\n");
  return lines_array;
}

/**
 * Creates and returns a sophisticated object responsible for managing input lines.
 * This object encapsulates the input data and provides methods to sequentially access lines
 * and check for the availability of further data.
 * @returns {object} An input handler instance with state and methods for line processing.
 */
function create_line_processor_instance() {
  const raw_lines_from_source = acquire_raw_input_lines();
  // The internal state of the processor, tracking the current position and total lines.
  const processor_state = {
    data_lines: raw_lines_from_source,
    current_line_index: 0,
    total_line_count: raw_lines_from_source.length,

    /**
     * Checks if there are more lines available to be processed in the input buffer.
     * @returns {boolean} True if there are unread lines, false otherwise.
     */
    has_more_lines: function() {
      return (this.current_line_index < this.total_line_count);
    },

    /**
     * Retrieves the next available input line from the buffer.
     * This method increments the internal line index after retrieval.
     * @returns {string} The next line of input as a string.
     * @throws {Error} If an attempt is made to read beyond the available lines.
     */
    get_next_line: function() {
      if (!this.has_more_lines()) {
        // Provide a clear and specific error message for debugging purposes.
        throw new Error("InputBufferExhausted: Attempted to read past the end of the input stream.");
      }
      const retrieved_line = this.data_lines[this.current_line_index];
      this.current_line_index += 1; // Advance the index for the subsequent read.
      return retrieved_line;
    }
  };
  return processor_state;
}

/**
 * Retrieves the next line of input using the globally available input handler.
 * This serves as a convenient wrapper around the handler's `get_next_line` method.
 * @returns {string} The next line from the input source.
 */
function get_line_from_source() {
  return input_data_handler.get_next_line();
}

/**
 * Checks if there are any remaining lines in the input stream via the global handler.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function check_for_remaining_lines() {
  return input_data_handler.has_more_lines();
}

/**
 * Displays the final calculated result or any other information to the standard output.
 * @param {*} data_to_output - The data (number, string, etc.) to be printed to the console.
 */
function display_calculated_result(data_to_output) {
  // Using template literals provides flexibility for future formatting or additional context.
  console.log(`${data_to_output}`);
}

// An object acting as an enumeration to define various input conversion types.
// Using Object.freeze ensures that these conversion modes cannot be accidentally modified.
const ConversionModes = Object.freeze({
  TO_INTEGER: 1, // Convert a string to an integer.
  SPLIT_BY_SPACE_STRINGS: 2, // Split a string by spaces into an array of strings.
  SPLIT_BY_SPACE_INTEGERS: 4, // Split by spaces and convert each part to an integer.
  SPLIT_BY_CHARACTERS: 6, // Split a string into an array of individual characters.
  SPLIT_BY_CHARACTERS_INTEGERS: 7, // Split into characters and convert each to an integer.
  JOIN_BY_SPACE: 8, // Join array elements with a space separator.
  JOIN_BY_NEWLINE: 9, // Join array elements with a newline separator.
  JOIN_CONCATENATED: 0 // Join array elements without any separator.
});

/**
 * Executes various data conversions on an input segment based on the specified mode.
 * This function handles different parsing and formatting requirements for input data.
 * @param {string|Array} input_segment - The data (either a string or an array) to be converted.
 * @param {number} conversion_mode_code - An integer code from `ConversionModes` defining the desired conversion.
 * @returns {*} The converted data, which can be a number, string, or array.
 * @throws {Error} If an unrecognized conversion mode code is provided.
 */
function perform_input_conversion(input_segment, conversion_mode_code) {
  try {
    switch (conversion_mode_code) {
      case ConversionModes.TO_INTEGER:
        // `Number()` provides robust conversion, handling floats and leading/trailing spaces.
        return Number(input_segment);
      case ConversionModes.SPLIT_BY_SPACE_STRINGS:
        // `split(" ")` handles single spaces. For multiple spaces, it creates empty strings.
        return input_segment.split(" ");
      case ConversionModes.SPLIT_BY_SPACE_INTEGERS:
        // Combines splitting with mapping each resulting string to a number.
        return input_segment.split(" ").map((val_str) => Number(val_str));
      case ConversionModes.SPLIT_BY_CHARACTERS:
        // An empty string as a separator splits the string into an array of characters.
        return input_segment.split("");
      case ConversionModes.SPLIT_BY_CHARACTERS_INTEGERS:
        // Splits into characters first, then converts each character to its numeric representation.
        return input_segment.split("").map((val_char) => Number(val_char));
      case ConversionModes.JOIN_BY_SPACE:
        // Joins array elements using a single space as a delimiter.
        return input_segment.join(" ");
      case ConversionModes.JOIN_BY_NEWLINE:
        // Joins array elements, placing each on a new line.
        return input_segment.join("\n");
      case ConversionModes.JOIN_CONCATENATED:
        // Concatenates all array elements directly without any separators.
        return input_segment.join("");
      default:
        // For any unknown or unsupported conversion mode, an error is thrown
        // to indicate an invalid operation, promoting clearer debugging.
        throw new Error(`InvalidConversionMode: Unrecognized conversion type code: ${conversion_mode_code}.`);
    }
  } catch (conversion_error) {
    // If an actual error occurs during the conversion process (e.g., `input_segment.split` on a non-string),
    // it's caught here. The error is logged, and the original input is returned as a fallback,
    // mimicking the original code's behavior for unhandled cases.
    console.error(`Error during conversion for input: '${input_segment}' with mode: ${conversion_mode_code}. Details: ${conversion_error.message}`);
    return input_segment; // Return the original input on conversion failure.
  }
}

/**
 * Reads the next line from the input source and immediately converts it into an integer.
 * @returns {number} The parsed integer value.
 */
function fetch_next_integer() {
  return perform_input_conversion(get_line_from_source(), ConversionModes.TO_INTEGER);
}

/**
 * Reads the next line and processes it into an array of strings, delimited by spaces.
 * @returns {string[]} An array where each element is a string token from the input line.
 */
function fetch_next_string_array() {
  return perform_input_conversion(get_line_from_source(), ConversionModes.SPLIT_BY_SPACE_STRINGS);
}

/**
 * Reads the next line, splits it by spaces, and converts each resulting token into an integer.
 * @returns {number[]} An array of integers.
 */
function fetch_next_integer_array() {
  return perform_input_conversion(get_line_from_source(), ConversionModes.SPLIT_BY_SPACE_INTEGERS);
}

/**
 * Reads the next line and breaks it down into an array of individual characters.
 * @returns {string[]} An array of single-character strings.
 */
function fetch_next_character_array() {
  return perform_input_conversion(get_line_from_source(), ConversionModes.SPLIT_BY_CHARACTERS);
}

/**
 * The main execution function of the program. It reads graph data,
 * constructs an adjacency matrix, and then applies a modified version of
 * the Floyd-Warshall algorithm to identify and sum redundant path costs.
 * Finally, it outputs a derived metric.
 */
function execute_primary_algorithm() {
  const matrix_dimension = fetch_next_integer();

  // Guard clause: Handle invalid or non-positive matrix dimensions immediately.
  // A matrix of size 0 or less is not meaningful for this algorithm.
  if (matrix_dimension <= 0) {
    display_calculated_result(-1);
    return;
  }

  // Initialize the adjacency matrix (or distance matrix) for the graph.
  // `Array.from` is used for explicit array creation, ensuring each inner array is unique.
  const graph_distances = Array.from({ length: matrix_dimension }, () => []);

  // Populate the adjacency matrix by reading input lines.
  // Each line is expected to contain `matrix_dimension` integer values.
  for (let row_idx = 0; row_idx < matrix_dimension; ++row_idx) {
    const current_row_data = fetch_next_integer_array();
    // Validate that each row has the expected number of elements.
    if (current_row_data.length !== matrix_dimension) {
        console.error(`Data integrity error: Row ${row_idx} contains ${current_row_data.length} elements, but expected ${matrix_dimension}.`);
        display_calculated_result(-1); // Indicate an error due to malformed input.
        return;
    }
    graph_distances[row_idx] = current_row_data;
  }

  // Calculate the initial sum of all direct edge weights in the matrix.
  // This sum includes each edge twice (e.g., A->B and B->A if symmetric).
  let sum_of_all_edges = 0;
  for (let r_idx = 0; r_idx < matrix_dimension; ++r_idx) {
    for (let c_idx = 0; c_idx < matrix_dimension; ++c_idx) {
      sum_of_all_edges = sum_of_all_edges + graph_distances[r_idx][c_idx];
    }
  }

  // This variable will accumulate the sum of path costs that are deemed redundant.
  let sum_of_redundant_paths = 0;

  // Apply a modified triple-nested loop structure, similar to Floyd-Warshall.
  // This helps in detecting if any direct path (i to j) can be formed by
  // going through an intermediate node (k) with the exact same cost.
  for (let intermediate_node_idx = 0; intermediate_node_idx < matrix_dimension; ++intermediate_node_idx) {
    for (let start_node_idx = 0; start_node_idx < matrix_dimension; ++start_node_idx) {
      for (let end_node_idx = 0; end_node_idx < matrix_dimension; ++end_node_idx) {

        const direct_distance = graph_distances[start_node_idx][end_node_idx];
        const distance_via_intermediate = graph_distances[start_node_idx][intermediate_node_idx] + graph_distances[intermediate_node_idx][end_node_idx];

        // Critical check: If a path through an intermediate node is strictly shorter
        // than the direct path, it implies the initial matrix did not represent
        // shortest paths, or contains negative cycles, which is invalid for this problem.
        if (direct_distance > distance_via_intermediate) {
          display_calculated_result(-1); // Output -1 and terminate as per problem specification.
          return;
        }
        // If the direct path cost is exactly equal to the path cost via an intermediate node,
        // AND the start, end, and intermediate nodes are all distinct,
        // then this direct path is considered redundant and its cost is added to the sum.
        else if (direct_distance === distance_via_intermediate &&
                 start_node_idx !== intermediate_node_idx &&
                 end_node_idx !== intermediate_node_idx) {
          sum_of_redundant_paths = sum_of_redundant_paths + direct_distance;
        }
      }
    }
  }

  // Both `sum_of_all_edges` and `sum_of_redundant_paths` count each edge twice
  // (e.g., A-B and B-A). Therefore, they are halved before the final subtraction
  // to get the true unique edge sums.
  const final_result = (sum_of_all_edges / 2) - (sum_of_redundant_paths / 2);
  display_calculated_result(final_result);
}

/**
 * This function serves as the initial entry point, coordinating the setup
 * of the input processing system and then invoking the core algorithm.
 */
function initiate_processing() {
  input_data_handler = create_line_processor_instance();
  execute_primary_algorithm();
}