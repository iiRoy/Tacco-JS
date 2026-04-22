/*
 * This file defines the core application logic for the Webhook Inbox Viewer.
 * It leverages Angular.js for frontend structure and data binding.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original source code.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered or added to create a Type I clone.
 */

// Define the API endpoint and maximum results for fetching data.
var    API_ENDPOINT = Fanout.WebhookInboxViewer.config.apiEndpoint;
var    MAX_RESULTS  = Fanout.WebhookInboxViewer.config.maxResults;


// Initialize the main Angular module for the Webhook Inbox Viewer.
// It depends on 'ngPrettyJson' for displaying JSON data prettily.
var WebhookInboxViewer = angular.module(  'WebhookInboxViewer'  , [ 'ngPrettyJson'  ]   );



/*
 * Factory: Pollymer
 * Provides a service for making HTTP requests with retry and deferred handling.
 * Utilizes $q for promises and $rootScope for Angular digest cycles.
 */
WebhookInboxViewer.factory("Pollymer", function ( $q, $rootScope ) {
        var count = 0; // Internal counter for Pollymer instances.

        return {
                create : function() {
                        // Create a new Pollymer Request instance.
                        // maxTries: -1 indicates infinite retry attempts for transient errors.
                        // errorCodes: Specifies HTTP error codes that trigger retries.
                        var req = new Pollymer.Request({ maxTries: -1, errorCodes: '500,502-599' });

                        // Assign a unique ID to this Pollymer instance for logging.
                        var id = ++count;

                        console.log("Pollymer " + id + " created");

                        // Return an object with methods for various HTTP verbs and control.
                        return {

                                /**
                                 * Initiates a POST request.
                                 * @param {string} url - The URL to send the POST request to.
                                 * @returns {Promise} A promise that resolves or rejects based on the request outcome.
                                 */
                                post: function(url) {
                                        return this.start('POST', url);
                                },

                                /**
                                 * Initiates a GET request.
                                 * @param {string} url - The URL to send the GET request to.
                                 * @returns {Promise} A promise that resolves or rejects based on the request outcome.
                                 */
                                get: function(url) {
                                        return this.start('GET', url);
                                },

                                /**
                                 * Initiates a DELETE request.
                                 * @param {string} url - The URL to send the DELETE request to.
                                 * @returns {Promise} A promise that resolves or rejects based on the request outcome.
                                 */
                                delete: function(url){
                                        return this.start('DELETE', url);
                                },

                                /**
                                 * Starts an HTTP request with the specified method and URL.
                                 * This is the core method for making requests.
                                 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'DELETE').
                                 * @param {string} url - The target URL for the request.
                                 * @returns {Promise} A promise that resolves with successful response data
                                 *                    or rejects with an error.
                                 */
                                start: function(method, url) {
                                        console.log("Pollymer " + id + "> start (" + method + ")");

                                        // Create a deferred object for handling the asynchronous operation.
                                        var d = $q.defer();

                                        // Register an 'error' event listener for the request.
                                        req.on('error', function(reason) {
                                                console.log("Pollymer " + id + "< error");
                                                d.reject({ code: -1, result: reason }); // Reject the promise on error.
                                                $rootScope.$apply(); // Trigger Angular digest cycle.
                                        });

                                        // Register a 'finished' event listener for the request.
                                        req.on('finished', function(code, result, headers) {
                                                console.log("Pollymer " + id + "< finished (" + code + ")");
                                                // Check if the HTTP status code indicates success (2xx range).
                                                if (code >= 200 && code < 300) {
                                                        d.resolve({ code: code, result: result, headers: headers }); // Resolve on success.
                                                } else {
                                                        d.reject({ code: code, result: result, headers: headers }); // Reject on other codes.
                                                }
                                                $rootScope.$apply(); // Ensure UI updates.
                                        });

                                        // Initiate the actual request.
                                        req.start(method, url);

                                        // Clean up event listeners once the promise is always settled (resolved or rejected).
                                        d.promise.always(function() {
                                                req.off('error');
                                                req.off('finished');
                                        });

                                        return d.promise; // Return the promise.
                                },

                                /**
                                 * Aborts the ongoing HTTP request.
                                 */
                                abort: function() {
                                        console.log("Pollymer " + id + "< abort");
                                        req.abort(); // Call the underlying request's abort method.
                                }
                        };
                }
        }
});


/*
 * Controller: HomeCtrl
 * Manages the functionality for the home page, primarily creating new webhooks.
 */
