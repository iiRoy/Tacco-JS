// Global variable declarations for linting tools.
// global jQuery
// jshint browser:true

/*
 *  FitVids 1.1
 *
 *  Copyright 2013, Chris Coyier - http://css-tricks.com
 *  + Dave Rupert - http://daverupert.com
 *  Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
 *  Released under the WTFPL license - http://sam.zoy.org/wtfpl/
 *
 *  This script makes videos fluidly responsive.
 */

; ( function ( $ ) {

    'use strict'; // Enforce strict mode for cleaner code.

    $.fn.fitVids = function ( options ) {

        // Default settings for the plugin.
        var settings = {
            customSelector: null,
            ignore: null
        };

        // Check if the FitVids style has already been appended to the document.
        if ( ! document.getElementById( 'fit-vids-style' ) ) {

            // appendStyles: Inspired by https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
            var head = document.head || document.getElementsByTagName( 'head' )[ 0 ];

            // The CSS required for fluid video wrappers.
            var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}' +
                      '.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,' +
                      '.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';

            // Create a temporary div to hold the style tag.
            var div = document.createElement( "div" );
            div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';

            // Append the style tag to the document head.
            head.appendChild( div.childNodes[ 1 ] );

        } // End of style injection block.

        // Merge user-provided options with default settings.
        if ( options ) {
            $.extend( settings, options );
        }

        // Iterate over each selected element.
        return this.each( function () {

            // Array of default video selectors.
            var selectors = [
                'iframe[src*="player.vimeo.com"]',
                'iframe[src*="youtube.com"]',
                'iframe[src*="youtube-nocookie.com"]',
                'iframe[src*="kickstarter.com"][src*="video.html"]',
                'object',
                'embed'
            ];

            // Add custom selectors if provided in settings.
            if ( settings.customSelector ) {
                selectors.push( settings.customSelector );
            }

            // Default ignore list class.
            var ignoreList = '.fitvidsignore';

            // Extend ignore list with custom ignore selectors.
            if ( settings.ignore ) {
                ignoreList = ignoreList + ', ' + settings.ignore;
            }

            // Find all videos matching the selectors within the current element.
            var $allVideos = $( this ).find( selectors.join( ',' ) );

            // SwfObj conflict patch: Exclude nested objects.
            $allVideos = $allVideos.not( 'object object' );

            // Disable FitVids for videos matching the ignore list.
            $allVideos = $allVideos.not( ignoreList );

            // Process each found video.
            $allVideos.each( function () {

                var $this = $( this );

                // If the video itself or any of its parents are in the ignore list, skip it.
                if ( $this.parents( ignoreList ).length > 0 ) {
                    return;
                }

                // If it's an embed inside an object or already wrapped, skip it.
                if ( this.tagName.toLowerCase() === 'embed' && $this.parent( 'object' ).length || $this.parent( '.fluid-width-video-wrapper' ).length ) {
                    return;
                }

                // If height and width are not set, or are not valid numbers,
                // assign default values to allow calculation.
                if ( ( ! $this.css( 'height' ) && ! $this.css( 'width' ) ) && ( isNaN( $this.attr( 'height' ) ) || isNaN( $this.attr( 'width' ) ) ) ) {
                    $this.attr( 'height', 9 );
                    $this.attr( 'width', 16 );
                }

                // Determine video dimensions and aspect ratio.
                var height = ( this.tagName.toLowerCase() === 'object' || ( $this.attr( 'height' ) && ! isNaN( parseInt( $this.attr( 'height' ), 10 ) ) ) )
                                ? parseInt( $this.attr( 'height' ), 10 )
                                : $this.height(),
                    width = ! isNaN( parseInt( $this.attr( 'width' ), 10 ) )
                                ? parseInt( $this.attr( 'width' ), 10 )
                                : $this.width(),
                    aspectRatio = height / width;

                // Assign a unique ID if the video doesn't have one.
                if ( ! $this.attr( 'id' ) ) {
                    var videoID = 'fitvid' + Math.floor( Math.random() * 999999 );
                    $this.attr( 'id', videoID );
                }

                // Wrap the video in a responsive div and set padding-top based on aspect ratio.
                $this.wrap( '<div class="fluid-width-video-wrapper"></div>' )
                     .parent( '.fluid-width-video-wrapper' )
                     .css( 'padding-top', ( aspectRatio * 100 ) + '%' );

                // Remove original height and width attributes to allow CSS to control sizing.
                $this.removeAttr( 'height' )
                     .removeAttr( 'width' );

            } ); // End of each video processing.

        } ); // End of each selected element processing.

    }; // End of $.fn.fitVids definition.

// Supports both jQuery and Zepto libraries.
} )( window.jQuery || window.Zepto );