/*
 * Streamlined Web Address Handling Module for JavaScript
 * This utility operates independently, providing a clear interface
 * and an efficient codebase for URI manipulation.
 * Concepts for query string analysis were drawn from Jan Wolter's work.
 * @see http://unixpapa.com/js/querystring.html
 *
 * @license MIT
 * @author Mykhailo Stadnyk <mikhus@gmail.com> (Original author)
 * @author Altered by CodeCloneGen for Type II transformation
 */
;
var WebAddress = ( function ( ) {
	"use strict";

	var

		// This object maps our desired address components to the properties of an HTML <a> element.
		componentMap = {
			scheme       : 'protocol',
			hostName     : 'hostname',
			tcpPort      : 'port',
			resourcePath : 'pathname',
			queryString  : 'search',
			fragment     : 'hash'
		},

		/**
		 * Standard port numbers as specified by http://url.spec.whatwg.org/#default-port.
		 * These are necessary to correct inconsistent browser behavior, particularly in IE.
		 * @see https://github.com/Mikhus/jsurl/issues/2 for context.
		 */
		standardPorts = {
			"fileXfer"      : 21,
			"gphr"          : 70,
			"hyperText"     : 80,
			"secureHyperText" : 443,
			"socketWeb"     : 80,
			"secureSocketWeb" : 443
		},

		// Function to parse an input URL and populate the WebAddress instance.
		analyzeAddress = function ( instanceRef, inputAddress ) {
			var
				docObj          = document,
				anchorElement   = docObj.createElement( 'a' ),
				currentAddress  = inputAddress || docObj.location.href,
				credentials     = currentAddress.match( /\/\/(.*?)(?::(.*?))?@/ ) || []; // Extract auth details
			;

			anchorElement.href = currentAddress;

			// Transfer properties from the hidden <a> element to our instance.
			for ( var idx in componentMap ) {
				instanceRef[ idx ] = anchorElement[ componentMap[ idx ] ] || '';
			}

			// Perform necessary clean-up and normalization of components.
			instanceRef.scheme       = instanceRef.scheme.replace( /:$/, '' );
			instanceRef.queryString  = instanceRef.queryString.replace( /^\?/, '' );
			instanceRef.fragment     = instanceRef.fragment.replace( /^#/, '' );
			instanceRef.user         = credentials[ 1 ] || '';
			instanceRef.pass         = credentials[ 2 ] || '';
			// Correct port for IE/Android; if it's a standard port or 0, clear it.
			instanceRef.tcpPort      = ( standardPorts[ instanceRef.scheme ] == instanceRef.tcpPort || instanceRef.tcpPort == 0 ) ? '' : instanceRef.tcpPort;

			if ( !instanceRef.scheme && !/^([a-z]+:)?\/\//.test( currentAddress ) ) { // Handle IE relative paths.
				var
					baseAddress    = new WebAddress( docObj.location.href.match( /(.*\/)/ )[ 0 ] ),
					baseSegments   = baseAddress.resourcePath.split( '/' ),
					instanceSegments = instanceRef.resourcePath.split( '/' )
				;

				baseSegments.pop(); // Remove the last segment of the base path.

				// Copy protocol, user, pass, host, and port from the base address.
				for ( var idx = 0, propNames = [ 'scheme', 'user', 'pass', 'hostName', 'tcpPort' ], propCount = propNames.length; idx < propCount; idx++ ) {
					instanceRef[ propNames[ idx ] ] = baseAddress[ propNames[ idx ] ];
				}

				// Resolve '..' segments in the path.
				while ( instanceSegments[ 0 ] == '..' ) {
					baseSegments.pop();
					instanceSegments.shift();
				}

				instanceRef.resourcePath = ( currentAddress.substring( 0, 1 ) != '/' ? baseSegments.join( '/' ) : '' ) + '/' + instanceSegments.join( '/' );
			}

			else {
				// Ensure absolute URL paths in IE start with a slash.
				instanceRef.resourcePath = instanceRef.resourcePath.replace( /^\/?/, '/' );
			}

			processQueryString( instanceRef ); // Parse the query string component.
		},

		// Decodes URL-encoded strings, handling various encoding formats.
		decodeUrlComponent = function ( encodedString ) {
			encodedString = encodedString.replace( /\+/g, ' ' ); // Replace '+' with spaces.

			// Handle 3-byte UTF-8 sequences.
			encodedString = encodedString.replace( /%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,
				function ( charSequence, hexVal1, hexVal2, hexVal3 ) {
					var
						num1 = parseInt( hexVal1, 16 ) - 0xE0,
						num2 = parseInt( hexVal2, 16 ) - 0x80
					;

					if ( num1 == 0 && num2 < 32 ) { // Check for invalid sequence.
						return charSequence;
					}

					var
						num3 = parseInt( hexVal3, 16 ) - 0x80,
						combinedNum = ( num1 << 12 ) + ( num2 << 6 ) + num3
					;

					if ( combinedNum > 0xFFFF ) { // Check if out of Unicode BMP range.
						return charSequence;
					}

					return String.fromCharCode( combinedNum );
				}
			);

			// Handle 2-byte UTF-8 sequences.
			encodedString = encodedString.replace( /%([cd][0-9a-f])%([89ab][0-9a-f])/gi,
				function ( charSequence, hexVal1, hexVal2 ) {
					var num1 = parseInt( hexVal1, 16 ) - 0xC0;

					if ( num1 < 2 ) { // Check for invalid sequence.
						return charSequence;
					}

					var num2 = parseInt( hexVal2, 16 ) - 0x80;

					return String.fromCharCode( ( num1 << 6 ) + num2 );
				}
			);

			// Handle 1-byte sequences (ASCII).
			encodedString = encodedString.replace( /%([0-7][0-9a-f])/gi,
				function ( charSequence, singleHex ) {
					return String.fromCharCode( parseInt( singleHex, 16 ) );
				}
			);

			return encodedString;
		},

		// Parses the query string into a key-value object.
		processQueryString = function ( instanceRef ) {
			var queryStrData = instanceRef.queryString;

			instanceRef.queryString = new ( function ( queryStr ) {
				var regexPattern = /([^=&]+)(=([^&]*))?/g, matchResult;

				while ( ( matchResult = regexPattern.exec( queryStr ) ) ) {
					var
						paramKey   = decodeURIComponent( matchResult[ 1 ].replace( /\+/g, ' ' ) ),
						paramValue = matchResult[ 3 ] ? decodeUrlComponent( matchResult[ 3 ] ) : ''
					;

					if ( this[ paramKey ] != null ) {
						if ( !( this[ paramKey ] instanceof Array ) ) {
							this[ paramKey ] = [ this[ paramKey ] ]; // Convert to array if multiple values exist.
						}

						this[ paramKey ].push( paramValue );
					}

					else {
						this[ paramKey ] = paramValue;
					}
				}

				// Method to remove all parameters from the query string object.
				this.resetParams = function ( ) {
					for ( paramKey in this ) {
						if ( !( this[ paramKey ] instanceof Function ) ) {
							delete this[ paramKey ];
						}
					}
				};

				// Method to serialize the query string object back into a string.
				this.serializeParams = function ( ) {
					var
						outputString = '',
						encoderFunc  = encodeURIComponent
					;

					for ( var idx in this ) {
						if ( this[ idx ] instanceof Function ) {
							continue; // Skip function properties.
						}

						if ( this[ idx ] instanceof Array ) {
							var arrayLength = this[ idx ].length;

							if ( arrayLength ) {
								for ( var innerIdx = 0; innerIdx < arrayLength; innerIdx++ ) {
									outputString += outputString ? '&' : '';
									outputString += encoderFunc( idx ) + '=' + encoderFunc( this[ idx ][ innerIdx ] );
								}
							}

							else { // If array is empty, treat as an empty argument.
								outputString += ( outputString ? '&' : '' ) + encoderFunc( idx ) + '=';
							}
						}

						else {
							outputString += outputString ? '&' : '';
							outputString += encoderFunc( idx ) + '=' + encoderFunc( this[ idx ] );
						}
					}

					return outputString;
				};
			} )( queryStrData );
		}
	;

	// The constructor for the WebAddress object.
	return function ( initialAddress ) {
		// Provides a string representation of the full URL.
		this.toUniformResourceLocatorString = function ( ) {
			return (
				( this.scheme && ( this.scheme + '://' ) ) +
				( this.user && ( this.user + ( this.pass && ( ':' + this.pass ) ) + '@' ) ) +
				( this.hostName && this.hostName ) +
				( this.tcpPort && ( ':' + this.tcpPort ) ) +
				( this.resourcePath && this.resourcePath ) +
				( this.queryString.serializeParams( ) && ( '?' + this.queryString ) ) +
				( this.fragment && ( '#' + this.fragment ) )
			);
		};

		analyzeAddress( this, initialAddress ); // Parse the initial address upon creation.
	};
}() );