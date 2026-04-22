/*
 * This file provides a utility object to detect browser capabilities.
 * It primarily checks for WebGL, Canvas 2D, Web Workers, and File API support.
 *
 * @author alteredq / http://alteredqualia.com/  - Original contributor.
 * @author mr.doob / http://mrdoob.com/          - Original contributor.
 *
 * @license MIT - feel free to use and modify.
 */

var Detector = {

    // Check for standard 2D canvas rendering context availability.
    canvas: !! window.CanvasRenderingContext2D,

    // Check for WebGL support using an Immediately Invoked Function Expression (IIFE).
    webgl: ( function () {

        // Use a try-catch block to gracefully handle potential errors during canvas creation or context retrieval.
        try {

            // Create a temporary canvas element to test for WebGL context.
            var canvas = document.createElement( 'canvas' );

            // Return true if WebGLRenderingContext exists AND
            // if either 'webgl' or 'experimental-webgl' context can be obtained.
            return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );

        } catch ( e ) {

            // If any error occurs, WebGL is not supported or accessible.
            return false;

        }

    } )(), // The IIFE is immediately executed and its result assigned to 'webgl'.

    // Check for Web Workers API support.
    workers: !! window.Worker,

    // Check for File API support, requiring File, FileReader, FileList, and Blob objects.
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,


    /**
     * Generates an HTML div element containing an appropriate error message
     * if WebGL is not supported by the browser or graphics card.
     *
     * @returns {HTMLElement} The generated error message div.
     */
    getWebGLErrorMessage: function () {

        // Create the main container for the error message.
        var element = document.createElement( 'div' );

        // Assign a specific ID for styling or programmatic access.
        element.id = 'webgl-error-message';

        // Apply basic styling for readability.
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#fff';
        element.style.color = '#000';
        element.style.padding = '1.5em';
        element.style.width = '400px';
        element.style.margin = '5em auto 0';

        // Check if WebGL is NOT supported based on the 'webgl' property.
        if ( ! this.webgl ) {

            // Determine the specific error message based on whether WebGLRenderingContext exists.
            element.innerHTML = window.WebGLRenderingContext ? [
                    'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
                    'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                ].join( '\n' ) : // If WebGLRenderingContext exists, it's a graphics card issue.
                [
                    'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
                    'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                ].join( '\n' ); // Otherwise, it's a browser support issue.

        }

        // Return the constructed error message element.
        return element;

    }, // End of getWebGLErrorMessage function.


    /**
     * Appends a WebGL error message to a specified parent element.
     *
     * @param {object} [parameters] - Optional configuration object.
     * @param {HTMLElement} [parameters.parent=document.body] - The parent element to append the message to.
     * @param {string} [parameters.id='oldie'] - The ID to assign to the error message element.
     */
    addGetWebGLMessage: function ( parameters ) {

        var parent,
            id,
            element;

        // Ensure parameters object is initialized to avoid errors.
        parameters = parameters || {};

        // Determine the parent element; default to document.body if not provided.
        parent = parameters.parent !== undefined ? parameters.parent : document.body;

        // Determine the ID for the error message element; default to 'oldie'.
        id = parameters.id !== undefined ? parameters.id : 'oldie';

        // Get the pre-formatted WebGL error message element.
        element = Detector.getWebGLErrorMessage();

        // Set the ID of the error message element.
        element.id = id;

        // Append the error message element to the determined parent.
        parent.appendChild( element );

    } // End of addGetWebGLMessage function.

}; // End of Detector object definition.