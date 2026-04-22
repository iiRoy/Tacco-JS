'use strict'
/*
 * This file contains the main application logic for the headless Drupal demo.
 * It's a demonstration of Angular.js interacting with a Drupal 8 backend.
 */

var mySite = 'http://dev-headless-drupal-8.gotpantheon.com/' // Base URL for the Drupal site

// Declare the main application module.
// It depends on several Angular modules for routing, resource handling, and HTML sanitization.

var headlessDrupal = angular
    .module(
        'headlessDrupal',
        [
            'ngRoute',    // For client-side routing
            'ngResource', // For interacting with RESTful services
            'ngSanitize'  // For sanitizing HTML content
        ]
    );

headlessDrupal.controller(
    'NodeLoader',
    function (
        $scope,
        $resource,
        $http
    ) {

        // Define a resource for interacting with Drupal nodes.
        // It expects a node ID and uses HAL+JSON for responses.
        var nodeService = $resource(
            mySite + 'node/:nodeId',
            { nodeId: '@nodeId' }, // Parameter definition
            {
                get: {
                    method: 'GET', // HTTP GET method
                    transformRequest: function (data, headersGetter) {
                        // Request header transformation: Accept HAL+JSON
                        headersGetter()['Accept'] = 'application/hal+json'
                    }
                }
            }
        );

        // --- Slider Example Functionality ---

        /**
         * Initializes the slider and loads the first node.
         * This function is called when the "start" button is clicked.
         */
        $scope.start = function () {
            jQuery('.starter').text('Loading...') // Update button text to indicate loading
            loadNode(
                1,
                function () {
                    // Callback after node 1 is loaded
                    jQuery('.starter').hide()             // Hide the start button
                    jQuery('.slider-container').show()    // Show the slider interface

                    // Initialize the jQuery UI slider with specific options.
                    // It also attaches an event listener for 'slideStop'.
                    jQuery('.slider').slider(
                        {
                            'tooltip': 'show', // Show tooltip on slider
                            'min': 1,          // Minimum slider value
                            'max': 5,          // Maximum slider value
                            'value': 1         // Initial slider value
                        }
                    )
                    .on(
                        'slideStop',
                        function (ev) {
                            // Event handler for when the slider stops
                            // Check if the value is a positive integer before loading
                            if (Number.isInteger(ev['value']) && ev['value'] > 0) {
                                loadNode(ev['value']) // Load the node corresponding to the slider value
                            }
                        }
                    )
                }
            )
        }

        /**
         * Jumps directly to a specific node by its ID.
         * @param {number} nid - The Node ID to load.
         */
        $scope.jump = function (nid) {
            loadNode(nid) // Call the helper function to load the node
        }

        // --- Initial Content for Display ---

        // This is dummy content displayed before any nodes are loaded from the backend.
        $scope.node = {
            'disclaimer': [
                {
                    'value': 'This data is bundled into app.js, not loaded from the backend.'
                }
            ],
            'title': [
                {
                    'value': 'Headless Drupal + Angular.js'
                }
            ],
            'body': [
                {
                    'value': '<p>This demo shows how you can use a dynamic front-end (Angular.js) and a Drupal back-end to power a great user experience. Go ahead and click the number field below to start loading nodes.</p>'
                }
            ]
        }

        // --- Helper Function for Node Loading ---

        /**
         * Loads a Drupal node from the backend and updates the scope.
         * @param {number} nid - The Node ID to load.
         * @param {function} [callback] - An optional callback function to execute after the node is loaded.
         */
        function loadNode(
            nid,
            callback
        ) {
            // Use the nodeService to fetch the node data.
            var node = nodeService.get(
                {
                    'nodeId': nid
                },
                function () {
                    $scope.node = node // Assign the loaded node data to the scope

                    // Check if a callback function was provided and execute it.
                    if (typeof callback === "function") {
                        // Call it, since we have confirmed it is callable
                        callback(nid);
                    }
                }
            );
        }
    }
);