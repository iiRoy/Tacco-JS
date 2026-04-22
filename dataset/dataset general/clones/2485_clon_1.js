/*
 * This file contains the client-side logic for interacting with a REST API,
 * including UI components for testing API endpoints.
 *
 * Author: [Original Author Name/Company - if known, otherwise omit]
 * Date: [Original Creation Date - if known, otherwise omit]
 * Version: 1.0.0
 *
 * This is a Type I clone, preserving all code structure and logic,
 * differing only in whitespace and comments.
 */

// Global variable to hold the initial test client model data.
var testClientModel;

// Default empty model for initializing the test client if no data is provided.
var emptyTestClientModel =
{
    // The HTTP method to be used for the request (e.g., GET, POST).
    HttpMethod: '',

    // The URI path template, potentially containing placeholders for parameters.
    UriPathTemplate: '',

    // A collection of sample data for different content types.
    Samples: {},

    // An array of URI parameters.
    UriParameters: [],

    // The base address for constructing the full request URI.
    BaseAddress: '/'
};



/*
 * Self-executing anonymous function (IIFE) to encapsulate the client-side logic
 * and prevent global namespace pollution.
 */
(function () {

    /*
     * Builds the final URI path by replacing placeholders in the template
     * with actual parameter values.
     *
     * @param {string} template - The URI path template (e.g., "/api/resource/{id}").
     * @param {Array<Object>} uriParameters - An array of URI parameter objects,
     *                                      each with `name`, `value`, and `enabled` properties.
     * @returns {string} The constructed URI path.
     */
    function BuildUriPath(template, uriParameters) {

        // Start with the base template path.
        var path = template;

        // Iterate through each URI parameter to substitute values.
        for (var i in uriParameters) {

            var parameter = uriParameters[i]; // Get the current parameter object.

            // Check if the parameter is enabled by the user.
            if (parameter.enabled()) {

                var parameterValue = parameter.value(); // Get the current value of the parameter.

                // Only substitute if the parameter has a non-empty value.
                if (parameterValue != "") {

                    // Construct the placeholder name (e.g., "{id}").
                    var variableName = '{' + parameter.name + '}';

                    // Replace the placeholder in the path with the actual value.
                    path = path.replace(variableName, parameterValue);
                }
            }
            else {
                // If the parameter is disabled, remove its placeholder from the path.
                path = RemoveUriParameter(path, parameter.name)
            }
        }

        // --- Path cleanup operations ---

        // Replace "/?" with "?" to handle cases where a path ends with a slash
        // and then a query string starts.
        path = path.replace("/?", "?");

        // Replace "?&" with "?" to handle empty query parameters or redundant '&'.
        path = path.replace("?&", "?");

        // Remove a trailing '?' if it exists (e.g., if all query params were removed).
        if (path.charAt(path.length - 1) == '?') {
            path = path.substr(0, path.length - 1);
        }

        // Remove a trailing '&' if it exists (e.g., if the last query param was removed).
        if (path.charAt(path.length - 1) == '&') {
            path = path.substr(0, path.length - 1);
        }

        // Return the final, cleaned-up URI path.
        return path;
    }

    /*
     * Removes a specific URI parameter placeholder from the given template.
     * This is typically used when a parameter is disabled.
     *
     * @param {string} template - The URI path template.
     * @param {string} parameterToRemove - The name of the parameter to remove.
     * @returns {string} The template with the specified parameter removed.
     */
    function RemoveUriParameter(template, parameterToRemove) {

        var path = template; // Start with the template path.

        // Construct the URL parameter placeholder (e.g., "{id}").
        var urlParameter = '{' + parameterToRemove + '}';

        // Construct a potential query parameter string (e.g., "id={id}").
        var queryParameter = parameterToRemove + '=' + urlParameter;

        // Remove any occurrences of the query parameter string.
        path = path.replace(queryParameter, "");

        // Remove any occurrences of the URL parameter placeholder.
        path = path.replace(urlParameter, "");

        return path; // Return the modified path.
    }

    /*
     * ViewModel for the test client UI, utilizing Knockout.js observables
     * for dynamic data binding.
     *
     * @param {Object} data - Initial data for the ViewModel, typically from `emptyTestClientModel`
     *                      or a pre-configured `testClientModel`.
     */
    function TestClientViewModel(data) {

        // Capture `this` for use in nested functions.
        var self = this;

        // Observable for the HTTP method, allowing UI updates when it changes.
        self.HttpMethod = ko.observable(data.HttpMethod);

        // The original URI path template, not observable as it's static for this client.
        self.UriPathTemplate = data.UriPathTemplate;

        // Observable for the *current* URI path, built from the template and parameters.
        self.UriPath = ko.observable(self.UriPathTemplate);


        // Initialize an array to hold URI parameters.
        self.UriParameters = new Array();

        // Populate UriParameters from the initial data.
        for (var i in data.UriParameters) {

            var uriParameter = data.UriParameters[i]; // Current parameter from data.

            // Observable for the parameter's value, allowing UI input.
            var uriParameterValue = ko.observable(uriParameter.value);

            // Observable to control if the parameter is enabled/included in the URI.
            var parameterEnabled = ko.observable(true);

            // Subscribe to value changes to update the UriPath.
            uriParameterValue.subscribe(function () {
                self.UriPath(BuildUriPath(self.UriPathTemplate, self.UriParameters));
            });

            // Subscribe to enabled status changes to update the UriPath.
            parameterEnabled.subscribe(function () {
                self.UriPath(BuildUriPath(self.UriPathTemplate, self.UriParameters));
            });

            // Add the parameter to the ViewModel's UriParameters array.
            self.UriParameters.push({ name: uriParameter.name, value: uriParameterValue, enabled: parameterEnabled });
        }


        // Observable array to manage request headers, allowing dynamic addition/removal.
        self.RequestHeaders = ko.observableArray();

        // Observable for the media type of the request body.
        self.RequestMediaType = ko.observable();


        // Temporary array to store available sample content types.
        var sampleTypes = new Array();

        // Populate sampleTypes from the `data.Samples` object keys.
        for (var index in data.Samples) {
            sampleTypes.push(index);
        };

        // Store the available sample types in the ViewModel.
        self.SampleTypes = sampleTypes;


        // Observable to control the visibility of the request body input area.
        // It's visible if there are any sample types available.
        self.ShouldShowBody = ko.observable(sampleTypes.length > 0);

        // Observable for the actual request body content.
        self.RequestBody = ko.observable();


        // Subscribe to changes in RequestMediaType to update the request body
        // and content-type header.
        self.RequestMediaType.subscribe(function () {
            // Decode and set the request body based on the selected media type sample.
            self.RequestBody(decodeSample(data.Samples[self.RequestMediaType()]) || "");

            var headers = self.RequestHeaders; // Get current headers.
            var mediaType = self.RequestMediaType(); // Get current media type.

            // If a media type is selected, add or replace the "content-type" header.
            if (mediaType && mediaType != "") {
                addOrReplaceHeader(headers, "content-type", mediaType);
            }
        });


        // Subscribe to changes in RequestBody to update the content-length header.
        self.RequestBody.subscribe(function () {
            var headers = self.RequestHeaders; // Get current headers.
            var contentLengh = self.RequestBody().length; // Calculate new content length.

            // Add or replace the "content-length" header.
            addOrReplaceHeader(headers, "content-length", contentLengh);
        });


        // Function to add a new empty header row to the UI.
        self.addHeader = function () {
            self.RequestHeaders.splice(0, 0, { name: "", value: "" }); // Add at the beginning.
        };

        // Function to remove a header row from the UI.
        self.removeHeader = function (header) {
            self.RequestHeaders.remove(header); // Remove the specified header object.
        };


        // Observable to store the response received from the API call.
        self.response = ko.observable();

        /*
         * Function to send the HTTP request to the API endpoint.
         */
        self.sendRequest = function () {

            var uriPath = self.UriPath(); // Get the current constructed URI path.
            var http = "http://";
            var https = "https://";

            // Determine the full URI: if uriPath is absolute, use it; otherwise,
            // prepend the BaseAddress.
            var uri = (uriPath.slice(0, http.length) == http || uriPath.slice(0, https.length) == https) ?
                uriPath :
                data.BaseAddress + uriPath;

            var httpMethod = self.HttpMethod(); // Get the selected HTTP method.
            var headers = self.RequestHeaders(); // Get the current request headers.
            // Determine if a request body should be sent.
            var requestBody = self.ShouldShowBody() ? self.RequestBody() : null;

            // Call the helper function to send the actual request.
            SendRequest(httpMethod, uri, headers, requestBody, function (httpRequest) {
                var httpResponse = getHttpResponse(httpRequest); // Process the raw HTTP response.
                self.response(httpResponse); // Update the observable with the parsed response.
                $("#testClientResponseDialog").dialog("open"); // Open the response dialog.
            });
        };


        /*
         * Initialize the main test client dialog using jQuery UI.
         */
        $("#testClientDialog").dialog({
            autoOpen: false, // Dialog is initially closed.
            height: "auto", // Adjust height automatically.
            width: "700", // Fixed width.
            modal: true, // Make it a modal dialog.
            open: function () {
                // When dialog opens, bind click event to overlay to close the dialog.
                jQuery('.ui-widget-overlay').bind('click', function () {
                    jQuery('#testClientDialog').dialog('close');
                })
            },
            buttons: {
                "Send": function () {
                    self.sendRequest(); // Call sendRequest when "Send" button is clicked.
                }
            }
        });


        /*
         * Initialize the response dialog using jQuery UI.
         */
        $("#testClientResponseDialog").dialog({
            autoOpen: false, // Dialog is initially closed.
            height: "auto", // Adjust height automatically.
            width: "550", // Fixed width.
            modal: true, // Make it a modal dialog.
            open: function () {
                // When response dialog opens, bind click event to overlay to close it.
                jQuery('.ui-widget-overlay').bind('click', function () {
                    jQuery('#testClientResponseDialog').dialog('close');
                })
            }
        });


        // Bind click event to a button to open the main test client dialog.
        $("#testClientButton").click(function () {
            $("#testClientDialog").dialog("open");
        });
    }

    // Determine the initial model: use `testClientModel` if available, otherwise `emptyTestClientModel`.
    var initialModel = testClientModel || emptyTestClientModel;

    // Apply Knockout.js bindings to the UI using the TestClientViewModel.
    ko.applyBindings(new TestClientViewModel(initialModel));
})(); // End of IIFE.


