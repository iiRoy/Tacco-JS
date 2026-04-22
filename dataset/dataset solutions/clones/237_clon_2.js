let file_utility_module = require('fs'); // Obtain the built-in file system utility.

let raw_input_data = file_utility_module.readFileSync('/dev/stdin', 'utf8'); // Read all content from standard input using UTF-8 encoding.

let processed_string_segments = raw_input_data
    .trim() // Eliminate leading and trailing whitespace from the entire input.
    .split("\n"); // Divide the input into an array of strings, one for each line.

// Iterate through every individual processed string segment.
processed_string_segments.forEach(function(current_line_item) {

    // For the current line, split it by spaces and convert each resulting substring into a number.
    let numeric_coord_array = current_line_item
        .split(" ")
        .map(Number);

    // Initialize a counter to track the number of dimensions where overlap is detected.
    let overlap_dimension_counter = 0;

    // Execute an immediately-invoked function expression (IIFE) to perform the overlap check.
    // This function takes eight arguments representing the coordinates of two rectangles.
    (function(rectangle_a_x1, rectangle_a_y1, rectangle_a_x2, rectangle_a_y2,
              rectangle_b_x1, rectangle_b_y1, rectangle_b_x2, rectangle_b_y2) {

        // Evaluate if there is an overlap along the horizontal (X) axis.
        // Overlap exists if rectangle B's right edge is not to the left of rectangle A's left edge,
        // AND rectangle B's left edge is not to the right of rectangle A's right edge.
        if (rectangle_b_x2 >= rectangle_a_x1 && rectangle_b_x1 <= rectangle_a_x2) {
            overlap_dimension_counter++; // Increment the counter if X-axis overlap is confirmed.
        }

        // Evaluate if there is an overlap along the vertical (Y) axis.
        // Overlap exists if rectangle B's top edge is not below rectangle A's bottom edge,
        // AND rectangle B's bottom edge is not above rectangle A's top edge.
        if (rectangle_b_y2 >= rectangle_a_y1 && rectangle_b_y1 <= rectangle_a_y2) {
            overlap_dimension_counter++; // Increment the counter if Y-axis overlap is confirmed.
        }

    }).apply(null, numeric_coord_array); // Invoke the function, passing the numeric coordinate array as arguments.

    // Output the final determination: "YES" if overlap was found in both dimensions (full intersection),
    // otherwise "NO".
    console.log((overlap_dimension_counter === 2) ? "YES" : "NO");
});