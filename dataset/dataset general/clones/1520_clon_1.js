/*
 * This is a Type I clone of the original JavaScript code.
 * All changes are restricted to whitespace and comments only.
 * The functional logic and structure remain absolutely identical.
 */

/*
 *  This module serves as a model definition for interacting with
 *  the Google Tasks API. It integrates into a larger 'liquid' framework.
 *
 *  Dependencies and external libraries required for this file's operation:
 *
 *  @requires  cordova.js           - The primary Phonegap/Cordova library.
 *  @requires  jquery.js            - A widely used JavaScript utility library.
 *  @requires  gapi-client.min.js   - Google's official JavaScript client for APIs.
 *  @requires  liquid.js            - The foundational 'liquid' application library.
 *  @requires  liquid.helper.oauth.js - A helper component within 'liquid' for OAuth 2.0.
 *
 *
 *  For reference on Google API structures and names, consult the
 *  Google APIs Explorer at:
 *  https://developers.google.com/apis-explorer/
 *
 *  @author    Abdullah Rubiyath    (Initial implementer)
 *  @author    Hossain Khan         (Key contributor)
 *
 *  @copyright Liquid Labs Inc.     (All rights reserved)
 *
 *  Date Created: 2023-10-27
 */


/**
 *  This Immediately Invoked Function Expression (IIFE) is used
 *  to extend the 'liquid' framework's 'model' object
 *  by adding a new 'tasks' module, specifically designed for
 *  managing Google Tasks.
 *
 *  @param {object} model  The existing 'model' object from the
 *                         'liquid' framework, to which the 'tasks'
 *                         functionality will be appended.
 */
( function ( model ) {


	model . tasks = {


		isGapiLoaded : false , // A boolean flag indicating whether the Google API client has been initialized.

		tasklistId   : '@default' , // The identifier for the default task list; every user has one.

		// Configuration settings for the Google API client, typically sourced from
		// the global 'liquid' configuration.
		gapiConfig   : liquid.config.gapi ,


		/**
		 *  Initiates the loading of the Google API client library for Tasks.
		 *  This function first checks if the API is already loaded. If it is,
		 *  the provided callback is executed immediately. Otherwise, it proceeds
		 *  to load the Google API and then invokes the callback upon successful completion.
		 *
		 *  @param {Function} callback  The function to be executed once the
		 *                              Google API client for Tasks is fully
		 *                              loaded and ready for use.
		 */
		loadGapi : function ( callback ) {
			var $this = model . tasks ; // Cache 'this' (model.tasks) for consistent scope.

			// Determine if the Google API client has already been loaded.
			if ( $this.isGapiLoaded )
			{
				callback ( ) ; // If loaded, simply invoke the callback.
			}
			else
			{
				// Load the Google API client for 'tasks' version 'v1'.
				gapi.client.load ( 'tasks' , 'v1' , function ( ) {
					$this.isGapiLoaded = true ; // Update the flag to indicate API is now loaded.
					if ( callback ) {
						callback ( ) ; // Execute the provided callback function.
					}
				}
				) ; // End of gapi.client.load call.
			}
		} , // End of loadGapi method definition.


		/**
		 *  Fetches the list of tasks associated with a specific TaskList from the
		 *  Google Tasks service. This method relies on the Google API client
		 *  to communicate with Google's backend servers.
		 *
		 *  For comprehensive documentation on this API endpoint, please refer to:
		 *  @link https://developers.google.com/google-apps/tasks/v1/reference/tasks/list
		 *
		 *  @param {Function} callback  A function that will be called with the
		 *                              response data received from Google's servers
		 *                              after the task list has been successfully retrieved.
		 */
		getList : function ( callback ) {
			var $this = model . tasks ; // Preserve the context of 'model.tasks'.

			// Retrieve an OAuth access token using the liquid.helper.oauth module.
			liquid.helper.oauth.getAccessToken ( function ( tokenObj ) {

				// Debugging: Output the acquired access token to the console.
				console.log ( 'Access Token >> ' + tokenObj.access_token ) ;

				// Set the obtained access token for all subsequent Google API requests.
				gapi.auth.setToken ( {
					access_token : tokenObj.access_token
				} ) ;

				// Ensure the Google API client is fully loaded before making any requests.
				$this.loadGapi ( function ( ) {
					// Construct the request to list tasks for the specified tasklist.
					var request = gapi.client.tasks.tasks.list ( {
						tasklist : $this.tasklistId , // Use the predefined tasklist ID.
					} ) ;

					// Execute the API request and pass the callback to handle the response.
					request.execute ( callback ) ;
				} ) ; // Completion of loadGapi callback.
			} ) ; // Completion of getAccessToken callback.

		} , // End of getList method definition.


	} ; // End of the 'model.tasks' object definition.


} ) ( window.liquid.model ) ; // Invoke the IIFE, passing the 'liquid.model' object.