/*
 * Decodes a URL-encoded sample string, replacing '+' with spaces and
 * CRLF with LF for consistent display.
 *
 * @param {string} sampleString - The encoded sample string.
 * @returns {string} The decoded and cleaned string.
 */
function decodeSample(sampleString) {
    return unescape(sampleString).replace(/\+/gi, " ").replace(/\r\n/gi, "\n");
}


/*
 * Adds a new header or replaces an existing one in a Knockout observableArray
 * of headers. Case-insensitive for header names.
 *
 * @param {ko.observableArray<Object>} headers - The observable array containing header objects.
 * @param {string} headerName - The name of the header to add or replace.
 * @param {string} headerValue - The new value for the header.
 */
function addOrReplaceHeader(headers, headerName, headerValue) {

    var headerList = headers(); // Get the underlying array of headers.

    // Iterate through existing headers to find a match.
    for (var i in headerList) {
        // Check for case-insensitive match on header name.
        if (headerList[i].name.toLowerCase() == headerName) {
            // If found, replace the existing header object with a new one
            // (preserving original case of the name if desired, or forcing new case).
            headers.replace(headerList[i], { name: headerList[i].name, value: headerValue });
            return; // Exit after replacing.
        }
    }

    // If no existing header was found, push a new header object.
    headers.push({ name: headerName, value: headerValue });
}


