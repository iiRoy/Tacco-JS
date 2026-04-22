/*
 * This is a Type I clone of the original classList.js script.
 * The purpose of this file is to demonstrate identical functionality
 * while having significant changes in whitespace and comments.
 * All original identifiers, operators, and expressions are preserved.
 *
 * Source: Original classList.js by Eli Grey (http://eligrey.com)
 * Date: A recent adaptation for cloning purposes.
 * License: Public Domain, use at your own risk, as per original.
 *
 * This cloned version retains the full cross-browser classList implementation.
 */


 /*global self, document, DOMException */

// The following line indicates the original source of the script.
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/


// Check if 'document' exists in the global 'self' object,
// and if 'classList' is NOT natively supported by elements.
if ( "document" in self && !(
		"classList" in document.createElement("_") && // Check for standard elements
		"classList" in document.createElementNS("http://www.w3.org/2000/svg", "svg") // Check for SVG elements
	) ) {

	// This is an immediately invoked function expression (IIFE)
	// to encapsulate the logic and prevent global variable pollution.
	( function ( view ) {

		"use strict" ; // Enforce strict mode for cleaner code.

		// If 'Element' is not defined in the view, there's nothing to do.
		if ( ! ( 'Element' in view ) ) return ;


		var // Declare multiple variables.
			  classListProp = "classList" // The name of the property to be added.
			, protoProp = "prototype" // Shorthand for 'prototype' string.
			, elemCtrProto = view.Element[ protoProp ] // Prototype of the Element constructor.
			, objCtr = Object // Reference to the native Object constructor.
			, strTrim = String[ protoProp ].trim || function ( ) { // Polyfill for String.prototype.trim.
				return this.replace( /^\s+|\s+$/g , "" ) ;
			}
			, arrIndexOf = Array[ protoProp ].indexOf || function ( item ) { // Polyfill for Array.prototype.indexOf.
				var // Declare loop variables.
					  i = 0
					, len = this.length
				;
				for ( ; i < len ; i++ ) { // Iterate through array elements.
					if ( i in this && this[ i ] === item ) {
						return i ; // Return index if item is found.
					}
				}
				return -1 ; // Return -1 if item is not found.
			}
			// Vendors: please allow content code to instantiate DOMExceptions
			, DOMEx = function ( type , message ) { // Custom DOMException constructor.
				this.name = type ;
				this.code = DOMException[ type ] ;
				this.message = message ;
			}
			, checkTokenAndGetIndex = function ( classList , token ) { // Helper function to validate tokens and get their index.
				if ( token === "" ) { // Token cannot be an empty string.
					throw new DOMEx(
						  "SYNTAX_ERR"
						, "An invalid or illegal string was specified"
					) ;
				}
				if ( /\s/.test( token ) ) { // Token cannot contain whitespace.
					throw new DOMEx(
						  "INVALID_CHARACTER_ERR"
						, "String contains an invalid character"
					) ;
				}
				// Use the polyfilled indexOf to find the token.
				return arrIndexOf.call( classList , token ) ;
			}
			, ClassList = function ( elem ) { // The ClassList constructor.
				var
					  trimmedClasses = strTrim.call( elem.getAttribute( "class" ) || "" ) // Get and trim the 'class' attribute.
					, classes = trimmedClasses ? trimmedClasses.split( /\s+/ ) : [ ] // Split into an array or initialize empty.
					, i = 0 // Loop counter.
					, len = classes.length // Length of the classes array.
				;
				for ( ; i < len ; i++ ) { // Populate the ClassList instance.
					this.push( classes[ i ] ) ;
				}
				// Private method to update the element's 'class' attribute.
				this._updateClassName = function ( ) {
					elem.setAttribute( "class" , this.toString( ) ) ;
				} ;
			}
			, classListProto = ClassList[ protoProp ] = [ ] // Set the prototype of ClassList to an empty array.
			, classListGetter = function ( ) { // Getter function for the 'classList' property.
				return new ClassList( this ) ;
			}
		; // End of variable declarations.

		// Most DOMException implementations don't allow calling DOMException's toString()
		// on non-DOMExceptions. Error's toString() is sufficient here.
		DOMEx[ protoProp ] = Error[ protoProp ] ;

		// Define 'item' method for ClassList prototype.
		classListProto.item = function ( i ) {
			return this[ i ] || null ;
		} ;

		// Define 'contains' method for ClassList prototype.
		classListProto.contains = function ( token ) {
			token += "" ; // Ensure token is a string.
			return checkTokenAndGetIndex( this , token ) !== -1 ;
		} ;

		// Define 'add' method for ClassList prototype.
		classListProto.add = function ( ) {
			var
				  tokens = arguments // All arguments are tokens to add.
				, i = 0 // Loop counter.
				, l = tokens.length // Number of tokens.
				, token // Current token.
				, updated = false // Flag to track if the class list changed.
			;
			do { // Process each token.
				token = tokens[ i ] + "" ;
				if ( checkTokenAndGetIndex( this , token ) === -1 ) { // If token is not already present.
					this.push( token ) ; // Add the token.
					updated = true ; // Mark as updated.
				}
			}
			while ( ++i < l ) ; // Continue until all tokens are processed.

			if ( updated ) { // If any changes were made.
				this._updateClassName( ) ; // Update the element's class attribute.
			}
		} ;

		// Define 'remove' method for ClassList prototype.
		classListProto.remove = function ( ) {
			var
				  tokens = arguments // All arguments are tokens to remove.
				, i = 0 // Loop counter.
				, l = tokens.length // Number of tokens.
				, token // Current token.
				, updated = false // Flag to track if the class list changed.
			;
			do { // Process each token.
				token = tokens[ i ] + "" ;
				var index = checkTokenAndGetIndex( this , token ) ; // Get the index of the token.
				if ( index !== -1 ) { // If the token exists.
					this.splice( index , 1 ) ; // Remove it from the array.
					updated = true ; // Mark as updated.
				}
			}
			while ( ++i < l ) ; // Continue until all tokens are processed.

			if ( updated ) { // If any changes were made.
				this._updateClassName( ) ; // Update the element's class attribute.
			}
		} ;

		// Define 'toggle' method for ClassList prototype.
		classListProto.toggle = function ( token , forse ) {
			token += "" ; // Ensure token is a string.

			var
				  result = this.contains( token ) // Check if the token is currently present.
				, method = result ? // Determine the action based on 'result' and 'forse'.
					forse !== true && "remove" // If present, and 'forse' is not true, then remove.
				:
					forse !== false && "add" // If not present, and 'forse' is not false, then add.
			;

			if ( method ) { // If an action (add or remove) was determined.
				this[ method ]( token ) ; // Execute the action.
			}

			return ! result ; // Return true if added, false if removed.
		} ;

		// Define 'toString' method for ClassList prototype.
		classListProto.toString = function ( ) {
			return this.join( " " ) ; // Join all class names with a space.
		} ;


		// Feature detection for defining properties.
		if ( objCtr.defineProperty ) {
			var classListPropDesc = { // Property descriptor for 'classList'.
				  get: classListGetter // Use the getter function.
				, enumerable: true // Should be enumerable.
				, configurable: true // Should be configurable.
			} ;
			try {
				// Attempt to define the property normally.
				objCtr.defineProperty( elemCtrProto , classListProp , classListPropDesc ) ;
			} catch ( ex ) { // IE 8 doesn't support enumerable:true on DOM elements.
				if ( ex.number === -0x7FF5EC54 ) { // Check for specific IE8 error code.
					classListPropDesc.enumerable = false ; // Set enumerable to false.
					objCtr.defineProperty( elemCtrProto , classListProp , classListPropDesc ) ; // Try again.
				}
			}
		} else if ( objCtr[ protoProp ].__defineGetter__ ) { // Fallback for older browsers using __defineGetter__.
			elemCtrProto.__defineGetter__( classListProp , classListGetter ) ; // Define the getter.
		}

	} ( self ) ) ; // Pass 'self' (window in browsers) to the IIFE.

} // End of the initial 'if' condition block.