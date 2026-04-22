/*
 * This program is designed to process incoming text data
 * from standard input. It searches for specific three-character
 * sequences, namely "JOI" and "IOI", and tallies their occurrences.
 * The final counts for each sequence are then printed to the console.
 */

let sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw data might contain unwanted leading or trailing spaces.
// We remove them to ensure accurate pattern matching.
sourceData = sourceData.trim();

let joiCount = 0; // A variable to store the number of times "JOI" is found.
let ioiCount = 0; // A variable to store the number of times "IOI" is found.

// We iterate through the string, looking for three-character substrings.
// The loop condition `sourceData.length - 3` ensures that
// there are always at least three characters remaining for a sequence check.
for ( let  idx  =  0 ;  idx  <  sourceData.length  -  3 ;  idx++ )
{
    // Check if the current three-character sequence matches "JOI".
    if ( sourceData[idx] + sourceData[idx + 1] + sourceData[idx + 2] === "JOI" )
    {
        joiCount++; // Increment the counter for "JOI".
    }

    // Check if the current three-character sequence matches "IOI".
    if ( sourceData[idx] + sourceData[idx + 1] + sourceData[idx + 2] === "IOI" )
    {
        ioiCount++; // Increment the counter for "IOI".
    }
}

// Output the final tally for "JOI" patterns.
console.log(joiCount);

// Output the final tally for "IOI" patterns.
console.log(ioiCount);