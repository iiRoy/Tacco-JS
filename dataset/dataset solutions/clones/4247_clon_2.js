var input_reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var input_processor; // Object to manage input lines
var input_lines_buffer = []; // Buffer for all incoming lines

// Event listener for each line of input
input_reader.on('line', function(current_input_line){
  input_lines_buffer.push(current_input_line);
});

// Event listener for when input stream closes
input_reader.on('close', function(){
  input_processor = initialize_input_handler(input_lines_buffer); // Initialize input handler
  log_debug_message("-----start-----"); // Log start of execution
  var start_time = new Date(); // Record start time
  execute_main_logic(); // Execute the primary program logic
  var end_time = new Date() - start_time; // Calculate elapsed time
  log_debug_message("----- end -----"); // Log end of execution
  log_debug_message("time : " + (end_time) + "ms"); // Display execution time
  log_debug_message("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Display memory usage
});

// Helper functions for parsing different data types from input
function get_next_integer(){ return perform_conversion(fetch_next_line(), 1); }
function get_next_string_array(){ return perform_conversion(fetch_next_line(), 2); }
function get_next_integer_array(){ return perform_conversion(fetch_next_line(), 4); }
function get_next_char_array(){ return perform_conversion(fetch_next_line(), 6); }

// Core input retrieval functions
function fetch_next_line(){ return input_processor.next(); }
function has_more_lines(){ return input_processor.hasNext(); }

/**
 * Initializes an object to handle sequential access to input lines.
 * @param {Array<string>} received_lines - An array of strings representing input lines.
 * @returns {object} An object with methods to check for more input and retrieve the next line.
 */
function initialize_input_handler(received_lines){
  var handler_instance = {
    data_lines : received_lines, // Stores all input lines
    current_line_idx : 0, // Current position in the input lines array
    total_lines : received_lines.length, // Total number of input lines

    // Checks if there are more lines to process
    hasNext : function(){
      return (this.current_line_idx < this.total_lines);
    },

    // Retrieves the next line from the input
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input
      } else {
        var retrieved_input = this.data_lines[this.current_line_idx];
        this.current_line_idx++;
        return retrieved_input;
      }
    }
  };
  return handler_instance;
}

// Function to print output to standard console
function print_result(output_data){
  console.log(output_data);
}

// Function to log debug messages to standard error
function log_debug_message(debug_info){
  console.error("debug:" + require("util").inspect(debug_info, false, null));
}

/**
 * Performs various conversions on input data based on a specified type code.
 * @param {*} input_data - The data to be converted.
 * @param {number} conversion_type - A numeric code indicating the desired conversion.
 *   1: Convert to integer.
 *   2: Split string by space into string array.
 *   4: Split string by space into number array.
 *   6: Split string by character into string array.
 *   7: Split string by character into number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 * @returns {*} The converted data or original data if conversion fails/type is unknown.
 */
function perform_conversion(input_data, conversion_type){
  try {
    switch(conversion_type){
      case 1: return parseInt(input_data);
      case 2: return input_data.split(" ");
      case 4: return input_data.split(" ").map(Number);
      case 6: return input_data.split("");
      case 7: return input_data.split("").map(Number);
      case 8: return input_data.join(" ");
      case 9: return input_data.join("\n");
      case 0: return input_data.join("");
      default: return input_data; // Return original if type is not recognized
    }
  } catch(error_occurred){
    return input_data; // Return original on error
  }
}

// Main program logic starts here
function execute_main_logic(){
  var array_size = get_next_integer(); // Read the size of the array
  var numeric_data_list = get_next_integer_array(); // Read the array of numbers

  // Iterate backwards through the array
  for(var outer_loop_index = array_size - 1; outer_loop_index >= 0; outer_loop_index--){
    var step_value = outer_loop_index + 1; // Calculate the step value for inner loop
    var current_sum = 0; // Initialize sum for current iteration

    // Inner loop to sum elements at specific intervals
    for(var inner_loop_index = outer_loop_index; inner_loop_index < array_size; inner_loop_index = inner_loop_index + step_value){
      current_sum += numeric_data_list[inner_loop_index];
    }

    // If the sum is negative, set relevant elements to zero
    if(current_sum < 0){
      for(var inner_loop_index_reset = outer_loop_index; inner_loop_index_reset < array_size; inner_loop_index_reset = inner_loop_index_reset + step_value){
        numeric_data_list[inner_loop_index_reset] = 0;
      }
    }
  }

  var final_result = 0; // Initialize final output sum
  // Sum all elements in the modified list
  for(var sum_index = 0; sum_index < array_size; sum_index++){
    final_result += numeric_data_list[sum_index];
  }

  print_result(final_result); // Output the final calculated result
}
