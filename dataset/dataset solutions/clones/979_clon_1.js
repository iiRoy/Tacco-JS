/*
 * This script is designed to locate all occurrences of a given 2D pattern
 * within a larger 2D field. It reads input from standard input,
 * processes the field and pattern dimensions, pre-computes row matches,
 * and then performs a final search to identify the top-left coordinates
 * of every matching pattern instance.
 */

// Define the input source and newline character based on the environment.
// For competitive programming on Linux-like systems, /dev/stdin and '\n' are typical.
config = {
    input: '/dev/stdin', // Specifies the input file path.
    newline: '\n'        // Defines the character sequence used for new lines.
};


// Read the entire content of the specified input file.
// The content is treated as ASCII and then split into an array of strings,
// where each string represents a line from the input.
line = require('fs').readFileSync(config.input, 'ascii')
                     .split(config.newline);


// The first line of input contains two space-separated integers:
// H (height of the main field) and W (width of the main field).
line[0] = line[0].split(' ').map(Number); // Parse the first line into an array of numbers.

// Extract the height and width of the main field.
H       = line[0][0];                     // H: Represents the number of rows in the main field.
W       = line[0][1];                     // W: Represents the number of columns in the main field.


// Extract the actual field data. The field consists of H rows,
// starting from the second line (index 1) of the input.
field   = line.slice(1, 1 + H);           // 'field' is an array of strings, each representing a row.


// The line immediately following the field data contains two more space-separated integers:
// R (height of the pattern) and C (width of the pattern).
line[1 + H] = line[1 + H].split(' ').map(Number); // Parse this line into an array of numbers.

// Extract the height and width of the pattern.
R           = line[1 + H][0];                     // R: Represents the number of rows in the pattern.
C           = line[1 + H][1];                     // C: Represents the number of columns in the pattern.


// Extract the actual pattern data. The pattern consists of R rows,
// starting from the line after the pattern dimensions.
pat         = line.slice(1 + H + 1, 1 + H + 1 + R); // 'pat' is an array of strings, each representing a pattern row.



/*
 * Pre-computation / Memoization Phase:
 *
 * This section initializes a 3D array 'mem' to store boolean values.
 * mem[field_row_idx][pattern_row_idx][start_col_idx] will be true
 * if the substring pat[pattern_row_idx] is found within field[field_row_idx]
 * starting at column start_col_idx.
 * This pre-computation significantly speeds up the main pattern matching phase.
 */

// Initialize the 'mem' array with 'H' (field height) rows.
mem = new Array(H);

for (i = 0; i < H; i++) { // Iterate through each row of the main field.
    // For each field row, initialize an array with 'R' (pattern height) elements.
    mem[i] = new Array(R);

    for (j = 0; j < R; j++) { // Iterate through each row of the pattern.
        // For the current field row (i) and pattern row (j),
        // initialize an array to hold boolean flags for all possible starting columns.
        // The number of possible starting columns is W - C + 1.
        mem[i][j] = new Array(W - C + 1);

        // Initialize all possible starting column positions for this (field_row, pattern_row) pair to 'false'.
        for (k = 0; k <= W - C; k++) {
            mem[i][j][k] = false;
        }

        // Search for all occurrences of the current pattern row (pat[j])
        // within the current field row (field[i]).
        // 'k' is reused here to store the index of the found substring.
        k = field[i].indexOf(pat[j]);

        // Loop while occurrences are found.
        while (k !== -1) {
            // If pat[j] is found in field[i] starting at column 'k', mark it as true.
            mem[i][j][k] = true;
            // Continue searching for the next occurrence, starting from the position
            // immediately after the current match.
            k            = field[i].indexOf(pat[j], k + 1);
        }
    }
}


/*
 * Main Pattern Matching Phase:
 *
 * This section iterates through all possible top-left starting positions
 * for the pattern within the field and uses the pre-computed 'mem' array
 * to quickly determine if a full match exists.
 */

// Iterate through all possible starting row indices for the pattern within the field.
// The pattern's top-left corner can be at row 'i' of the field.
for (i = 0; i <= H - R; i++) {
    // Iterate through all possible starting column indices for the pattern within the field.
    // The pattern's top-left corner can be at column 'j' of the field.
    for (j = 0; j <= W - C; j++) {

        // Assume that a pattern match is found at the current (i, j) position.
        flag = true;

        // Check each row of the pattern against the corresponding row in the field.
        // 'k' represents the row index within the pattern (from 0 to R-1).
        for (k = 0; k < R; k++) {
            // Using the 'mem' array, check if the k-th row of the pattern (pat[k])
            // matches the (i+k)-th row of the field (field[i+k])
            // when starting at the current column 'j'.
            if (!mem[i + k][k][j]) {
                // If any row of the pattern does not match its corresponding field row
                // at the expected position, then the entire pattern does not match.
                flag = false;
                break; // Exit the inner loop as a mismatch has been found.
            }
        }

        // If the 'flag' remains true after checking all pattern rows,
        // it means a complete match of the pattern was found.
        if (flag) {
            // Output the top-left coordinates (row 'i', column 'j') of the found pattern.
            console.log('%d %d', i, j);
        }
    }
}