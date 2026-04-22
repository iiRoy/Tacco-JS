run( function * ( write , gets ) {
  // Declare and initialize variables for the main logic.
  // 'n' will store the number of iterations, parsed from the input.
  var n = + ( yield ) ;

  // 'cost' will store intermediate cost differences.
  var cost = [ ] ;

  // 'accum' will accumulate the absolute differences.
  var accum = 0 ;

  // 'x' holds the previous value from the input.
  var x = 0 ;

  // Loop 'n' times to process the input values.
  for ( var i = 0 ; i < n ; ++ i ) {
    // Read the next value 'y' from the input, parsed as a number.
    var y = + ( yield ) ;

    // Calculate the difference and push it to the 'cost' array.
    cost.push( x - y ) ;

    // Add the absolute difference to the accumulator.
    accum += Math.abs( x - y ) ;

    // Update 'x' for the next iteration.
    x = y ;
  } // End of the main processing loop.

  // After the loop, handle the final segment's cost to 0.
  cost.push( x - 0 ) ;
  accum += Math.abs( x - 0 ) ;

  // Initialize a string builder for the output.
  var builder = "" ;

  // Calculate and append results to the builder.
  for ( var i = 0 ; i < n ; ++ i ) {
    // The core calculation for each line of output.
    builder += ( accum - Math.abs( cost[ i ] ) - Math.abs( cost[ i + 1 ] ) + Math.abs( cost[ i ] + cost[ i + 1 ] ) ) ;
    // Append a newline character for formatting.
    builder += os.EOL ;
  }

  // Output the final built string to the console.
  console.log( builder ) ;
} ) ;

/**
 * A comprehensive JSDoc comment for the 'run' function.
 * This function orchestrates the execution of a generator-based main logic,
 * handling input (via 'gets') and output (via 'write') streams.
 *
 * @param { (write: (line: string, end?: string) => void, gets: () => IterableIterator<string|null>) => IterableIterator<any> } main
 *   The main generator function that contains the application logic.
 *   It receives 'write' for output and 'gets' for input.
 */
function run( main ) {
  // Obtain references to standard input and output streams.
  var istream = process.stdin ;
  var ostream = process.stdout ;

  /**
   * An array to buffer processed words/lines from the input.
   * @type { [ string | null ] }
   */
  var words = [ ] ;

  /**
   * An array to buffer raw lines read from the input stream.
   * @type { [ string ] }
   */
  var lines = [ ] ;

  // Stores any remaining part of a chunk that doesn't form a complete line.
  var rest = "" ;

  // Flag to indicate if the input stream has ended.
  var ended = false ;

  // Constants for input parsing modes.
  var INPUT_MODE_LINE = 0 ; // Process input as whole lines.
  var INPUT_MODE_WORD = 1 ; // Process input as individual words.

  // The current input parsing mode, defaults to word mode.
  var input_mode = INPUT_MODE_WORD ;

  /**
   * Writes a line to the output stream, followed by a specified end character
   * or a default operating system end-of-line character.
   *
   * @param { string } line - The string content to write.
   * @param { string } [ end ] - Optional: The string to append after the line.
   *   If undefined, `os.EOL` is used.
   */
  function write( line , end ) {
    ostream.write( line + ( undefined === end ? os.EOL : end ) ) ;
  }

  /**
   * A generator function that provides input to the main logic.
   * It handles switching between line and word input modes implicitly.
   *
   * @yields { string | null } The next word or line from the input.
   */
  function * gets ( ) {
    // If there are buffered lines, return the next one.
    if ( 0 < lines.length ) {
      return lines.shift( ) ;
    } else {
      // Switch to line input mode to request a full line.
      input_mode = INPUT_MODE_LINE ;

      /**
       * The line yielded from the main generator.
       * @type { string }
       */
      var line = yield ;

      // Switch back to word input mode after receiving the line.
      input_mode = INPUT_MODE_WORD ;
      return line ;
    }
  }

  // Initialize the main generator function.
  var main_itr = main( write , gets ) ;

  /**
   * Processes a chunk of data received from the input stream.
   * This function is responsible for buffering and parsing lines.
   *
   * @param { string | null } chunk - The received data chunk, or null if the stream ended.
   */
  function get_chunk ( chunk ) {
    // Pause the input stream to prevent further 'data' events during processing.
    istream.pause( ) ;

    // If the chunk is null, it signifies the end of the input stream.
    if ( null === chunk ) {
      lines.push( null ) ;
    } else {
      // Append the new chunk to any remaining data.
      rest += chunk ;

      // Regular expression to find complete lines (including newlines).
      var line_exp = /.*(\r?\n|\r)/g ;
      var line_match , lastIndex = 0 ;

      // Extract all complete lines from the 'rest' buffer.
      while ( null !== ( line_match = line_exp.exec( rest ) ) ) {
        lastIndex = line_exp.lastIndex ;
        lines.push( line_match[ 0 ] ) ;
      }

      // Update 'rest' to contain only the incomplete part.
      rest = rest.substring( lastIndex ) ;
    }
    // Continue processing the buffered input.
    loop( ) ;
  }

  /**
   * The main processing loop that feeds input to the generator and handles output.
   * It continuously processes buffered lines and words until the main generator is done
   * or more input is needed.
   */
  function loop ( ) {
    // Process buffered lines until empty.
    while ( 0 < lines.length ) {
      // Determine how to parse the input based on the current mode.
      switch ( input_mode ) {
        case INPUT_MODE_LINE:
        {
          // In line mode, push the entire line to 'words'.
          words.push( lines.shift( ) ) ;
        }
        break ;

        case INPUT_MODE_WORD:
        {
          // In word mode, check if the current line is null (end of stream).
          if ( null === lines[ 0 ] ) {
            words.push( lines.shift( ) ) ;
          } else {
            // Regular expression to extract a single word (non-whitespace characters).
            var word_exp = /[^ \s]+/g ;
            var line_match ;

            // Attempt to extract a word from the current line.
            if ( null !== ( line_match = word_exp.exec( lines[ 0 ] ) ) ) {
              words.push( line_match[ 0 ] ) ;
              // Remove the extracted word from the line.
              lines[ 0 ] = lines[ 0 ].substring( word_exp.lastIndex ) ;
            } else {
              // If no word is found, the line is empty or only whitespace, so discard it.
              lines.shift( ) ;
            }
          }
        }
        break ;
      }

      // Feed buffered words to the main generator.
      while ( 0 < words.length ) {
        var result = main_itr.next( words.shift( ) ) ;

        // If the generator yielded a value, write it to output.
        if ( undefined !== result.value ) {
          if ( 'string' === typeof result.value ) {
            write( result.value , "" ) ; // Write string value directly.
          } else {
            write( `${ result.value }` , "" ) ; // Convert other values to string.
          }
        }

        // If the generator is done, exit the function.
        if ( result.done ) return ;
      }
    }

    // If no more buffered input, either signal end or resume stream.
    ended ? setTimeout( get_chunk , 0 , null ) : istream.resume( ) ;
  }

  // Set up event listeners for the input stream.
  istream.on( 'data' , get_chunk ) ; // Process data chunks.
  istream.on( 'end' , function ( ) {
    ended = true ; // Mark stream as ended.
    get_chunk( null ) ; // Process final (null) chunk.
  } ) ;

  // Set the encoding for the input stream.
  istream.setEncoding( 'utf8' ) ;
  // Kick off the processing by simulating an initial empty chunk.
  get_chunk( null ) ;
} ; // End of run function definition.

// Require the 'os' module to access operating system specific functionalities,
// such as the end-of-line character.
var os = require( 'os' ) ;