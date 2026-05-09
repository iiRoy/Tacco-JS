/*
 * This file contains the svgenie library.
 *
 * Project: svgenie
 * Repository: https://github.com/Causata/svgenie
 *
 * Copyright (c) 2013 Causata Ltd
 * License: MIT - For full license text, please see the project repository.
 */
/* global canvg window document */


var svgenie = ( function ( ) {

    "use strict" ; /* Enforce strict mode for cleaner code */

    /*
     * Helper function to serialize an XML node to a string.
     * Handles different browser implementations.
     */
    var _serializeXmlNode = function ( xmlNode ) {

        if ( typeof window . XMLSerializer != "undefined" ) {
            // Standard browser implementation
            return ( new window . XMLSerializer ( ) ) . serializeToString ( xmlNode ) ;
        }
        else if ( typeof xmlNode . xml != "undefined" ) {
            // IE-specific implementation
            return xmlNode . xml ;
        }

        // Fallback for unsupported environments
        return "" ;
    } ;


    /*
     * Converts an SVG element (or its ID) into a canvas element.
     *
     * @param {string|HTMLElement} svg The SVG element or its ID.
     * @param {Object} options Configuration options (currently unused in this function).
     * @param {Function} callback Function to call with the generated canvas.
     */
    var _toCanvas = function ( svg , options , callback ) {

        // If a string is provided, assume it's an ID
        if ( typeof svg == "string" ) {
            // Remove leading '#' if present
            if ( svg . substr ( 0 , 1 ) == "#" ) {
                svg = svg . substr ( 1 ) ;
            }
            // Get the element by ID
            svg = document . getElementById ( svg ) ;
        }

        // Create an off-screen canvas element
        var canvas = document . createElement ( "canvas" ) ;
        canvas . setAttribute ( "height" , svg . offsetHeight ) ;
        canvas . setAttribute ( "width" , svg . offsetWidth ) ;

        // Use canvg to render the SVG onto the canvas
        canvg ( canvas , _serializeXmlNode ( svg ) , {
            ignoreMouse     : true ,    // Ignore mouse events during rendering
            ignoreAnimation : true ,    // Ignore SVG animations
            renderCallback  : function ( ) {
                // Once rendering is complete, invoke the callback with the canvas
                callback ( canvas ) ;
            }
        } ) ;
    } ;


    /*
     * Converts an SVG element to a Data URL (PNG format).
     *
     * @param {string|HTMLElement} id The SVG element or its ID.
     * @param {Object} options Configuration options.
     * @param {Function} callback Function to call with the Data URL and canvas.
     */
    var _toDataURL = function ( id , options , callback ) {

        // First, convert the SVG to a canvas
        _toCanvas ( id , options , function ( canvas ) {
            // Then, get the Data URL from the canvas and pass it to the callback
            callback ( canvas . toDataURL ( "image/png" ) , canvas ) ;
        } ) ;
    } ;


    /*
     * Initiates the saving process for an SVG as a PNG image.
     *
     * @param {string|HTMLElement} id The SVG element or its ID.
     * @param {Object} options Configuration options, including 'name' for the filename.
     */
    var _save = function ( id , options ) {

        // Get the Data URL for the SVG
        _toDataURL ( id , options , function ( data , canvas ) {
            // Proceed to save the Data URL to a file
            _saveToFile ( {
                data   : data ,       // The image data URL
                canvas : canvas ,     // The canvas element
                name   : options . name || "image.png" // Desired filename
            } ) ;
        } ) ;
    } ;


    /*
     * Handles the actual saving of the image data to a file.
     * Uses different methods based on browser capabilities.
     *
     * @param {Object} conf Configuration object containing data, canvas, and name.
     */
    var _saveToFile = function ( conf ) {

        var a = document . createElement ( "a" ) ;

        // Check for 'download' attribute support (Chrome, Firefox 20+)
        if ( a . download != null ) {
            a . href     = conf . data ;
            a . download = conf . name ;
            _pretendClick ( a ) ; // Simulate a click to trigger download
            return ;
        } ;

        // Check for IE10+ msSaveBlob support
        if ( window . navigator . msSaveBlob ) {
            conf . canvas . toBlob ( function ( blobby ) {
                // Ensure msSaveBlob is still available
                if ( window . navigator . msSaveBlob ) {
                    window . navigator . msSaveBlob ( blobby , conf . name ) ;
                }
            } , "image/png" ) ; // Specify PNG format for the blob
            return ;
        }

        // No supported save method found (e.g., older browsers)
        // In this case, the image might open in a new tab,
        // or the user would need to right-click and save manually.
    } ;


    /*
     * Simulates a click event on an HTML element.
     * Used to programmatically trigger downloads.
     *
     * @param {HTMLElement} eElement The element to click.
     * @returns {boolean} True if the event was dispatched successfully.
     */
    function _pretendClick ( eElement ) {

        var oEvent = document . createEvent ( "MouseEvents" ) ;
        oEvent . initMouseEvent ( "click" ,
            true ,      // bubbles
            false ,     // cancelable
            window ,    // view
            0 ,         // detail
            0 ,         // screenX
            0 ,         // screenY
            0 ,         // clientX
            0 ,         // clientY
            false ,     // ctrlKey
            false ,     // altKey
            false ,     // shiftKey
            false ,     // metaKey
            0 ,         // button
            null        // relatedTarget
        ) ;
        return eElement . dispatchEvent ( oEvent ) ;
    } ;


    // Public API of the svgenie library
    return {
        save       : _save ,       // Function to save an SVG as a PNG
        toCanvas   : _toCanvas ,   // Function to convert an SVG to a canvas
        toDataURL  : _toDataURL    // Function to convert an SVG to a Data URL
    } ;

} ) ( ) ; // Immediately-invoked function expression (IIFE)