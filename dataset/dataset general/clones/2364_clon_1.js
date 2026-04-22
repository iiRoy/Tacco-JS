/*
 * This file defines a set of RequireJS modules for CSS management.
 *
 * The primary module, 'css', acts as a RequireJS plugin
 * responsible for dynamically loading and injecting CSS files
 * into the current HTML document.
 *
 * Important Note: The 'css' loader is designed to return control
 * immediately after initiating the stylesheet injection. It does not
 * wait for the browser to fully parse or render the CSS.
 * This design choice prioritizes file optimization and dependency management
 * within a RequireJS-based application.
 */

define(
    'css', // Module ID for the CSS plugin
    {
        // The 'load' method is called by RequireJS when a module using this plugin is requested.
        load: function ( name, require, load, config ) {

            // Helper function to create and append a <link> element to the document head.
            function inject ( filename )
            {
                // Retrieve the <head> element of the document.
                var head = document.getElementsByTagName('head')[ 0 ];

                // Create a new <link> HTML element.
                var link = document.createElement( 'link' );

                // Set the 'href' attribute to the computed filename.
                link.href = filename;

                // Specify the relationship as a stylesheet.
                link.rel = 'stylesheet';

                // Define the media type of the linked resource.
                link.type = 'text/css';

                // Append the newly created <link> element to the document's head.
                head.appendChild( link );
            }

            // Construct the full URL for the CSS file using the base URL from RequireJS config.
            inject( config.baseUrl + name );

            // Signal to RequireJS that the module has been loaded successfully.
            // The 'true' argument indicates that the module is ready immediately.
            load( true );

        }, // End of 'load' function

        // 'pluginBuilder' points to a separate file used by the RequireJS optimizer (r.js)
        // for build-time processing of CSS files.
        pluginBuilder: './css-build'
    }
);

define(
    'css-embed', // Module ID for embedding CSS directly
    function ()
    {
        /**
         * Injects CSS content directly into the document using a <style> tag.
         *
         * @param {string} content - The raw CSS string to be embedded.
         */
        function embed_css ( content )
        {
            // Get the document's head element.
            var head = document.getElementsByTagName( 'head' )[ 0 ],
                // Create a new <style> element.
                style = document.createElement( 'style' ),
                // Create a text node containing the CSS content.
                rules = document.createTextNode( content );

            // Set the type attribute for the style tag.
            style.type = 'text/css';

            // Handle IE-specific way of setting CSS text.
            if ( style.styleSheet ) {
                style.styleSheet.cssText = rules.nodeValue;
            } else {
                // For modern browsers, append the text node directly to the style element.
                style.appendChild( rules );
            }

            // Finally, append the style element to the document's head.
            head.appendChild( style );
        }

        // The 'css-embed' module exports the 'embed_css' function.
        return embed_css;
    }
);

define(
    'css!style.css', // Defines a module that loads 'style.css' via the 'css' plugin
    [ 'css-embed' ], // Depends on the 'css-embed' module for direct embedding
    function ( embed )
    {
        // Embed the specific CSS rules for the 'style.css' pseudo-module.
        embed(
            '.bi {  font-weight: bold;  font-style: italic; } ' // Inline CSS content
        );
        // Indicate successful loading/processing of this CSS module.
        return true;
    }
);

define(
    'css!more.css', // Another CSS module, loading 'more.css'
    [ 'css-embed' ], // Also depends on 'css-embed'
    function ( embed )
    {
        // Embed a different set of CSS rules.
        embed(
            '#tag {  border: 1px solid black; } ' // More inline CSS
        );
        // Confirm module readiness.
        return true;
    }
);

define(
    'a', // Module 'a'
    {
        // Defines a method 'call' within module 'a'.
        call: function ( X )
        {
            // Sets the inner HTML of an element with ID 'tag' to the value of X.
            document.getElementById( 'tag' ).innerHTML = X;
        }
    }
);

define(
    'b', // Module 'b'
    [ 'a' ], // Module 'b' depends on module 'a'
    function ( a ) {
        // Module 'b' returns an object.
        return {
            // This object has a method 'call'.
            call: function ( X )
            {
                // The 'call' method of 'b' delegates its call to 'a.call'.
                a.call( X );
            }
        }; // End of returned object
    }
);

define(
    'c', // Module 'c'
    [ 'b' ], // Module 'c' depends on module 'b'
    function ( b ) {
        // Module 'c' also returns an object.
        return {
            // This object exposes a method named 'say'.
            say: function ( X )
            {
                // The 'say' method of 'c' calls the 'call' method of its dependency 'b'.
                b.call( X );
            }
        }; // End of returned object for 'c'
    }
);

// The main application entry point, using RequireJS to load dependencies.
requirejs(
    [
        'css!style.css',   // Load 'style.css' using the 'css' plugin
        'css!more.css',    // Load 'more.css' using the 'css' plugin
        'c'                // Load module 'c'
    ],
    function ( css1, css2, c ) {
        // Once all dependencies are loaded, this callback function is executed.

        // Call the 'say' method of module 'c' with a test message.
        c.say( 'Hello this is a test for using requirejs to load css files.' );

        // Log the return values of the CSS modules (which are 'true' in this case).
        // This demonstrates that the CSS modules were successfully processed.
        console.log( css1 + ',' + css2 );
    }
);

// Defines an empty 'main' module.
// This is often used as a conventional entry point or a placeholder
// in RequireJS applications, even if it doesn't perform specific actions itself.
define( "main", function () { /* No specific logic here */ } );