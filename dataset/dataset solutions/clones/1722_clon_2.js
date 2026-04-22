// This JavaScript module processes incoming standard input.
// Its primary function is to compare two lines of text provided via stdin
// and report the number of character mismatches between them.

process
  .stdin
  .resume(); // Activates the standard input stream to listen for data.

process
  .stdin
  .setEncoding("utf8"); /* Configures the input stream's character encoding
                                      to UTF-8, ensuring proper interpretation of diverse characters. */

process.stdin.on("data", var_received_payload => {
  /* This anonymous function is executed whenever new data arrives on stdin.
   * 'var_received_payload' holds the incoming text as a string. */

  var extracted_segments = var_received_payload.split("\n"); // Divides the input string into an array of lines.

  var first_text_line = extracted_segments[0]; // Retrieves the very first line of text.

  var second_text_line = extracted_segments[1]; // Obtains the second line of text for comparison.

  var common_char_length = first_text_line.length; // Determines the character count of the first line.

  var char_difference_total = 0; // Initializes a counter for character discrepancies.

  // Iterates through each character position, comparing corresponding characters from both lines.
  for (var char_idx = 0; char_idx < common_char_length; char_idx++) {
    // If characters at the current index do not match, increment the discrepancy counter.
    if (first_text_line[char_idx] !== second_text_line[char_idx]) {
      char_difference_total++; // Increment count for each differing character.
    }
  }

  // Logs the final tally of character differences to the standard output.
  console.info(char_difference_total);
});