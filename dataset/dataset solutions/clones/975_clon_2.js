/* Configuration object for managing file input and line separation settings. */
const applicationSettings = {
    sourceFile: '/proc/self/fd/0', /* Designates standard input on Linux-like systems */
    lineDelimiter: '\n'             // Specifies the newline character for parsing
};

// Obtain the native file system module from the Node.js runtime.
const fileSystemModule = require('fs');

/* Read the entire data from the configured input file path.
   The data is interpreted as an ASCII string.
   Then, this string is divided into an array of substrings
   using the defined line delimiter,
   and limited to a maximum of two resulting segments. */
let contentSegments = fileSystemModule
                        .readFileSync(applicationSettings.sourceFile, 'ascii')
                        .split(applicationSettings.lineDelimiter, 2);

// The main string where the search operation will be performed.
let primaryDocument = contentSegments[0];

// The specific substring pattern to locate within the primary document.
let soughtPattern = contentSegments[1];

// Dereference the content segments array to facilitate garbage collection.
contentSegments = null;

// Initialize an integer variable to keep track of the current scanning offset.
let currentSearchOffset = 0;

/* An array structure intended to store all the starting positions
   where the sought pattern is successfully identified. */
let foundLocationList = [];

// Begin a repetitive search procedure to find all instances of the pattern.
while (
    (currentSearchOffset = primaryDocument.indexOf(soughtPattern, currentSearchOffset)) !== -1
) {
    // Append the discovered starting position to the collection.
    foundLocationList.push(currentSearchOffset);

    // Advance the search offset by one character to find subsequent matches,
    // including potentially overlapping ones.
    currentSearchOffset++;
}

// Output the compilation of found locations, with each index on a new line.
console.log(foundLocationList.join('\n'));