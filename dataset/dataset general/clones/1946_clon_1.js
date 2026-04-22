/*
 * This file contains the main application logic for dynamically loading
 * project content and managing UI interactions.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to prevent global scope pollution.
 */
!( function ( window ) {

    // Configuration object, populated from an external JSON file.
    var config;

    // DOM elements frequently accessed throughout the application.
    var nav,
        body,
        content;

    /**
     * Initializes the application with configuration data.
     * Sets up global DOM references and event listeners.
     *
     * @param {object} config_json - The configuration data, typically loaded from JSON.
     */
    function init ( config_json ) {

        // Store the configuration object globally within this module's scope.
        config = config_json;

        // Retrieve key DOM elements by their IDs or tags.
        nav = document.getElementById( 'nav' );
        body = document.body;
        content = document.getElementById( 'content' );

        // Assign the goHome function to the click event of the 'link_home' element.
        document.getElementById( 'link_home' ).onclick = goHome;

        // Iterate through the content items defined in the configuration.
        // For each project, create a navigation link and append it to the 'nav' element.
        config.content.forEach( function ( project, i ) {
            // Create an anchor (<a>) element for the project link.
            var projectLink = document.createElement( 'a' );
            projectLink.href = "#" + project.link_id; // Set href to target the project's ID.
            projectLink.innerHTML = project.title;    // Display the project's title as link text.

            // Attach a click event listener to the newly created project link.
            projectLink.onclick = function ( ) {
                // Fade out the current content area to prepare for new content.
                $( content ).fadeOut( 250, function ( ) {
                    // Ensure the content div is completely hidden after fading out.
                    $( content ).hide( );
                    // Clear any existing content from the content div.
                    $( content ).empty( );
                    // Embed the selected project's content.
                    embedProject( project, function ( ) {
                        // Once embedding is complete, fade the content area back in.
                        $( content ).fadeIn( 250 );
                    } );
                } );
                // Prevent the default anchor link behavior (e.g., jumping to a hash).
                return false;
            };

            // Create a list item (<li>) element to hold the project link.
            projectLI = document.createElement( 'li' );
            projectLI.appendChild( projectLink ); // Add the project link to the list item.

            // Append the complete list item to the navigation bar.
            nav.appendChild( projectLI );
        } );

        // After all initial setup and navigation links are created,
        // automatically navigate to the home state.
        goHome( );
    } /* End of init function */


    /**
     * Handles navigation to the "home" state.
     * Clears the content area.
     *
     * @returns {boolean} Always returns false to prevent default link behavior.
     */
    function goHome ( ) {
        $( content ).fadeOut( 250, function ( ) {
            $( content ).empty( ); // Empty content after fade out.
        } );
        return false;
    }


    /**
     * Embeds project content into the main content area based on its type.
     *
     * @param {object} projectContent - The project object containing details like type, src, etc.
     * @param {function} callback - A function to be called once the embedding is complete.
     */
    function embedProject ( projectContent, callback ) {
        // Use a switch statement to handle different project types.
        switch ( projectContent.type ) {
            case "page"       : Template.page( projectContent, callback );       break;
            case "processing" : Template.processing( projectContent, callback ); break;
        }
    }


    /*
     * The Template object contains methods for rendering different types of project content.
     */
    var Template = {

        /**
         * Renders a static HTML page.
         * Fetches HTML content via AJAX and inserts it into the content area.
         *
         * @param {object} projectContent - The project object for the page.
         * @param {function} doneEmbedding - Callback to signal completion.
         */
        page : function ( projectContent, doneEmbedding ) {
            $.get( projectContent.src, function ( page_html ) {
                content.innerHTML = page_html; // Insert fetched HTML into the content div.
                doneEmbedding( );             // Signal that embedding is complete.
            } );
        },

        /**
         * Renders a Processing.js sketch.
         * Assembles HTML structure, fetches Processing code, and initializes the sketch.
         *
         * @param {object} projectContent - The project object for the Processing sketch.
         * @param {function} doneEmbedding - Callback to signal completion.
         */
        processing : function ( projectContent, doneEmbedding ) {

            // Construct the HTML string for the Processing sketch display.
            content.innerHTML = [
                '<h1>' + projectContent.title + '</h1>',
                '<canvas id="' + projectContent.link_id + '"width="' + projectContent.width + '" height="' + projectContent.height + '"></canvas>',
                '<p>' + projectContent.desc + '</p>',
                '<pre class="code prettyprint" style="display:none"></pre>',
                '<input id="codeToggle" type="button" value="View Source" />'
            ].join( '' ); // Join array elements into a single HTML string.

            // Find the dynamically created canvas, pre, and button elements within the content.
            // [0] is used because jQuery's find() returns a jQuery object (an array-like collection).
            var canvas = $( content ).find( 'canvas' )[ 0 ];
            var codePre = $( content ).find( 'pre' )[ 0 ];
            var codeToggle = $( content ).find( '#codeToggle' )[ 0 ];

            // Set up the click handler for the "View Source" / "Hide Source" button.
            codeToggle.onclick = function ( ) {
                // Toggle button text based on current display state of the code block.
                codeToggle.value = codePre.style.display === 'none' ? "Hide Source" : "View Source";
                // Use jQuery's fadeToggle to show/hide the code block with a fade effect.
                $( codePre ).fadeToggle( );
            }

            // Make an AJAX request to fetch the Processing sketch's source code.
            // This code is used both to initialize the Processing canvas and to populate the <pre> tag.
            $.ajax( {
                url         : projectContent.src,
                contentType : "text"
            } ).done( function ( code ) {
                // Initialize a new Processing sketch instance on the canvas with the fetched code.
                var p = new Processing( canvas, code );

                /*
                 * Optional: Uncomment the following lines to require a click
                 * on the canvas to start the sketch, and pause it initially.
                 *
                 * p.noLoop(); // Stop the sketch loop initially.
                 * canvas.onclick = function() {
                 *  canvas.onclick = null; // Remove the click handler after first click.
                 *  p.loop();              // Start the sketch loop.
                 * }
                 */

                // Populate the <pre> tag with the fetched source code.
                $( codePre ).text( code );
                // Apply syntax highlighting using the `prettyPrint` library.
                prettyPrint( );
                // Signal that embedding of the Processing sketch is complete.
                doneEmbedding( );
            } );
        }
    }; /* End of Template object */

    // Entry point: When the DOM is fully loaded, fetch the configuration.
    $( document ).ready( function ( ) {
        $.get( 'config.json', function ( decoded_json ) {
            // Once the configuration JSON is loaded and parsed, initialize the application.
            init( decoded_json );
        } );
    } );

} )( this ); // The 'this' keyword refers to the global object (window in browsers).