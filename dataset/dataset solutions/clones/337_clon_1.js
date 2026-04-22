/*
 * This JavaScript file processes input data from standard input,
 * sorts it based on specific criteria, and then outputs
 * the processed information in a grouped and formatted manner.
 * It's designed to handle lines containing a word and a numeric page reference.
 */


// --- Initialization and Input Reading ---

// Declare 'd' to store the raw input lines.
// It reads from standard input, decodes as UTF-8,
// removes extraneous whitespace, and splits into an array by newline.
var d = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n'); // 'd' now holds an array of all input lines


var info = line = ''; // 'info' for temporary parsed line parts; 'line' for the current raw line.
var map = [];         // 'map' will store our main data: an array of [word, pageNumber] pairs.


// --- Parsing Input Lines into the Map ---

// Loop through each line received from the standard input.
// 'd.shift()' extracts and removes the first element from 'd',
// efficiently processing the input array one line at a time.
while (line = d.shift())
{
    // Split the current line by a space to separate the word and its page number.
  info = line.split(' ');

    // Add the parsed word and page number to our 'map' array.
    // 'info[0]' is the word (string).
    // '+info[1]' converts the page number from a string to a number using unary plus.
  map.push([info[0], +info[1]]);
}


// --- Sorting the Collected Data ---

// Sort the 'map' array. The custom comparison function defines the sorting logic:
// 1. Primary sort key: the word (alphabetically).
// 2. Secondary sort key: the page number (numerically), applied if words are identical.
map.sort(function(a, b) {
    // Compare words (the first element of each pair, a[0] and b[0])
    if (a[0] < b[0]) {
        return -1; // 'a' should come before 'b'
    }
    if (a[0] > b[0]) {
        return 1;  // 'a' should come after 'b'
    }

    // If the words are the same, then compare their page numbers (second element, a[1] and b[1])
    if (a[1] < b[1]) {
        return -1; // 'a' page is smaller, so 'a' comes before 'b'
    }
    if (a[1] > b[1]) {
        return 1;  // 'a' page is larger, so 'a' comes after 'b'
    }

    // If both the word and the page number are identical, their relative order doesn't matter.
    return 0;
});


// --- Output Generation and Grouping ---

var word = '';   // This variable keeps track of the current word being processed for grouping.
var pages = []; // This array temporarily collects page numbers for the current 'word' group.

// Iterate over each item in the now sorted 'map' array.
// 'info' represents the current [word, pageNumber] pair.
// 'i' is the zero-based index of the current item in the 'map'.
map.forEach(function(info, i) {
    // Check if the word of the current item ('info[0]') is different from the 'word' we've been tracking.
    // This condition signifies the start of a new word group.
  if (word !== info[0])
  {
        // If this is not the very first item in the map (meaning a previous word group was processed)
    if (i !== 0)
    {
            // Print the collected page numbers for the *previous* word, joined by spaces.
      console.log(pages.join(' '));
            // Reset the 'pages' array to begin collecting pages for the *new* word group.
      pages = [];
    }
        // Print the new word itself.
    console.log(info[0]);
  }
    // Add the current item's page number ('info[1]') to the 'pages' array.
  pages.push(info[1]);
    // Update the 'word' tracker to the word of the current item for the next iteration.
  word = info[0];
});

// After the loop completes, there will be a final set of page numbers
// in the 'pages' array corresponding to the last word encountered.
// This line ensures those final pages are printed to the console.
console.log(pages.join(' '));

// --- End of Script ---