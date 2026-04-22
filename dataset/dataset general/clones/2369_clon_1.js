/*
 *   Module: JSHint Reporter
 *
 *   This module provides a custom reporter function for JSHint results.
 *   It formats and outputs the JSHint errors to the console.
 */
exports.reporter = function ( errors, results )
{
	// Declare main variables for the reporter scope.
	var buffer = '', // Stores the output string to be logged.
		title  = 'error'; // Initial title for error messages.

	/**
	 *   Helper function: numberWang
	 *   Calculates padding spaces based on input.
	 *   @param {number} wangaNumb - The number to base padding on.
	 *   @returns {string} A string of spaces.
	 */
	function numberWang ( wangaNumb )
	{
		// Internal variables for padding calculation.
		var thatsNumberWang = 5 - wangaNumb, // Determine the number of spaces needed.
			stayNumberWang  = '',            // String to build up spaces.
			i;                               // Loop counter.

		// Loop to append spaces.
		for ( i = 0; i < thatsNumberWang; i += 1 )
		{
			stayNumberWang += ' '; // Add a single space.
		}

		return stayNumberWang; // Return the generated space string.
	}


	// Append the file name from the first result to the buffer.
	buffer += '[JSHint: ' + results[0].file + ']\n\n';


	// Check if there are any errors to report.
	if ( errors.length )
	{
		// If more than one error, pluralize the 'title'.
		if ( errors.length > 1 )
		{
			title += 's'; /* Append 's' to make 'errors' */
		}


		// Iterate over each error result.
		errors.forEach( function ( result )
		{
			// Extract the error object from the current result.
			var error = result.error;

			// Format and append the error details to the buffer.
			// This includes padding, line/character numbers, and the reason.
			buffer += numberWang (
				( error.line + error.character.toString() ).length
			) + ' ' + error.line + ',' + error.character + ':' + ' ' + error.reason + '\n';
		} );


		// Add a summary line for the errors.
		buffer += '\n✗ ' + errors.length + ' ' + title + ', double-click above, [F4] for next, [shift-F4] for previous.\n';

	}
	else
	{
		// If no errors, append a success message.
		buffer += '✓ 0 errors, [esc] to hide.\n';
	}


	// Output the accumulated buffer content to the console.
	console.log ( buffer );

}; // End of exports.reporter function.