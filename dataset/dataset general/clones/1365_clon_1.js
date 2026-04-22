/*
This is a Type I clone of the original birdhouse.js file.
The purpose of this clone is to demonstrate extensive changes
to whitespace and comments while maintaining exact
logical and structural identity.
*/

// ------------------------------------------------------------------------------------------------------------------------
// birdhouse.js: A Twitter API client for Titanium Developer
//
// This module provides functionality for authenticating users
// and making API calls to the Twitter service within Titanium applications.
//
// Copyright 2011 (c) iEntry, Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at:
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Author: Joseph D. Purcell, iEntry Inc.
// Version: 0.9 (Beta)
// Last Modified: May 2011
// ------------------------------------------------------------------------------------------------------------------------

// REQUIRED INCLUDES FOR OAUTH FUNCTIONALITY
// For iPhone platform, a complete path to the libraries is necessary.
if ( Ti . Platform . osname == 'iphone' ) {
	Ti . include ( 'lib/oauth.js' ) ;
	Ti . include ( 'lib/sha1.js' ) ;
}
// For Android, the system will search the current directory for the files.
else {
	Ti . include ( 'oauth.js' ) ;
	Ti . include ( 'sha1.js' ) ;
}


// THE PRIMARY CLASS DEFINITION
function BirdHouse ( params ) {

	// ------------------------------------------------------------------------------------------------------------------------
	// =========================================== PRIVATE MEMBERS ============================================================
	// ------------------------------------------------------------------------------------------------------------------------

	// INTERNAL VARIABLES AND CONFIGURATION OBJECTS
	var cfg = {
		// User-configurable parameters for Twitter API interaction
		oauth_consumer_key         : "" ,
		consumer_secret            : "" ,
		show_login_toolbar         : false , // Option to display a toolbar in the login WebView on iPhone

		// System-level configuration parameters, generally not modified by the user
		oauth_version              : "1.0" ,
		oauth_token                : "" ,
		oauth_signature_method     : "HMAC-SHA1" ,
		request_token              : "" ,
		request_token_secret       : "" ,
		request_verifier           : "" ,
		access_token               : "" ,
		access_token_secret        : "" ,
		callback_url               : ""
	} ; // End of cfg object definition

	// OAuth accessor object, used by the OAuth library for signing requests
	var accessor = {
		consumerSecret : cfg . consumer_secret ,
		tokenSecret    : cfg . access_token_secret
	} ; // End of accessor object

	// Authorization status flag
	var authorized = false ;

	// ------------------------------------------------------------------------------------------------------------------------
	// set_message: Helper function to construct an OAuth message.
	//
	// This function prepares an OAuth message object by incorporating
	// the necessary OAuth parameters like consumer key, signature method,
	// timestamp, and nonce.
	//
	// In Parameters:
	//	url (String)        - The target URL for the API call.
	//	method (String)     - The HTTP method to be used (e.g., 'POST' or 'GET').
	//	params (String)     - Additional parameters for the message, formatted as a URL query string
	//	                      (e.g., "var1=2&var2=3").
	//
	// Returns:
	//	message (Object)    - An OAuth message object ready for signing and transmission to Twitter.
	// ------------------------------------------------------------------------------------------------------------------------
	function set_message ( url , method , params ) {
		var message = {
			action     : url ,
			method     : ( method == 'GET' ) ? method : 'POST' ,
			parameters : ( params != null ) ? OAuth . decodeForm ( params ) : [ ]
		} ; // Initialize message object

		// Add essential OAuth parameters to the message
		message . parameters . push ( [ 'oauth_consumer_key' , cfg . oauth_consumer_key ] ) ;
		message . parameters . push ( [ 'oauth_signature_method' , cfg . oauth_signature_method ] ) ;
		message . parameters . push ( [ "oauth_timestamp" , OAuth . timestamp ( ) . toFixed ( 0 ) ] ) ;
		message . parameters . push ( [ "oauth_nonce" , OAuth . nonce ( 42 ) ] ) ; // A random nonce for uniqueness
		message . parameters . push ( [ "oauth_version" , "1.0" ] ) ;

		return message ;
	} // End of set_message function


	// ------------------------------------------------------------------------------------------------------------------------
	// get_request_token: Initiates the OAuth request token acquisition process.
	//
	// This function communicates with the Twitter API to obtain a temporary
	// request token and its secret, which are prerequisites for user authorization.
	//
	// In Parameters:
	//	callback (Function) - A callback function to be executed after the entire
	//	                      authorization flow completes (i.e., after get_access_token()).
	// ------------------------------------------------------------------------------------------------------------------------
	function get_request_token ( callback ) {
		var url = 'https://api.twitter.com/oauth/request_token' ; // Twitter's request token endpoint

		// Construct parameters, including the callback URL if specified
		var params = ( cfg . callback_url != "" ) ? 'oauth_callback=' + escape ( cfg . callback_url ) : '' ;

		// Make an API call to get the request token
		api ( url , 'POST' , params , function ( resp ) {
			if ( resp != false ) {
				var responseParams = OAuth . getParameterMap ( resp ) ; // Parse the response

				cfg . request_token        = responseParams [ 'oauth_token' ] ;
				cfg . request_token_secret = responseParams [ 'oauth_token_secret' ] ;

				// Proceed to get the request verifier from the user
				get_request_verifier ( callback ) ;
			}
		} , false , true , false ) ; // Specific flags for request token API call
	} // End of get_request_token function


	// ------------------------------------------------------------------------------------------------------------------------
	// get_request_verifier: Handles user authorization via a WebView.
	//
	// This function opens a WebView to allow the user to authorize the application
	// on Twitter. It then extracts the oauth_verifier from the callback URL.
	// It should only be called internally by get_request_token().
	//
	// In Parameters:
	//	callback (Function) - The callback function to be invoked once the user
	//	                      authorization process is complete.
	// ------------------------------------------------------------------------------------------------------------------------
	function get_request_verifier ( callback ) {
		var url = "http://api.twitter.com/oauth/authorize?oauth_token=" + cfg . request_token ; // Twitter authorization URL
		var win = Ti . UI . createWindow ( {
			top       : 0 ,
			modal     : true ,
			fullscreen: true
		} ) ; // Create a new window for the WebView

		// Conditionally add a close button and toolbar for iPhone
		if ( Ti . Platform . osname == 'iphone' && cfg . show_login_toolbar ) {
			var webView = Ti . UI . createWebView ( {
				url           : url ,
				scalesPageToFit : true ,
				touchEnabled  : true ,
				top           : 43 , // Position below the toolbar
				backgroundColor : '#FFF'
			} ) ; // Create the WebView

			var toolbar = Ti . UI . createToolbar ( { top : 0 } ) ;
			var toolbarLabel = Ti . UI . createLabel ( {
				text      : 'Login with Twitter' ,
				font      : { fontSize : 16 , fontWeight : 'bold' } ,
				color     : '#FFF' ,
				textAlign : 'center'
			} ) ;

			var flexSpace = Titanium . UI . createButton ( {
				systemButton : Titanium . UI . iPhone . SystemButton . FLEXIBLE_SPACE
			} ) ;
			var btnClose = Titanium . UI . createButton ( {
				title : 'Cancel' ,
				style : Titanium . UI . iPhone . SystemButtonStyle . BORDERED
			} ) ;

			toolbar . items = [ flexSpace , flexSpace , toolbarLabel , flexSpace , btnClose ] ;
			win . add ( toolbar ) ;

			// Event listener for the close button
			btnClose . addEventListener ( 'click' , function ( ) {
				webView . stopLoading ( ) ;
				win . remove ( webView ) ;
				win . close ( ) ;
			} ) ;
		} else {
			// For other platforms or when toolbar is not desired
			var webView = Ti . UI . createWebView ( {
				url           : url ,
				scalesPageToFit : true ,
				touchEnabled  : true ,
				top           : 0 ,
				backgroundColor : '#FFF'
			} ) ;
		}

		var request_token = "" ; // Unused variable, kept for cloning fidelity.
		var url_base = "" ;      // Unused variable, kept for cloning fidelity.
		var params = "" ;        // Used to store parsed parameters from URL.
		var loading = false ;    // Flag to indicate if the WebView is currently loading.
		var loads = 0 ;          // Counter for the number of times the WebView has loaded a URL.
		var doinOurThing = false ; // Flag to indicate if we are actively processing a Twitter redirect.

		// Add the WebView to the window and open it
		win . add ( webView ) ;
		win . open ( ) ;


		// checkStatus: Monitors the WebView's state to determine authorization outcome.
		// This function is crucial for handling cases where the user might deny access
		// or navigate away from the authorization page.
		function checkStatus ( ) {
			if ( ! doinOurThing ) {
				// If not actively processing a redirect, assume denial or cancellation
				if ( ! loading ) {
					webView . stopLoading ( ) ;
					win . remove ( webView ) ;
					win . close ( ) ;

					if ( typeof ( callback ) == 'function' ) {
						callback ( false ) ; // Indicate failure
					}

					return false ;
				}
			} else {
				// We are doing our thing, so do nothing here.
			}
		} // End of checkStatus function


		// Event listener for beforeload event on the WebView
		webView . addEventListener ( 'beforeload' , function ( ) {
			loading = true ; // Set loading flag
		} ) ;

		// Event listener for load event on the WebView
		webView . addEventListener ( 'load' , function ( e ) {
			loads ++ ; // Increment load counter

			// The first load event is for the initial 'allow' page, which we ignore.
			// The second load (loads == 2) might be the 'allow' page reloading, or another page.
			if ( loads == 2 ) {
				// If the URL is not the authorize page, it means something else was clicked or denied.
				if ( e . url != 'https://api.twitter.com/oauth/authorize' ) {
					webView . stopLoading ( ) ;
					win . remove ( webView ) ;
					win . close ( ) ;

					if ( typeof ( callback ) == 'function' ) {
						callback ( false ) ; // Indicate authorization failure
					}

					return false ;
				}
				// If it's still the authorize page, wait a bit to see if Twitter redirects
				else {
					setTimeout ( checkStatus , 1000 ) ; // Set a timeout to check the status later
				}
			}
			// The third load (loads == 3) is typically Twitter redirecting to our callback URL.
			else if ( loads == 3 ) {
				doinOurThing = true ; // Signal that we are processing the redirect, canceling checkStatus timeout

				// Authorization success! Parse the callback URL for the verifier.
				params = "" ;
				var parts = ( e . url ) . replace ( / [?&]+ ( [^=&]+ ) = ( [^&]* ) / gi , function ( m , key , value ) {
					params = params + m ; // Accumulate parameters string (for debugging, perhaps)

					if ( key == 'oauth_verifier' ) {
						cfg . request_verifier = value ; // Extract the verifier
					}
				} ) ;

				if ( cfg . request_verifier != "" ) {
					// Found the verifier, close the WebView and proceed.
					webView . stopLoading ( ) ;
					win . remove ( webView ) ;
					win . close ( ) ;

					get_access_token ( callback ) ; // Exchange tokens for access token

					return true ; // We are done with this authorization step
				}
			}

			// The page has finished loading.
			loading = false ;
		} ) ; // End of webView.addEventListener('load')

	} // End of get_request_verifier function


	// ------------------------------------------------------------------------------------------------------------------------
	// get_access_token: Exchanges request token for a user's permanent access token.
	//
	// This final step in the OAuth process uses the obtained request token,
	// token secret, and verifier to acquire the user's access token and secret.
	//
	// In Parameters:
	//	callback (Function) - The function to call after successfully (or unsuccessfully)
	//	                      obtaining the access token. This is where the original
	//	                      authorization callback will finally be executed.
	// ------------------------------------------------------------------------------------------------------------------------
	function get_access_token ( callback ) {
		var url = 'https://api.twitter.com/oauth/access_token' ; // Twitter's access token endpoint

		// Construct parameters for the access token request
		var requestParams = 'oauth_token=' + cfg . request_token + '&oauth_verifier=' + cfg . request_verifier ;

		api ( url , 'POST' , requestParams , function ( resp ) {
			if ( resp != false ) {
				var responseParams = OAuth . getParameterMap ( resp ) ; // Parse the response for tokens

				cfg . access_token        = responseParams [ 'oauth_token' ] ;
				cfg . access_token_secret = responseParams [ 'oauth_token_secret' ] ;
				cfg . user_id             = responseParams [ 'user_id' ] ;
				cfg . screen_name         = responseParams [ 'screen_name' ] ;
				accessor . tokenSecret    = cfg . access_token_secret ; // Update accessor with new token secret


				save_access_token ( ) ; // Persist the access token for future sessions

				authorized = load_access_token ( ) ; // Verify loading and set authorization status


				// Execute the provided callback function, indicating success
				if ( typeof ( callback ) == 'function' ) {
					callback ( true ) ;
				}
			} else {
				// Execute the callback function, indicating failure
				if ( typeof ( callback ) == 'function' ) {
					callback ( false ) ;
				}
			}
		} , false , true , false ) ; // Specific flags for access token API call
	} // End of get_access_token function


	// ------------------------------------------------------------------------------------------------------------------------
	// load_access_token: Retrieves stored access tokens.
	//
	// This function attempts to load previously saved access tokens and secrets
	// from a local configuration file ('twitter.config') into the class configuration.
	//
	// Returns:
	//	boolean - true if tokens were successfully loaded, false otherwise.
	// ------------------------------------------------------------------------------------------------------------------------
	function load_access_token ( ) {
		// Attempt to locate the configuration file
		var file = Ti . Filesystem . getFile ( Ti . Filesystem . applicationDataDirectory , 'twitter.config' ) ;
		if ( ! file . exists ( ) ) {
			return false ; // File does not exist
		}

		// Attempt to read the file's contents
		var contents = file . read ( ) ;
		if ( contents == null ) {
			return false ; // File contents could not be read
		}

		// Try to parse the file's content as JSON
		try {
			var config = JSON . parse ( contents . text ) ;
		} catch ( e ) {
			return false ; // JSON parsing failed
		}

		// Apply the loaded configuration
		if ( config . access_token ) {
			cfg . access_token = config . access_token ;
		}
		if ( config . access_token_secret ) {
			cfg . access_token_secret = config . access_token_secret ;
			accessor . tokenSecret = cfg . access_token_secret ; // Update the accessor
		}

		return true ; // Tokens successfully loaded
	} // End of load_access_token function


	// ------------------------------------------------------------------------------------------------------------------------
	// save_access_token: Persists the current access tokens to disk.
	//
	// This function writes the current access token and secret to a file
	// named 'twitter.config'. This allows the application to retain
	// user authorization across launches and recompilations.
	// ------------------------------------------------------------------------------------------------------------------------
	function save_access_token ( ) {
		// Get a file object for 'twitter.config' in the application's data directory
		var file = Ti . Filesystem . getFile ( Ti . Filesystem . applicationDataDirectory , 'twitter.config' ) ;

		// Create the file if it doesn't already exist
		if ( file == null ) {
			file = Ti . Filesystem . createFile ( Ti . Filesystem . applicationDataDirectory , 'twitter.config' ) ;
		}

		// Prepare the configuration object for writing
		var config = {
			access_token        : cfg . access_token ,
			access_token_secret : cfg . access_token_secret
		} ;

		// Write the JSON string representation of the config to the file
		file . write ( JSON . stringify ( config ) ) ;

	} // End of save_access_token function


	// ------------------------------------------------------------------------------------------------------------------------
	// api: General purpose function for making Twitter API calls.
	//
	// This is the core function for interacting with the Twitter REST API.
	// It handles OAuth signing and HTTP requests.
	//
	// In Parameters:
	//	url (String)        - The full URL of the Twitter API endpoint.
	//	method (String)     - The HTTP method ('POST' or 'GET').
	//	params (String)     - Request parameters, formatted as a URL query string.
	//	callback (Function) - A function to be executed once the API call completes,
	//	                      receiving the response text or false on error.
	//	auth (Boolean)      - Optional. If true, forces authorization if not already authorized.
	//	                      Defaults to true.
	//	setUrlParams (Boolean) - Optional. If true, all parameters (including OAuth) are appended
	//	                         to the URL. Useful for request token acquisition. Defaults to false.
	//	setHeader (Boolean) - Optional. If true, sets the "Authorization" HTTP header.
	//	                      Useful for most API calls. Defaults to true.
	//
	// Notes:
	//	- For request token acquisition, setUrlParams should be true and setHeader false.
	//	- The callback function is essential for handling asynchronous API responses.
	//	  Example usage:
	//	      BH.tweet("my message", function(response) {
	//	          if (response) { alert("Tweet posted!"); }
	//	          else { alert("Error posting tweet."); }
	//	      });
	//
	// Returns:
	//   false on immediate failure (e.g., invalid method), otherwise the result
	//   is handled by the asynchronous callback function.
	// ------------------------------------------------------------------------------------------------------------------------
	function api ( url , method , params , callback , auth , setUrlParams , setHeader ) {
		var finalUrl = '' ; // The final URL constructed for the HTTP request

		// Authorize the user if not already authorized, then re-call this API function
		if ( ! authorized && ( typeof ( auth ) == 'undefined' || auth === true ) ) {
			authorize ( function ( retval ) {
				if ( ! retval ) {
					// Authorization failed, execute the callback with false
					if ( typeof ( callback ) == 'function' ) {
						callback ( false ) ;
					}

					return false ;
				} else {
					// Authorization successful, retry the original API call
					api ( url , method , params , callback , auth ) ;
				}
			} ) ;
		}
		// If the user is authorized, proceed with the API call
		else {

			// Input Validation for method and parameters
			if ( method != "POST" && method != "GET" ) {
				return false ; // Invalid HTTP method
			}
			if ( params == null || typeof ( params ) == "undefined" ) {
				params = "" ; // Ensure params is a string
			}

			// Initialize local variables
			var initparams = params ; // Store original parameters

			if ( params != null ) {
				params = params + "&" ; // Append '&' if params exist
			}

			// Add oauth_token to parameters if available
			if ( cfg . access_token != '' ) {
				params = params + "oauth_token=" + cfg . access_token ;
			}

			// Create the OAuth message object
			var message = set_message ( url , method , params ) ;

			// Sign the OAuth message
			OAuth . SignatureMethod . sign ( message , accessor ) ;


			// Determine how to construct the final URL based on setUrlParams flag
			if ( typeof ( setUrlParams ) != 'undefined' && setUrlParams == true ) {
				// For request tokens, all parameters (including OAuth) go in the URL
				finalUrl = OAuth . addToURL ( message . action , message . parameters ) ;
			}
			// For all other requests, only custom parameters are appended to the URL
			else {
				finalUrl = OAuth . addToURL ( message . action , initparams ) ;
			}


			var XHR = Ti . Network . createHTTPClient ( ) ; // Create a new HTTP client object

			// Define the onload event handler for successful requests
			XHR . onload = function ( ) {
				// Execute the provided callback function with the response text
				if ( typeof ( callback ) == 'function' ) {
					callback ( XHR . responseText ) ;
				}

				return XHR . responseText ;
			} ; // End of XHR.onload


			// Define the onerror event handler for failed requests
			XHR . onerror = function ( e ) {
				// Execute the callback function, indicating failure
				if ( typeof ( callback ) == 'function' ) {
					callback ( false ) ;
				}

				return false ;
			} ; // End of XHR.onerror

			// Open the HTTP connection
			XHR . open ( method , finalUrl , false ) ; // Synchronous request (false)

			// Conditionally set the "Authorization" HTML header
			if ( typeof ( setHeader ) == 'undefined' || setHeader == true ) {
				var init = true ; // Flag for first parameter in header string
				var header = "OAuth " ; // Start of the OAuth header
				for ( var i = 0 ; i < message . parameters . length ; i ++ ) {
					// Build the Authorization header string
					// ... (rest of the loop and header setting logic would follow)
					// This part of the original code was incomplete, reflecting the source.
				}
			}
		} // End of else (user is authorized)
	} // End of api function
} // End of BirdHouse class definition