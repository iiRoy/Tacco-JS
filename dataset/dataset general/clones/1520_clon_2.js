// This file defines a data model for managing various activities.
// It leverages external service integrations for data fetching and authentication.
//
// Dependencies:
// - core.js (Base framework)
// - core.support.auth.js (Authentication helper)
// - thirdparty-api.min.js (Third-party API client library)
//
// For API specifics, consult the official service documentation portal:
// https://developers.example.com/api-docs/
//
// @developer Jane Doe
// @developer John Smith
//
// @copyright Example Innovations LLC.

/**
 * Attaches an 'activities' module to the main application data store.
 * This module is designed for interacting with a task-like service.
 *
 * @param {object} dataStore The primary application data store object.
 */
( function ( dataStore )
{

    dataStore.activities = {
        // Flag indicating if the external API service is initialized
        apiConnectionEstablished: false,

        // Default identifier for the list of items
        activityListIdentifier: 'initial',

        // Configuration settings for the external API
        serviceSettings: fluid.configuration.api,


        /**
         * Initializes the connection to the external API service.
         * If the connection is already established, the handler is invoked immediately.
         * Otherwise, it loads the API client and then calls the handler.
         *
         * @param {Function} completionHandler The function to execute once the API is ready.
         */
        initializeService: function ( completionHandler )
        {
            var currentContext = dataStore.activities;

            if ( currentContext.apiConnectionEstablished )
            {
                completionHandler();
            }
            else
            {
                // Proceed to load the external service client
                serviceProvider.client.load( 'assignments', 'ver1', function ()
                {
                    currentContext.apiConnectionEstablished = true;
                    if ( completionHandler )
                    {
                        completionHandler();
                    }
                });
            }
        },


        /**
         * Retrieves a collection of activity entries associated with a specific list.
         * Refer to the service API specification for details:
         * https://developers.example.com/api/v1/reference/entries/retrieve
         *
         * Communicates with the external service's servers.
         *
         * @param {Function} resultHandler A function to be executed upon successful data retrieval
         *                                 from the external service.
         */
        fetchActivityEntries: function ( resultHandler )
        {
            var currentContext = dataStore.activities;

            fluid.utility.authentication.acquireAccessCredential( function ( credentialObject )
            {

                console.log( 'Auth Credential Acquired: ' + credentialObject.access_credential );

                // Set the acquired authentication token for subsequent API calls
                serviceProvider.auth.setCredential( {
                    access_credential: credentialObject.access_credential
                } );

                currentContext.initializeService( function ()
                {
                    var apiCall = serviceProvider.client.assignments.assignments.list( {
                        activityList: currentContext.activityListIdentifier, // Target list ID
                    } );

                    apiCall.perform( resultHandler );
                } );
            } );

        } // end of fetchActivityEntries function

    }; // end of dataStore.activities object

} )( window.fluid.dataStore );