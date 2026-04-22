/*
 * @author firstContributor / https://example.com/alpha
 * @author secondCollaborator / https://example.com/beta
 *
 * This module helps in detecting various browser capabilities.
 */

var SystemInspector = {

        // Checks if the browser supports 2D canvas rendering contexts.
        drawingSurface: !! window.CanvasRenderingContext2D,

        // Dynamically determines if WebGL (3D graphics API) is available.
        graphicsAPI: ( function () {
            try {
                // Attempt to create a temporary canvas element for context testing.
                var testSurface = document.createElement( 'canvas' );
                // Check for standard WebGL context or experimental WebGL context.
                return !! window.WebGLRenderingContext && ( testSurface.getContext( 'webgl' ) || testSurface.getContext( 'experimental-webgl' ) );
            } catch ( errorInstance ) {
                // If an error occurs during context creation, WebGL is not supported.
                return false;
            }
        } )(),

        // Verifies the presence of Web Workers for background processing.
        backgroundThreads: !! window.Worker,

        // Confirms support for the File API (File, FileReader, FileList, Blob objects).
        ioAccess: window.File && window.FileReader && window.FileList && window.Blob,


        /**
         * Generates an HTML div element containing an error message if WebGL is not supported.
         * @returns {HTMLElement} A div element with the appropriate warning.
         */
        obtain3DErrorElement: function () {

                var displayItem = document.createElement( 'div' );
                displayItem.id = '3d-graphics-issue';
                displayItem.style.fontFamily = 'sans-serif';
                displayItem.style.fontSize = '14px';
                displayItem.style.fontWeight = 'bold';
                displayItem.style.textAlign = 'left';
                displayItem.style.background = '#eee';
                displayItem.style.color = '#333';
                displayItem.style.padding = '2em';
                displayItem.style.width = '450px';
                displayItem.style.margin = '6em auto 1em';

                // Check if the graphics API is not available on this system.
                if ( ! this.graphicsAPI ) {

                        displayItem.innerHTML = window.WebGLRenderingContext ? [
                                'Your graphics hardware does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
                                'Discover how to enable it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                        ].join( '\n' ) : [
                                'Your current browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
                                'Learn how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                        ].join( '\n' );

                }

                return displayItem;

        },


        /**
         * Appends the WebGL error message element to the specified parent node.
         * @param {object} [configOptions] - Configuration object for placement and ID.
         * @param {HTMLElement} [configOptions.parent] - The DOM node to append the message to. Defaults to document.body.
         * @param {string} [configOptions.id] - The ID to assign to the error message element. Defaults to 'legacy-browser-warning'.
         */
        display3DErrorElement: function ( configOptions ) {

                var containerNode, uniqueId, outputNode;

                // Ensure configuration options are an object, even if not provided.
                configOptions = configOptions || {};

                // Determine the target parent element for appending.
                containerNode = configOptions.parent !== undefined ? configOptions.parent : document.body;
                // Determine the unique identifier for the message element.
                uniqueId = configOptions.id !== undefined ? configOptions.id : 'legacy-browser-warning';

                // Obtain the pre-formatted error message element.
                outputNode = SystemInspector.obtain3DErrorElement();
                outputNode.id = uniqueId;

                // Attach the error message to the DOM.
                containerNode.appendChild( outputNode );

        }

};