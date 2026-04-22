/***********************************************************************************************************************
 *
 *  jQuery Tags Input Plugin 1.3.3
 *  Copyright (c) 2011 XOXCO, Inc
 *  Documentation: http://xoxco.com/clickable/jquery-tags-input
 *  Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *  Contact: ben@xoxco.com
 *
 **********************************************************************************************************************/

( function( $ ) {

    var delimiter      = new Array(); // Stores delimiters for each tags input instance
    var tags_callbacks = new Array(); // Stores callback functions for each tags input instance


    // Function to handle automatic resizing of the input field
    $.fn.doAutosize = function( o ) {

        var minWidth    = $( this ).data( 'minwidth' ),
            maxWidth    = $( this ).data( 'maxwidth' ),
            val         = '',
            input       = $( this ),
            testSubject = $( '#' + $( this ).data( 'tester_id' ) );


        // If the value hasn't changed, no need to resize
        if ( val === ( val = input.val() ) ) {
            return;
        }

        // Prepare content for the test subject (hidden element used for width calculation)
        var escaped = val.replace( /&/g, '&amp;' )
                         .replace( /\s/g, ' ' )
                         .replace( /</g, '&lt;' )
                         .replace( />/g, '&gt;' );

        testSubject.html( escaped );

        // Calculate new width based on content and comfort zone
        var testerWidth = testSubject.width(),
            newWidth    = ( testerWidth + o.comfortZone ) >= minWidth ? testerWidth + o.comfortZone : minWidth,
            currentWidth = input.width(),
            isValidWidthChange = ( ( newWidth < currentWidth && newWidth >= minWidth ) ||
                                   ( newWidth > minWidth && newWidth < maxWidth ) );

        // Apply width change if valid
        if ( isValidWidthChange ) {
            input.width( newWidth );
        }

    };

    // Initializes or resets the autosize functionality for an input
    $.fn.resetAutosize = function( options ) {

        // Determine min and max width for the input field
        var minWidth = $( this ).data( 'minwidth' ) || options.minInputWidth || $( this ).width(),
            maxWidth = $( this ).data( 'maxwidth' ) || options.maxInputWidth || ( $( this ).closest( '.tagsinput' ).width() - options.inputPadding ),
            val      = '',
            input    = $( this ),
            // Create a hidden tester element to measure text width
            testSubject = $( '<tester/>' ).css( {
                position    : 'absolute',
                top         : -9999,
                left        : -9999,
                width       : 'auto',
                fontSize    : input.css( 'fontSize' ),
                fontFamily  : input.css( 'fontFamily' ),
                fontWeight  : input.css( 'fontWeight' ),
                letterSpacing: input.css( 'letterSpacing' ),
                whiteSpace  : 'nowrap'
            } ),
            testerId = $( this ).attr( 'id' ) + '_autosize_tester';

        // Append tester to body if it doesn't exist
        if ( !$( '#' + testerId ).length > 0 ) {
            testSubject.attr( 'id', testerId );
            testSubject.appendTo( 'body' );
        }

        // Store autosize data on the input element
        input.data( 'minwidth', minWidth );
        input.data( 'maxwidth', maxWidth );
        input.data( 'tester_id', testerId );
        input.css( 'width', minWidth );
    };


    // Adds a new tag to the input field
    $.fn.addTag = function( value, options ) {
        // Merge default options with provided options
        options = jQuery.extend( { focus : false, callback : true }, options );

        this.each( function() {
            var id = $( this ).attr( 'id' ); // Get the ID of the current tags input

            // Split existing tags by delimiter
            var tagslist = $( this ).val().split( delimiter[id] );

            // If the list is empty, initialize a new array
            if ( tagslist[0] == '' ) {
                tagslist = new Array();
            }

            // Trim whitespace from the new tag value
            value = jQuery.trim( value );

            var skipTag = false;

            // Check for uniqueness if required
            if ( options.unique ) {
                skipTag = $( this ).tagExist( value );
                if ( skipTag == true ) {
                    // Mark the fake input as 'not_valid' for styling purposes
                    $( '#' + id + '_tag' ).addClass( 'not_valid' );
                }
            } else {
                skipTag = false; // No uniqueness check, so don't skip
            }


            // Add the tag if it's not empty and not a duplicate (if unique option is set)
            if ( value != '' && skipTag != true ) {

                // Create the tag HTML element
                $( '<span>' ).addClass( 'tag' ).append(
                    $( '<span>' ).text( value ).append( '&nbsp;&nbsp;' ),
                    $( '<a>', {
                        href  : '#',
                        title : 'Removing tag',
                        text  : 'x'
                    } ).click( function() {
                        return $( '#' + id ).removeTag( escape( value ) ); // Handle tag removal
                    } )
                ).insertBefore( '#' + id + '_addTag' ); // Insert before the add tag input

                tagslist.push( value ); // Add the new tag to the internal list

                $( '#' + id + '_tag' ).val( '' ); // Clear the fake input field

                // Set focus based on options
                if ( options.focus ) {
                    $( '#' + id + '_tag' ).focus();
                } else {
                    $( '#' + id + '_tag' ).blur();
                }

                // Update the hidden input field with the new tags list
                $.fn.tagsInput.updateTagsField( this, tagslist );

                // Execute onAddTag callback if defined
                if ( options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag'] ) {
                    var f = tags_callbacks[id]['onAddTag'];
                    f.call( this, value );
                }

                // Execute onChange callback if defined
                if ( tags_callbacks[id] && tags_callbacks[id]['onChange'] ) {
                    var i = tagslist.length;
                    var f = tags_callbacks[id]['onChange'];
                    f.call( this, $( this ), tagslist[i - 1] );
                }
            }
        } );

        return false; // Prevent default action
    };


    // Removes a tag from the input field
    $.fn.removeTag = function( value ) {
        value = unescape( value ); // Decode the value

        this.each( function() {
            var id = $( this ).attr( 'id' ); // Get the ID of the current tags input

            var old = $( this ).val().split( delimiter[id] ); // Get existing tags

            $( '#' + id + '_tagsinput .tag' ).remove(); // Remove all visible tag elements

            str = ''; // Initialize string for new tags list
            for ( i = 0; i < old.length; i++ ) {
                if ( old[i] != value ) {
                    str = str + delimiter[id] + old[i]; // Rebuild string, excluding the removed tag
                }
            }

            $.fn.tagsInput.importTags( this, str ); // Import the updated tags list

            // Execute onRemoveTag callback if defined
            if ( tags_callbacks[id] && tags_callbacks[id]['onRemoveTag'] ) {
                var f = tags_callbacks[id]['onRemoveTag'];
                f.call( this, value );
            }
        } );

        return false; // Prevent default action
    };


    // Checks if a tag already exists in the input field
    $.fn.tagExist = function( val ) {
        var id       = $( this ).attr( 'id' );
        var tagslist = $( this ).val().split( delimiter[id] );

        // Returns true if tag exists, false otherwise
        return ( jQuery.inArray( val, tagslist ) >= 0 );
    };


    // Clears all existing tags and imports new ones from a string
    $.fn.importTags = function( str ) {
        id = $( this ).attr( 'id' ); // Get current element's ID
        $( '#' + id + '_tagsinput .tag' ).remove(); // Remove all visible tags
        $.fn.tagsInput.importTags( this, str ); // Use the internal import function
    }


    // Main plugin function to initialize tags input
    $.fn.tagsInput = function( options ) {
        // Default settings for the plugin
        var settings = jQuery.extend( {
            interactive        : true,
            defaultText        : 'add a tag',
            minChars           : 0,
            width              : '300px',
            height             : '100px',
            autocomplete       : { selectFirst : false },
            hide               : true,
            delimiter          : ',',
            unique             : true,
            removeWithBackspace: true,
            placeholderColor   : '#666666',
            autosize           : true,
            comfortZone        : 20,
            inputPadding       : 6 * 2
        }, options );

        this.each( function() {
            // Hide the original input field if specified
            if ( settings.hide ) {
                $( this ).hide();
            }

            var id = $( this ).attr( 'id' );
            // If no ID or delimiter already set, generate a unique ID
            if ( !id || delimiter[$( this ).attr( 'id' )] ) {
                id = $( this ).attr( 'id', 'tags' + new Date().getTime() ).attr( 'id' );
            }


            // Prepare data object with merged settings and internal IDs
            var data = jQuery.extend( {
                pid         : id,
                real_input  : '#' + id,
                holder      : '#' + id + '_tagsinput',
                input_wrapper: '#' + id + '_addTag',
                fake_input  : '#' + id + '_tag'
            }, settings );

            delimiter[id] = data.delimiter; // Store the delimiter for this instance

            // Set up callback functions if provided in settings
            if ( settings.onAddTag || settings.onRemoveTag || settings.onChange ) {
                tags_callbacks[id]             = new Array();
                tags_callbacks[id]['onAddTag']    = settings.onAddTag;
                tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
                tags_callbacks[id]['onChange']    = settings.onChange;
            }

            // Build the basic HTML markup for the tags input
            var markup = '<div id="' + id + '_tagsinput" class="tagsinput"><div id="' + id + '_addTag">';

            // Add interactive input field if enabled
            if ( settings.interactive ) {
                markup = markup + '<input id="' + id + '_tag" value="" data-default="' + settings.defaultText + '" />';
            }

            markup = markup + '</div><div class="tags_clear"></div></div>';

            $( markup ).insertAfter( this ); // Insert the generated markup after the original input

            // Apply custom width and height
            $( data.holder ).css( 'width', settings.width );
            $( data.holder ).css( 'min-height', settings.height );
            $( data.holder ).css( 'height', settings.height );

            // Import initial tags if the original input has a value
            if ( $( data.real_input ).val() != '' ) {
                $.fn.tagsInput.importTags( $( data.real_input ), $( data.real_input ).val() );
            }

            // Set up interactive behavior for the fake input field
            if ( settings.interactive ) {
                $( data.fake_input ).val( $( data.fake_input ).attr( 'data-default' ) );
                $( data.fake_input ).css( 'color', settings.placeholderColor );
                $( data.fake_input ).resetAutosize( settings ); // Initialize autosize

                // Focus on the fake input when clicking the holder
                $( data.holder ).bind( 'click', data, function( event ) {
                    $( event.data.fake_input ).focus();
                } );

                // Handle focus event for the fake input (clear placeholder)
                $( data.fake_input ).bind( 'focus', data, function( event ) {
                    if ( $( event.data.fake_input ).val() == $( event.data.fake_input ).attr( 'data-default' ) ) {
                        $( event.data.fake_input ).val( '' );
                    }
                    $( event.data.fake_input ).css( 'color', '#000000' );
                } );

                // Autocomplete functionality
                if ( settings.autocomplete_url != undefined ) {
                    var autocomplete_options = { source : settings.autocomplete_url };
                    for ( attrname in settings.autocomplete ) {
                        autocomplete_options[attrname] = settings.autocomplete[attrname];
                    }

                    if ( jQuery.Autocompleter !== undefined ) { // Old jQuery Autocomplete
                        $( data.fake_input ).autocomplete( settings.autocomplete_url, settings.autocomplete );
                        $( data.fake_input ).bind( 'result', data, function( event, data, formatted ) {
                            if ( data ) {
                                $( '#' + id ).addTag( data[0] + "", { focus : true, unique : ( settings.unique ) } );
                            }
                        } );
                    } else if ( jQuery.ui.autocomplete !== undefined ) { // jQuery UI Autocomplete
                        $( data.fake_input ).autocomplete( autocomplete_options );
                        $( data.fake_input ).bind( 'autocompleteselect', data, function( event, ui ) {
                            $( event.data.real_input ).addTag( ui.item.value, { focus : true, unique : ( settings.unique ) } );
                            return false;
                        } );
                    }


                } else {
                    // If autocomplete is not used, create a new tag on blur (tab out)
                    $( data.fake_input ).bind( 'blur', data, function( event ) {
                        var d = $( this ).attr( 'data-default' );
                        if ( $( event.data.fake_input ).val() != '' && $( event.data.fake_input ).val() != d ) {
                            if ( ( event.data.minChars <= $( event.data.fake_input ).val().length ) && ( !event.data.maxChars || ( event.data.maxChars >= $( event.data.fake_input ).val().length ) ) )
                                $( event.data.real_input ).addTag( $( event.data.fake_input ).val(), { focus : true, unique : ( settings.unique ) } );
                        } else {
                            $( event.data.fake_input ).val( $( event.data.fake_input ).attr( 'data-default' ) );
                            $( event.data.fake_input ).css( 'color', settings.placeholderColor );
                        }
                        return false;
                    } );

                }

                // Create a new tag when a delimiter key is pressed
                $( data.fake_input ).bind( 'keypress', data, function( event ) {
                    if ( _checkDelimiter( event ) ) {
                        event.preventDefault(); // Prevent default keypress action
                        if ( ( event.data.minChars <= $( event.data.fake_input ).val().length ) && ( !event.data.maxChars || ( event.data.maxChars >= $( event.data.fake_input ).val().length ) ) )
                            $( event.data.real_input ).addTag( $( event.data.fake_input ).val(), { focus : true, unique : ( settings.unique ) } );
                        $( event.data.fake_input ).resetAutosize( settings ); // Reset autosize after adding tag
                        return false;
                    } else if ( event.data.autosize ) {
                        $( event.data.fake_input ).doAutosize( settings ); // Autosize on regular keypress
                    }
                } );

                // Delete last tag on backspace if input is empty
                data.removeWithBackspace && $( data.fake_input ).bind( 'keydown', function( event ) {
                    if ( event.keyCode == 8 && $( this ).val() == '' ) {
                        event.preventDefault();
                        var last_tag = $( this ).closest( '.tagsinput' ).find( '.tag:last' ).text();
                        var id       = $( this ).attr( 'id' ).replace( /_tag$/, '' );
                        last_tag     = last_tag.replace( /[\s]+x$/, '' ); // Remove the 'x' from the tag text
                        $( '#' + id ).removeTag( escape( last_tag ) );
                        $( this ).trigger( 'focus' );
                    }
                } );

                $( data.fake_input ).blur(); // Trigger blur initially to set placeholder

                // Remove 'not_valid' class when user starts typing in the fake input
                if ( data.unique ) {
                    $( data.fake_input ).keydown( function( event ) {
                        if ( event.keyCode == 8 || String.fromCharCode( event.which ).match( /\w+|[áéíóúÁÉÍÓÚñÑ,/]+/ ) ) {
                            $( this ).removeClass( 'not_valid' );
                        }
                    } );
                }
            } // end if settings.interactive
        } );

        return this; // Return the jQuery object for chaining
    };


    // Updates the hidden input field with the current list of tags
    $.fn.tagsInput.updateTagsField = function( obj, tagslist ) {
        var id = $( obj ).attr( 'id' );
        $( obj ).val( tagslist.join( delimiter[id] ) );
    };


    // Imports a string of tags into the tags input field
    $.fn.tagsInput.importTags = function( obj, val ) {
        $( obj ).val( '' ); // Clear the existing value of the hidden input
        var id   = $( obj ).attr( 'id' );
        var tags = val.split( delimiter[id] ); // Split the string by the delimiter
        for ( i = 0; i < tags.length; i++ ) {
            $( obj ).addTag( tags[i], { focus : false, callback : false } ); // Add each tag without focus or callback
        }

        // Trigger onChange callback after importing
        if ( tags_callbacks[id] && tags_callbacks[id]['onChange'] ) {
            var f = tags_callbacks[id]['onChange'];
            f.call( obj, obj, tags[i] );
        }
    };


    /**
     * Internal helper function to check if the pressed key is a delimiter.
     *
     * @param   {object} event - The keypress event object.
     * @returns {boolean}      - True if the key is a delimiter, false otherwise.
     * @private
     */
    var _checkDelimiter = function( event ) {
        var flag = false; // Default: no match

        // Check for Enter key (keyCode 13)
        if ( event.which == 13 ) {
            flag = true;
        }

        // Iterate through custom delimiters
        $.each( event.data.delimiter, function( index, value ) {
            if ( event.which == value.charCodeAt( 0 ) ) {
                flag = true;
            }
        } );

        return flag;
    };

} )( jQuery );