/*
 * jQuery.NiceFileInput.js
 * --------------------------------------
 * Nice File Input - A jQuery plugin designed to make file input elements
 * easily styleable with CSS, enhancing the user experience.
 *
 * Developed by Jorge Moreno - @alterebro
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * This plugin builds upon foundational concepts and implementations from:
 *   - Shaun Inman (original concept and styling approach)
 *     http://www.shauninman.com/archive/2007/09/10/styling_file_inputs_with_css_and_the_dom
 *   - Mika Tuupola (initial jQuery plugin implementation)
 *     http://www.appelsiini.net/projects/filestyle
 *
 * Version: 1.0.0
 * Date: 2023-10-27
 *
 */
( function ( $ ) {

    // Extend jQuery's prototype with our new plugin function
    $.fn.nicefileinput = function ( options ) {

        // Default settings for the plugin
        var settings = {
            label    :   'Browse...', // Text displayed on the custom button
            fullPath :   false         // Whether to display the full path or just the filename
        };

        // Merge user-provided options with default settings
        if ( options ) {
            $.extend( settings, options );
        }
        ; // The semicolon here is part of the original code, retained for Type I.


        // Iterate over each selected element to apply the plugin
        return this.each( function () {

            var self = this; // Cache the current DOM element reference

            // Proceed only if the element hasn't been styled yet
            if ( $ ( self ) . attr ( 'data-styled' ) === undefined ) {

                // Generate a unique identifier for this instance
                var r     =   Math . round ( Math . random ( ) * 10000 ) ;
                var d     =   new Date ( ) ;
                var guid  =   d . getTime ( ) + r . toString ( ) ;


                // Create the filename display input field
                var filename = $ ( '<input type="text" readonly="readonly">' )
                    . css ( {
                        'display'   :   'block' ,
                        'float'     :   'left'  ,
                        'margin'    :   0       ,
                        'padding'   :   '0 5px'
                    } )
                    . addClass ( 'NFI-filename NFI' + guid ) ;


                // Create the custom button wrapper
                var wrapper = $ ( "<div>" )
                    . css ( {
                        'overflow'      :   'hidden'     ,
                        'position'      :   'relative'   ,
                        'display'       :   'block'      ,
                        'float'         :   'left'       ,
                        'white-space'   :   'nowrap'     ,
                        'text-align'    :   'center'
                    } )
                    . addClass ( 'NFI-button NFI' + guid )
                    . html ( settings . label ) ; // Set the button text from settings


                // Insert the filename input after the original file input
                $ ( self ) . after ( filename ) ;

                // Wrap the original file input with the custom button wrapper
                $ ( self ) . wrap ( wrapper ) ;


                // Wrap both the custom button and the filename input in a common container
                $ ( '.NFI' + guid ) . wrapAll ( '<div class="NFI-wrapper" id="NFI-wrapper-' + guid + '" />' ) ;

                // Apply styles to the newly created wrapper
                $ ( '.NFI-wrapper' ) . css ( {
                    'overflow'       :   'auto'         ,
                    'display'        :   'inline-block'
                } ) ;

                // Copy classes from the original file input to the new wrapper
                $ ( "#NFI-wrapper-" + guid ) . addClass ( $ ( self ) . attr ( "class" ) ) ;


                // Apply necessary styles to the original file input to make it invisible but functional
                $ ( self )
                    . css ( {
                        'opacity'   :   0         , // Make it completely transparent
                        'position'  :   'absolute', // Position it over the custom button
                        'border'    :   'none'    ,
                        'margin'    :   0         ,
                        'padding'   :   0         ,
                        'top'       :   0         ,
                        'right'     :   0         ,
                        'cursor'    :   'pointer' , // Indicate it's clickable
                        'height'    :   '60px'    // Ensure sufficient height for interaction
                    } )
                    . addClass ( 'NFI-current' ) ; // Add a class for identification

                // Attach a change event handler to the original file input
                $ ( self ) . on ( "change" , function ( ) {

                    var fullPath = $ ( self ) . val ( ) ; // Get the full path from the file input

                    // Check if the full path should be displayed
                    if ( settings . fullPath ) {
                        filename . val ( fullPath ) ; // Display the full path
                    } else {
                        // Extract only the filename from the path
                        var pathArray = fullPath . split ( /[/\\\\]/ ) ; // Split by both forward and back slashes
                        filename . val ( pathArray [ pathArray . length - 1 ] ) ; // Display the last part (filename)
                    }

                } ) ;

                // Mark the original file input as styled to prevent re-initialization
                $ ( self ) . attr ( 'data-styled' , true ) ;

            } // End of data-styled check

        } ) ; // End of each loop

    } ; // End of plugin definition

} ) ( jQuery ) ; // End of IIFE, passing jQuery alias