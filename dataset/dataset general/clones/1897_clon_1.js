/*
 * jQuery Tree Plugin - A simple, lightweight tree view implementation.
 *
 * This plugin allows you to transform an unordered list into an interactive tree structure.
 * It supports expanding/collapsing nodes, maintaining state (optionally via cookies),
 * and custom icons for open/closed states.
 *
 * Dependencies:
 *   - jQuery (obviously)
 *   - jQuery.cookie (optional, for persistent state saving/restoring)
 *
 * Author: Your Name/Original Author (as per your knowledge)
 * Version: 1.0.0
 * License: MIT
 */

/*
 * Self-executing anonymous function to encapsulate the plugin and prevent global scope pollution.
 * Passes jQuery as '$' for convenience.
 */
! function ( $ ) {


    // Define the 'tree' plugin method for jQuery objects.
    $.fn.tree = function ( options ) {


        // Initialize configuration settings for the tree.
        // If no options are provided, an empty object is used.
        if ( ! options )
            options = {};


        // Establish the default configuration for the tree.
        // These defaults can be overridden by user-provided 'options'.
        /*
         * Detailed Options:
         *
         *  - open_char:    The character displayed when a node is in an 'open' (expanded) state.
         *                  Default is a downward-pointing triangle (&#9660;).
         *
         *  - close_char:   The character displayed when a node is in a 'close' (collapsed) state.
         *                  Default is a rightward-pointing triangle (&#9658;).
         *
         *  - default_expanded_paths_string:
         *                  A string representing paths to be expanded by default when the tree loads,
         *                  if no cookie is found for state restoration.
         *                  - Use 'all' to expand every node in the tree.
         *                  - Use an empty string '' to have all nodes collapsed initially.
         *                  - Paths are '/' delimited, e.g., '0/1' expands the first child, then its second child.
         *                  - Multiple paths can be comma-separated, e.g., '0,1/0'
         *
         *  - only_one:     Boolean flag. If true, only one branch of the tree can be expanded at any given time.
         *                  Expanding a new branch will collapse previously expanded siblings. Default is false.
         *
         *  - animation:    The speed of the expansion/collapse animation.
         *                  Standard jQuery animation speeds ('slow', 'fast') or a numeric duration (e.g., 400).
         *                  Default is 'slow'.
         */
        var default_options = {
              open_char                     : '&#9660;'
            , close_char                    : '&#9658;'
            , default_expanded_paths_string : ''
            , only_one                      : false
            , animation                     : 'slow'
        };


        // Create a new object 'o' to store the merged options.
        // This ensures that the original 'options' object is not modified.
        var o = {};


        // Merge default options with user-provided options.
        // The properties from 'options' will override those in 'default_options'.
        $.extend( o, default_options, options );


        /**
         * Saves the current expansion state of the tree to a cookie.
         * The state is represented as a string of '/' delimited paths,
         * with multiple paths separated by commas.
         * This method is attached to jQuery's prototype, making it available on jQuery objects.
         */
        $.fn.save_paths = function () {

            var paths        = []
              , path         = []
              , open_nodes   = $( this ).find( 'li span.open' )
              , last_depth   = null;

            // Iterate over all currently open nodes in the tree.
            for ( var i = 0; i < open_nodes.length; i ++ ) {

                // Determine the depth of the current open node within the tree structure.
                // The depth is calculated based on the number of parent 'ul' elements.
                var depth = $( open_nodes[ i ] ).parents( 'ul' ).length - 1;

                // Skip nodes if they are not directly nested or if there's a depth jump.
                // This logic helps to correctly form the path string.
                if ( ( last_depth == null && depth > 0 ) || ( depth > last_depth && depth - last_depth > 1 ) )
                    continue;


                // Get the position of the current node relative to its siblings.
                // This is used to build the path segment.
                var pos = $( open_nodes[ i ] ).parent().prevAll().length;

                // Handle the first node or a new branch.
                if ( last_depth == null ) {
                    path = [ pos ];
                }
                // If moving up the tree (closing branches).
                else if ( depth < last_depth ) {
                    paths.push( path.join( '/' ) ); // Save the completed path.
                    var diff = last_depth - depth;
                    path.splice( path.length - diff - 1, diff + 1 ); // Truncate path.
                    path.push( pos ); // Add current node's position.
                }
                // If at the same depth (sibling node).
                else if ( depth == last_depth ) {
                    paths.push( path.join( '/' ) ); // Save the completed path.
                    path.splice( path.length - 1, 1 ); // Remove last segment.
                    path.push( pos ); // Add current node's position.
                }
                // If moving deeper into the tree (opening a child node).
                else if ( depth > last_depth ) {
                    path.push( pos ); // Append current node's position.
                }


                // Update the last known depth for the next iteration.
                last_depth = depth;

            } // End of loop through open nodes.

            // Add the last accumulated path to the list.
            paths.push( path.join( '/' ) );


            // Attempt to save the compiled state to a cookie.
            // The cookie key can be specified via 'data-cookie' attribute on the tree root.
            var cookie_key = this.data( 'cookie' );

            // If no custom cookie key is provided, use the default.
            if ( ! cookie_key )
                cookie_key = 'jtree-cookie';

            // Use a try-catch block to handle cases where jQuery.cookie plugin might not be available.
            try {
                $.cookie( cookie_key, paths.join( ',' ) );
            }
            catch ( e ) {
                // Silently fail if cookie plugin is not loaded.
                // You might want to log this error in a production environment.
            }

        }; // End of $.fn.save_paths.


        /**
         * Restores the expansion state of the tree from a cookie or default options.
         * This function reads a paths string and expands the corresponding nodes.
         * It is also attached to jQuery's prototype.
         */
        $.fn.restore_paths = function () {

            var paths_string = null;

            // Determine the cookie key, similar to 'save_paths'.
            var cookie_key = this.data( 'cookie' );

            if ( ! cookie_key )
                cookie_key = 'jtree-cookie';

            // Try to retrieve the expansion state from the cookie.
            try {
                paths_string = $.cookie( cookie_key );
            }
            catch ( e ) {
                // If cookie plugin is missing, paths_string remains null.
            }


            // If no cookie data is found, fall back to the default expanded paths from options.
            if ( ! paths_string )
                paths_string = o.default_expanded_paths_string;


            // Handle the 'all' option: expand every single arrow in the tree.
            if ( paths_string == 'all' ) {
                $( this ).find( 'span.jtree-arrow' ).open();
            }
            // Otherwise, parse the paths string and expand specific nodes.
            else {
                var paths = paths_string.split( ',' );

                for ( var i = 0; i < paths.length; i ++ ) {

                    var path = paths[ i ].split( '/' )
                      , obj  = $( this ); // Start from the root of the current tree.

                    for ( var j = 0; j < path.length; j ++ ) {

                        // Navigate to the correct child 'li' element based on the path segment.
                        obj = $( obj.children( 'li' )[ path[ j ] ] );

                        // Open the arrow associated with this node.
                        obj.children( 'span.jtree-arrow' ).open();

                        // Move to the 'ul' (children container) for the next segment of the path.
                        obj = obj.children( 'ul' );

                    } // End of inner path segment loop.

                } // End of outer paths loop.
            }

        }; // End of $.fn.restore_paths.


        /**
         * Expands all collapsible nodes within the current jQuery selection.
         * It handles animation intelligently, ensuring nested elements are
         * opened without animation first to correctly calculate heights.
         *
         * @param {string|number} [animation] - The animation speed or duration.
         *                                      Defaults to the plugin's 'animation' option.
         *                                      Use 'none' to disable animation.
         */
        $.fn.expand = function ( animation ) {

            // Determine the animation setting. 'none' disables it, otherwise use option or provided value.
            animation = ( animation == 'none' ) ? undefined : ( ! animation ) ? o.animation : animation;

            // Find all 'close' arrows that are direct children of an 'li' (first-level collapsible).
            // We only care about closing elements, as open ones are already expanded.
            elems = $( this ).find( '.jtree-arrow.close:first-child' );

            // Recursively open all nested 'close' elements *without* animation.
            // This is crucial to ensure that the parent 'ul' has its full height
            // before animating its expansion.
            elems.siblings( 'ul' ).find( '.jtree-arrow.close' ).open( undefined );

            // Now, open the top-level 'close' elements *with* animation.
            // Their heights are now correctly calculated.
            elems.open( animation );

        }; // End of $.fn.expand.


        /**
         * Collapses all collapsible nodes within the current jQuery selection.
         *
         * @param {string|number} [animation] - The animation speed or duration.
         *                                      Defaults to the plugin's 'animation' option.
         *                                      Use 'none' to disable animation.
         */
        $.fn.collapse = function ( animation ) {

            // Determine the animation setting for collapsing.
            animation = ( animation == 'none' ) ? undefined : ( ! animation ) ? o.animation : animation;

            // Find all 'jtree-arrow' elements and call their 'close' method.
            $( this ).find( '.jtree-arrow' ).close( animation );

        }; // End of $.fn.collapse.


        /**
         * Opens (expands) a single node associated with a '.jtree-arrow' element.
         *
         * @param {string|number} [animation] - The animation speed or duration.
         *                                      If undefined, no animation is used.
         */
        $.fn.open = function ( animation ) {

            // Ensure the target element is actually a '.jtree-arrow'.
            if ( $( this ).hasClass( 'jtree-arrow' ) ) {

                // Show the sibling 'ul' element (the children of this node).
                $( this ).parent().children( 'ul' ).show( animation );

                // Update the arrow's class and character to reflect the 'open' state.
                $( this )
                    .removeClass( 'close' )
                    .addClass( 'open' )
                    .html( o.open_char );

            }

        }; // End of $.fn.open.


        /**
         * Closes (collapses) a single node associated with a '.jtree-arrow' element.
         *
         * @param {string|number} [animation] - The animation speed or duration.
         *                                      If undefined, no animation is used.
         */
        $.fn.close = function ( animation ) {

            // Ensure the target element is a '.jtree-arrow'.
            if ( $( this ).hasClass( 'jtree-arrow' ) ) {

                // Hide the sibling 'ul' element (the children of this node).
                $( this ).parent().children( 'ul' ).hide( animation );

                // Update the arrow's class and character to reflect the 'close' state.
                $( this )
                    .removeClass( 'open' )
                    .addClass( 'close' )
                    .html( o.close_char );

            }

        }; // End of $.fn.close.


        /**
         * Handles the click event for a '.jtree-arrow' element.
         * Toggles the open/close state and handles 'only_one' option logic.
         */
        $.fn.click_event = function () {

            var button = $( this );

            // Proceed only if the clicked element is an arrow.
            if ( button.hasClass( 'jtree-arrow' ) ) {

                // Toggle between 'open' and 'close' based on current state.
                button[ button.hasClass( 'open' ) ? 'close' : 'open' ]( o.animation );

                // If 'only_one' option is enabled, collapse siblings.
                if ( o.only_one )
                    button.closest( 'li' ).siblings().children( 'span.jtree-arrow' ).close( o.animation );

            }

        }; // End of $.fn.click_event.


        // Main loop: Iterate over each selected element to apply the tree functionality.
        for ( var i = 0; i < this.length; i ++ ) {

            // Ensure that the current element is an unordered list (UL).
            if ( this[ i ].tagName === 'UL' ) {

                // Transform the unordered list into a tree structure.
                // Find all 'li' elements that contain a 'ul' (i.e., have children).
                // Prepend a 'jtree-arrow' span to these list items to act as the toggle.
                $( this[ i ] )
                    .find( 'li' )
                    .has( 'ul' )
                    .prepend( '<span class="jtree-arrow close" style="cursor:pointer;">' + o.close_char + '</span>' );

                // Initially hide all child 'ul' elements to start with a collapsed tree.
                $( this[ i ] ).find( 'ul' ).hide();

                // Restore the tree's expansion state from a cookie or default settings.
                $( this[ i ] ).restore_paths();


                // Attach a click event handler to the 'jtree-arrow' spans.
                // This will handle expanding and collapsing nodes.
                $( this[ i ] )
                    .find( 'li > span.jtree-arrow' )
                    .on( 'click', { tree : this[ i ] }, function ( e ) {

                        // Execute the defined click event logic for the arrow.
                        $( this ).click_event();

                        // After any change, save the updated tree paths to the cookie.
                        $( e.data.tree ).save_paths();

                    } );


                // Attach a click event handler for elements with the 'jtree-button' class.
                // This allows custom buttons within list items to trigger the arrow's click behavior.
                $( this[ i ] )
                    .find( 'li .jtree-button' )
                    .on( 'click', { tree : this[ i ] }, function ( e ) {

                        // Find the associated 'jtree-arrow' for the button's parent 'li'.
                        var arrow = $( this ).closest( 'li' ).children( 'span.jtree-arrow' );

                        // Trigger the arrow's click event.
                        arrow.click_event();

                        // Save the tree's state after the action.
                        $( e.data.tree ).save_paths();

                    } );

            } // End of if (tagName === 'UL').

        } // End of main loop.

    }; // End of $.fn.tree definition.


} ( jQuery ); // Invoke the IIFE with jQuery.