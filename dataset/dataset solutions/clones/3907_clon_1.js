/*
 * This JavaScript code processes input from standard input.
 * It's designed to read a sequence of numbers and perform
 * some calculations based on their sorted order.
 */

// Resume stdin to ensure the process doesn't exit immediately.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');

// Initialize a variable to accumulate all incoming data chunks.
var all_input = '';

/*
 * Register a listener for the 'data' event on stdin.
 * This function is called whenever new data is available.
 */
process.stdin.on('data', function (chunk) {
   // Append the received chunk of data to the all_input string.
   all_input += chunk;
});


/*
 * Register a listener for the 'end' event on stdin.
 * This function is executed once all input has been received.
 */
process.stdin.on('end', function () {

   // Split the accumulated input string into an array of lines.
   lines = all_input.split('\n');

   // The first line is assumed to be the count 'n'.
   n = lines[0];

   // The second line contains space-separated numbers.
   line = lines[1].split(' ');

   // Initialize an empty array to store parsed integer values.
   var list = [];

   // Loop through the 'n' elements from the input line.
   for (var i = 0; i < n; i++) {
      // Parse each element as an integer and add it to the list.
      list.push(parseInt(line[i]));
   }


   // Create a shallow copy of the list to sort it without modifying the original.
   var sortedList = list.slice();

   // Sort the copied list in ascending order.
   sortedList.sort();

   // Initialize an empty dictionary (object) to store mappings.
   var dict = {};

   // Iterate over the indices of the original 'list'.
   for (var i in list) {
      // Get the value from the sorted list corresponding to the current index.
      var val = sortedList[i];

      // Check if the value already exists as a key in the dictionary.
      if (val in dict) {
         // If it exists, push the current index 'i' into its array of indices.
         dict[val].push(i);
      }
      else {
         // If it doesn't exist, create a new array with 'i' as its first element.
         dict[val] = [i];
      }
   }


   // Decrement 'n' by 1 for 0-based indexing or other calculation purposes.
   n -= 1;


   // Loop from 0 up to the modified 'n'.
   for (var i = 0; i <= n; i++) {

      // Get the current value from the original list.
      var val = list[i];

      // Retrieve and remove the last index associated with 'val' from the dictionary.
      // Note: val.toString() is used as dictionary keys are strings.
      var index = dict[val.toString()].pop();

      // Calculate the 'half' point of the array (floor division).
      half = Math.floor(n / 2);

      // Determine the 'left' median value from the sorted list.
      var left = sortedList[half];

      // Determine the 'right' median value from the sorted list.
      var right = sortedList[half + 1];

      // Initialize the answer variable.
      var ans = 0;

      // Conditional logic to decide the answer based on the index's position relative to 'half'.
      if (index <= half) {
         // If the index is in the first half, the answer is the 'right' median.
         ans = right;
      }
      else {
         // Otherwise (if in the second half), the answer is the 'left' median.
         ans = left;
      }

      // Print the calculated answer to the console, converting it to a string.
      console.log(ans.toString());
   }
});