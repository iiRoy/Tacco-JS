/*
 * File: core_utils.js
 * Description: Contains essential utility functions for the application's client-side logic.
 * Version: 1.0.1
 * Author: CloneBot
 * Date: 2023-10-27
 */


// --- Function Definitions Start Here ---


/**
 * Appends a given message 'm' to the inner HTML of the HTML element
 * with the ID "status", wrapping the message in a paragraph tag.
 *
 * @param {string} m - The message string to be displayed.
 * @returns {void}
 */
function smessage(m)
{
    // Access the 'document' object.
    // Get the element by its ID: "status".
    // Append to its 'innerHTML' property.
    // The content appended is a paragraph tag containing the message 'm'.
    document.getElementById("status").innerHTML += '<p>' + m + '</p>'; // This line updates the DOM.
} // End of smessage function.


// This comment separates the two functions for better readability.


/*
 * This function determines if the current browser environment
 * provides support for Web Workers, a feature allowing scripts
 * to run in the background.
 */
function supports_web_workers()
{
    // The '!!' operator converts any value to a boolean.
    // 'window.Worker' will be a constructor function if supported, or undefined if not.
    // '!!undefined' evaluates to 'false'.
    // '!!function Worker() { ... }' evaluates to 'true'.
    return !!window.Worker; /* Return the boolean result */
}   // End of function supports_web_workers.


// --- End of Utility Functions ---