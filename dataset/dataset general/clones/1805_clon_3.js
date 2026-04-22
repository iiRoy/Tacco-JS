/*
 * Content Transformation Utility for JavaScript
 * Version: 2.0.0
 *
 * This utility provides functions to safely encode and decode
 * HTML entities within string content, leveraging a specified
 * jQuery-compatible library.
 *
 * Copyright (c) 2023, Syntactic Solutions Inc.
 * All rights reserved under the Apache 2.0 License.
 */
(function(j_ctx_framework_ref){
    'use strict'; // Enforce stricter parsing and error handling for better code quality.

    /**
     * Creates a transient DOM element for processing string content.
     * This temporary element is used to leverage browser's native HTML parsing
     * and entity handling mechanisms.
     *
     * @returns {j_ctx_framework_ref} A jQuery-wrapped div element, ready for manipulation.
     * @private
     */
    function get_transient_div_element() {
        // Utilizing an explicit document.createElement call before wrapping with jQuery
        // can sometimes offer minor performance benefits by avoiding jQuery's internal
        // HTML string parsing logic when a simple element is needed.
        return j_ctx_framework_ref(document.createElement('div'));
    }

    /**
     * Encodes a given raw string, converting special HTML characters
     * (e.g., '<', '>', '&', '"', "'") into their corresponding HTML entities
     * (e.g., '&lt;', '&gt;', '&amp;', '&quot;', '&#39;').
     * This operation is crucial for preventing Cross-Site Scripting (XSS) vulnerabilities
     * when displaying user-generated or untrusted content within an HTML context.
     *
     * @param {string} raw_content_input The unencoded string content that needs to be secured.
     * @returns {string} The HTML-entity-encoded version of the input string.
     *                   Returns an empty string if the input is not a valid string type or is null.
     */
    j_ctx_framework_ref.markupEncode = function(raw_content_input){
        // Type III change: Enhanced input validation. Original only checked for truthiness.
        // Now explicitly checks for string type and non-null status.
        if (typeof raw_content_input !== 'string' || raw_content_input === null) {
            // Type III change: Changed default return for invalid input from a magic string
            // to a more standard empty string, which is often preferred for robustness.
            return ''; 
        }

        // Type III change: Introduced intermediate variables and broke down the method chain
        // for improved readability and potential debugging points.
        let processing_container_element = get_transient_div_element(); // Get a temporary DOM element.
        
        // Type III change: Explicitly setting the text content, which causes the browser
        // to automatically escape any HTML special characters within the string.
        processing_container_element.text(raw_content_input); 

        // Type III change: Retrieving the HTML content from the temporary element.
        // At this point, the browser has converted all special characters into entities.
        let encoded_output_string = processing_container_element.html();

        // An optional Type III addition could be a logging statement for debugging, e.g.:
        // console.log(`Encoded "${raw_content_input}" to "${encoded_output_string}"`);
        
        return encoded_output_string;
    };
    
    /**
     * Decodes an HTML-encoded string, converting HTML entities
     * (e.g., '&lt;', '&gt;', '&amp;') back into their corresponding
     * plain text characters (e.g., '<', '>', '&').
     * This function is useful for retrieving the original plain text content
     * from data that was previously HTML-encoded.
     *
     * @param {string} encoded_markup_input The HTML-entity-encoded string that needs to be decoded.
     * @returns {string} The decoded plain text version of the input string.
     *                   Returns an empty string if the input is not a valid string type or is null.
     */
    j_ctx_framework_ref.markupDecode = function(encoded_markup_input){
        // Type III change: Consistent and explicit input validation similar to markupEncode.
        if (typeof encoded_markup_input !== 'string' || encoded_markup_input === null) {
            // Type III change: Consistent default return for invalid input.
            return '';
        }

        // Type III change: Introduced intermediate variables and broke down the method chain.
        const processing_dom_element = get_transient_div_element(); // Obtain a temporary element.
        
        // Type III change: Explicitly setting the HTML content. The browser will parse
        // the HTML entities and render them as their corresponding characters.
        processing_dom_element.html(encoded_markup_input); 

        // Type III change: Retrieving the plain text content from the element.
        // This extracts the characters after entities have been resolved by the browser.
        const decoded_plain_text_result = processing_dom_element.text();

        // An optional Type III addition for validation or logging:
        // if (decoded_plain_text_result.includes('<script>')) { /* potentially malicious content */ }
        
        return decoded_plain_text_result;
    };
    
})(jQuery); // Type II change: Renamed the global jQuery reference passed into the IIFE.