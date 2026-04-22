/*
 * This file implements a jQuery plugin based on Clippy, a Flash-based
 * clipboard copy tool. It allows users to easily copy text to their
 * clipboard from a web page.
 *
 * Clippy project: https://github.com/mojombo/clippy
 *
 * Please note: This plugin relies on Flash technology, which may
 * have varying levels of support across different browsers and
 * operating systems. Your mileage may vary.
 */


( function( $ )
{

	/**
	 * jQuery plugin for Clippy integration.
	 * @param {object} opts - Configuration options for Clippy.
	 */
	$.fn.clippy = function( opts )
	{

		// Define default configuration options for the Clippy instance.
		var _opts = {
			'width'       : '14',         // Default width of the Flash object.
			'height'      : '14',         // Default height of the Flash object.
			'color'       : '#ffffff',    // Background color of the Flash object.
			'clippy_path' : 'clippy.swf', // Path to the Clippy SWF file.
			'keep_text'   : false         // Whether to keep the original text after embedding Clippy.
		};


		// Merge user-provided options with the defaults.
		opts = $.extend( _opts, opts );


		// Parameters for the Flash <object> and <param> tags.
		var params = {
			'movie'           : opts.clippy_path,
			'allowScriptAccess' : 'always',
			'quality'         : 'high',
			'scale'           : 'noscale',
			'bgcolor'         : opts.color
		};


		// Prepare parameters specifically for the <embed> tag.
		// These are derived from `params` but include width and height
		// directly, and `src` instead of `movie`.
		var embed_params = $.extend( { }, params, {
			'width'  : opts.width,
			'height' : opts.height
		} );

		// The 'movie' parameter for <object> becomes 'src' for <embed>.
		embed_params.src = embed_params.movie;

		// Remove the 'movie' parameter as it's not used in <embed> directly.
		delete embed_params.movie;


		// Iterate over each element in the jQuery selection.
		this.each( function( idx, val )
		{

			var text; // Variable to hold the text to be copied.

			// Determine the text to be copied based on options or element data/content.
			if ( opts.text && opts.text != '' )
			{
				text = opts.text; // Use text from options if provided.
			}
			else if ( $( val ).data( 'text' ) && $( val ).data( 'text' ) != '' )
			{
				text = $( val ).data( 'text' ); // Use text from data attribute if available.
			}
			else
			{
				text = $( val ).text( ); // Fallback to element's inner text.
			}


			// The text must be URI-encoded for FlashVars, as specified by Clippy.
			// See: https://github.com/mojombo/clippy/pull/9
			text = encodeURIComponent( text );


			// Set FlashVars for both object and embed, containing the encoded text.
			params.FlashVars      = 'text=' + text;
			embed_params.FlashVars = 'text=' + text;


			// Construct the Flash object and embed elements.
			// The structure follows the example provided in the Clippy README.

			// Create the <object> element.
			var dom = $( '<object />' ).attr( {
				'classid' : 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
				'width'   : opts.width,
				'height'  : opts.height
			} );

			// Create the <embed> element.
			var embed = $( '<embed />' ).attr( embed_params );


			// Attempt to append the <embed> to the <object> and then add <param>s.
			try
			{
				// Append <embed> as a child of <object>.
				dom.append( embed );

				// Prepend <param> elements to the <object>.
				// Each parameter in `params` becomes a <param> tag.
				$.each( params, function( idx2, val2 )
				{
					dom.prepend( $( '<param />' ).attr( {
						'name'  : idx2,
						'value' : val2
					} ) );
				} );
			}
			catch ( e )
			{
				// In some browsers (e.g., IE), appending <embed> to <object>
				// directly might not be allowed or cause issues.
				// In such cases, we fallback to using just the <embed> element.
				dom = embed;
			}


			// Decide how to update the element's content based on `keep_text` option.
			if ( opts.keep_text )
			{
				// If `keep_text` is true, embed Clippy and then append the original text.
				$( val ).html( dom ).append( decodeURIComponent( text ) );
			}
			else
			{
				// Otherwise, replace the element's entire content with the Clippy button.
				$( val ).html( dom );
			}

		} ); // End of this.each()

	}; // End of $.fn.clippy

} )( jQuery ); // End of IIFE