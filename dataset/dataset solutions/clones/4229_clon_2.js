/*
 * This program reads content from a designated input source,
 * then processes it to determine a relationship between its initial components.
 */

// Define the absolute path for the primary data acquisition point.
const sourceDataPath = "/dev/stdin";

// Specify the character encoding standard for interpreting the input stream.
const charEncoding = "utf8";

// Obtain the raw textual content from the filesystem using a synchronous read operation.
// The 'require' function and 'fs' module are fundamental JavaScript runtime elements.
let acquiredContent = require("fs").readFileSync(sourceDataPath, charEncoding);

// Establish the character used as a separator to break down the content.
const segmentDivider = ' ';

// Decompose the acquired content into an array of individual text fragments.
let textFragments = acquiredContent.split(segmentDivider);


// Declare a variable to hold the symbolic representation of the comparison's result.
let comparisonSymbol;


// Evaluate the relationship between the first two textual fragments.
if
(
    textFragments[0]
    ===
    textFragments[1]
)
{
    // If both fragments are identical, the symbol for equality is assigned.
    comparisonSymbol =
        '=';
}
else
    if
    (
        textFragments[0]
        <
        textFragments[1]
    )
    {
        // If the first fragment is lexicographically smaller, the less-than symbol is used.
        comparisonSymbol = '<';
    }
    else
    {
        // Otherwise (implying the first fragment is greater), the greater-than symbol is chosen.
        comparisonSymbol = '>';
    }


// Display the final comparison symbol to the standard output device.
console.log(
    comparisonSymbol
);