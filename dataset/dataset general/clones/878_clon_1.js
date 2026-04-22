/*
 * disusered.open.js - This file handles opening documents using compatible applications.
 *
 * @overview Core functionality for opening various document types within the application.
 * @author Carlos Antonio - The original author of this robust module.
 * @license MIT - Licensed under the MIT license for open-source use.
 *
 * This module leverages Cordova's exec function to bridge JavaScript and native functionalities.
 * It supports opening local files and downloading/opening remote files.
*/

// Require the Cordova 'exec' module for native communication.
var exec = require('cordova/exec');


/**
 * open - Main function to open a file or URL.
 *
 * This method determines whether the provided URI is a remote URL or a local file
 * and dispatches to the appropriate handler.
 *
 * @param {String} uri File URI or URL to be opened. This is a mandatory parameter.
 * @param {Function} successCallback Function to be invoked upon successful operation completion.
 * @param {Function} errorCallback Function to be invoked if an error occurs during the operation.
 * @param {Boolean} trustAllCertificates Flag indicating whether to trust all SSL certificates for HTTPS connections.
 *                                       Defaults to `false` if not explicitly provided as a boolean.
 * @returns {Boolean} Returns `false` if the URI is invalid or missing, otherwise initiates the open process.
 */
exports.open = function(uri, successCallback, errorCallback, trustAllCertificates) {
    // --- Input validation ---
    // Ensure that a URI is provided and that there's at least one argument.
    if (!uri || arguments.length === 0) {
        /* If no URI is provided or no arguments are passed,
           we cannot proceed with the open operation. */
        return false;
    }

    // Encode the URI to handle special characters correctly.
    uri = encodeURI(uri);


    // Check if the URI is an HTTP/HTTPS URL.
    if (uri.match('http')) {
        // If it's an HTTP/HTTPS URL, initiate download and then open.
        downloadAndOpen(uri, successCallback, errorCallback, trustAllCertificates);
    }
    else {
        // If it's a local file URI, directly call the native 'Open' plugin.
        exec(
            // Success handler: Bind `this` context, original URI, and the success callback.
            onSuccess.bind(this, uri, successCallback),

            // Error handler: Bind `this` context and the error callback.
            onError.bind(this, errorCallback),

            // Cordova service name
            'Open',

            // Action name
            'open',

            // Arguments array for the native method
            [uri]
        );
    }
}; // End of exports.open function.


/**
 * downloadAndOpen - Handles downloading a remote file and then opening it.
 *
 * This internal helper function uses Cordova's FileTransfer plugin to download
 * files from a given URL to a temporary cache directory, and then opens the
 * downloaded file.
 *
 * @param {String} url The URL of the file to be downloaded.
 * @param {Function} successCallback Function to be called on successful download and open.
 * @param {Function} errorCallback Function to be called if download or open fails.
 * @param {Boolean} trustAllCertificates Specifies whether to trust all SSL certificates.
 */
function downloadAndOpen(url, successCallback, errorCallback, trustAllCertificates) {
    // Initialize a new FileTransfer object for downloading.
    var ft = new FileTransfer();

    // Determine the appropriate cache directory.
    // Prefer external cache if available, otherwise use internal iOS cache.
    var ios = cordova.file.cacheDirectory;
    var ext = cordova.file.externalCacheDirectory;
    var dir = (ext) ? ext : ios; // Choose external if exists, else internal.

    // Extract the file name from the URL.
    var name = url.substring(url.lastIndexOf('/') + 1);

    // Construct the full path where the file will be saved.
    var path = dir + name;

    // --- Certificate Trust Handling ---
    // Ensure trustAllCertificates is a boolean. Default to false if not.
    if (typeof trustAllCertificates !== 'boolean') {
        // If the type is not boolean, explicitly set it to false.
        trustAllCertificates = false;
    }

    // Initiate the file download.
    ft.download(
        url,                                // Source URL of the file.
        path,                               // Destination path on the device.
        function done(entry) {              // Success callback for download.
            // Convert the FileEntry to a file URI.
            var file = entry.toURL();

            // Once downloaded, open the local file.
            exec(
                onSuccess.bind(this, file, successCallback), // Bind success context and callbacks.
                onError.bind(this, errorCallback),           // Bind error context and callbacks.
                'Open',                                      // Cordova service name.
                'open',                                      // Action to perform.
                [file]                                       // Arguments: the downloaded file URI.
            );
        },
        onError.bind(this, errorCallback),  // Error callback for the download operation.
        trustAllCertificates                // Pass the certificate trust setting.
    );
} // End of downloadAndOpen function.


/**
 * onSuccess - Common success handler for the `open` operation.
 *
 * This function logs the success event and invokes the provided success callback.
 *
 * @param {String} path The file URI or URL that was successfully opened.
 * @param {Function} callback The user-defined success callback function.
 * @return {String} Returns the path of the successfully opened file.
 */
function onSuccess(path, callback) {
    // Trigger a custom event indicating success.
    fire('success', path);

    // If a callback function is provided, execute it.
    if (typeof callback === 'function') {
        callback(path);
    }

    // Return the path for potential chaining or further processing.
    return path;
} // End of onSuccess function.


/**
 * onError - Common error handler for the `open` operation.
 *
 * This function logs the error event and invokes the provided error callback.
 *
 * @param {Function} callback The user-defined error callback function.
 * @return {Number} Returns the error code. Default is 0 if no specific code is provided.
 */
function onError(callback) {
    // Determine the error code. If more than one argument is passed, the second is the code.
    var code = (arguments.length > 1) ? arguments[1] : 0;

    // Trigger a custom event indicating an error.
    fire('error', code);

    // If an error callback function is provided, execute it.
    if (typeof callback === 'function') {
        callback(code);
    }

    // Return the error code.
    return code;
} // End of onError function.


/**
 * fire - Dispatches custom Cordova document events.
 *
 * This internal utility function is responsible for creating and dispatching
 * custom events on the Cordova document object, allowing external listeners
 * to react to success or error states.
 *
 * @param {String} event The name of the event to fire ('success' or 'error').
 * @param {String|Number} data The data associated with the event (e.g., file path or error code).
 */
function fire(event, data) {
    // Lazily require Cordova channel and main Cordova objects.
    var channel = require('cordova/channel');
    var cordova = require('cordova');

    // Initialize an empty payload object for the event.
    var payload = {};

    // Subscribe to the Cordova 'deviceready' event to ensure the platform is ready.
    channel.onCordovaReady.subscribe(function() {
        // Construct the full event name, e.g., 'open.success' or 'open.error'.
        var name = 'open.' + event;

        // Determine the property name for the payload based on the event type.
        // For 'error' event, use 'error'; otherwise, use 'data'.
        var prop = (event === 'error') ? event : 'data';

        // Assign the provided data to the correct property in the payload.
        payload[prop] = data;

        // Fire the custom document event with the specified name and payload.
        cordova.fireDocumentEvent(name, payload);
    });
} // End of fire function.