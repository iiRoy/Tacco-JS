c = console.log; // Alias for console.log, used frequently for output

l = require('fs')
    .readFileSync(0, 'utf8') // Read entire input from stdin
    .split('\n');           // Split the input into an array of lines

// Parse the first line to get dimensions (height and width)
n = l[0]
    .split(' ')     // Split the first line by space
    .map(Number);   // Convert string parts to numbers

h = n[0]; // Assign height from the parsed numbers
w = n[1]; // Assign width from the parsed numbers

/*
 * Generate the border string.
 * The width of the border is 'w' (content width) + 2 (for leading and trailing '#').
 */
d = '#'.repeat(w + 2);

c(d); // Print the top border

// Loop through each line of the content, from index 1 up to 'h' (height)
for (i = 1; i <= h;) {
    // Print the current line surrounded by '#' characters
    c(`#${l[i++]}#`);
}

c(d); // Print the bottom border

// End of Type I clone demonstration.