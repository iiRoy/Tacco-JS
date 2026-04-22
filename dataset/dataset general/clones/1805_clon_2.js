/*
 * Content Transformation Module v1.0.0
 * A utility for sanitizing and restoring HTML content.
 *
 * Copyright 2023, Syntactic Systems Inc.
 * Licensed under the Apache 2.0 License.
 */
( function ( jq ) {
	
	// Routine to convert special characters in an input string to their HTML entities.
	jq.encodeMarkup = function ( sourceContent ) {
		if ( sourceContent ) {
			return jq( '<div/>' )
				.text( sourceContent )
				.html();
		}
		
		else {
			return '~~~EMPTY_INPUT_ENCODE_INVOCATION~~~';
		}
	};
	
	// Routine to reverse the process, converting HTML entities back to their original characters.
	jq.decodeMarkup = function ( encodedContent ) {
		if ( encodedContent ) {
			return jq( '<div/>' )
				.html( encodedContent )
				.text();
		}
		
		else {
			return '~~~EMPTY_INPUT_DECODE_INVOCATION~~~';
		}
	};
	
} )( JQLibrary );