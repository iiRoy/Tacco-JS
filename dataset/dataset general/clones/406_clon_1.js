var TINDER_HOST = "https://api.gotinder.com" ;
var request = require ( 'request' ) ; // Node.js module for making HTTP requests

/*
 * This is the constructor function for the TinderClient class.
 * It initializes a new instance of the client, preparing it
 * for interaction with the Tinder API.
 *
 * @constructor
 * @this {TinderClient}
 */
function TinderClient ( )
{

	var xAuthToken = null ; // Stores the authentication token received from Tinder.
	var lastActivity = new Date ( ) ; // Timestamp of the last user activity for updates.
	var _this = this ; // Reference to the current instance of TinderClient.

	/*
	 * This property holds the user ID of the currently authenticated profile.
	 * It is set after successful authorization.
	 */
	this . userId = null ;

	/*
	 * Helper function to construct the standard request options object
	 * required for Tinder API calls. It includes the base URL, JSON payload,
	 * and necessary headers.
	 *
	 * @param path {String} The relative URI path for the API endpoint (e.g., 'user/recs').
	 * @param data {Object} An object containing any extra data to be sent in the request body.
	 * @returns {Object} A fully formed options object suitable for the 'request' module.
	 */
	var getRequestOptions = function ( path, data )
	{
		var options = {
			url : TINDER_HOST + "/" + path , // Concatenate base host with the specific endpoint path.
			json : data // Data payload to be sent as JSON.
		} ;


		var headers = {
			'User-Agent' : 'Tinder Android Version 2.2.3' , // Mimics the Android app's user agent.
			'os_version' : '16' // Operating system version, often static for API calls.
		} ;

		// If an authentication token exists, add it to the request headers.
		if ( xAuthToken )
		{
			headers [ 'X-Auth-Token' ] = xAuthToken ;
		}


		options . headers = headers ; // Assign the constructed headers to the options object.


		return options ; // Return the complete options object.
	} ;


	/*
	 * This internal function is responsible for issuing GET requests to the Tinder API.
	 * It abstracts away the HTTP method and uses the shared request options helper.
	 *
	 * @param {String} path The API endpoint path.
	 * @param {Object} data Any query parameters or body data for the GET request.
	 * @param {Function} callback The function to be called upon completion of the request.
	 */
	var tinderGet = function ( path, data, callback )
	{
		var opts = getRequestOptions ( path, data ) ; // Get base request options.
		opts . method = 'GET' ; // Set the HTTP method to GET.
		request ( opts, callback ) ; // Execute the request using the 'request' module.
	} ;


	/*
	 * This internal function handles issuing POST requests to the Tinder API.
	 * Similar to tinderGet, it uses the shared request options helper but specifies POST.
	 *
	 * @param {String} path The API endpoint path.
	 * @param {Object} data The data payload for the POST request body.
	 * @param {Function} callback The function to be executed once the request finishes.
	 */
	var tinderPost = function ( path, data, callback )
	{
		var opts = getRequestOptions ( path, data ) ; // Obtain the standard request parameters.
		opts . method = 'POST' ; // Set the HTTP method to POST.
		request ( opts, callback ) ; // Send the POST request.
	} ;


	/*
	 * Creates a wrapper function for Tinder API callbacks to consistently
	 * parse the response body and handle potential JSON errors.
	 *
	 * @param {Function} callback The original callback provided by the user.
	 * @returns {Function} A new callback function that processes the response before calling the original.
	 */
	var makeTinderCallback = function ( callback )
	{
		return function ( error, res, body )
		{
			var data = null ; // Initialize data to null, will hold parsed body.

			// Proceed only if there was no network or HTTP error.
			if ( ! error )
			{
				// Check if the response body is a string, indicating it might need JSON parsing.
				if ( typeof body === "string" )
				{
					try
					{
						data = JSON . parse ( body ) ; // Attempt to parse the JSON string.
					}
					catch ( err )
					{
						// If parsing fails, perhaps log the error or handle gracefully.
						// For now, we'll just let data remain null or the original string.
						console . error ( "Failed to parse JSON response:", err ) ;
					}
				}
				// If the body is already an object, use it directly.
				else if ( typeof body === "object" )
				{
					data = body ;
				}
			}

			// If an original callback was provided, invoke it with the processed error and data.
			if ( callback )
			{
				callback ( error, data ) ;
			}
		} ;
	} ;


	// Public API methods for the TinderClient.

	/**
	 * Retrieves a list of recommended profiles nearby the user's current location.
	 *
	 * @param {Number} limit The maximum number of recommendations to fetch.
	 * @param {Function} callback The callback function (error, data) to be invoked upon completion.
	 */
	this . getRecommendations = function ( limit, callback )
	{
		tinderGet ( 'user/recs',
			{
				limit : limit // Pass the desired limit as part of the request data.
			},
			makeTinderCallback ( callback ) // Wrap the user's callback for consistent response handling.
		) ;
	} ;


	/**
	 * Sends a message to a specific user within an existing match.
	 *
	 * @param {String} userId The unique identifier of the user to whom the message should be sent.
	 * @param {String} message The text content of the message.
	 * @param {Function} callback The callback function (error, data) to execute when the message is sent.
	 */
	this . sendMessage = function ( userId, message, callback )
	{
		tinderPost ( 'user/matches/' + userId, // Construct the specific endpoint for sending a message.
			{
				message : message // The message content to be sent in the request body.
			},
			makeTinderCallback ( callback )
		) ;
	} ;


	/**
	 * Initiates a "pass" (swipe left) action on a given user profile.
	 * This indicates disinterest in the profile.
	 *
	 * @param {String} userId The ID of the user to pass.
	 * @param {Function} callback The callback function (error, data) to be called after the pass action.
	 */
	this . pass = function ( userId, callback )
	{
		tinderGet ( 'pass/' + userId, // API endpoint for passing a user.
			null, // No additional data is typically needed for a pass.
			makeTinderCallback ( callback )
		) ;
	} ;


	/**
	 * Initiates a "like" (swipe right) action on a given user profile.
	 * This indicates interest in the profile.
	 *
	 * @param {String} userId The ID of the user to like.
	 * @param {Function} callback The callback function (error, data) to be called after the like action.
	 */
	this . like = function ( userId, callback )
	{
		tinderGet ( 'like/' + userId, // API endpoint for liking a user.
			null, // No extra data is required for a like.
			makeTinderCallback ( callback )
		) ;
	} ;


	/**
	 * Authorizes the TinderClient instance using Facebook authentication tokens.
	 * This is the crucial step to obtain an X-Auth-Token from Tinder.
	 *
	 * @param {String} fbToken The Facebook access token obtained from the user's Facebook login.
	 * @param {String} fbId The user's Facebook ID.
	 * @param {Function} callback The callback function (error, res, body) to invoke upon authorization attempt.
	 */
	this . authorize = function ( fbToken, fbId, callback )
	{
		tinderPost ( 'auth', // The authentication API endpoint.
			{
				facebook_token : fbToken, // Facebook access token.
				facebook_id : fbId // Facebook user ID.
			},
			function ( error, res, body ) // Custom callback for authorization, as it processes raw body for token.
			{
				// Check for no error and ensure a token is present in the response body.
				if ( ! error && body . token )
				{
					xAuthToken = body . token ; // Store the received Tinder X-Auth-Token.
					_this . userId = body . user . _id ; // Store the Tinder user ID.
					_this . defaults = body ; // Store the entire response body which contains global settings.
					callback ( error, res, body ) ; // Call the original callback with full response.
				}
				// If there's an error message in the body, throw an exception.
				else if ( body . error )
				{
					throw "Failed to authenticate: " + body . error ;
				}
			}
		) ;
	} ;


	/**
	 * Checks whether the current TinderClient instance has been successfully authorized.
	 * Authorization is indicated by the presence of an `xAuthToken`.
	 *
	 * @return {boolean} True if the client is authorized, false otherwise.
	 */
	this . isAuthorized = function ( )
	{
		return xAuthToken != null ; // Returns true if xAuthToken has a value, false if null.
	}


	/**
	 * Retrieves the stored Tinder X-Auth-Token.
	 *
	 * @return {String|null} The X-Auth-Token if available, otherwise null.
	 */
	this . getAuthToken = function ( )
	{
		return xAuthToken || null ; // Returns the token or null if it's not set.
	}


	/**
	 * Provides access to the client's default settings and global information
	 * obtained during authorization. This often includes API limits and other
	 * configuration data.
	 *
	 * @return {Object} An object containing default client information and globals.
	 */
	this . getDefaults = function ( )
	{
		return _this . defaults ; // Returns the 'defaults' object stored during authorization.
	}

	/**
	 * Fetches a list of new updates, which can include new messages,
	 * new matches, or users who have liked the current profile.
	 *
	 * @param {Function} callback The callback function (error, data) to handle the updates.
	 */
	this . getUpdates = function ( callback )
	{
		tinderPost ( 'updates', // The API endpoint for fetching updates.
			{
				last_activity_date : lastActivity . toISOString ( ) // Send the last known activity date.
			},
			makeTinderCallback ( function ( err, data )
			{
				// Upon successful update, refresh the last activity date for future requests.
				lastActivity = new Date ( data . last_activity_date ) ;

				// If an original callback was provided, invoke it.
				if ( callback )
				{
					callback ( err, data ) ;
				}
			} )
		) ;
	} ;


	/**
	 * Retrieves the entire history for the user, encompassing all matches, messages, blocks, etc.
	 *
	 * NOTE: Historical messages might not be returned beyond a certain age.
	 * The official client typically fetches this once and then relies on incremental updates.
	 *
	 * @param {Function} callback The callback function (error, data) to process the historical data.
	 */
	this . getHistory = function ( callback )
	{
		tinderPost ( 'updates', // Re-uses the 'updates' endpoint but with an empty activity date.
			{
				last_activity_date : "" // An empty string typically signals a request for full history.
			},
			makeTinderCallback ( callback ) // Use the standard callback wrapper.
		) ;
	} ;


	/**
	 * Updates the geographical position of the user's profile.
	 * This impacts the recommendations received by the user.
	 *
	 * @param {Number} lon The longitude coordinate.
	 * @param {Number} lat The latitude coordinate.
	 * @param {Function} callback The callback function (error, data) to be called after position update.
	 */
	this . updatePosition = function ( lon, lat, callback )
	{
		tinderPost ( 'user/ping', // The API endpoint for updating user location.
			{
				lon : lon, // Longitude value.
				lat : lat // Latitude value.
			},
			makeTinderCallback ( callback )
		) ;
	} ;


	/**
	 * Fetches detailed information about a specific user by their ID.
	 *
	 * @param {String} userId The unique identifier of the user to retrieve.
	 * @param {Function} callback The callback function (error, data) to receive the user's details.
	 */
	this . getUser = function ( userId, callback )
	{
		tinderGet ( 'user/' + userId, // Construct the endpoint for a specific user's profile.
			null, // No additional data needed for this GET request.
			makeTinderCallback ( callback )
		) ;
	} ;

} // End of TinderClient function definition.

exports . TinderClient = TinderClient ; // Export the TinderClient constructor for external use.