const fileSystemModule = require("fs");

// This program reads input from standard input, processes it in chunks,
// and prints specific characters based on a pattern match.
fileSystemModule
  .readFileSync(
    "/dev/stdin", // Specifies the standard input file path.
    "utf8"        // Defines the character encoding for reading the file.
  )
  .split('\n\n') // Divides the entire input content into an array of strings,
                 // using double newlines as the delimiter for each segment.
  .map(
    function(inputSegment) { // Iterates over each segment of the input array.
      // This string acts as a lookup table for the characters to be printed.
      const characterMap = 'AE..C.BD.FG';

      // A regular expression designed to find a sequence that starts with '1',
      // contains any number of digits or newline characters, and ends with '1'.
      // The 'm' flag enables multiline matching, though its effect here is minimal
      // as the pattern itself doesn't use '^' or '$' for line boundaries.
      const searchPattern = /1(\d|\n)*1/m;

      // Executes the regular expression on the current input segment.
      // It returns an array containing the full match at index 0,
      // or null if no match is found.
      const matchResult = searchPattern.exec(inputSegment);

      // Retrieves the length of the full matched string (e.g., "1231" would have length 4).
      // Assumes a match is always found based on problem context.
      const matchedStringLength = matchResult[0].length;

      // Calculates an index by taking the modulo 11 of the matched string's length.
      // This index is used to select a character from the 'characterMap' string.
      const finalCharIndex = matchedStringLength % 11;

      // Prints the character located at the calculated index from the 'characterMap'.
      console.log(characterMap[finalCharIndex]);
    }
  );