/*
 * Sends an HTTP request using XMLHttpRequest.
 *
 * @param {string} httpMethod - The HTTP method (e.g., "GET", "POST").
 * @param {string} url - The URL to send the request to.
 * @param {Array<Object>} requestHeaders - An array of header objects ({name: string, value: string}).
 * @param {string|null} requestBody - The request body content, or null if no body.
 * @param {function(XMLHttpRequest): void} handleResponse - Callback function to handle the XMLHttpRequest object
 *                                                         once the response is received.
 * @returns {boolean} True if the request was successfully initiated, false otherwise.
 */
function SendRequest(httpMethod, url, requestHeaders, requestBody, handleResponse) {

    // --- Input validation ---
    if (httpMethod.length == 0) {
        alert("HTTP Method should not be empty");
        return false;
    }

    if (url.length == 0) {
        alert("Url should not be empty");
        return false;
    }


    var httpRequest = new XMLHttpRequest(); // Create a new XMLHttpRequest object.

    try {
        // Open the request. 'false' makes it synchronous, which is generally
        // discouraged but sometimes used in specific testing scenarios.
        httpRequest.open(httpMethod, encodeURI(url), false);
    }
    catch (e) {
        // Handle errors during request opening (e.g., cross-origin restrictions).
        alert("Cannot send request. Check the security setting of your browser if you are sending request to a different domain.");
        return false;
    }


    try {
        // Set request headers.
        for (var i in requestHeaders) {
            var header = requestHeaders[i];
            httpRequest.setRequestHeader(header.name, header.value);
        }
    } catch (e) {
        // Handle errors if headers are invalid.
        alert("Invalid header.");
        return false;
    }


    // Set up the event handler for state changes.
    httpRequest.onreadystatechange = function () {
        switch (this.readyState) {
            case 4: // DONE state, response is ready.
                handleResponse(httpRequest); // Call the provided callback.
                break;
            default:
                break;
        }
    }


    // Set up the event handler for request timeouts.
    httpRequest.ontimeout = function () {
        alert("Request timed out.");
    }


    try {
        // Send the request, including the body if provided.
        httpRequest.send(requestBody);
    } catch (e) {
        // Catch any errors during the send operation.
        alert(e);
        return false;
    }

    return true; // Request initiated successfully.
}


/*
 * Extracts relevant information from an XMLHttpRequest object after a response
 * has been received and formats it into a standardized response object.
 *
 * @param {XMLHttpRequest} httpRequest - The XMLHttpRequest object with a completed response.
 * @returns {Object} An object containing status, headers, and content of the HTTP response.
 */
function getHttpResponse(httpRequest) {

    var statusCode = httpRequest.status; // HTTP status code (e.g., 200, 404).
    var statusText = httpRequest.statusText; // HTTP status text (e.g., "OK", "Not Found").
    var responseHeaders = httpRequest.getAllResponseHeaders(); // All response headers as a string.
    var rawResponse = httpRequest.responseText; // The actual response body.


    // Special handling for IE: sometimes returns 1223 for 204 No Content.
    // This is a known IE bug/quirk.
    if (statusCode === 1223) {
        statusCode = 204;
        statusText = "No Content";
    }

    // Combine status code and text for display.
    var responseStatus = statusCode + "/" + statusText;

    // Return a structured response object.
    return { status: responseStatus, headers: responseHeaders, content: rawResponse };
}