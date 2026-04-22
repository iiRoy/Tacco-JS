/*
 * This section defines the primary application logic.
 * It's wrapped in a 'run' function call, which manages input/output operations.
 */
run ( function * ( write, gets ) {
    // Declare a variable 'n' to store the parsed integer value.
    // The 'yield' keyword is used to retrieve the next input value from the 'gets' generator.
    var n = parseInt( yield, 10 );

    // Calculate the floor of 'n' divided by 3, and then output the result.
    // The 'write' function is used for sending output to the standard output stream.
    write( Math.floor( n / 3 ) );
} );

/*
 * JSDoc comment block for the 'run' function.
 * This function serves as a wrapper to execute the main program logic,
 * handling asynchronous input/output operations through generators.
 *
 * @param {(write: (line: string, end?: string) => void, gets: () => IterableIterator<string|null>) => IterableIterator<any>} main
 *        The main generator function containing the application's core logic.
 *        It receives 'write' and 'gets' utility functions as arguments.
 */
function run ( main ) {
    // Obtain references to the standard input and output streams.
    // These are crucial for performing I/O operations.
    var istream = process.stdin;
    var ostream = process.stdout;

    // --- Internal State Variables for Input Processing ---

    /*
     * @type {[string|null]} An array to store processed words or lines.
     * This acts as a buffer for data yielded by the input stream.
     */
    var words = [ ];

    /*
     * @type {[string]} An array to store lines read from the input stream.
     * New data chunks are appended here and then processed into words.
     */
    var lines = [ ];

    // 'rest' holds any incomplete line data from the last chunk.
    var rest = "";

    // 'ended' flag indicates if the input stream has signaled its end.
    var ended = false;

    // Constants defining the input processing modes.
    // INPUT_MODE_LINE expects entire lines.
    var INPUT_MODE_LINE = 0;
    // INPUT_MODE_WORD expects individual words.
    var INPUT_MODE_WORD = 1;

    // The current input processing mode, initialized to word mode.
    var input_mode = INPUT_MODE_WORD;

    // --- Utility Function: 'write' ---

    /*
     * @param {string} line The content to be written to the output stream.
     * @param {string} [end] Optional string to append after 'line'. Defaults to the OS's newline character.
     *
     * This function ensures efficient writing to stdout by corking and uncorking the stream.
     */
    function write ( line, end ) {
        // Prevent multiple small writes from causing performance issues.
        ostream.cork( );
        // Write the provided line, appending either the specified 'end' string or a system-specific newline.
        ostream.write( line + ( undefined === end ? os.EOL : end ) );
        // Flush the buffered output to the actual stream.
        ostream.uncork( );
    }

    // --- Utility Generator Function: 'gets' ---

    /*
     * This generator function is responsible for providing input values (lines or words)
     * to the main program logic. It handles buffering and switching between input modes.
     */
    function * gets ( ) {
        // Check if there are already buffered lines available.
        if ( 0 < lines.length ) {
            // If yes, return the first buffered line and remove it from the buffer.
            return lines.shift( );
        } else {
            // If no lines are buffered, switch to LINE input mode to request a full line.
            input_mode = INPUT_MODE_LINE;

            /*
             * @type {string} The received line from the main generator's 'yield'.
             * This will pause execution until the next input chunk is processed and a line is ready.
             */
            var line = yield;

            // After receiving a line, revert to WORD input mode for subsequent requests.
            input_mode = INPUT_MODE_WORD;

            // Return the received line.
            return line;
        }
    }

    // Initialize the main program's generator iterator.
    // This starts the execution of the main logic, providing it with the 'write' and 'gets' utilities.
    var main_itr = main( write, gets );

    // --- Input Chunk Handler: 'get_chunk' ---

    /*
     * @param {string|null} chunk The incoming data chunk from the standard input stream.
     *                           'null' signifies the end of the input stream.
     *
     * This function processes raw input chunks, parses them into lines, and triggers the main loop.
     */
    function get_chunk ( chunk ) {
        // Pause the input stream to prevent new 'data' events while processing the current chunk.
        istream.pause( );

        // Handle the case where the input stream has ended.
        if ( null === chunk ) {
            // Push a null marker to indicate end-of-input for the 'lines' buffer.
            lines.push( null );
        } else {
            // Append the new chunk to any remaining 'rest' data from previous chunks.
            rest += chunk;

            // Regular expression to find complete lines (ending with \r\n or \r).
            var line_exp = /.*(\r?\n|\r)/g;
            var line_match, lastIndex = 0;

            // Iterate and extract all complete lines from the 'rest' buffer.
            while ( null !== ( line_match = line_exp.exec( rest ) ) ) {
                lastIndex = line_exp.lastIndex;
                lines.push( line_match[ 0 ] );
            }

            // Update 'rest' to contain only the incomplete part of the last chunk.
            rest = rest.substring( lastIndex );
        }

        // After processing the chunk, initiate or continue the main processing loop.
        loop( );
    }

    // --- Main Processing Loop: 'loop' ---

    /*
     * This function continuously processes buffered input (lines and words)
     * and feeds them to the main application logic via the 'main_itr' generator.
     */
    function loop ( ) {
        // Continue processing as long as there are lines in the buffer.
        while ( 0 < lines.length ) {
            // Determine how to process the next input based on the current 'input_mode'.
            switch ( input_mode ) {
                case INPUT_MODE_LINE:
                {
                    // In LINE mode, the entire next line is pushed to 'words'.
                    words.push( lines.shift( ) );
                }
                break; // Exit the switch block.

                case INPUT_MODE_WORD:
                {
                    // In WORD mode, check if the first line in the buffer is an end-of-input marker.
                    if ( null === lines[ 0 ] ) {
                        // If it's an end marker, push it to 'words' and remove it from 'lines'.
                        words.push( lines.shift( ) );
                    } else {
                        // Otherwise, parse words from the current line.
                        var word_exp = /[^\s]+/g; // Regex to find non-whitespace sequences.
                        var line_match;

                        // Attempt to extract the next word.
                        if ( null !== ( line_match = word_exp.exec( lines[ 0 ] ) ) ) {
                            // If a word is found, push it to 'words'.
                            words.push( line_match[ 0 ] );
                            // Remove the extracted word from the current line.
                            lines[ 0 ] = lines[ 0 ].substring( word_exp.lastIndex );
                        } else {
                            // If no words are found in the current line (e.g., it was just whitespace),
                            // discard this line and move to the next.
                            lines.shift( );
                        }
                    }
                }
                break; // Exit the switch block.
            }

            // After populating 'words' (either with a line or a word),
            // feed these to the main generator until 'words' is empty or the generator is done.
            while ( 0 < words.length ) {
                // Advance the main generator, passing the next word/line as its 'yield' result.
                var result = main_itr.next( words.shift( ) );

                // Check if the generator yielded a value to be output.
                if ( undefined !== result.value ) {
                    // If the yielded value is a string, write it directly.
                    if ( 'string' === typeof result.value ) {
                        write( result.value, "" );
                    } else {
                        // Otherwise, convert the value to a string and write it.
                        write( `${ result.value }`, "" );
                    }
                }

                // If the main generator has completed its execution, exit the 'run' function.
                if ( result.done ) return;
            }
        }

        // After exhausting all buffered lines, decide whether to continue or end.
        // If 'ended' is true, schedule a final 'get_chunk(null)' call to signal end-of-input.
        // Otherwise, resume the stdin stream to listen for more data.
        ended ? setTimeout( get_chunk, 0, null ) : process.stdin.resume( );
    }

    // --- Event Listeners for Standard Input ---

    // Attach a listener for 'data' events to process incoming chunks.
    process.stdin.on( 'data', get_chunk );

    // Attach a listener for the 'end' event, signaling the close of the input stream.
    process.stdin.on( 'end', function ( ) {
        // Set the 'ended' flag to true.
        ended = true;
        // Process the final chunk (which will be 'null' due to the end of stream).
        get_chunk( null );
    } );

    // --- Initial Setup ---

    // Set the encoding for the standard input stream to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Initiate the input processing by calling 'get_chunk' with 'null'.
    // This primes the system, allowing the 'loop' to start and potentially resume stdin.
    get_chunk( null );
};

/*
 * Require the 'os' module to access operating system specific functionalities,
 * such as the end-of-line character (os.EOL).
 */
var os = require( 'os' );