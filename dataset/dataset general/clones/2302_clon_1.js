/***********************************************************************************************************************
 * Bootstrap 3.0 IconPicker - jQuery plugin for Icon selection                                                         *
 *                                                                                                                     *
 * Copyright (c) 20013 A. K. M. Rezaul Karim<titosust@gmail.com>                                                       *
 *                                                                                                                     *
 * Licensed under the MIT license:                                                                                     *
 *   http://www.opensource.org/licenses/mit-license.php                                                                *
 *                                                                                                                     *
 * Project home:                                                                                                       *
 *   https://github.com/titosust/Bootstrap-icon-picker                                                                 *
 *                                                                                                                     *
 * Version:  1.0.0                                                                                                     *
 ***********************************************************************************************************************/

( function ( $ ) {


    // Extends jQuery to add the iconPicker functionality
    $.fn.iconPicker = function ( options ) {


        var mouseOver = false; /* Flag to track mouse interaction with the popup */
        var $popup    = null;  /* jQuery object for the icon selection popup */

        // Array containing all available Glyphicon icon names
        var icons     = new Array ( "adjust" , "align-center" , "align-justify" , "align-left" , "align-right" , "arrow-down" , "arrow-left" , "arrow-right" , "arrow-up" , "asterisk" , "backward" , "ban-circle" , "barcode" , "bell" , "bold" , "book" , "bookmark" , "briefcase" , "bullhorn" , "calendar" , "camera" , "certificate" , "check" , "chevron-down" , "chevron-left" , "chevron-right" , "chevron-up" , "circle-arrow-down" , "circle-arrow-left" , "circle-arrow-right" , "circle-arrow-up" , "cloud" , "cloud-download" , "cloud-upload" , "cog" , "collapse-down" , "collapse-up" , "comment" , "compressed" , "copyright-mark" , "credit-card" , "cutlery" , "dashboard" , "download" , "download-alt" , "earphone" , "edit" , "eject" , "envelope" , "euro" , "exclamation-sign" , "expand" , "export" , "eye-close" , "eye-open" , "facetime-video" , "fast-backward" , "fast-forward" , "file" , "film" , "filter" , "fire" , "flag" , "flash" , "floppy-disk" , "floppy-open" , "floppy-remove" , "floppy-save" , "floppy-saved" , "folder-close" , "folder-open" , "font" , "forward" , "fullscreen" , "gbp" , "gift" , "glass" , "globe" , "hand-down" , "hand-left" , "hand-right" , "hand-up" , "hd-video" , "hdd" , "header" , "headphones" , "heart" , "heart-empty" , "home" , "import" , "inbox" , "indent-left" , "indent-right" , "info-sign" , "italic" , "leaf" , "link" , "list" , "list-alt" , "lock" , "log-in" , "log-out" , "magnet" , "map-marker" , "minus" , "minus-sign" , "move" , "music" , "new-window" , "off" , "ok" , "ok-circle" , "ok-sign" , "open" , "paperclip" , "pause" , "pencil" , "phone" , "phone-alt" , "picture" , "plane" , "play" , "play-circle" , "plus" , "plus-sign" , "print" , "pushpin" , "qrcode" , "question-sign" , "random" , "record" , "refresh" , "registration-mark" , "remove" , "remove-circle" , "remove-sign" , "repeat" , "resize-full" , "resize-horizontal" , "resize-small" , "resize-vertical" , "retweet" , "road" , "save" , "saved" , "screenshot" , "sd-video" , "search" , "send" , "share" , "share-alt" , "shopping-cart" , "signal" , "sort" , "sort-by-alphabet" , "sort-by-alphabet-alt" , "sort-by-attributes" , "sort-by-attributes-alt" , "sort-by-order" , "sort-by-order-alt" , "sound-5-1" , "sound-6-1" , "sound-7-1" , "sound-dolby" , "sound-stereo" , "star" , "star-empty" , "stats" , "step-backward" , "step-forward" , "stop" , "subtitles" , "tag" , "tags" , "tasks" , "text-height" , "text-width" , "th" , "th-large" , "th-list" , "thumbs-down" , "thumbs-up" , "time" , "tint" , "tower" , "transfer" , "trash" , "tree-conifer" , "tree-deciduous" , "unchecked" , "upload" , "usd" , "user" , "volume-down" , "volume-off" , "volume-up" , "warning-sign" , "wrench" , "zoom-in" , "zoom-out" );


        // Default settings for the plugin
        var settings  = $.extend (
            {
                /* No default settings defined yet, but this is where they would go */
            } ,
            options
        );


        // Iterate over each selected element to apply the iconPicker
        return this.each ( function () {

            var element = this; // Store reference to the current DOM element


            // Only proceed if buttonOnly is not set and iconPicker is not already attached
            if ( ! settings.buttonOnly && $ ( this ).data ( "iconPicker" ) == undefined ) {

                // Wrap the input element with an input-group for Bootstrap styling
                var $this   = $ ( this ).addClass ( "form-control" );
                var $wraper = $ ( "<div/>" , { class : "input-group" } );
                $this.wrap ( $wraper );

                // Add the button addon next to the input field
                var $button = $ ( "<span class=\"input-group-addon pointer\"><i class=\"glyphicon  glyphicon-picture\"></i></span>" );
                $this.after ( $button );


                // Attach click event handler to the button
                ( function ( ele ) {
                    $button.click ( function () {
                        createUI ( ele );         // Create the popup UI
                        showList ( ele , icons ); // Populate and display the icon list
                    } );
                } ) ( $this );

                // Mark the element as having iconPicker attached to prevent re-initialization
                $ ( this ).data ( "iconPicker" , { attached : true } );
            }


            /**
             * Creates and displays the icon selection popup UI.
             * @param {jQuery} $element The input element associated with the icon picker.
             */
            function createUI ( $element ) {

                // Initialize popup element with dynamic positioning
                $popup = $ ( '<div/>' , {
                    css   : {
                        'top'  : $element.offset ().top + $element.outerHeight () + 6 ,
                        'left' : $element.offset ().left
                    } ,
                    class : 'icon-popup'
                } );

                // Populate the popup with control elements (pagination, search) and icon list container
                $popup.html ( '<div class="ip-control"> \
						          <ul> \
						            <li><a href="javascript:;" class="btn" data-dir="-1"><span class="glyphicon  glyphicon-fast-backward"></span></a></li> \
						            <li><input type="text" class="ip-search glyphicon  glyphicon-search" placeholder="Search" /></li> \
						            <li><a href="javascript:;"  class="btn" data-dir="1"><span class="glyphicon  glyphicon-fast-forward"></span></a></li> \
						          </ul> \
						      </div> \
						     <div class="icon-list"> </div> \
					         ' ).appendTo ( "body" );


                // Add Bootstrap dropdown-menu class and show the popup
                $popup.addClass ( 'dropdown-menu' ).show ();

                // Set mouseOver flag based on mouse interaction with the popup
                $popup.mouseenter ( function () { mouseOver = true; } ).mouseleave ( function () { mouseOver = false; } );


                var lastVal       = "" ,
                    start_index   = 0 ,
                    per_page      = 30 ,
                    end_index     = start_index + per_page;

                // Handle pagination clicks (fast-backward, fast-forward)
                $ ( ".ip-control .btn" , $popup ).click ( function ( e ) {
                    e.stopPropagation (); // Prevent event from bubbling up
                    var dir = $ ( this ).attr ( "data-dir" );
                    start_index = start_index + per_page * dir;
                    start_index = start_index < 0 ? 0 : start_index;

                    // Update visible icons based on pagination
                    if ( start_index + per_page <= 210 ) {
                        $.each ( $ ( ".icon-list>ul li" ) , function ( i ) {
                            if ( i >= start_index && i < start_index + per_page ) {
                                $ ( this ).show ();
                            } else {
                                $ ( this ).hide ();
                            }
                        } );
                    } else {
                        start_index = 180; // Reset if out of bounds
                    }
                } );


                // Handle search input keyup event
                $ ( '.ip-control .ip-search' , $popup ).on ( "keyup" , function ( e ) {
                    if ( lastVal != $ ( this ).val () ) {
                        lastVal = $ ( this ).val ();
                        if ( lastVal == "" ) {
                            showList ( icons ); // Show all icons if search is empty
                        } else {
                            // Filter icons based on search query
                            showList ( $element , $ ( icons )
                                .map ( function ( i , v ) {
                                    if ( v.toLowerCase ().indexOf ( lastVal.toLowerCase () ) != -1 ) { return v }
                                } ).get () );
                        }

                    }
                } );

                // Close popup when clicking outside of it
                $ ( document ).mouseup ( function ( e ) {
                    if ( ! $popup.is ( e.target ) && $popup.has ( e.target ).length === 0 ) {
                        removeInstance (); // Remove the popup
                    }
                } );

            }

            /**
             * Removes the icon selection popup from the DOM.
             */
            function removeInstance () {
                $ ( ".icon-popup" ).remove ();
            }


            /**
             * Populates the icon list within the popup with provided icon names.
             * @param {jQuery} $element The input element associated.
             * @param {Array} arrLis An array of icon names to display.
             */
            function showList ( $element , arrLis ) {

                var $ul = $ ( "<ul>" ); // Create an unordered list for icons


                // Append each icon as a list item with a link
                for ( var i in arrLis ) {
                    $ul.append ( "<li><a href=\"#\" title=" + arrLis [ i ] + "><span class=\"glyphicon  glyphicon-" + arrLis [ i ] + "\"></span></a></li>" );
                }
                ;

                // Set the generated list as the content of the icon-list div
                $ ( ".icon-list" , $popup ).html ( $ul );

                // Attach click handler to each icon link
                $ ( ".icon-list li a" , $popup ).click ( function ( e ) {
                    e.preventDefault (); // Prevent default link behavior
                    var title = $ ( this ).attr ( "title" );
                    $element.val ( "glyphicon glyphicon-" + title ); // Set the input value
                    removeInstance (); // Close the popup
                } );
            }

        } );
    };


} ( jQuery ) );