(function(rawData) {
  // This function processes raw input data.
  // First, it removes any trailing newline character from the input.
  // Then, it splits the cleaned string into an array of substrings using a space as a delimiter.
  var elements = rawData.replace(/\n$/, '').split(' ');

  // The resulting array of elements is then sorted.
  // A custom comparison function is provided to sort the elements in descending numerical order.
  // After sorting, the elements are joined back into a single string, separated by spaces.
  // Finally, this combined string is printed to the console.
  console.log(elements.sort(function(firstVal, secondVal) {
    // The comparison logic 'secondVal - firstVal' ensures a descending sort for numbers.
    return secondVal - firstVal;
  }).join(' '));
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // The IIFE is immediately invoked with content read from standard input.
