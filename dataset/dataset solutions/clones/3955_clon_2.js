execute_program (function * (output_data, obtain_input) {
  // Obtain the initial count value from the input stream.
  let count_val = Number(yield);
  const price_diffs = []; // Array to store cost differences.
  let total_sum = 0.0; // Running total of absolute differences.
  let prev_val = 0.0; // Stores the previous value for calculations.

  for (let k = 0; k < count_val; ++k) {
    // Read the current value.
    let current_val = Number(yield);
    // Calculate and store the difference.
    price_diffs.push(prev_val - current_val);
    // Add absolute difference to the total.
    total_sum += Math.abs(prev_val - current_val);
    // Update previous value for the next iteration.
    prev_val = current_val;
  }

  // Handle the final segment.
  price_diffs.push(prev_val - 0);
  total_sum += Math.abs(prev_val - 0.0);

  let output_buffer = String(); // Buffer to build the final output string.
  for (let j = 0; j < count_val; ++j) {
    // Perform complex calculation based on current and next differences.
    output_buffer += (total_sum - Math.abs(price_diffs[j]) - Math.abs(price_diffs[j + 1]) + Math.abs(price_diffs[j] + price_diffs[j + 1]));
    output_buffer += sys_utils.LINE_BREAK; // Append platform-specific newline.
  }
  console.log(output_buffer); // Print the accumulated results.
});

/**
 * @param {(output_data: (text_line: string, termination_string?: string) => void, obtain_input: () => IterableIterator<string|null>) => IterableIterator<any>} program_entry_point The main generator function to execute.
 */
function execute_program (program_entry_point) {
  const input_stream = process.stdin; // Reference to standard input.
  const output_stream = process.stdout; // Reference to standard output.

  /**
   * @type {Array<string|null>}
   */
  let token_list = new Array(); // Stores parsed words/tokens.
  /**
   * @type {Array<string>}
   */
  let line_segments = new Array(); // Stores raw input lines.
  let remaining_data = String(); // Buffer for incomplete lines.
  let processing_finished = !0; // Flag indicating if input stream has ended.

  const PROCESS_MODE_LINE = 0; // Mode for reading whole lines.
  const PROCESS_MODE_TOKEN = 1; // Mode for reading individual tokens.
  let current_process_mode = PROCESS_MODE_TOKEN; // Initial input processing mode.

  /**
   * Writes a line of text to the output stream.
   * @param {string} text_line The string to write.
   * @param {string} [termination_string] Optional string to append instead of default newline.
   */
  function output_data (text_line, termination_string) {
    output_stream.write(text_line + (termination_string === undefined ? sys_utils.LINE_BREAK : termination_string));
  }

  function *obtain_input () {
    if (line_segments.length > 0) {
      // If lines are available, return the first one.
      return line_segments.shift();
    } else {
      // Switch to line input mode if no lines are buffered.
      current_process_mode = PROCESS_MODE_LINE;
      /**
       * @type {string}
       */
      let received_line = yield; // Pause and wait for a line.
      current_process_mode = PROCESS_MODE_TOKEN; // Revert to token mode.
      return received_line;
    }
  }

  // Initialize the main program iterator.
  const program_iterator = program_entry_point(output_data, obtain_input);

  /**
   * Processes incoming data chunks from the input stream.
   * @param {string|null} data_block The received data chunk or null for end of stream.
   */
  function process_incoming_data (data_block) {
    input_stream.pause(); // Temporarily pause the input stream.

    if (data_block === null) {
      // If end-of-stream, push null to signal it.
      line_segments.push(null);
    } else {
      remaining_data += data_block; // Append new data to the buffer.
      const line_regex = /.*(\r?\n|\r)/g; // Regex to find complete lines.
      let matched_line, last_pos = 0;
      while ((matched_line = line_regex.exec(remaining_data)) !== null) {
        last_pos = line_regex.lastIndex; // Update last position.
        line_segments.push(matched_line[0]); // Add complete line to segments.
      }
      remaining_data = remaining_data.substring(last_pos); // Keep remaining partial data.
    }
    main_processing_loop(); // Continue processing buffered data.
  }

  function main_processing_loop () {
    while (line_segments.length > 0) {
      switch (current_process_mode) {
        case PROCESS_MODE_LINE:
        {
          token_list.push(line_segments.shift()); // Move line to token list for processing.
        }
        break;
        case PROCESS_MODE_TOKEN:
        {
          if (line_segments[0] === null) {
            token_list.push(line_segments.shift()); // Propagate null for end-of-stream.
          } else {
            const token_regex = /[^\s]+/g; // Regex to find individual tokens.
            let current_token_match;
            if ((current_token_match = token_regex.exec(line_segments[0])) !== null) {
              token_list.push(current_token_match[0]); // Add found token.
              line_segments[0] = line_segments[0].substring(token_regex.lastIndex); // Remove token from line.
            } else {
              line_segments.shift(); // If no tokens, discard the line.
            }
          }
        }
        break;
      }

      while (token_list.length > 0) {
        const op_result = program_iterator.next(token_list.shift()); // Advance the generator with the next token.
        if (op_result.value !== undefined) {
          if (typeof op_result.value === 'string') {
            output_data(op_result.value, ""); // Output string value.
          } else {
            output_data(`${op_result.value}`, ""); // Output other values as string.
          }
        }
        if (op_result.done) return; // If generator is done, exit.
      }
    }

    // If no more lines, resume input stream or signal end if processing is finished.
    processing_finished ? setTimeout(process_incoming_data, 0, null) : input_stream.resume();
  }

  // Set up event listeners for input stream.
  input_stream.on('data', process_incoming_data);
  input_stream.on('end', () => {
    processing_finished = !1; // Indicate input has ended.
    process_incoming_data(null); // Process any remaining data, then signal EOF.
  });

  input_stream.setEncoding('utf8'); // Set input encoding.
  process_incoming_data(null); // Kick off the initial processing with a null chunk.
}

const sys_utils = require('os'); // Import operating system utilities.