/*
 * lazyYT - A lightweight JavaScript plugin to lazy load YouTube videos.
 *
 * Version: 1.0.1
 * Date: December 30, 2014
 *
 * License: Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
 *          For more details, see: http://creativecommons.org/licenses/by-sa/4.0/
 *
 * Original project contributors:
 *   - https://github.com/tylerpearson/lazyYT/graphs/contributors
 *   - https://github.com/daugilas/lazyYT/graphs/contributors
 *
 * Basic Usage Example:
 *   <div class="lazyYT" data-youtube-id="laknj093n" data-parameters="rel=0">loading...</div>
 *   The text inside the div will be used as the initial loading message,
 *   which is then replaced by the video title once fetched.
 */


; ( function ( $ )
{
    // Ensure strict mode for cleaner code and fewer errors.
    'use strict';


    /**
     * Sets up a single lazyYT element with the necessary HTML structure and event handlers.
     *
     * @param {jQuery} $el The jQuery-wrapped element to set up.
     * @param {object} settings The plugin settings.
     */
    function setUp ( $el, settings )
    {
        // Retrieve various data attributes from the element or fall back to settings.
        var width                  =   $el.data( 'width'         )
          , height                 =   $el.data( 'height'        )
          , ratio                  = ( $el.data( 'ratio' ) ) ? $el.data( 'ratio' ) : settings.default_ratio
          , id                     =   $el.data( 'youtube-id'    )
          , padding_bottom                                                 // To store calculated padding for aspect ratio.
          , innerHtml              =   []                                 // Array to build the inner HTML efficiently.
          , $thumb                                                         // jQuery object for the thumbnail element.
          , thumb_img                                                      // Stores the name of the thumbnail image file.
          , loading_text           = $el.text() ? $el.text() : settings.loading_text // Text displayed before video title loads.
          , youtube_parameters     = $el.data( 'parameters' ) || '';     // Additional YouTube player parameters.


        // Split the ratio string (e.g., "16:9") into an array of two numbers.
        ratio                      =   ratio.split( ":" );


        // --- Determine the video container's dimensions and aspect ratio padding. ---

        // If both width and height are explicitly provided as numbers.
        if
        (
               typeof width  === 'number'
            && typeof height === 'number'
        )
        {
            $el.width( width );
            padding_bottom = height + 'px';
        }
        // If only width is provided as a number.
        else if ( typeof width === 'number' )
        {
            $el.width( width );
            // Calculate height based on the provided width and the aspect ratio.
            padding_bottom = ( width * ratio[1] / ratio[0] ) + 'px';
        }
        // If neither width nor height is explicitly provided, assume fluid width.
        else
        {
            width = $el.width();

            // Special handling for fluid layouts: if initial width is 0,
            // it means the container hasn't rendered or is taking parent's width.
            if ( width == 0 )
            {
                width = $el.parent().width();
            }

            // For fluid containers, use percentage padding-bottom for aspect ratio.
            padding_bottom = ( ratio[1] / ratio[0] * 100 ) + '%';
        }


        // --- Construct the HTML content that will be placed inside the 'lazyYT' container. ---

        // Start of the thumbnail container.
        innerHtml.push( '<div class="ytp-thumbnail">' );

            // Start of the YouTube-style large play button.
            innerHtml.push( '<div class="ytp-large-play-button"' );
            // Apply scale transformation if the container width is small (for responsive design).
            if ( width <= 640 ) innerHtml.push( ' style="transform: scale(0.563888888888889);"' );
            innerHtml.push( '>' );

            // Start of the SVG element for the play button icon.
            innerHtml.push( '<svg>' );
                // Path for the main background shape of the play button.
                innerHtml.push( '<path fill-rule="evenodd" clip-rule="evenodd" fill="#1F1F1F" class="ytp-large-play-button-svg" d="M84.15,26.4v6.35c0,2.833-0.15,5.967-0.45,9.4c-0.133,1.7-0.267,3.117-0.4,4.25l-0.15,0.95c-0.167,0.767-0.367,1.517-0.6,2.25c-0.667,2.367-1.533,4.083-2.6,5.15c-1.367,1.4-2.967,2.383-4.8,2.95c-0.633,0.2-1.316,0.333-2.05,0.4c-0.767,0.1-1.3,0.167-1.6,0.2c-4.9,0.367-11.283,0.617-19.15,0.75c-2.434,0.034-4.883,0.067-7.35,0.1h-2.95C38.417,59.117,34.5,59.067,30.3,59c-8.433-0.167-14.05-0.383-16.85-0.65c-0.067-0.033-0.667-0.117-1.8-0.25c-0.9-0.133-1.683-0.283-2.35-0.45c-2.066-0.533-3.783-1.5-5.15-2.9c-1.033-1.067-1.9-2.783-2.6-5.15C1.317,48.867,1.133,48.117,1,47.35L0.8,46.4c-0.133-1.133-0.267-2.55-0.4-4.25C0.133,38.717,0,35.583,0,32.75V26.4c0-2.833,0.133-5.95,0.4-9.35l0.4-4.25c0.167-0.966,0.417-2.05,0.75-3.25c0.7-2.333,1.567-4.033,2.6-5.1c1.367-1.434,2.967-2.434,4.8-3c0.633-0.167,1.333-0.3,2.1-0.4c0.4-0.066,0.917-0.133,1.55-0.2c4.9-0.333,11.283-0.567,19.15-0.7C35.65,0.05,39.083,0,42.05,0L45,0.05c2.467,0,4.933,0.034,7.4,0.1c7.833,0.133,14.2,0.367,19.1,0.7c0.3,0.033,0.833,0.1,1.6,0.2c0.733,0.1,1.417,0.233,2.05,0.4c1.833,0.566,3.434,1.566,4.8,3c1.066,1.066,1.933,2.767,2.6,5.1c0.367,1.2,0.617,2.284,0.75,3.25l0.4,4.25C84,20.45,84.15,23.567,84.15,26.4z M33.3,41.4L56,29.6L33.3,17.75V41.4z"></path>' );
                // Polygon for the white play arrow on top of the dark background.
                innerHtml.push( '<polygon fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" points="33.3,41.4 33.3,17.75 56,29.6"></polygon>' );
            innerHtml.push( '</svg>' ); // End of SVG element.
            innerHtml.push( '</div>' ); // End of .ytp-large-play-button.

        innerHtml.push( '</div>' ); // End of .ytp-thumbnail.


        // --- Video title (info bar) ---
        innerHtml.push( '<div class="html5-info-bar">' );
            innerHtml.push( '<div class="html5-title">' );
                innerHtml.push( '<div class="html5-title-text-wrapper">' );
                    // Link for the video title, opening in a new tab.
                    innerHtml.push( '<a id="lazyYT-title-', id, '" class="html5-title-text" target="_blank" tabindex="3100" href="https://www.youtube.com/watch?v=', id, '">' );
                        innerHtml.push( loading_text ); // Initial loading text.
                    innerHtml.push( '</a>' );
                innerHtml.push( '</div>' ); // End of .html5-title-text-wrapper.
            innerHtml.push( '</div>' ); // End of .html5-title.
        innerHtml.push( '</div>' ); // End of .html5-info-bar.


        // Apply calculated padding to maintain aspect ratio and inject the generated HTML.
        $el.css(
            {
                'padding-bottom': padding_bottom
            }
        )
        .html( innerHtml.join( '' ) ); // Join array elements into a single string and set as HTML.


        // --- Determine the best quality thumbnail image based on container width. ---
        if ( width > 640 )
        {
            thumb_img = 'maxresdefault.jpg';
        }
        else if ( width > 480 )
        {
            thumb_img = 'sddefault.jpg';
        }
        else if ( width > 320 )
        {
            thumb_img = 'hqdefault.jpg';
        }
        else if ( width > 120 )
        {
            thumb_img = 'mqdefault.jpg';
        }
        else if ( width == 0 ) // Fallback for cases where width calculation might fail (e.g., hidden elements).
        {
            thumb_img = 'hqdefault.jpg';
        }
        else
        {
            thumb_img = 'default.jpg';
        }


        // Select the thumbnail element, apply background image, add class, and attach click handler.
        $thumb = $el.find( '.ytp-thumbnail' ).css(
            {
                'background-image': [ 'url(http://img.youtube.com/vi/', id, '/', thumb_img, ')' ].join( '' )
            }
        )
        .addClass( 'lazyYT-image-loaded' ) // Mark that the thumbnail image has been loaded/set.
        .on( 'click', function ( e )
        {
            // Prevent default link behavior or other clicks if any.
            e.preventDefault();

            // Only load the video iframe if it hasn't been loaded yet and the image is visible.
            if ( ! $el.hasClass( 'lazyYT-video-loaded' ) && $thumb.hasClass( 'lazyYT-image-loaded' ) )
            {
                // Replace the thumbnail and play button with the YouTube iframe.
                $el.html( '<iframe src="//www.youtube.com/embed/' + id + '?autoplay=1&' + youtube_parameters + '" frameborder="0" allowfullscreen></iframe>' )
                   .addClass( 'lazyYT-video-loaded' ); // Mark that the video iframe has been loaded.
            }
        });


        // Fetch video title from YouTube's GData API (v2) using JSONP.
        // This is done asynchronously after the initial setup.
        $.getJSON( 'https://gdata.youtube.com/feeds/api/videos/' + id + '?v=2&alt=json', function ( data )
        {
            // Update the loading text with the actual video title once data is received.
            $el.find( '#lazyYT-title-' + id ).text( data.entry.title.$t );
        });

    } // End of setUp function.


    /**
     * lazyYT jQuery plugin definition.
     * Initializes lazy loading for YouTube videos on selected elements.
     *
     * @param {object} newSettings Optional settings to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.lazyYT = function ( newSettings )
    {
      // Default settings for the plugin.
      var defaultSettings = {
        loading_text    : 'Loading...'     , // Default text shown before video title is fetched.
        default_ratio   : '16:9'           , // Default aspect ratio if not specified via data-ratio.
        callback        : null             , // Placeholder for a future callback function (ToDo).
        container_class : 'lazyYT-container' // Class added to the lazyYT container element.
      };

      // Merge default settings with any provided new settings.
      var settings = $.extend( defaultSettings, newSettings );

      // Iterate over each selected element and apply the lazyYT setup.
      return this.each( function ()
      {
          // Wrap the current element in a jQuery object and add the container class.
          var $el = $( this ).addClass( settings.container_class );
          // Call the setup function for this element with the merged settings.
          setUp( $el, settings );
      } );
    };

} ( jQuery ) ); // Immediately invoked function expression (IIFE) with jQuery passed as $ parameter.