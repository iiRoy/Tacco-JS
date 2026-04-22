/*
 * prettySocial.js
 *
 * A jQuery plugin for custom social share buttons.
 *
 * @author Sonny T. <hi@sonnyt.com>
 * @homepage sonnyt.com
 * @license MIT
 */

( function ( $ ) {

    'use strict'; /* Enforce strict mode for cleaner code */

    /**
     * Extends jQuery's prototype with the prettySocial function.
     * This allows chaining and usage like $(selector).prettySocial();
     *
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.prettySocial = function () {

        /**
         * Configuration for various supported social media sites.
         * Each site defines its share URL template and popup window dimensions.
         *
         * @private
         * @type {Object}
         */
        var _sites = {

                // Pinterest sharing configuration
                pinterest: {
                    url: 'http://pinterest.com/pin/create/button/?url={{url}}&media={{media}}&description={{description}}',
                    popup: {
                        width: 685,
                        height: 500
                    }
                },

                // Facebook sharing configuration
                facebook: {
                    url: 'https://www.facebook.com/sharer/sharer.php?s=100&p[title]={{title}}&p[summary]={{description}}&p[url]={{url}}&p[images][0]={{media}}',
                    popup: {
                        width: 626,
                        height: 436
                    }
                },

                // Twitter sharing configuration
                twitter: {
                    url: 'https://twitter.com/share?url={{url}}&via={{via}}&text={{description}}',
                    popup: {
                        width: 685,
                        height: 500
                    }
                },

                // Google+ sharing configuration (Note: Google+ is deprecated, but kept for historical compatibility)
                googleplus: {
                    url: 'https://plus.google.com/share?url={{url}}',
                    popup: {
                        width: 600,
                        height: 600
                    }
                },

                // LinkedIn sharing configuration
                linkedin: {
                    url: 'https://www.linkedin.com/shareArticle?mini=true&url={{url}}&title={{title}}&summary={{description}}+&source={{via}}',
                    popup: {
                        width: 600,
                        height: 600
                    }
                }
            }, /* End of _sites object */



            /**
             * Opens a new pop-up window centered on the screen.
             * This function is primarily intended for desktop browsers.
             *
             * @private
             * @param  {Object} site - The configuration object for the selected social site.
             * @param  {String} url  - The fully constructed URL to be opened in the popup.
             * @returns {Window} A reference to the newly opened window.
             */
            _popup = function ( site, url ) {

                // Calculate the horizontal position to center the popup.
                var left = ( window.innerWidth / 2 ) - ( site.popup.width / 2 ),
                    // Calculate the vertical position to center the popup.
                    top = ( window.innerHeight / 2 ) - ( site.popup.height / 2 );

                // Open the new window with specific features to create a "popup" effect.
                return window.open(
                    url,
                    '',
                    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + site.popup.width + ', height=' + site.popup.height + ', top=' + top + ', left=' + left
                );
            }, /* End of _popup function */



            /**
             * Replaces placeholders in a social site's URL template with actual data.
             * This function prepares the final share URL.
             *
             * @private
             * @param  {Object} site - The configuration object for the selected social site.
             * @param  {Object} link - An object containing share data (url, title, description, media, via).
             * @returns {String} The polished URL ready for sharing.
             */
            _linkFix = function ( site, link ) {

                // Start with the site's base URL template and sequentially replace placeholders.
                var url = site.url
                    .replace( /{{url}}/g, encodeURIComponent( link.url ) )           // Replace URL placeholder
                    .replace( /{{title}}/g, encodeURIComponent( link.title ) )       // Replace title placeholder
                    .replace( /{{description}}/g, encodeURIComponent( link.description ) ) // Replace description placeholder
                    .replace( /{{media}}/g, encodeURIComponent( link.media ) )       // Replace media (image) placeholder
                    .replace( /{{via}}/g, encodeURIComponent( link.via ) );         // Replace 'via' (source/author) placeholder

                return url;
            }; /* End of _linkFix function */

        // Iterate over each selected element to apply the prettySocial functionality.
        return this.each( function() {

            // Cache the current jQuery object for better performance and readability.
            var $this = $( this );

            // Determine the type of social network from the data-type attribute.
            var type = $this.data( 'type' ),

                // Retrieve the corresponding social site configuration, or null if not found.
                site = _sites[ type ] || null;

            // Check if a valid social site was specified.
            if ( !site ) {
                // If not, throw an error to indicate misconfiguration.
                $.error( 'Social site is not set for element: ' + $this.prop( 'tagName' ) + '#' + $this.attr( 'id' ) + '.' );
            }

            // Gather all necessary link information from data attributes of the current element.
            var link = {
                url: $this.data( 'url' ) || '',                     // The URL to share
                title: $this.data( 'title' ) || '',                 // The title for the share
                description: $this.data( 'description' ) || '',     // The description/summary for the share
                media: $this.data( 'media' ) || '',                 // The media (e.g., image URL) for the share
                via: $this.data( 'via' ) || ''                      // The 'via' or source for the share (e.g., Twitter handle)
            };

            // Prepare the final sharing URL using the _linkFix utility.
            var url = _linkFix( site, link );

            // Differentiate behavior for mobile vs. desktop browsers.
            // Mobile devices often handle links differently and may require 'touchstart/touchend'.
            if ( navigator.userAgent.match( /Android|IEMobile|BlackBerry|iPhone|iPad|iPod|Opera Mini/i ) ) {

                $this
                    // Bind 'touchstart' event for initial touch detection.
                    .bind( 'touchstart', function ( e ) {
                        // If multiple touches, ignore and let default behavior occur.
                        if ( e.originalEvent.touches.length > 1 ) {
                            return;
                        }

                        // Mark that the touch started without scrolling.
                        $this.data( 'touchWithoutScroll', true );
                    } )
                    // Bind 'touchmove' event to detect if the user is scrolling.
                    .bind( 'touchmove', function () {
                        // If touchmove occurs, it means the user is scrolling, so reset the flag.
                        $this.data( 'touchWithoutScroll', false );

                        return; // Exit the handler
                    } )
                    // Bind 'touchend' event to finalize the touch action.
                    .bind( 'touchend', function ( e ) {
                        // Prevent default touch action (e.g., link navigation).
                        e.preventDefault();

                        // Retrieve the flag indicating if it was a simple tap or a scroll.
                        var touchWithoutScroll = $this.data( 'touchWithoutScroll' );

                        // If multiple touches or it was a scroll, do nothing.
                        if ( e.originalEvent.touches.length > 1 || !touchWithoutScroll ) {
                            return;
                        }

                        // Call the popup window function for sharing.
                        _popup( site, url );
                    } );
            } else {
                // For desktop browsers, simply bind a 'click' event.
                $this.bind( 'click', function ( e ) {
                    // Prevent the default link behavior.
                    e.preventDefault();

                    // Call the popup window function for sharing.
                    _popup( site, url );
                } );
            }
        } ); // End of this.each()
    }; // End of $.fn.prettySocial

} )( jQuery ); // End of IIFE, passing jQuery as $