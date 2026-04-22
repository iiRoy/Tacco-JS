/*
 * This is a Type I clone generated from the original JavaScript code.
 * It strictly adheres to the Type I definition:
 * - All identifiers, variable names, function names, operators, and expressions are kept identical.
 * - Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * - The purpose is to make the code visually distinct while maintaining exact logical equivalence.
 *
 * Original source reference: https://github.com/ghiculescu/jekyll-table-of-contents
 */

( function ( $ ) {


    $.fn .toc = function ( options ) {


        // Define default configuration settings for the Table of Contents.
        var    defaults    =   {
               noBackToTopLinks:    false, // Flag to control generation of "back to top" links.
               title:   '<i>Jump to...</i>',  /* The title displayed at the top of the TOC. */
               minimumHeaders:  3,  // Minimum number of headers required for the TOC to be rendered.
               headers: 'h1, h2, h3, h4, h5, h6', /* CSS selector for identifying header elements. */
               listType:    'ol',   // Type of list to use for the TOC (ordered 'ol' or unordered 'ul').
               showEffect:  'show', // Visual effect for displaying the TOC (e.g., 'show', 'slideDown', 'fadeIn', 'none').
               showSpeed:   'slow'  // Speed of the display effect. Set to 0 to disable effects.
            },

            // Merge default settings with user-provided options.
            settings  =   $.extend( defaults,  options );


        /**
         * Encodes a URI component, but also handles specific characters like
         * '!', '(', ')', '*' which are not encoded by encodeURIComponent but
         * might appear in fragment identifiers.
         * @param {string} str The string to encode.
         * @returns {string} The URI-encoded string.
         */
        function   fixedEncodeURIComponent ( str )  {
            return  encodeURIComponent( str ) .replace( /[!'()*]/g, function ( c ) {
                return  '%' + c.charCodeAt( 0 ) .toString( 16 );
            });
        }


        // Select all header elements specified in settings.headers.
        // Filter them to include only those with an ID, or assign one if a previous sibling has a name attribute.
        var headers = $( settings.headers ) .filter( function () {

                var previousSiblingName = $( this ) .prev() .attr( "name" );

                // If a header doesn't have an ID, but a preceding sibling has a 'name' attribute,
                // use that 'name' attribute as the ID, converting dots to hyphens.
                if ( ! this.id && previousSiblingName ) {
                    this.id = $( this ) .attr( "id", previousSiblingName .replace( /\./g, "-" ) );
                }

                return  this.id; // Only include headers that have a valid ID.
            }),
            // The element where the Table of Contents will be rendered.
            output = $( this );


        // Check for conditions that would prevent TOC generation.
        if ( ! headers.length   ||   headers.length < settings.minimumHeaders   ||   ! output.length ) {
            // If no headers are found, or not enough headers, or the output element is missing,
            // then there's nothing to do, so we return early.
            return;
        }


        // If the show speed is explicitly set to 0, disable any visual effect.
        if ( 0  ===  settings.showSpeed ) {
            settings.showEffect = 'none';
        }


        // Define rendering functions for different display effects.
        var render = {
            show:      function () { output.hide() .html( html ) .show( settings.showSpeed ); },
            slideDown: function () { output.hide() .html( html ) .slideDown( settings.showSpeed ); },
            fadeIn:    function () { output.hide() .html( html ) .fadeIn( settings.showSpeed ); },
            none:      function () { output.html( html ); } // No effect, just set the HTML.
        };


        // Helper function to extract the numeric level from a header's node name (e.g., "H1" -> 1).
        var get_level = function ( ele ) {
            return  parseInt( ele.nodeName .replace( "H", "" ),  10 );
        };


        // Determine the highest (lowest number) header level present in the document.
        var highest_level = headers .map( function ( _, ele ) {
            return  get_level( ele );
        }) .get() .sort()[ 0 ];


        // HTML snippet for the "back to top" icon/link.
        var return_to_top = '<i class="icon-arrow-up back-to-top"> </i>';


        // Initialize variables for TOC generation.
        var level = get_level( headers[ 0 ] ), // Current header level.
            this_level, // Level of the header currently being processed.
            html = settings.title + " <" + settings.listType + ">"; // Start building the TOC HTML.


        // Attach a click event handler to all selected headers.
        headers .on( 'click', function () {
            // If "back to top" links are enabled, update the URL hash on header click.
            if ( ! settings.noBackToTopLinks ) {
                window.location.hash = this.id;
            }
        })
        .addClass( 'clickable-header' ) // Add a class for styling clickable headers.
        .each( function ( _, header ) { // Iterate over each header to build the TOC structure.

            this_level = get_level( header ); // Get the level of the current header.

            // If "back to top" links are enabled and this is a top-level header,
            // add the "back to top" link after it.
            if ( ! settings.noBackToTopLinks  &&  this_level  ===  highest_level ) {
                $( header ) .addClass( 'top-level-header' ) .after( return_to_top );
            }

            // Logic to construct the nested list based on header levels.
            if ( this_level === level ) { // Current header is at the same level as the previous one.
                html += "<li><a href='#" + fixedEncodeURIComponent( header.id ) + "'>" + header.innerHTML + "</a>";
            }
            else if ( this_level <= level ) { // Current header is at a higher or equal level (less nested) than the previous.
                // Close previous list items and lists until the correct level is reached.
                for ( i = this_level; i < level; i++ ) {
                    html += "</li></" + settings.listType + ">";
                }
                html += "<li><a href='#" + fixedEncodeURIComponent( header.id ) + "'>" + header.innerHTML + "</a>";
            }
            else if ( this_level > level ) { // Current header is at a lower level (more nested) than the previous.
                // Open new lists and list items to create deeper nesting.
                for ( i = this_level; i > level; i-- ) {
                    html += "<" + settings.listType + "><li>";
                }
                html += "<a href='#" + fixedEncodeURIComponent( header.id ) + "'>" + header.innerHTML + "</a>";
            }

            level = this_level; // Update the current level for the next iteration.
        });

        html += "</" + settings.listType + ">"; // Close the main list element.


        // If "back to top" links are enabled, attach a click handler to them.
        if ( ! settings.noBackToTopLinks ) {
            $( document ) .on( 'click', '.back-to-top', function () {
                $( window ) .scrollTop( 0 ); // Scroll the window to the very top.
                window.location.hash = ''; // Clear the fragment identifier from the URL.
            });
        }


        // Execute the chosen display effect to render the TOC.
        render[ settings.showEffect ]();


    }; // End of $.fn.toc function definition.


}) ( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.