run(function*(write,gets)
{
	// This is the main program logic, executed as a generator function.
	// It reads input, performs calculations, and writes output.

	var n = +(yield) ;		// Read the first number 'n' from input.
	var cost = [ ] ;		// Initialize an array to store cost differences.
	var accum = 0 ;			// Initialize an accumulator for absolute differences.
	var x = 0 ;				// Initialize 'x' to 0 for the first calculation.

	// Loop 'n' times to process subsequent inputs.
	for ( var i = 0 ; i < n ; ++i )
	{
		var y = +(yield) ;		// Read the next number 'y' from input.
		cost.push(x - y) ;		// Calculate difference (x - y) and add to 'cost' array.
		accum += Math.abs(x - y) ;	// Add the absolute difference to 'accum'.
		x = y ;					// Update 'x' to the current 'y' for the next iteration.
	}

	// After the loop, handle the last segment (from 'x' to 0).
	cost.push(x - 0) ;			// Calculate difference (x - 0) and add to 'cost'.
	accum += Math.abs(x - 0) ;	// Add the absolute difference to 'accum'.

	var builder = "" ;			// Initialize an empty string to build the output.

	// Loop 'n' times to calculate and append values to the builder string.
	// This calculation involves 'accum' and absolute values of 'cost' elements.
	for ( var i = 0 ; i < n ; ++i )
	{
		builder += (accum - Math.abs(cost[i]) - Math.abs(cost[i + 1]) + Math.abs(cost[i] + cost[i + 1])) ;
	}

	write(builder) ; // Write the final built string to output.
}
) ; // End of the main generator function passed to `run`.

/**
 * @param {(write: (line: string, end?: string) => void, gets: () => IterableIterator<string|null>) => IterableIterator<any>} main
 * This JSDoc defines the `main` parameter as a function that takes `write` and `gets`
 * and returns an IterableIterator.
 */
function run (main) {
	// Standard input and output streams for Node.js.
	var istream = process.stdin ;
	var ostream = process.stdout ;

	/**
	 * @type {[string|null]}
	 * An array to buffer words read from input.
	 */
	var words = [ ] ;

	/**
	 * @type {[string]}
	 * An array to buffer full lines read from input.
	 */
	var lines = [ ] ;

	var rest = "" ;				// Stores any remaining partial data from input chunks.
	var ended = false ;			// Flag to indicate if the input stream has ended.

	// Constants to define input reading modes.
	var INPUT_MODE_LINE = 0 ;	// Read input line by line.
	var INPUT_MODE_WORD = 1 ;	// Read input word by word (default).

	var input_mode = INPUT_MODE_WORD ;	// Current input reading mode.

	/**
	 * @param {string} line
	 * @param {string} [end]
	 * Function to write a line to the output stream. Appends a newline by default.
	 */
	function write ( line , end )
	{
		// If 'end' is undefined, use the system's end-of-line character. Otherwise, use 'end'.
		ostream.write(line + (undefined === end ? os.EOL : end)) ;
	}

	/**
	 * @generator
	 * Generator function to get input.
	 * It can either return a buffered line or yield to wait for new input.
	 */
	function *gets ( )
	{
		if (0 < lines.length)
		{
			// If there are buffered lines, return the first one.
			return lines.shift() ;
		}
		else
		{
			// If no buffered lines, switch to line input mode and yield for new input.
			input_mode = INPUT_MODE_LINE ;
			/**
			 * @type {string}
			 * The line received from the yield.
			 */
			var line = yield ;
			input_mode = INPUT_MODE_WORD ; // Switch back to word input mode.
			return line ;
		}
	}

	// Initialize the main generator with the write and gets functions.
	var main_itr = main(write, gets) ;

	/**
	 * @param {string|null} chunk
	 * Callback function for incoming data chunks from stdin.
	 */
	function get_chunk (chunk)
	{
		istream.pause() ; // Pause the input stream to process the current chunk.

		if (null === chunk)
		{
			// If chunk is null, it signifies the end of the input stream.
			lines.push(null) ;
		}
		else
		{
			// Append the new chunk to the 'rest' buffer.
			rest += chunk ;

			// Regular expression to find lines (ending with newline characters).
			var line_exp = /.*(\r?\n|\r)/g ;
			var line_match, lastIndex = 0 ;

			// Extract all complete lines from the 'rest' buffer.
			while (null !== (line_match = line_exp.exec(rest)))
			{
				lastIndex = line_exp.lastIndex ;
				lines.push(line_match[0]) ;
			}
			// Keep any remaining partial data in 'rest'.
			rest = rest.substring(lastIndex) ;
		}
		loop() ; // Continue processing after receiving a chunk.
	}

	/**
	 * Main processing loop. It drains buffered input and advances the main generator.
	 */
	function loop ()
	{
		// Process buffered lines as long as they exist.
		while (0 < lines.length)
		{
			// Determine how to process the next input based on the current mode.
			switch (input_mode)
			{
				case INPUT_MODE_LINE:
				{
					// If in line mode, just push the whole line as a word.
					words.push(lines.shift()) ;
				}
				break ; // Exit switch case.

				case INPUT_MODE_WORD:
				{
					// If in word mode.
					if (null === lines[0])
					{
						// If the first line is null (end of input), push it.
						words.push(lines.shift()) ;
					}
					else
					{
						// Otherwise, extract a word from the current line.
						var word_exp = /[^\s]+/g ; // Regex to find non-whitespace sequences (words).
						var line_match ;

						if (null !== (line_match = word_exp.exec(lines[0])))
						{
							// If a word is found, push it to 'words' buffer.
							words.push(line_match[0]) ;
							// Remove the extracted word from the current line.
							lines[0] = lines[0].substring(word_exp.lastIndex) ;
						}
						else
						{
							// If no word is found in the current line, discard the line.
							lines.shift() ;
						}
					}
				}
				break ; // Exit switch case.
			}

			// While there are buffered words, feed them to the main generator.
			while (0 < words.length)
			{
				// Advance the main generator with the next word.
				var result = main_itr.next(words.shift()) ;

				if (undefined !== result.value)
				{
					// If the generator yielded a value, write it to output.
					if ('string' === typeof result.value)
					{
						write(result.value, "") ; // Write string value without newline.
					}
					else
					{
						// Convert other types to string and write.
						write(`${result.value}`, "") ;
					}
				}
				if (result.done) return ; // If the generator is done, exit the run function.
			}
		}

		// If all buffered input is processed, either schedule a null chunk
		// (if input ended) or resume the input stream to get more data.
		ended ? setTimeout(get_chunk, 0, null) : istream.resume() ;
	}

	istream.on('data', get_chunk) ; // Event listener for incoming data.
	istream.on('end', function () {
		ended = true ; // Set 'ended' flag when input stream finishes.
		get_chunk(null) ; // Process the end of stream.
	});

	istream.setEncoding('utf8') ; // Set input stream encoding.
	get_chunk(null) ; // Initiate the process by calling get_chunk with null (to start loop).
} ; // End of the 'run' function.

// Require the 'os' module to get platform-specific end-of-line characters.
var os = require('os') ;