// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All identifiers, operators, and expressions remain strictly identical.

run(
  function*(write, gets) {
    // Initialize an array to hold counts for 'M', 'A', 'R', 'C', 'H'
    var counts = [0, 0, 0, 0, 0];

    // Read the number of names to process from the input stream
    var n = parseInt(yield, 10);

    // Loop through each name provided in the input
    for (var i = 0; i < n; ++i) {
      var name = yield; // Get the next name from the input stream
      // Use a switch statement to categorize names based on their first character
      switch (name[0]) {
        case 'M':
          ++counts[0]; // Increment count for 'M'
          break;
        case 'A':
          ++counts[1]; // Increment count for 'A'
          break;
        case 'R':
          ++counts[2]; // Increment count for 'R'
          break;
        case 'C':
          ++counts[3]; // Increment count for 'C'
          break;
        case 'H':
          ++counts[4]; // Increment count for 'H'
          break;
        default:
          // Ignore names that do not start with M, A, R, C, H
          break;
      }
    }

    // Variable to store the final answer, initialized to zero
    var ans = 0;

    // Triple nested loop to find combinations of three distinct counts
    // This calculates the sum of products of counts for all unique triplets (i, j, k)
    for (var i = 0; i < 5; ++i)
      for (var j = i + 1; j < 5; ++j)
        for (var k = j + 1; k < 5; ++k) {
          ans += counts[i] * counts[j] * counts[k];
        }

    // Output the final calculated answer to the standard output
    write(ans);
  }
); // End of the main generator function call

/**
 * This JSDoc comment describes the 'main' parameter for the run function.
 * @param {(write: (line: string, end?: string) => void, gets: () => IterableIterator<string|null>) => IterableIterator<any>} main
 * The 'main' parameter is expected to be a generator function that takes 'write' and 'gets'
 * functions as arguments and returns an IterableIterator.
 */