WebhookInboxViewer.controller("HomeCtrl", function ( $scope, $window, Pollymer ) {
    $scope.webhookId = ""; // Initialize webhook ID scope variable.

    /**
     * Redirects the user to the view page for a specific inbox.
     * @param {string} id - The ID of the webhook inbox to open.
     */
    var openInbox = function ( id ) {
        $window.location.href = "/view/" + id;
    };

    /**
     * Handles the creation of a new webhook inbox.
     * Sets a loading state, makes a POST request, and redirects on success.
     */
    $scope.create = function () {
        $scope.creating = true; // Set creating flag to true to show loading indicator.
        var url = API_ENDPOINT + "create/"; // Construct the API URL for creation.
        var pollymer = Pollymer.create(); // Create a new Pollymer instance.
        var poll = pollymer.post(url); // Send a POST request to create the inbox.

        // Handle the promise returned by the POST request.
        poll.then(function (result) {
            $scope.creating = false; // Reset creating flag.
            var result = result.result; // Extract the actual result data.
            openInbox(result.id); // Open the newly created inbox.
        }, function (reason) {
            $scope.error = true; // Set error flag if creation fails.
        });
    };
});


/*
 * Controller: WebhookInboxCtrl
 * Manages the display and interaction for a specific webhook inbox.
 * Handles fetching, displaying, and managing webhook entries.
 */
