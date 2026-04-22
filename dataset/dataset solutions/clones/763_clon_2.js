var raw_input_data = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines.
var parsed_lines = raw_input_data.trim().split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
   // Extract the quantity of items for the current test case from the first line.
   // The '- 0' ensures conversion to a numerical type.
   var item_quantity = parsed_lines.shift() - 0;

   // If the item quantity is zero, it signifies the end of input, so break the loop.
   if (item_quantity === 0) {
      break;
   }

   // Retrieve the sequence of item identifiers for the current test case.
   // These are space-separated strings on the next line.
   var item_labels = parsed_lines.shift().split(' ');

   // A boolean indicator to track if a clear winner has emerged.
   var has_a_winner = false;

   // An object to store the frequency count of each unique item label.
   var label_counts = {};

   // Iterate through each item label in the current sequence.
   for (var current_item_idx = 0; current_item_idx < item_quantity; ++current_item_idx) {
      var current_label_being_processed = item_labels[current_item_idx];

      // Increment the count for the current item label. If it's new, initialize to 1.
      label_counts[current_label_being_processed] = (label_counts[current_label_being_processed] || 0) + 1;

      // An array to temporarily hold [count, label] pairs for sorting.
      var current_tallies = [];

      // Populate the temporary array with counts and their corresponding labels from the frequency map.
      for (var map_key in label_counts) {
         if (Object.prototype.hasOwnProperty.call(label_counts, map_key)) {
            current_tallies.push([label_counts[map_key], map_key]);
         }
      }

      // Sort the tallies in ascending order based on their counts.
      current_tallies.sort(function(first_entry, second_entry) {
         return first_entry[0] - second_entry[0];
      });

      // Calculate how many items are yet to be processed in the current sequence.
      var remaining_item_count = item_quantity - (current_item_idx + 1);

      // Special handling for when there is only one unique item label encountered so far.
      // This ensures 'current_tallies[1]' can be accessed without error in subsequent checks.
      if (current_tallies.length === 1) {
          current_tallies[1] = [0, 'placeholder'];
      }

      // If the top two counts are identical, no clear leader yet; continue to the next item.
      if (current_tallies[0][0] === current_tallies[1][0]) {
         continue;
      }

      // Check if the leading item's count is definitively greater than the second item's count,
      // even if all remaining items were to be added to the second item's tally.
      if (current_tallies[0][0] > current_tallies[1][0] + remaining_item_count) {
         // If so, a winner is declared. Output the winner's label and the number of items processed.
         console.log(current_tallies[0][1] + ' ' + (current_item_idx + 1));
         has_a_winner = true; // Set the flag.
         break; // Exit the inner loop, as a winner has been found.
      }
   }

   // After processing all items (or finding a winner), check if a winner was declared.
   // If not, it means there was no clear winner, resulting in a tie.
   if (has_a_winner === false) {
      console.log('TIE');
   }
}