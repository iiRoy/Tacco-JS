run ( function   *   ( write ,   gets )   {
	// Initialize variables for white and black counts
	var white   =   + ( yield )   -   1 ; // Get white count from input, convert to number, subtract 1
	var black   =   + ( yield )   -   1 ; // Get black count from input, convert to number, subtract 1


	// Calculate and write the initial line based on white and black counts
	write ( ` ${ Math . floor ( ( white   -   1 )   /   50 )   *   2   +   2   +   Math . floor ( ( black   -   1 )   /   50 )   *   2   +   2 }   100 ` ) ;

	// Loop to generate lines for 'white' segments
	do   {
		var line0   =   "" ,   line1   =   "" ; // Initialize two line buffers for output

		// Iterate to build the lines in chunks of 2 characters
		for   ( var i   =   0 ;   i   <   100 ;   i   +=   2 )   {

			// If there's still 'white' remaining, add the pattern ".#" and "##"
			if   ( 0   <   white )   {
				line0   +=   ".#" ;
				line1   +=   "##" ;
				-- white ; // Decrement white count
			}   else   {
				// Otherwise, add "##" for both lines (filler)
				line0   +=   "##" ;
				line1   +=   "##" ;
			}
		}

		// Write the generated lines
		write ( line0 ) ;
		write ( line1 ) ;
	}   while   ( 0   <   white ) ; // Continue as long as white count is positive


	// Loop to generate lines for 'black' segments
	do   {
		var line0   =   "" ,   line1   =   "" ; // Initialize two new line buffers

		// Iterate to build the lines in chunks of 2 characters
		for   ( var i   =   0 ;   i   <   100 ;   i   +=   2 )   {
			// If there's still 'black' remaining, add the pattern ".." and "#."
			if   ( 0   <   black )   {
				line0   +=   ".." ;
				line1   +=   "#." ;
				-- black ; // Decrement black count
			}   else   {
				// Otherwise, add ".." for both lines (filler)
				line0   +=   ".." ;
				line1   +=   ".." ;
			}
		}

		// Write the generated lines
		write ( line0 ) ;
		write ( line1 ) ;
	}   while   ( 0   <   black ) ; // Continue as long as black count is positive
} ) ;


/**
 * @param {(write: (line: string, end?: string) => void, gets: () => IterableIterator<string|null>) => IterableIterator<any>} main
 * This function sets up the environment for running a generator-based main program,
 * handling input (from stdin) and output (to stdout).
 */
function   run   ( main )   {
	var istream   =   process . stdin ; // Standard input stream
	var ostream   =   process . stdout ; // Standard output stream


	/**
	 * @type {[string|null]}
	 * Buffer for parsed words/lines to be passed to the generator.
	 */
	var words   =   [ ] ;

	/**
	 * @type {[string]}
	 * Buffer for raw lines read from input.
	 */
	var lines   =   [ ] ;
	var rest   =   "" ; // Remaining partial line from input chunk
	var ended   =   false ; // Flag to indicate if input stream has ended

	// Input parsing modes
	var INPUT_MODE_LINE   =   0 ;
	var INPUT_MODE_WORD   =   1 ;
	var input_mode   =   INPUT_MODE_WORD ; // Default input mode


	/**
	 * @param {string} line
	 * @param {string} [end]
	 * Writes a line to the output stream, appending a newline or custom 'end' string.
	 */
	function   write   ( line ,   end )   {
		ostream . write ( line   +   ( undefined   ===   end   ?   os . EOL   :   end ) ) ;
	}

	/**
	 * Generator function to retrieve input.
	 * It yields when a line is requested and not immediately available.
	 */
	function   * gets   ( )   {
		if   ( 0   <   lines . length )   {
			// If there are buffered lines, return the first one
			return   lines . shift ( ) ;
		}   else   {
			// Otherwise, switch to LINE input mode and wait for a line
			input_mode   =   INPUT_MODE_LINE ;
			/**
			 * @type {string}
			 * The yielded value will be the next line of input.
			 */
			var line   =   yield ;
			input_mode   =   INPUT_MODE_WORD ; // Switch back to WORD input mode
			return   line ;
		}
	}

	// Initialize the main generator with write and gets functions
	var main_itr   =   main ( write ,   gets ) ;


	/**
	 * @param {string|null} chunk
	 * Processes a chunk of data from the input stream.
	 */
	function   get_chunk   ( chunk )   {
		istream . pause ( ) ; // Pause the input stream to process the chunk

		if   ( null   ===   chunk )   {
			lines . push ( null ) ; // If chunk is null, it signifies end of input
		}   else   {
			rest   +=   chunk ; // Append new chunk to remaining data
			var line_exp   =   /.*(\r?\n|\r)/g ; // Regex to find complete lines
			var line_match ,   lastIndex   =   0 ;

			// Extract all complete lines from 'rest'
			while   ( null   !==   ( line_match   =   line_exp . exec ( rest ) ) )   {
				lastIndex   =   line_exp . lastIndex ;
				lines . push ( line_match [ 0 ] ) ;
			}
			rest   =   rest . substring ( lastIndex ) ; // Keep any remaining partial line
		}
		loop ( ) ; // Continue processing
	}


	/**
	 * Main processing loop.
	 * Processes buffered lines/words and feeds them to the main generator.
	 */
	function   loop   ( )   {
		while   ( 0   <   lines . length )   {
			switch   ( input_mode )   {
				case   INPUT_MODE_LINE :
				{
					// In LINE mode, push the whole line to words buffer
					words . push ( lines . shift ( ) ) ;
				}
				break ;
				case   INPUT_MODE_WORD :
				{
					// In WORD mode
					if   ( null   ===   lines [ 0 ] )   {
						// If line is null (end of input), push it to words
						words . push ( lines . shift ( ) ) ;
					}   else   {
						// Otherwise, extract the first word from the line
						var word_exp   =   /[^\s]+/g ; // Regex to find a word (non-whitespace sequence)
						var line_match ;

						if   ( null   !==   ( line_match   =   word_exp . exec ( lines [ 0 ] ) ) )   {
							words . push ( line_match [ 0 ] ) ; // Push the found word
							lines [ 0 ]   =   lines [ 0 ] . substring ( word_exp . lastIndex ) ; // Remove word from line
						}   else   {
							lines . shift ( ) ; // If no word found, discard the line
						}
					}
				}
				break ;
			}

			// Process all available words
			while   ( 0   <   words . length )   {
				var result   =   main_itr . next ( words . shift ( ) ) ; // Advance the main generator

				if   ( undefined   !==   result . value )   {
					// If the generator yielded a value, write it to output
					if   ( 'string'   ===   typeof   result . value )   {
						write ( result . value ,   "" ) ;
					}   else   {
						write ( ` ${ result . value } ` ,   "" ) ;
					}
				}
				if   ( result . done )   return ; // If generator is done, exit
			}
		}

		// If no more lines to process, either schedule a null chunk (if ended) or resume input stream
		ended   ?   setTimeout ( get_chunk ,   0 ,   null )   :   istream . resume ( ) ;
	}

	// Attach data event listener to process incoming chunks
	istream . on ( 'data' ,   get_chunk ) ;

	// Attach end event listener to signal end of input
	istream . on ( 'end' ,   function   ( )   {
		ended   =   true ;
		get_chunk ( null ) ; // Process final null chunk
	} ) ;

	istream . setEncoding ( 'utf8' ) ; // Set input stream encoding
	get_chunk ( null ) ; // Start the processing by feeding an initial null chunk (no data yet)
} ;


// Require the 'os' module for platform-specific end-of-line character
var os   =   require ( 'os' ) ;