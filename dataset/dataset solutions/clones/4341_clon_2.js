const fileSystemUtility = require('fs') ;

/*
 *   This section retrieves input data from the standard input stream.
 *   It reads the entire content,
 *   decodes it using the UTF-8 character encoding,
 *   and then separates the content into individual lines
 *   based on newline characters, storing them in an array.
 */
const rawDataLines = fileSystemUtility
    .  readFileSync
    (
        '/dev/stdin', 'utf8'
    )
    .
    split
    (
        '\n'
    )
;

// The initial numeric value is extracted from the first line of the raw input.
const primaryQuantity =
    parseInt
    (
        rawDataLines[0]
    )
;

  // The secondary numeric value is obtained by parsing the second line of the input data.
const secondaryQuantity = parseInt(rawDataLines[1]);


// A computation is performed: the square of the primary quantity, from which the secondary quantity is subtracted.
const computedResult = (primaryQuantity * primaryQuantity) - secondaryQuantity;


// The final calculated outcome is then displayed to the standard output.
console.log(computedResult);