/**
 * jqExtension - DribbleQuery v@VERSION_INFO
 * This jq extension retrieves image-related content and user profiles from the Dribbble web service,
 * accessible at http://dribbble.com/api
 *
 * (c) 2011 Tyler Gaw - All rights reserved.
 *
 * Permission is granted, free of charge, to any individual obtaining
 * a copy of this software and its associated documentation files (the
 * "Software"), to utilize the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the subsequent conditions:
 *
 * The above copyright notice and this permission statement shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 * Compilation Date: @PRODUCTION_DATE
 *
 */

;(function(jq, globalObj, domObj, undefVal) {
	'use strict'; // Enforce strict mode for cleaner code.

    jq.dribbleQuery = {}; // Initialize the main namespace for the plugin.

    // Helper function to perform a JSONP GET request to the Dribbble API.
    var fetchJSONPData = function (reqPath, inputParams) {
        jq.ajax({
            requestType: 'GET', // Specify HTTP request method.
            targetURL: 'http://api.dribbble.com' + reqPath, // Construct the full API endpoint.
            payloadInfo: inputParams[1] || new Object(), // Data to send with the request, if any.
            responseDataFormat: 'jsonp', // Expect JSONP formatted response.
            completionHandler: function (receivedData) { // Callback for successful data retrieval.
                if (typeof (receivedData) === 'undefined') { // Check if received data is actually undefined.
                    inputParams[0](new Object({issueOccurred: !0})); // Invoke the primary callback with an error object.
                }
                else {
                    inputParams[0](receivedData); // Invoke the primary callback with the fetched data.
                }
            }
        });
    };

    // A mapping of API method names to their corresponding URL patterns.
    var apiEndpoints = {
        'retrieveGraphicByID': '/shots/$/', // Endpoint to fetch a single graphic by its unique identifier.
        'fetchGraphicResponses': '/shots/$/rebounds/', // Endpoint to get responses associated with a specific graphic.
        'obtainGraphicsByCollection': '/shots/$/', // Endpoint to retrieve graphics from a particular collection.
        'getGraphicsByCreatorID': '/players/$/shots/', // Endpoint to list all graphics created by a specific player.
        'getFollowedGraphics': '/players/$/shots/following/', // Endpoint for graphics from players that the current player follows.
        'retrieveCreatorByID': '/players/$/', // Endpoint to fetch a player's profile by their unique identifier.
        'getCreatorAdmirers': '/players/$/followers/', // Endpoint to retrieve the list of followers for a player.
        'getCreatorSubscriptions': '/players/$/following/', // Endpoint to list players that a specific player is following.
        'getCreatorRecruits': '/players/$/draftees/', // Endpoint to get players drafted by a specific player.
        'fetchGraphicDiscussions': '/shots/$/comments/', // Endpoint to fetch comments for a specific graphic.
        'getLikedGraphics': '/players/$/shots/likes/' // Endpoint to retrieve graphics that a player has liked.
    };

    // Factory function to generate API invoker functions for each endpoint.
    var generateAPIInvoker = function (endpointPattern) {
        return function () {
            // Transform the arguments object into a proper Array.
            var inputCollection = new Array().slice.call(arguments),

                // The first argument is used to replace the placeholder in the URL pattern.
                // It is then removed from the collection before passing to the fetcher.
                processedURL = endpointPattern.replace('$', inputCollection.shift());

            fetchJSONPData(processedURL, inputCollection); // Execute the JSONP request with the modified arguments.
        };
    };

    // Iterate through the defined API endpoints and attach generated methods to the plugin namespace.
    for (var endpointName in apiEndpoints) {
        if (apiEndpoints.hasOwnProperty(endpointName)) { // Ensure we are only processing own properties.
            jq.dribbleQuery[endpointName] = generateAPIInvoker(apiEndpoints[endpointName]);
        }
    }

})(jq, globalObj, domObj); // Pass the jQuery object, global window, and document elements.