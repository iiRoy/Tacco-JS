let total_sequences_count;
let string_collection = [];
let balance_information_list = [];

/**
 * Analyzes a given string sequence to determine its parenthesis balance.
 * Returns an object containing the count of unmatched closing and opening parentheses.
 *
 * @param {string} sequence_text The input string to analyze.
 * @returns {{unmatched_closing: number, unmatched_opening: number}} An object with balance counts.
 */
function determine_paren_balance(sequence_text) {
  // Guard clause for empty or invalid input strings.
  if (!sequence_text || sequence_text.length === 0) {
    return { unmatched_closing: 0, unmatched_opening: 0 };
  }

  // Initialize the balance state for the current sequence.
  let current_balance_state = {
    unmatched_closing: 0, // Represents initial `p[0]`
    unmatched_opening: 0  // Represents initial `p[1]`
  };

  // Iterate through each character of the input string.
  for (const char_item of sequence_text) {
    if (char_item === '(') {
      current_balance_state.unmatched_opening++;
    } else if (char_item === ')') {
      // If there's an open parenthesis to match, decrement the open count.
      if (current_balance_state.unmatched_opening > 0) {
        current_balance_state.unmatched_opening--;
      } else {
        // Otherwise, it's an unmatched closing parenthesis.
        current_balance_state.unmatched_closing++;
      }
    }
    // Any other characters are implicitly ignored, maintaining original behavior.
  }
  return current_balance_state;
}

/**
 * Main function to orchestrate the processing of parenthesis sequences.
 * It reads input, analyzes balances, sorts the results, and attempts to
 * form a valid overall parenthesis sequence through a greedy consumption strategy.
 */
function orchestrate_sequence_processing() {
  total_sequences_count = parse_next_numeric_token();

  // If there are no sequences, it's trivially a valid arrangement.
  if (total_sequences_count === 0) {
    output_final_result('Yes');
    return;
  }

  // Populate the string collection by reading input tokens.
  for (let current_idx = 0; current_idx < total_sequences_count; current_idx++) {
    string_collection[current_idx] = parse_next_string_token();
  }

  // Analyze each string to determine its parenthesis balance.
  for (let current_idx = 0; current_idx < total_sequences_count; current_idx++) {
    balance_information_list[current_idx] = determine_paren_balance(string_collection[current_idx]);
  }

  // Custom sorting logic for the balance information list.
  // This comparison function implements a specific greedy strategy for ordering.
  balance_information_list.sort((item_a, item_b) => {
    // Calculate net balance change for each item (unmatched opening - unmatched closing).
    const net_balance_change_a = item_a.unmatched_opening - item_a.unmatched_closing;
    const net_balance_change_b = item_b.unmatched_opening - item_b.unmatched_closing;

    // Special handling for items that start with unmatched closing parentheses (i.e., 'bad' prefixes).
    if (item_a.unmatched_closing > 0 && item_b.unmatched_closing > 0) {
      if (item_a.unmatched_closing === item_b.unmatched_closing) {
        // If both have the same number of initial unmatched closing,
        // prioritize the one that contributes more to opening parentheses (higher net_balance_change).
        return net_balance_change_b - net_balance_change_a;
      } else {
        // Otherwise, prioritize the one with *more* initial unmatched closing parentheses.
        // This is a crucial part of the greedy strategy.
        return item_b.unmatched_closing - item_a.unmatched_closing;
      }
    }
    // General case: prioritize items that contribute more to opening parentheses (higher net_balance_change).
    return net_balance_change_b - net_balance_change_a;
  });

  let current_cumulative_balance = 0; // Represents `q` from original code.
  let is_entire_sequence_valid = true; // Represents `ans` from original code.

  let remaining_items_to_process = total_sequences_count;
  // Use a boolean array to track consumed items instead of nulling out array elements.
  const consumed_flags = new Array(total_sequences_count).fill(false);

  // Main greedy consumption loop. Continues as long as there are items left
  // and the sequence remains potentially valid.
  while (remaining_items_to_process > 0 && is_entire_sequence_valid) {
    let item_was_successfully_consumed_in_this_pass = false; // Represents `update` from original code.

    // Iterate through the sorted list to find an item that can be consumed.
    for (let idx = 0; idx < total_sequences_count; idx++) {
      const current_item_data = balance_information_list[idx];

      // Check if the item has not been consumed yet and if the current balance
      // can accommodate its unmatched closing parentheses.
      if (!consumed_flags[idx] && current_cumulative_balance >= current_item_data.unmatched_closing) {
        // Consume the item: update cumulative balance and mark as consumed.
        current_cumulative_balance += (current_item_data.unmatched_opening - current_item_data.unmatched_closing);
        consumed_flags[idx] = true;
        item_was_successfully_consumed_in_this_pass = true;
        remaining_items_to_process--;
        break; // Found and consumed an item, break inner loop to start a new pass.
      }
    }

    // If no item could be consumed in this pass, the sequence is invalid.
    if (!item_was_successfully_consumed_in_this_pass) {
      is_entire_sequence_valid = false;
      // The `while` loop condition will handle termination.
    }
  }

  // Final check: the sequence is valid only if all items were consumed AND the final balance is zero.
  const final_decision = is_entire_sequence_valid && current_cumulative_balance === 0;
  output_final_result(final_decision ? 'Yes' : 'No');
}

// --- Input/Output Helper Functions ---

// Global variables for managing raw input and parsed tokens.
let raw_input_buffer = '';
let input_tokens = [];
let current_input_index = 0;

/**
 * Parses and returns the next numeric token from the input stream.
 * @returns {number} The parsed integer.
 */
const parse_next_numeric_token = () => {
  const token_str = input_tokens[current_input_index++];
  const parsed_value = parseInt(token_str, 10);
  // Basic validation: if not a number, output an error and return 0.
  if (isNaN(parsed_value)) {
    console.error("Input parsing error: Expected a number, but received:", token_str);
    return 0;
  }
  return parsed_value;
};

/**
 * Returns the next string token from the input stream.
 * @returns {string} The next string token.
 */
const parse_next_string_token = () => {
  return input_tokens[current_input_index++];
};

/**
 * Outputs the final result to the console.
 * @param {string} value_to_display The string to be logged.
 */
const output_final_result = (value_to_display) => {
  console.log(value_to_display);
};

// --- Standard Node.js Input Handling ---

process.stdin.resume();
process.stdin.setEncoding('utf8');

// Accumulate all incoming data chunks.
process.stdin.on('data', (chunk_of_data) => {
  raw_input_buffer += chunk_of_data;
});

// Once all input has been received, process it.
process.stdin.on('end', () => {
  // Trim whitespace and split the entire input into tokens by any whitespace.
  input_tokens = raw_input_buffer.trim().split(/\s+/);
  // Initiate the main processing logic.
  orchestrate_sequence_processing();
});