function run(main) {
  // Obtain references to standard input and output streams
  var istream = process.stdin;
  var ostream = process.stdout;

  /**
   * @type {[string|null]} An array to store processed words.
   * These words are yielded by the 'gets' generator to the 'main' generator.
   */
  var words = [];
  /**
   * @type {[string]} An array to store lines read from the input buffer.
   * These lines are raw chunks from the input stream, split by newline characters.
   */
  var lines = [];

  // Buffer to hold partial input data that does not form a complete line yet
  var rest = "";

  // Flag to indicate if the input stream has ended
  var ended = false;

  // Constants for input parsing modes
  var INPUT_MODE_LINE = 0; // Indicates that the 'gets' generator expects a full line
  var INPUT_MODE_WORD = 1; // Indicates that the 'gets' generator expects a single word

  // Current input parsing mode, defaults to word mode for general input processing
  var input_mode = INPUT_MODE_WORD;


  /**
   * Writes a line of text to the output stream.
   *
   * @param {string} line The content string to write.
   * @param {string} [end] Optional string to append after the line. If undefined,
   *                       the OS-specific end-of-line character is used.
   */
  function write(line, end) {
    // Write the line, appending OS-specific EOL unless 'end' is explicitly provided
    ostream.write(line + (undefined === end ? os.EOL : end));
  }


  /**
   * A generator function that provides input to the main application logic.
   * It yields control back to the 'run' function when it needs more input.
   *
   * @yields {string|null} The next word or line from the input, depending on the mode.
   */
  function* gets() {
    // If there are already lines buffered from previous input chunks, return the next one
    if (0 < lines.length) {
      return lines.shift();
    } else {
      // If no lines are buffered, switch to LINE mode to read a full line from the stream
      input_mode = INPUT_MODE_LINE;
      /**
       * @type {string} The line read from the input stream.
       */
      var line = yield; // Pause execution and wait for a line to be provided by 'run'
      input_mode = INPUT_MODE_WORD; // Switch back to word mode after successfully getting a line
      return line;
    }
  }


  // Initialize the main generator function, passing the custom 'write' and 'gets' functions
  var main_itr = main(write, gets);


  /**
   * Processes a chunk of data received from the input stream.
   * This function is a callback for 'data' and 'end' events on the input stream.
   *
   * @param {string|null} chunk The received data chunk, or null if the stream has ended.
   */
  function get_chunk(chunk) {
    istream.pause(); // Pause the input stream to prevent further data events immediately

    if (null === chunk) {
      // If chunk is null, it signifies the end of the input stream
      lines.push(null); // Push a null marker to indicate stream termination
    } else {
      // Append the new chunk to the 'rest' buffer for processing
      rest += chunk;

      // Regular expression to find complete lines (ending with \r\n or \r)
      var line_exp = /.*(\r?\n|\r)/g;
      var line_match,
        lastIndex = 0;

      // Extract all complete lines from the 'rest' buffer
      while (null !== (line_match = line_exp.exec(rest))) {
        lastIndex = line_exp.lastIndex;
        lines.push(line_match[0]); // Push the complete line into the lines buffer
      }
      // Keep any remaining partial line in 'rest' for the next chunk
      rest = rest.substring(lastIndex);
    }

    // Call the main processing loop to handle newly available data
    loop();
  }


  /**
   * The core processing loop for handling input and advancing the main generator.
   * It continuously processes buffered lines and words until no more input is available
   * or the main generator indicates it is done.
   */
  function loop() {
    while (0 < lines.length) {
      // Determine how to process the next item based on the current input_mode
      switch (input_mode) {
        case INPUT_MODE_LINE: {
          // In LINE mode, simply move the next buffered line to the 'words' array
          words.push(lines.shift());
        }
        break; // Exit switch after processing a line
        case INPUT_MODE_WORD: {
          // In WORD mode, handle null lines (stream end) or parse individual words
          if (null === lines[0]) {
            // If the first line is null, it's the end of input, so propagate it
            words.push(lines.shift());
          } else {
            // Regex to find non-whitespace sequences (words)
            var word_exp = /[^\s]+/g;
            var line_match;

            // Attempt to extract a word from the current line
            if (null !== (line_match = word_exp.exec(lines[0]))) {
              words.push(line_match[0]); // Add the found word to the 'words' buffer
              // Update the current line by removing the extracted word
              lines[0] = lines[0].substring(word_exp.lastIndex);
            } else {
              // If no word found (line is empty or only whitespace), discard the line
              lines.shift();
            }
          }
        }
        break; // Exit switch after processing a word or line
      }

      // Process all available words by feeding them to the main generator
      while (0 < words.length) {
        var result = main_itr.next(words.shift()); // Advance the generator with the next word
        if (undefined !== result.value) {
          // If the generator yielded a value, write it to the output stream
          if ('string' === typeof result.value) {
            write(result.value, ""); // Write string directly without adding EOL
          } else {
            write(`${result.value}`, ""); // Convert other types to string and write
          }
        }
        if (result.done) return; // If the generator is done, terminate the run function
      }
    }

    // If no more lines are buffered, either schedule another chunk read (if ended)
    // or resume the input stream to wait for more data.
    ended ?
      setTimeout(get_chunk, 0, null) // If stream ended, ensure final null chunk is processed asynchronously
      :
      process.stdin.resume(); // Otherwise, resume stdin to listen for more incoming data
  }

  // Set up event listeners for the input stream
  istream.on('data', get_chunk); // When data is received, the 'get_chunk' function processes it
  istream.on('end', function() {
    ended = true; // Mark the input stream as having ended
    get_chunk(null); // Process any remaining data and signal end with a null chunk
  });

  // Set the encoding for the input stream to UTF-8
  istream.setEncoding('utf8');

  // Initial call to get_chunk with null to kickstart the process.
  // This allows the main generator to make its first 'yield' request,
  // which will then be fulfilled by subsequent 'get_chunk' calls from actual input data.
  get_chunk(null);
} // End of the 'run' function definition


// Require the 'os' module to access OS-specific information,
// particularly for obtaining the correct end-of-line character.
var os = require('os');