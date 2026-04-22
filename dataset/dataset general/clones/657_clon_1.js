/**
 *
 * This is the truly awesome
 * CodeBlue pseudo-cross-browser XHR/AJAX Code Library.
 *
 * It's distributed under the DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE,
 * Version 2, issued in December 2004.
 *
 * Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
 *
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 * 0. You just DO WHAT THE FUCK YOU WANT TO. Seriously.
 *
 */

// Main AJAX utility object definition.
var ajax = {

    /**
     * Creates a new XMLHttpRequest object.
     * This version removes older IE compatibility code.
     * @returns {XMLHttpRequest|boolean} A new XHR object or false if not supported.
     */
    ajaxRequest : function () {

        // Check if the browser supports XMLHttpRequest natively.
        if (window.XMLHttpRequest) {
            // Modern browsers use this.
            return new XMLHttpRequest();
        } else {
            // Fallback for extremely old or non-compliant browsers (less relevant now).
            return false;
        }

    }, // End of ajaxRequest function

    /**
     * Performs an asynchronous HTTP GET request.
     *
     * @param {string} url - The URL to send the request to.
     * @param {function} readyfunc - Callback function executed upon completion (readyState == 4).
     * @param {function} errfunc - Callback function executed if an error occurs during send.
     * @param {string} [user] - Optional username for authentication.
     * @param {string} [pass] - Optional password for authentication.
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    asyncGet : function (url, readyfunc, errfunc, user, pass) {

        // Instantiate a new XHR object.
        var request = new this.ajaxRequest();

        // Assign the event handler for state changes.
        request.onreadystatechange = function () {
            // Check if the request is complete.
            if (request.readyState == 4) {
                // Execute the success callback.
                readyfunc(request);
            }
        };

        // Open the request: GET method, asynchronous.
        request.open("GET", url, true, user, pass);

        // Attempt to send the request.
        try {
            request.send(null);
        } catch (e) {
            // Handle any exceptions during the send operation.
            errfunc(e);
        }

        // Return the request object for further manipulation if needed.
        return request;

    }, // End of asyncGet function

    /**
     * Performs an asynchronous HTTP POST request.
     *
     * @param {string} url - The URL to send the request to.
     * @param {*} payload - The data to be POSTed.
     * @param {function} readyfunc - Callback function executed upon completion (readyState == 4).
     * @param {function} errfunc - Callback function executed if an error occurs during send.
     * @param {string} [contentType] - The Content-Type header value (defaults to 'application/x-www-form-urlencoded').
     * @param {string} [user] - Optional username for authentication.
     * @param {string} [pass] - Optional password for authentication.
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    asyncPost : function (url, payload, readyfunc, errfunc, contentType, user, pass) {

        // Set default Content-Type if not provided.
        contentType = contentType || "application/x-www-form-urlencoded";

        // Create a new XHR instance.
        var request = new this.ajaxRequest();

        // Define the callback for state changes.
        request.onreadystatechange = function () {
            if (request.readyState == 4) { // Request finished and response is ready.
                readyfunc(request); // Call the user-defined ready function.
            }
        };

        // Initialize the request: POST method, asynchronous.
        request.open("POST", url, true, user, pass);

        // Set the Content-Type header for the POST data.
        request.setRequestHeader("Content-type", contentType);

        // Send the payload.
        try {
            request.send(payload);
        } catch (e) {
            // Catch and report any errors during send.
            errfunc(e);
        }

        // Return the request object.
        return request;

    }, // End of asyncPost function

    /**
     * Performs a synchronous HTTP GET request.
     * Note: Synchronous requests can block the UI and are generally discouraged.
     *
     * @param {string} url - The URL to send the request to.
     * @param {string} [user] - Optional username for authentication.
     * @param {string} [pass] - Optional password for authentication.
     * @returns {XMLHttpRequest} The XMLHttpRequest object with the completed response.
     */
    syncGet : function (url, user, pass) {

        // Get an XHR object.
        var request = new this.ajaxRequest();

        // Open the request: GET method, synchronous (false).
        request.open("GET", url, false, user, pass);

        // Send the request without a body.
        request.send(null);

        // Return the request object which now contains the response.
        return request;

    }, // End of syncGet function

    /**
     * Performs a synchronous HTTP POST request.
     *
     * @param {string} url - The URL to send the request to.
     * @param {*} payload - The data to be POSTed.
     * @param {string} [contentType] - The Content-Type header value (defaults to 'application/x-www-form-urlencoded').
     * @param {string} [user] - Optional username for authentication.
     * @param {string} [pass] - Optional password for authentication.
     * @returns {XMLHttpRequest} The XMLHttpRequest object with the completed response.
     */
    syncPost : function (url, payload, contentType, user, pass) {

        // Ensure contentType is set, defaulting if necessary.
        contentType = contentType || "application/x-www-form-urlencoded";

        // Obtain a new XHR object.
        var request = new this.ajaxRequest();

        // Open the request: POST method, synchronous (false).
        request.open("POST", url, false, user, pass);

        // Set the Content-Type header before sending.
        request.setRequestHeader("Content-type", contentType);

        // Send the request with the specified payload.
        request.send(payload);

        // The request is now complete; return the object.
        return request;

    } // End of syncPost function

}; // End of ajax object definition