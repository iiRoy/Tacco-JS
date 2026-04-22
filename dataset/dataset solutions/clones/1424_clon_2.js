function obtainInputLines()
{
    // This variable will hold the complete raw content read from the specified input source.
    // The built-in 'fs' (file system) module is utilized to perform a synchronous read operation
    // from '/dev/stdin', which universally represents the standard input stream on POSIX systems.
    // The data is specifically interpreted using the 'utf8' character encoding.
    let  rawDataBuffer  =  require("fs").readFileSync("/dev/stdin", "utf8");

    // The raw data, once retrieved, is then parsed and separated into an array of individual lines.
    // The regular expression /\\n\\r?/ ensures that both typical Unix-style newlines (LF)
    // and Windows-style newlines (CRLF) are correctly identified and used as delimiters.
    return rawDataBuffer.split(/\n\r?/);
} // Concludes the definition of the obtainInputLines function


// The primary execution block of this script commences here.
// It is designed to process and display a modified version of the very first line
// acquired from the standard input.
console.log(
    obtainInputLines()  // Invoke the utility function to fetch all available input lines.
    [0]                 // Select the initial line (at index 0) from the array of lines.
    .split('')          // Deconstruct this chosen line into an array where each element is a single character.
    .map( (charElement) => { // Iterate through each character in the array, applying a transformation function.
        // Evaluate if the current character is a lowercase alphabetic letter.
        // The double negation (!!) converts the result of .match() (either an array or null) into a boolean.
        return !!charElement.match(/[a-z]/)
               ? charElement.toUpperCase()    // If it is lowercase, convert it to its uppercase counterpart.
               : ( // Otherwise, proceed to the subsequent conditional check.
                   // Evaluate if the character is an uppercase alphabetic letter.
                   !!charElement.match(/[A-Z]/)
                   ? charElement.toLowerCase() // If it's uppercase, convert it to its lowercase counterpart.
                   : charElement               // If it's neither lowercase nor uppercase (e.g., number, symbol, space), retain its original form.
                 );
    } )
    .join('')           // Reassemble all the processed characters back into a single, cohesive string.
); // Marks the termination of the console.log statement.