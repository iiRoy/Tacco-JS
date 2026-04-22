/*
 * ---
 *
 * This file defines the Request.Blob class, an extension for MooTools' Request.
 * It facilitates the uploading of binary files (Blobs) using XMLHttpRequest.
 *
 * It's a combination of earlier works by Juan Lago and Arian Stolwijk,
 * further refined by the listed authors.
 *
 * License: MIT-style license. Feel free to use, modify, and distribute.
 *
 * Authors involved in its development:
 * - Arian Stolwijk (Initial concept and contribution)
 * - Djamil Legato (Further enhancements)
 * - Juan Lago (Original sendBlob implementation inspiration)
 * - Mateusz Cyrankiewicz (Additional contributions)
 *
 * Requires: The base Request class from MooTools.
 * Provides: Request.Blob, making it available as a new Request type.
 * Credits: Inspired by and built upon concepts found at https://gist.github.com/a77b537e729aff97429c
 *
 * ---
 */

( function () {


	// Determine if the browser's XHR object supports the 'onprogress' event.
	// This is a common feature check for modern browsers.
	var progressSupport = ( 'onprogress' in new Browser.Request ) ;


	// Define the Request.Blob class, extending the base MooTools Request class.
	Request.Blob = new Class( {

		// Inherit all properties and methods from the standard Request class.
		Extends: Request ,

		// Custom options specific to Request.Blob.
		options: {
			urlEncoded   : false , // Do not URL-encode the payload, as it's a binary blob.
			noCache      : true  , // Prevent caching of the request to ensure fresh data.
			emulation    : false , // Disable HTTP method emulation (e.g., _method parameter).
			trackProgress: false   // Flag to track upload/download progress.
			                        // Note: This is primarily used for non-blob uploads in Safari,
			                        // as native progress events handle blobs.
		} ,

		/**
		 * Sends the XMLHttpRequest with the provided binary data (blob).
		 *
		 * @param {Blob}    blob     The binary data to send in the request body.
		 * @param {Object}  options  Optional request options, overriding instance defaults.
		 * @returns {Request.Blob} The current instance for chaining.
		 */
		send: function ( blob , options ) {

			// Perform initial checks and fire 'onCancel' if necessary.
			if ( ! this.check( options ) ) {

				return this ;

			}

			// Ensure the 'isSuccess' option is properly set.
			this.options.isSuccess = this.options.isSuccess || this.isSuccess ;

			// Set the running flag to true, indicating an active request.
			this.running = true ;


			// Determine the URL and HTTP method for the request.
			var url    = String( this.options.url ) ,
			    method = this.options.method.toLowerCase() ;


			// If no URL is explicitly provided, use the current document's pathname.
			if ( ! url ) {

				url = document.location.pathname ;

			}


			// Handle URL trimming if a hash ('#') is present.
			var trimPosition = url.lastIndexOf( '/' ) ;

			if ( trimPosition > -1 && ( trimPosition = url.indexOf( '#' ) ) > -1 ) {

				url = url.substr( 0 , trimPosition ) ;

			}


			// Append a unique ID to the URL to prevent caching if 'noCache' is true.
			if ( this.options.noCache ) {

				url += ( url.contains( '?' ) ? '&' : '?' ) + String.uniqueID() ;

			}


			// Get the XMLHttpRequest object instance.
			var xhr = this.xhr ;


			// Attach progress event handlers if supported by the browser.
			if ( progressSupport ) {

				xhr.onloadstart       = this.loadstart.bind( this ) ;
				xhr.onprogress        = this.progress.bind( this ) ;
				xhr.upload.onprogress = this.progress.bind( this ) ;

			}


			// Open the XMLHttpRequest with the specified method, URL, async flag, user, and password.
			xhr.open( method.toUpperCase() , url , this.options.async , this.options.user , this.options.password ) ;

			// Set 'withCredentials' if user authentication is provided and supported by XHR.
			if ( this.options.user && 'withCredentials' in xhr ) {

				xhr.withCredentials = true ;

			}


			// Assign the state change handler for the XHR object.
			xhr.onreadystatechange = this.onStateChange.bind( this ) ;


			// Set request headers from the instance's 'headers' property.
			Object.each( this.headers , function ( value , key ) {

				try {

					xhr.setRequestHeader( key , value ) ;

				} catch ( e ) {

					// Fire an exception event if setting a header fails.
					this.fireEvent( 'exception' , [ key , value ] ) ;

				}

			} , this ) ;


			// Fire the 'request' event to signal the start of the request.
			this.fireEvent( 'request' ) ;


			// Send the binary data (blob) with the request.
			xhr.send( blob ) ;


			// If the request is synchronous, manually call onStateChange to process the response.
			if ( ! this.options.async ) {

				this.onStateChange() ;

			}


			// Set a timeout for the request if specified in options.
			if ( this.options.timeout ) {

				this.timer = this.timeout.delay( this.options.timeout , this ) ;

			}

			// Return the Request.Blob instance for method chaining.
			return this ;

		}

	} ) ;

} ) () ;