// This is a Zepto plugin.
// It helps convert textareas into markdown editors.
// The plugin is wrapped in an immediately invoked function expression (IIFE).

; ( function ( $ ) {
    // Define the 'editor' plugin method.
    $.fn.editor = function () {

        // Get options, if provided, otherwise an empty object.
        var options = arguments[ 1 ] || { };
        // Default settings for the plugin.
        var defaults = { };

        // Merge defaults with provided options.
        var settings = $.extend( { }, defaults, options );
        // Cache the textarea element and its parent container.
        var textarea = $( this ), container = textarea.parent( );


        var insert = function ( str ) {
            var element = textarea[ 0 ]; // Get the native DOM element.
            var start = element.selectionStart;
            var value = element.value;

            // Insert the string at the current cursor position.
            element.value = value.substring( 0, start ) + str + value.substring( start );

            // Update selection to be after the inserted string.
            element.selectionStart = element.selectionEnd = start + str.length;
        };


        var wrap = function ( left, right ) {
            var element = textarea[ 0 ]; // Access the underlying DOM element.
            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;

            // Wrap the selected text with 'left' and 'right' strings.
            element.value = value.substring( 0, start ) + left + value.substring( start, end ) + right + value.substring( end );

            // Adjust the selection to cover the wrapped text.
            element.selectionStart = end + left.length + right.length;
        };


        var tab = function ( event ) {
            var element = textarea[ 0 ]; // The DOM element is needed for selection properties.
            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;

            // Split the selected portion by newlines to handle multiple lines.
            var selections = value.substring( start, end ).split( "\n" );

            // Prepend a tab character to each selected line.
            for ( var i = 0; i < selections.length; i++ ) {
                selections[ i ] = "\t" + selections[ i ];
            }

            // Reconstruct the textarea value with the tabbed lines.
            element.value = value.substring( 0, start ) + selections.join( "\n" ) + value.substring( end );

            // Adjust selection after tabbing.
            if ( end > start ) {
                element.selectionStart = start;
                element.selectionEnd = end + selections.length; // Adjust end position based on number of lines tabbed.
            } else {
                element.selectionStart = element.selectionEnd = start + 1; // If no selection, just move cursor by one tab.
            }
        };


        var untab = function ( event ) {
            var element = textarea[ 0 ];

            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;
            // Regex to find a single tab at the beginning of a line.
            var pattern = new RegExp( /^[\t]{1}/ );
            var edits = 0; // Counter for how many tabs were removed.

            // Handle single-line untabbing.
            if ( start == end ) {
                // Move cursor to the beginning of the current line.
                while ( start > 0 ) {
                    if ( value.charAt( start ) == "\n" ) {
                        start++; // Include the newline itself if found.
                        break;
                    }
                    start--;
                }

                var portion = value.substring( start, end );
                var matches = portion.match( pattern );

                if ( matches ) {
                    // Remove the tab and update the value.
                    element.value = value.substring( 0, start ) + portion.replace( pattern, '' ) + value.substring( end );
                    end--; // Adjust end position since a character was removed.
                }

                element.selectionStart = element.selectionEnd = end;
            }
            // Handle multiline untabbing.
            else {
                var selections = value.substring( start, end ).split( "\n" );

                for ( var i = 0; i < selections.length; i++ ) {
                    if ( selections[ i ].match( pattern ) ) {
                        edits++; // Increment edit count.
                        selections[ i ] = selections[ i ].replace( pattern, '' ); // Remove leading tab.
                    }
                }

                element.value = value.substring( 0, start ) + selections.join( "\n" ) + value.substring( end );

                element.selectionStart = start;
                element.selectionEnd = end - edits; // Adjust end position by total tabs removed.
            }
        };


        // Defines the various markdown controls.
        var controls = {
            bold: function () {
                wrap( '**', '**' );
            },
            italic: function () {
                wrap( '*', '*' );
            },
            strike: function () { // Striking through text.
                wrap( '~~', '~~' );
            },
            code: function () {
                wrap( '`', '`' );
            },
            link: function () {
                var element = textarea[ 0 ];
                var start = element.selectionStart, end = element.selectionEnd;
                var value = element.value;

                var selection = value.substring( start, end );
                // Create a markdown link format.
                var link = '[' + selection + '](' + selection + ')';

                element.value = value.substring( 0, start ) + link + value.substring( end );
                element.selectionStart = element.selectionEnd = end + link.length;
            },
            img: function () { // Image insertion.
                var element = textarea[ 0 ];
                var start = element.selectionStart, end = element.selectionEnd;
                var value = element.value;

                var selection = value.substring( start, end );
                // Create a markdown image format.
                var link = '![' + selection + '](' + selection + ')';

                element.value = value.substring( 0, start ) + link + value.substring( end );
                element.selectionStart = element.selectionEnd = end + link.length;
            },
            list: function () {
                var element = textarea[ 0 ];
                var start = element.selectionStart, end = element.selectionEnd;
                var value = element.value;

                var selections = value.substring( start, end ).split( "\n" );

                for ( var i = 0; i < selections.length; i++ ) {
                    selections[ i ] = '* ' + selections[ i ]; // Prepend list item marker.
                }

                element.value = value.substring( 0, start ) + "\n" + selections.join( "\n" ) + "\n" + value.substring( end );
            },
            quote: function () {
                var element = textarea[ 0 ];
                var start = element.selectionStart, end = element.selectionEnd;
                var value = element.value;

                var selections = value.substring( start, end ).split( "\n" );

                for ( var i = 0; i < selections.length; i++ ) {
                    selections[ i ] = '> ' + selections[ i ]; // Prepend blockquote marker.
                }

                element.value = value.substring( 0, start ) + selections.join( "\n" ) + value.substring( end );
            },
            h1: function () { // Heading 1.
                wrap( '#', '' );
            },
            h2: function () { // Heading 2.
                wrap( '##', '' );
            },
            h3: function () { // Heading 3.
                wrap( '###', '' );
            },
            h4: function () { // Heading 4.
                wrap( '####', '' );
            },
            h5: function () { // Heading 5.
                wrap( '#####', '' );
            },
            h6: function () { // Heading 6.
                wrap( '######', '' );
            }
        };


        // Event listener for keydown events on the textarea.
        textarea.on( 'keydown', function ( event ) {
            // Check if the pressed key is TAB (keyCode 9).
            if ( event.keyCode === 9 ) {
                event.preventDefault(); // Prevent default tab behavior (losing focus).
                event.stopPropagation(); // Stop event bubbling.

                // If Shift key is also pressed, perform untab.
                if ( event.shiftKey && event.keyCode === 9 ) {
                    untab( event );
                }
                // Otherwise, perform tab.
                else {
                    tab( event );
                }
            }
        } );


        // Event delegation for clicks on navigation links within the container.
        container.on( 'click', 'nav a', function ( event ) {
            // Get the clicked anchor element and extract the method name from its href.
            var a = $( event.target ), method = a.attr( 'href' ).split( '#' ).pop( );

            // If a corresponding control method exists, execute it.
            if ( controls[ method ] ) {
                controls[ method ]();
            }

            return false; // Prevent default link behavior.
        } );
    }; // End of $.fn.editor function.

}( Zepto ) ); // End of IIFE, passing Zepto object.