WebhookInboxViewer.controller("WebhookInboxCtrl", function ( $scope, $window, $route, Pollymer ) {

    // Initialize the inbox state object with various properties.
    $scope.inbox = {
        updatesCursor   : null,
        historyCursor   : null,
        newestId        : null,
        entries         : [], // Currently displayed entries.
        pendingEntries  : [], // Entries fetched but not yet displayed (for live updates).
        liveUpdates     : true, // Flag for automatic live updates.
        fetching        : false, // Flag indicating if data is currently being fetched.
        pollingUpdates  : false, // Flag indicating if long polling for updates is active.
        error           : false  // Flag for general errors.
    };

    $scope.webhookEndpoint = ""; // Placeholder for the full webhook endpoint URL.

    var webhookId = $window.serverData.webhookId; // Retrieve the webhook ID from server-side data.

    $scope.animationMode = "static"; // Default animation mode for entries.

    /**
     * Initiates the process to copy the webhook URL to the clipboard.
     */
    $scope.copyUrl = function () {
        console.log('Init >>>>'); // Log initiation of copy operation.
        copyClipBoard(); // Call the helper function to perform clipboard copy.
    };

    /**
     * Handles the deletion of the current webhook inbox.
     * Prevents deletion if defaultPrevented is true.
     * @param {Event} ev - The event object from the UI interaction.
     */
    $scope.deleteInbox = function (ev) {
        var url = 'http:' + API_ENDPOINT + "i/" + webhookId + '/'; // Construct the delete URL.
        if (ev.defaultPrevented === false) {
            deleteInboxFn(url); // Call the helper function to perform deletion.
        }
    };

    /**
     * Sets a flag to show the full inbox text content.
     */
    $scope.showText = function () {
        $scope.show_inbox_text = true;
    };

    /**
     * Sets a flag to hide the full inbox text content.
     */
    $scope.hideText = function () {
        $scope.show_inbox_text = false;
    };

    /**
     * Returns the CSS class for animation based on the current animation mode.
     * @returns {string} The animation CSS class.
     */
    $scope.getAnimationType = function () {
        return "animate-" + $scope.animationMode;
    };

    /**
     * Converts a raw item object from the API into a view model suitable for display.
     * Adds a `dateTime` property by parsing the `created` timestamp.
     * @param {object} item - The raw item object.
     * @returns {object} The modified item view model.
     */
    var itemToViewModel = function (item) {
        item.dateTime = Date.parse(item.created); // Parse creation date.
        return item;
    };

    /**
     * Handles fetching past webhook entries from the API.
     * Sets fetching state, makes a GET request, and processes the results.
     * @param {string} url - The URL to fetch past entries from.
     * @returns {Promise} A promise representing the fetch operation.
     */
    var handlePastFetch = function (url) {
        $scope.inbox.fetching = true; // Indicate that fetching is in progress.
        var pollymer = Pollymer.create(); // Create a Pollymer instance.
        var poll = pollymer.get(url); // Execute a GET request.

        // Always (on resolve or reject) set fetching to false.
        poll.always(function () {
            $scope.inbox.fetching = false;
        });

        // Handle successful fetch.
        poll.then(function (result) {
            var items = result.result.items; // Extract items from the result.
            if ("last_cursor" in result.result) {
                $scope.inbox.historyCursor = result.result.last_cursor; // Update history cursor.
            } else {
                $scope.inbox.historyCursor = -1; // Indicate no more history.
            }
            for (var i = 0; i < items.length; i++) {
                var entry = itemToViewModel(items[i]); // Convert to view model.
                $scope.animationMode = "static"; // Set animation mode.
                convertToJson(entry); // Convert body to JSON if applicable.
                $scope.inbox.entries.push(entry); // Add to displayed entries.
            }
        }, function () {
            $scope.inbox.error = true; // Set error flag on failure.
        });
        return poll; // Return the promise for chaining.
    };

    /**
     * Toggles the live updates feature on or off.
     * If turning off, flushes any pending entries.
     */
    $scope.toggleAuto = function () {
        if (!$scope.inbox.liveUpdates) {
            $scope.flushPendingEntriesNonLive(); // Flush if live updates are being turned off.
        }
        $scope.inbox.liveUpdates = !$scope.inbox.liveUpdates; // Toggle the flag.
    };

    /**
     * Flushes a single pending entry into the main entries list when live updates are active.
     * Uses 'live' animation mode.
     */
    $scope.flushPendingEntriesLive = function () {
        $scope.animationMode = "live"; // Set animation mode for live updates.
        var entry = $scope.inbox.pendingEntries.pop(); // Get the latest pending entry.
        convertToJson(entry); // Convert its body to JSON if possible.
        $scope.inbox.entries.unshift(entry); // Add to the beginning of the displayed entries.
        $scope.$apply(); // Manually trigger digest cycle for immediate UI update.
    };

    /**
     * Flushes all pending entries into the main entries list when live updates are inactive.
     * Uses 'nonlive' animation mode.
     */
    $scope.flushPendingEntriesNonLive = function () {
        $scope.animationMode = "nonlive"; // Set animation mode.

        // Concatenate pending entries to the beginning of the main entries.
        $scope.inbox.entries = $scope.inbox.pendingEntries.concat($scope.inbox.entries);
        $scope.inbox.pendingEntries = []; // Clear pending entries.
    };

    var longPollymer = null; // Variable to hold the Pollymer instance for long polling.

    /**
     * Initiates a long polling request to fetch new updates for the inbox.
     * Recursive function that calls itself after a successful poll.
     * @param {string} [id] - Optional ID to fetch updates since a specific entry.
     */
    var longPoll = function (id) {
        var url = API_ENDPOINT + "i/" + webhookId + "/items/?order=created"; // Base URL for updates.

        // Append 'since' parameter based on provided ID or current updates cursor.
        if (id) {
            url += "&since=id:" + id;
        } else if ($scope.inbox.updatesCursor) {
            url += "&since=cursor:" + $scope.inbox.updatesCursor;
        }

        $scope.inbox.pollingUpdates = true; // Indicate that long polling is active.
        longPollymer = longPollymer || Pollymer.create(); // Create Pollymer if not already existing.
        var poll = longPollymer.get(url); // Execute the GET request for updates.

        // Always (on resolve or reject) set pollingUpdates to false.
        poll.always(function () {
            $scope.inbox.pollingUpdates = false;
        });

        // Handle successful update fetch.
        poll.then(function (result) {
            if (result.result === "") {
                return; // No new updates.
            }
            $scope.inbox.updatesCursor = result.result.last_cursor; // Update the updates cursor.
            var items = result.result.items; // Extract new items.
            for (var i = 0; i < items.length; i++) {
                var entry = itemToViewModel(items[i]); // Convert to view model.
                $scope.inbox.pendingEntries.unshift(entry); // Add to pending entries (newest first).
            }
        });
        // After processing, recursively call longPoll to fetch the next batch of updates.
        poll.then(function () {
            longPoll();
        });
    };

    /**
     * Stops any active long polling request by aborting the Pollymer instance.
     */
    var stopLongPoll = function () {
        if (longPollymer != null) {
            longPollymer.abort(); // Abort the request.
            longPollymer = null; // Clear the instance.
        }
    };

    /**
     * Performs initial loading of the inbox data.
     * Fetches historical data and then starts long polling for new updates.
     */
    var initial = function () {
        var url = API_ENDPOINT + "i/" + webhookId + "/items/?order=-created&max=" + MAX_RESULTS; // URL for initial historical fetch.

        // Initial load of past entries.
        var poll = handlePastFetch(url);
        poll.then(function (result) {

            var prefix = "";
            // Check if API_ENDPOINT is protocol-relative and add 'http:' if so.
            if (API_ENDPOINT.substring(0, 2) == "//") {
                prefix = "http:";
            }

            // Construct the full webhook endpoint URL.
            $scope.webhookEndpoint = prefix + API_ENDPOINT + "i/" + webhookId + "/";

            // Determine the ID of the newest item, if any, to start long polling from.
            var id = ("result" in result && "items" in result.result && result.result.items.length) ? result.result.items[0].id : null;
            longPoll(id); // Start long polling for updates.
        });
    };

    /**
     * Constructs and returns the URL for sending data to the webhook inbox.
     * @returns {string} The webhook inbox URL or an empty string if not available.
     */
    $scope.webhookInboxUrl = function () {
        if ($scope.webhookEndpoint.length == 0) {
            return "";
        }
        return $scope.webhookEndpoint + "in/";
    };

    /**
     * Fetches more historical entries for the inbox.
     * Uses the `historyCursor` to paginate.
     */
    $scope.history = function () {
        // Construct URL for fetching more history using the current history cursor.
        var url = API_ENDPOINT + "i/" + webhookId + "/items/?order=-created&max=" + MAX_RESULTS + "&since=cursor:" + $scope.inbox.historyCursor;

        // Execute the historical fetch.
        handlePastFetch(url);
    };

    /**
     * Placeholder for clipboard copy functionality.
     * The actual implementation is in `copyClipBoard()`.
     */
    $scope.copy = function () {
        var endPoint = $scope.webhookEndpoint;
        // Note: Direct clipboard access without user interaction is typically restricted by browsers.
    };

    /**
     * Checks if a given string is valid JSON.
     * @param {string} str - The string to check.
     * @returns {boolean} True if the string is valid JSON, false otherwise.
     */
    $scope.IsJsonString = function (str) {
        try {
            JSON.parse(str); // Attempt to parse the string as JSON.
        } catch (e) {
            return false; // If parsing fails, it's not valid JSON.
        }
        return true; // If parsing succeeds, it is valid JSON.
    };

    // Set up an interval to delete the inbox after a very long period (30 days).
    setInterval(function () {
        var url = 'http:' + API_ENDPOINT + "i/" + webhookId + '/';
        deleteInboxFn(url);
    }, 10000 * 60 * 24 * 30); // 10000ms * 60s * 24h * 30d = 30 days.

    /**
     * Helper function to perform the inbox deletion.
     * Redirects to the home page on successful deletion.
     * @param {string} url - The URL for the delete API call.
     */
    function deleteInboxFn(url) {
        var pollymer = Pollymer.create(); // Create a Pollymer instance for deletion.
        pollymer.delete(url).then(function () {
            $window.location = '/'; // Redirect to home page after deletion.
        });
    }

    /**
     * Converts the `body` property of an entry to a JSON object if it's a valid JSON string.
     * @param {object} entry - The entry object whose body might be converted.
     */
    function convertToJson(entry) {
        var bool = $scope.IsJsonString(entry.body); // Check if the body is a JSON string.
        if (bool) {
            var obj = JSON.parse(entry.body); // Parse the JSON string.
            entry.body = obj; // Replace the string body with the parsed object.
        }
    }

    // This function handles copying the webhook URL to the clipboard.
    // It uses ZeroClipboard for cross-browser compatibility.
    // The comment "10000*60*24*30 for 30 days" seems misplaced here and likely refers to the setInterval above.
    function copyClipBoard() {
        var val = 'http:' + API_ENDPOINT + "i/" + webhookId + '/in/'; // The URL to copy.

        // Initialize ZeroClipboard with the target button and movie path.
        var client = new ZeroClipboard($('#clip_button'), { moviePath: "/static/scripts/ZeroClipboard.swf" });

        // console.log('Val >>> ', val); // Log the value being copied.

        // Event listener for when ZeroClipboard is ready.
        client.on('ready', function (event) {
            // Event listener for when the copy action is triggered.
            client.on('copy', function (event) {
                var clipboard = event.clipboardData; // Get the clipboard data object.
                clipboard.setData("text/plain", val); // Set plain text data to clipboard.
                alert('URL copied'); // Inform the user.
                // clipboard.setData("text/html", "HTML <b>DO NOT</b> work"); // Example of setting HTML data (commented out).
            });
        });
    }

    // Set up a worker function that periodically flushes pending entries
    // into the main display list when live updates are enabled.
    var tableUpdateWorker = function () {
        // Only flush if live updates are on and there are pending entries.
        if ($scope.inbox.liveUpdates && $scope.inbox.pendingEntries.length > 0) {
            $scope.flushPendingEntriesLive(); // Flush a pending entry.
        }
        // Schedule the worker to run again after a short delay (120ms).
        $window.setTimeout(function () { tableUpdateWorker(); }, 120);
    };
    tableUpdateWorker(); // Start the table update worker immediately.

    // Perform the initial data load for the inbox.
    initial();
});