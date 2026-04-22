( function ( ) {
	var output, Converter ;
	/* This block checks if the environment is CommonJS (like Node.js) or a browser.
	   It determines where to assign the module's output and retrieve the Converter class. */
	if ( typeof exports === "object" && typeof require === "function" )
	{
		// CommonJS environment detected.
		output = exports ;
		Converter = require( "./Markdown.Converter" ).Converter ;
	}
	else
	{
		// Browser environment.
		output = window.Markdown ;
		Converter = output.Converter ;
	}


	output.getSanitizingConverter = function ( ) {
		// Create a new instance of the Markdown Converter.
		var converter = new Converter( ) ;

		// Chain the HTML sanitization and tag balancing hooks.
		converter.hooks.chain( "postConversion", sanitizeHtml ) ;
		converter.hooks.chain( "postConversion", balanceTags ) ;

		// Return the configured converter instance.
		return converter ;
	}


	function sanitizeHtml ( html ) {
		// Replace all HTML tags with their sanitized version.
		return html.replace( /<[^>]*>?/gi, sanitizeTag ) ;
	}


	/*
	 * Whitelist for basic HTML tags.
	 * Includes block-level, inline, and self-closing tags.
	 */
	var basic_tag_whitelist = /^(<\/?(b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|i|kbd|li|ol(?: start="\d+")?|p|pre|s|sup|sub|strong|strike|ul)>|<(br|hr)\s?\/?>)$/i ;
	/*
	 * Whitelist for 'a' (anchor) tags.
	 * Allows 'href' attribute with specific URL patterns and optional 'title'.
	 */
	var a_white = /^(<a\shref="((https?|ftp):\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\stitle="[^"<>]+")?\s?>|<\/a>)$/i ;

	/*
	 * Whitelist for 'img' (image) tags.
	 * Allows 'src' attribute with specific URL patterns, and optional 'width', 'height', 'alt', 'title'.
	 */
	var img_white = /^(<img\ssrc="(https?:\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\swidth="\d{1,3}")?(\sheight="\d{1,3}")?(\salt="[^"<>]*")?(\stitle="[^"<>]*")?\s?\/?>)$/i ;


	function sanitizeTag ( tag ) {
		/*
		 * Checks if the given HTML tag matches any of the allowed whitelists.
		 * If it matches, the tag is returned as is; otherwise, an empty string is returned, effectively removing the tag.
		 */
		if ( tag.match( basic_tag_whitelist ) || tag.match( a_white ) || tag.match( img_white ) ) {
			return tag ;
		}
		else {
			return "" ;
		}
	}


	/**
	 * @summary Attempts to balance HTML tags in the provided string.
	 * @description This function removes unmatched opening or closing tags to ensure valid HTML structure.
	 *              It's crucial that the input HTML has already been sanitized for safety.
	 *              Based on a community snippet for HTML tag balancing.
	 * @param {string} html - The HTML string to balance.
	 * @returns {string} The HTML string with balanced tags.
	 */
	function balanceTags ( html ) {

		// If the input HTML is empty, there's nothing to balance.
		if ( html == "" ) {
			return "" ;
		}

		// Regular expression to find all HTML tags (opening or closing).
		var re = /<\/?\w+[^>]*(\s|$|>)/g ;

		// Convert HTML to lowercase to simplify case-insensitive comparisons for tag names.
		var tags = html.toLowerCase( ).match( re ) ;

		// If no HTML tags are found, return the original HTML.
		var tagcount = ( tags || [ ] ).length ;
		if ( tagcount == 0 ) {
			return html ;
		}

		var tagname, tag ;
		// Tags that are typically self-closing or don't require explicit closing in all contexts.
		var ignoredtags = "<p><img><br><li><hr>" ;
		var match ;
		var tagpaired = [ ] ; // Tracks which tags have found their matching pair.
		var tagremove = [ ] ; // Marks tags for removal if they are unmatched.
		var needsRemoval = false ; // Flag to indicate if any tags need to be removed.

		// Iterate through the matched tags in their original order.
		for ( var ctag = 0; ctag < tagcount; ctag++ ) {
			// Extract the tag name (e.g., from "<div>" get "div").
			tagname = tags[ ctag ].replace( /<\/?(\w+).*/, "$1" ) ;

			// Skip tags that have already been paired or are in the ignore list.
			if ( tagpaired[ ctag ] || ignoredtags.search( "<" + tagname + ">" ) > -1 ) {
				continue ;
			}

			tag = tags[ ctag ] ;
			match = -1 ; // Reset match index.

			// If it's an opening tag (doesn't start with "</").
			if ( ! /^<\//.test( tag ) ) {
				// Search forward for its corresponding closing tag.
				for ( var ntag = ctag + 1; ntag < tagcount; ntag++ ) {
					// Ensure the next tag hasn't been paired yet and is the correct closing tag.
					if ( ! tagpaired[ ntag ] && tags[ ntag ] == "</" + tagname + ">" ) {
						match = ntag ; // Found a match.
						break ;
					}
				}
			}

			// If no matching closing tag was found for an opening tag, or if it's an unmatched closing tag.
			if ( match == -1 ) {
				needsRemoval = tagremove[ ctag ] = true ; // Mark the current tag for removal.
			}
			else {
				tagpaired[ match ] = true ; // Mark the found closing tag as paired.
			}
		}

		// If no tags were marked for removal, return the original HTML.
		if ( ! needsRemoval ) {
			return html ;
		}

		// Remove all orphaned (unmatched) tags from the HTML string.
		var ctag = 0 ;
		html = html.replace( re, function ( match ) {
			// If the tag was marked for removal, replace it with an empty string; otherwise, keep it.
			var res = tagremove[ ctag ] ? "" : match ;
			ctag++ ; // Increment tag counter.
			return res ;
		} ) ;

		// Return the HTML with balanced tags.
		return html ;
	}

} ) ( ) ;