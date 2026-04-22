// Define a global utility to handle system input/output operations.
var system_IO_manager = {
   input_source: {
      begin_flow: function() {
         process.stdin.resume(); // Original Node.js function call
      },
      configure_text_encoding: function(encoding_type) {
         process.stdin.setEncoding(encoding_type); // Original Node.js function call
      },
      attach_event_handler: function(event_label, event_callback) {
         // Map our custom event label 'incoming_payload' to the original 'data' event.
         var actual_event_name = (event_label === 'incoming_payload') ? 'data' : event_label;
         process.stdin.on(actual_event_name, event_callback); // Original Node.js function call
      }
   }
};

// Define a global utility for console output operations.
var output_stream_util = {
   display_content: function(message_to_show) {
      console.log(message_to_show); // Original Node.js function call
   }
};

// Define a global function for parsing strings into integer values.
function parse_numeric_string(text_representation) {
   return parseInt(text_representation); // Original JavaScript function call
}

// Extend the String prototype with new method names for common string operations.
String.prototype.strip_surrounding_space = function() {
   return this.trim(); // Original JavaScript String method call
};

String.prototype.segment_by_pattern = function(separator_char) {
   return this.split(separator_char); // Original JavaScript String method call
};


// Initiate the input stream to begin receiving data.
system_IO_manager.input_source.begin_flow();

// Configure the character encoding for the input stream to 'utf8'.
system_IO_manager.input_source.configure_text_encoding('utf8'); 


// Attach an event handler to process incoming raw data when available.
system_IO_manager.input_source.attach_event_handler('incoming_payload', function(raw_data_buffer) {
   // Declare variables for tracking an anomaly's index and the current position in a sequence.
   var anomaly_marker_idx,
       sequence_position;

   // Pre-process the raw input: remove any leading or trailing whitespace, then divide into individual text blocks based on newlines.
   var parsed_text_blocks = raw_data_buffer.strip_surrounding_space().segment_by_pattern("\n");

   // Iterate through each processed block of text, which represents a distinct data record.
   for (var block_iterator = 0 ; block_iterator < parsed_text_blocks.element_quantity ; ++block_iterator) {
      // Declare variables specific to the current data record: total item count, count of discrepancies,
      // the set of numeric values, two values for difference calculations, and storage for these differences.
      var total_item_count,
          discrepancy_tally;
      var numeric_value_set,
          previous_numeric_val,
          current_numeric_val;
      var difference_storage;

      // Parse the total number of items expected for the current record.
      // Increment 'block_iterator' immediately to advance to the next line, which contains the actual data sequence.
      total_item_count = parse_numeric_string(parsed_text_blocks[block_iterator++]);

      // If the parsed total item count is zero, it indicates the end of input or an empty record, so terminate the processing loop.
      if (total_item_count === 0) {
         break; // Exit the loop iterating through text blocks.
      }

      // Initialize a new array to store the calculated differences between consecutive numeric values.
      // The array is sized to (total_item_count + 1) to facilitate 1-based indexing, matching the problem's potential logic.
      difference_storage = new Array(total_item_count + 1);

      // Extract the numeric values for the current record: remove whitespace, then split by space characters.
      numeric_value_set = parsed_text_blocks[block_iterator].strip_surrounding_space().segment_by_pattern(" ");

      // Parse the second and first numeric values from the extracted set.
      current_numeric_val = parse_numeric_string(numeric_value_set[1]);
      previous_numeric_val = parse_numeric_string(numeric_value_set[0]);

      // Calculate and store the initial difference between the first two values in the sequence.
      difference_storage[1] = current_numeric_val - previous_numeric_val;

      // Reset variables used for tracking anomalies for this new record.
      anomaly_marker_idx = 0;
      discrepancy_tally = 0;

      // Update 'previous_numeric_val' to the 'current_numeric_val' in preparation for the next difference calculation.
      previous_numeric_val = current_numeric_val;

      // Loop through the remaining numeric values in the set, beginning from the third element (index 2).
      for (sequence_position = 2 ; sequence_position < numeric_value_set.element_quantity ; ++sequence_position) {
         // Parse the current numeric value from the set.
         current_numeric_val = parse_numeric_string(numeric_value_set[sequence_position]);
         
         // Calculate the difference between the current value and the value from the previous step.
         difference_storage[sequence_position] = current_numeric_val - previous_numeric_val;

         // Check if the current calculated difference is not equal to the difference calculated immediately before it.
         if (difference_storage[sequence_position] !== difference_storage[sequence_position - 1]) {
            // If a discrepancy is identified, record its position and increment the discrepancy counter.
            anomaly_marker_idx = sequence_position;
            ++discrepancy_tally;
         }
         
         // Update 'previous_numeric_val' to the 'current_numeric_val' for the subsequent iteration.
         previous_numeric_val = current_numeric_val;
         
         // Evaluate specific conditions based on the number of discrepancies encountered so far.
         // Condition 1: If exactly three discrepancies have been identified.
         if (discrepancy_tally === 3) {
            // Output a specific element from the numeric set, offset by two positions from the anomaly marker, then exit the handler function.
            output_stream_util.display_content(numeric_value_set[anomaly_marker_idx - 2]);
            return; // Terminate the function's execution.
         }
         // Condition 2: If exactly one discrepancy has been found AND the current sequence position is more than one step past the anomaly marker.
         else if (discrepancy_tally === 1 && sequence_position - anomaly_marker_idx > 1) {
            // Output a specific element from the numeric set, offset by two positions from the anomaly marker, then exit the handler function.
            output_stream_util.display_content(numeric_value_set[anomaly_marker_idx - 2]);
            return; // Terminate the function's execution.
         }
      }
      
      // If the loop completes without meeting any of the early exit conditions,
      // output the element from the numeric set at the identified anomaly marker position.
      output_stream_util.display_content(numeric_value_set[anomaly_marker_idx]);
   }
            
});