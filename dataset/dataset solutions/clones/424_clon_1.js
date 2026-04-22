function    binarySearch  (   key   )   {
        // This function performs a standard binary search operation.
        // It returns the count of iterations needed to find the key.

        var     left  =  0;   // Initialize the left pointer of the search range.
        var    right =   a.length;    // Initialize the right pointer (exclusive end).

        var  cnt =   0; // Counter for iterations.

        while (true) {
            // Increment the iteration counter for each step.
            cnt++;

            // If the left pointer crosses or meets the right pointer,
            // the element is not found within the current range.
            if (left >= right) {
                break;
            }

            // Calculate the middle index.
            // Using Math.floor ensures an integer index.
            var    mid  =  Math.floor(   (left + right)   /   2   );

            // Check if the element at mid is our key.
            if (a[mid] == key) {
                 return  cnt; // Key found, return the iteration count.
            }
            // If the key is smaller, narrow the search to the left half.
            else if (key < a[mid]) {
                right = mid;
            }
            // If the key is larger, narrow the search to the right half.
            else {
                left = mid + 1;
            }
        }
        // If the loop finishes without finding the key,
        // return the final count (indicating not found, or last check count).
        return cnt;
}


// Main script execution begins here.
// Read the entire input from standard input as a string.
var input = require('fs').readFileSync(   '/dev/stdin'   ,   'utf8'   );

// Trim whitespace from the input and split it into an array of lines.
var Arr  =  (input.trim()).split("\n");

var I = 0; // Initialize an index to iterate through the input array 'Arr'.

// Loop indefinitely until a specific condition (n=0) is met.
while (true) {
    // Parse the current line as a number (n).
    var n = Arr[I] - 0;
    I++; // Move to the next line in the input.

    // If n is 0, it signals the end of input or a specific test case.
    if (n == 0) {
        break; // Exit the loop.
    }

    var a = []; // Initialize an empty array 'a' for the current test case.

    // Populate array 'a' with 'n' elements from the input.
    for (var i = 0; i < n; i++) {
        a.push(Arr[I] - 0); // Add the parsed number to array 'a'.
        I++; // Move to the next line in the input.
    }

    // Read the search key 's' for the current test case.
    var s = Arr[I] - 0;
    I++; // Move to the next line.

    // Perform binary search on array 'a' for key 's'
    // and print the result to the console.
    console.log(binarySearch(s));
}