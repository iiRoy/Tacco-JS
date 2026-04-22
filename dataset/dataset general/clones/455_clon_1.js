/*
 * markItUp! Universal MarkUp Engine, jQuery plugin
 *
 * Version: 1.1.7
 * Licensing: Dual licensed under the MIT and GPL licenses.
 *
 * (C) 2007-2010 Jay Salvat
 * Project Website: http://markitup.jaysalvat.com/
 *
 * This software is provided under the following terms:
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
( function ( $ ) {

    // Define the markItUp! jQuery plugin method.
    $.fn.markItUp = function ( settings, extraSettings ) {

        // Declare variables for options and keyboard states.
        var options, ctrlKey, shiftKey, altKey;

        // Initialize keyboard state flags.
        ctrlKey = shiftKey = altKey = false;

        // Default options for markItUp!
        options = {
            id:                        '',                      // Optional ID for the editor container.
            nameSpace:                 '',                      // Optional CSS namespace for the editor.
            root:                      '',                      // Root path for plugin resources.
            previewInWindow:           '',                      // Preview window configuration string (e.g., 'width=800, height=600, resizable=yes, scrollbars=yes').
            previewAutoRefresh:        true,                    // Automatically refresh the preview.
            previewPosition:           'after',                 // Position of the preview ('after' or 'before' the textarea).
            previewTemplatePath:       '~/templates/preview.html', // Path to the HTML template for the preview.
            previewParserPath:         '',                      // Path to a server-side script for parsing preview content.
            previewParserVar:          'data',                  // Variable name used to send content to the parser.
            resizeHandle:              true,                    // Enable/disable the resize handle.
            beforeInsert:              '',                      // Callback function/string executed before content insertion.
            afterInsert:               '',                      // Callback function/string executed after content insertion.
            onEnter:                   {},                      // Custom action on Enter key press.
            onShiftEnter:              {},                      // Custom action on Shift+Enter key press.
            onCtrlEnter:               {},                      // Custom action on Ctrl+Enter key press.
            onTab:                     {},                      // Custom action on Tab key press.
            markupSet:                 [ { /* Default empty markup set */ } ] // Array defining the markup buttons.
        };

        // Extend default options with user-provided settings, then with extra settings.
        $.extend( options, settings, extraSettings );

        // Compute markItUp! plugin root path if not explicitly provided.
        if ( !options.root ) {
            $( 'script' ).each( function ( a, tag ) {
                var miuScript = $( tag ).get( 0 ).src.match( /(.*)jquery\.markitup(\.pack)?\.js$/ );
                if ( miuScript !== null ) {
                    options.root = miuScript[ 1 ];
                }
            } );
        }

        // Iterate over each selected element to apply the plugin.
        return this.each( function () {
            // Declare local variables for each editor instance.
            var $$, textarea, levels, scrollPosition, caretPosition, caretOffset,
                clicked, hash, header, footer, previewWindow, template, iFrame, abort;

            $$ = $( this );                    // jQuery object of the textarea.
            textarea = this;                   // DOM element of the textarea.
            levels = [];                       // Stack to manage dropdown menu levels.
            abort = false;                     // Flag to abort markup insertion.
            scrollPosition = caretPosition = 0; // Initial scroll and caret positions.
            caretOffset = -1;                  // Offset for caret positioning.

            // Localize paths (replace '~/' with the determined root path).
            options.previewParserPath = localize( options.previewParserPath );
            options.previewTemplatePath = localize( options.previewTemplatePath );

            /**
             * Replaces the '~/' placeholder in paths with the actual plugin root.
             * @param {string} data The path string to localize.
             * @param {boolean} inText Indicates if localization is happening within text content.
             * @returns {string} The localized path.
             */
            function localize ( data, inText ) {
                if ( inText ) {
                    // Replace '~/' within quoted strings in text.
                    return data.replace( /("|')~\//g, "$1" + options.root );
                }
                // Replace '~/' at the beginning of a path.
                return data.replace( /^~\//, options.root );
            }

            /**
             * Initializes and builds the markItUp! editor interface.
             */
            function init () {
                var id = '', nameSpace = '';

                // Determine the ID for the editor container.
                if ( options.id ) {
                    id = 'id="' + options.id + '"';
                } else if ( $$.attr( "id" ) ) {
                    id = 'id="markItUp' + ( $$.attr( "id" ).substr( 0, 1 ).toUpperCase() ) + ( $$.attr( "id" ).substr( 1 ) ) + '"';
                }

                // Determine the CSS namespace for the editor.
                if ( options.nameSpace ) {
                    nameSpace = 'class="' + options.nameSpace + '"';
                }

                // Wrap the textarea with necessary container divs.
                $$.wrap( '<div ' + nameSpace + '></div>' );
                $$.wrap( '<div ' + id + ' class="markItUp"></div>' );
                $$.wrap( '<div class="markItUpContainer"></div>' );
                $$.addClass( "markItUpEditor" );

                // Create and insert the header containing the markup buttons.
                header = $( '<div class="markItUpHeader"></div>' ).insertBefore( $$ );
                $( dropMenus( options.markupSet ) ).appendTo( header );

                // Create and insert the footer.
                footer = $( '<div class="markItUpFooter"></div>' ).insertAfter( $$ );

                // Add the resize handle if enabled and not Safari (Safari handles resizing natively).
                if ( options.resizeHandle === true && $.browser.safari !== true ) {
                    var resizeHandle = $( '<div class="markItUpResizeHandle"></div>' )
                        .insertAfter( $$ )
                        .bind( "mousedown", function ( e ) {
                            var h = $$.height(), y = e.clientY, mouseMove, mouseUp;
                            mouseMove = function ( e ) {
                                $$.css( "height", Math.max( 20, e.clientY + h - y ) + "px" );
                                return false;
                            };
                            mouseUp = function ( e ) {
                                $( "html" ).unbind( "mousemove", mouseMove ).unbind( "mouseup", mouseUp );
                                return false;
                            };
                            $( "html" ).bind( "mousemove", mouseMove ).bind( "mouseup", mouseUp );
                        } );
                    footer.append( resizeHandle );
                }

                // Attach keydown and keyup event handlers to the textarea.
                $$.keydown( keyPressed ).keyup( keyPressed );

                // Bind a custom event to handle external calls for content insertion.
                $$.bind( "insertion", function ( e, settings ) {
                    if ( settings.target !== false ) {
                        get(); // Get current selection/caret position.
                    }
                    if ( textarea === $.markItUp.focused ) {
                        markup( settings ); // Apply markup if this editor is focused.
                    }
                } );

                // Keep track of the currently focused editor instance.
                $$.focus( function () {
                    $.markItUp.focused = this;
                } );
            }

            /**
             * Recursively builds the header with dropdown menus based on the markupSet.
             * @param {Array} markupSet The array of markup definitions.
             * @returns {jQuery} The generated unordered list (UL) element.
             */
            function dropMenus ( markupSet ) {
                var ul = $( '<ul></ul>' ), i = 0;
                $( 'li:hover > ul', ul ).css( 'display', 'block' ); // Ensure submenus are visible on hover.

                $.each( markupSet, function () {
                    var button = this, t = '', title, li, j;
                    title = ( button.key ) ? ( button.name || '' ) + ' [Ctrl+' + button.key + ']' : ( button.name || '' );
                    key = ( button.key ) ? 'accesskey="' + button.key + '"' : '';

                    if ( button.separator ) {
                        // Create a separator item.
                        li = $( '<li class="markItUpSeparator">' + ( button.separator || '' ) + '</li>' ).appendTo( ul );
                    } else {
                        i++;
                        // Generate class names for nested menus.
                        for ( j = levels.length - 1; j >= 0; j-- ) {
                            t += levels[ j ] + "-";
                        }

                        // Create the anchor element for the button.
                        var aHref = $( '<a href="" ' + key + ' title="' + title + '">' + ( button.text || button.name || '' ) + '</a>' );

                        // Apply custom styling for buttons with text content.
                        if ( button.text ) {
                            aHref.css( 'background-image', 'none' );
                            if ( button.text.length < 2 ) {
                                aHref.css( 'text-indent', '0.4em' );
                            } else {
                                aHref.css( 'text-indent', '0' );
                            }
                            aHref.addClass( 'labeled' );
                        }

                        // Create the list item, attach events, and append to the UL.
                        li = $( '<li class="markItUpButton markItUpButton' + t + ( i ) + ' ' + ( button.className || '' ) + '"></li>' )
                            .append( aHref )
                            .bind( "contextmenu", function () { // Prevent context menu on Mac to allow Ctrl+click.
                                return false;
                            } )
                            .click( function () {
                                return false; // Prevent default link behavior.
                            } )
                            .mousedown( function () {
                                if ( button.call ) {
                                    eval( button.call )(); // Execute custom callback function if defined.
                                }
                                setTimeout( function () { markup( button ) }, 1 ); // Apply markup with a slight delay.
                                return false;
                            } )
                            .hover( function () {
                                $( '> ul', this ).show(); // Show dropdown menu on hover.
                                $( document ).one( 'click', function () { // Close dropdown if clicked outside.
                                    $( 'ul ul', header ).hide();
                                } );
                            }, function () {
                                $( '> ul', this ).hide(); // Hide dropdown menu when not hovering.
                            } )
                            .appendTo( ul );

                        // If the button has a dropdown, recurse to build it.
                        if ( button.dropMenu ) {
                            levels.push( i );
                            $( li ).addClass( 'markItUpDropMenu' ).append( dropMenus( button.dropMenu ) );
                        }
                    }
                } );
                levels.pop(); // Pop current level after building its children.
                return ul;
            }

            /**
             * Processes special markItUp! placeholders in a string.
             * Handles alternative text based on Alt key and prompts for user input.
             * @param {string} string The string containing placeholders.
             * @returns {string} The processed string.
             */
            function magicMarkups ( string ) {
                if ( string ) {
                    string = string.toString();
                    // Process ( !(alt text|!|default text) !) for Alt key alternatives.
                    string = string.replace( /\(\!\(([\s\S]*?)\)\!\)/g,
                        function ( x, a ) {
                            var b = a.split( '|!|' );
                            if ( altKey === true ) {
                                return ( b[ 1 ] !== undefined ) ? b[ 1 ] : b[ 0 ];
                            } else {
                                return ( b[ 1 ] === undefined ) ? "" : b[ 0 ];
                            }
                        }
                    );
                    // Process [ ![prompt]! ] or [ ![prompt:!:value]! ] for user prompts.
                    string = string.replace( /\[\!\[([\s\S]*?)\]\!\]/g,
                        function ( x, a ) {
                            var b = a.split( ':!:' );
                            if ( abort === true ) {
                                return false; // If already aborted, skip further prompts.
                            }
                            var value = prompt( b[ 0 ], ( b[ 1 ] ) ? b[ 1 ] : '' );
                            if ( value === null ) {
                                abort = true; // User cancelled the prompt.
                            }
                            return value;
                        }
                    );
                    return string;
                }
                return "";
            }

            /**
             * Prepares an action string or function by processing magic markups.
             * @param {string|function} action The action to prepare.
             * @returns {string} The prepared action string.
             */
            function prepare ( action ) {
                if ( $.isFunction( action ) ) {
                    action = action( hash ); // Execute function if it's a callback.
                }
                return magicMarkups( action ); // Process placeholders.
            }

            /**
             * Builds the block of text to be inserted into the editor.
             * @param {string} string Optional string to use instead of current selection.
             * @returns {object} An object containing the built block and its components.
             */
            function build ( string ) {
                var openWith = prepare( clicked.openWith );
                var placeHolder = prepare( clicked.placeHolder );
                var replaceWith = prepare( clicked.replaceWith );
                var closeWith = prepare( clicked.closeWith );
                var block;

                if ( replaceWith !== "" ) {
                    block = openWith + replaceWith + closeWith;
                } else if ( selection === '' && placeHolder !== '' ) {
                    block = openWith + placeHolder + closeWith;
                } else {
                    block = openWith + ( string || selection ) + closeWith;
                }

                return {
                    block: block,
                    openWith: openWith,
                    replaceWith: replaceWith,
                    placeHolder: placeHolder,
                    closeWith: closeWith
                };
            }

            /**
             * Applies the selected markup to the editor's content.
             * @param {object} button The markup button object.
             */
            function markup ( button ) {
                var len, j, n, i, string, start, lines;

                hash = clicked = button; // Store the clicked button's properties.
                get(); // Get the current selection and caret position.

                // Extend the hash object with current editor state and context.
                $.extend( hash, {
                    line: "",
                    root: options.root,
                    options: options,
                    textarea: textarea,
                    selection: ( selection || '' ),
                    caretPosition: caretPosition,
                    ctrlKey: ctrlKey,
                    shiftKey: shiftKey,
                    altKey: altKey
                } );

                // Callbacks before insertion.
                prepare( options.beforeInsert );
                prepare( clicked.beforeInsert );

                if ( ctrlKey === true && shiftKey === true ) {
                    prepare( clicked.beforeMultiInsert );
                }
                $.extend( hash, { line: 1 } );

                // Determine the insertion logic based on keyboard modifiers.
                if ( ctrlKey === true && shiftKey === true ) {
                    // Multi-line insertion.
                    lines = selection.split( /\r?\n/ );
                    for ( j = 0, n = lines.length, i = 0; i < n; i++ ) {
                        if ( $.trim( lines[ i ] ) !== '' ) {
                            $.extend( hash, { line: ++j, selection: lines[ i ] } );
                            lines[ i ] = build( lines[ i ] ).block;
                        } else {
                            lines[ i ] = "";
                        }
                    }
                    string = { block: lines.join( '\n' ) };
                    start = caretPosition;
                    len = string.block.length + ( ( $.browser.opera ) ? n : 0 );
                } else if ( ctrlKey === true ) {
                    // Block insertion with selection replaced.
                    string = build( selection );
                    start = caretPosition + string.openWith.length;
                    len = string.block.length - string.openWith.length - string.closeWith.length;
                    len -= fixIeBug( string.block );
                } else if ( shiftKey === true ) {
                    // Block insertion, keeping selection.
                    string = build( selection );
                    start = caretPosition;
                    len = string.block.length;
                    len -= fixIeBug( string.block );
                } else {
                    // Simple insertion at caret, or replacing selection.
                    string = build( selection );
                    start = caretPosition + string.block.length;
                    len = 0;
                    start -= fixIeBug( string.block );
                }

                // Adjust caret offset for specific scenarios, like when no selection and placeholder is used.
                if ( ( selection === '' && string.replaceWith === '' ) ) {
                    caretOffset += fixOperaBug( string.block );

                    start = caretPosition + string.openWith.length;
                    len = string.block.length - string.openWith.length - string.closeWith.length;

                    caretOffset = $$.val().substring( caretPosition, $$.val().length ).length;
                    caretOffset -= fixOperaBug( $$.val().substring( 0, caretPosition ) );
                }

                // Update hash with new caret and scroll positions.
                $.extend( hash, { caretPosition: caretPosition, scrollPosition: scrollPosition } );

                // Perform the actual insertion if block content changed and not aborted.
                if ( string.block !== selection && abort === false ) {
                    insert( string.block );
                    set( start, len ); // Set the new selection/caret position.
                } else {
                    caretOffset = -1; // Reset caret offset if no insertion.
                }
                get(); // Refresh selection and caret after insertion.

                // Reset line and selection in hash for after-insertion callbacks.
                $.extend( hash, { line: '', selection: selection } );

                // Callbacks after insertion.
                if ( ctrlKey === true && shiftKey === true ) {
                    prepare( clicked.afterMultiInsert );
                }
                prepare( clicked.afterInsert );
                prepare( options.afterInsert );

                // Refresh preview if it's open and auto-refresh is enabled.
                if ( previewWindow && options.previewAutoRefresh ) {
                    refreshPreview();
                }

                // Reinitialize keyboard state flags.
                shiftKey = altKey = ctrlKey = abort = false;
            }

            /**
             * Fix for Opera bug: calculates extra line feeds in a string.
             * @param {string} string The string to check.
             * @returns {number} The count of extra line feeds.
             */
            function fixOperaBug ( string ) {
                if ( $.browser.opera ) {
                    return string.length - string.replace( /\n*/g, '' ).length;
                }
                return 0;
            }

            /**
             * Fix for IE bug: calculates extra carriage returns in a string.
             * @param {string} string The string to check.
             * @returns {number} The count of extra carriage returns.
             */
            function fixIeBug ( string ) {
                if ( $.browser.msie ) {
                    return string.length - string.replace( /\r*/g, '' ).length;
                }
                return 0;
            }

            /**
             * Inserts a block of text into the textarea.
             * @param {string} block The text block to insert.
             */
            function insert ( block ) {
                if ( document.selection ) {
                    // For Internet Explorer.
                    var newSelection = document.selection.createRange();
                    newSelection.text = block;
                } else {
                    // For other browsers.
                    $$.val( $$.val().substring( 0, caretPosition ) + block + $$.val().substring( caretPosition + selection.length, $$.val().length ) );
                }
            }

            /**
             * Sets the selection or caret position in the textarea.
             * @param {number} start The starting position of the selection.
             * @param {number} len The length of the selection.
             */
            function set ( start, len ) {
                if ( textarea.createTextRange ) {
                    // For Internet Explorer.
                    // Quick fix for Opera 9.5 to prevent issues with zero-length selections.
                    if ( $.browser.opera && $.browser.version >= 9.5 && len == 0 ) {
                        return false;
                    }
                    var range = textarea.createTextRange();
                    range.collapse( true );
                    range.moveStart( 'character', start );
                    range.moveEnd( 'character', len );
                    range.select();
                } else if ( textarea.setSelectionRange ) {
                    // For other browsers (Gecko, WebKit, Opera).
                    textarea.setSelectionRange( start, start + len );
                }
                textarea.scrollTop = scrollPosition; // Restore scroll position.
                textarea.focus(); // Ensure textarea is focused.
            }

            /**
             * Gets the current selection and caret position from the textarea.
             * @returns {string} The currently selected text.
             */
            function get () {
                textarea.focus(); // Ensure the textarea is focused to get accurate selection.

                scrollPosition = textarea.scrollTop; // Store current scroll position.
                if ( document.selection ) {
                    // For Internet Explorer.
                    selection = document.selection.createRange().text;
                    if ( $.browser.msie ) {
                        var range = document.selection.createRange(), rangeCopy = range.duplicate();
                        rangeCopy.moveToElementText( textarea );
                        caretPosition = -1;
                        while ( rangeCopy.inRange( range ) ) { // Fix IE bugs with linefeeds.
                            rangeCopy.moveStart( 'character' );
                            caretPosition++;
                        }
                    } else {
                        // For Opera (old versions that use document.selection).
                        caretPosition = textarea.selectionStart;
                    }
                } else {
                    // For Gecko & Webkit browsers.
                    caretPosition = textarea.selectionStart;
                    selection = $$.val().substring( caretPosition, textarea.selectionEnd );
                }
                return selection;
            }

            /**
             * Opens or toggles the preview window.
             */
            function preview () {
                // If preview window is not open or was closed.
                if ( !previewWindow || previewWindow.closed ) {
                    if ( options.previewInWindow ) {
                        // Open as a separate popup window.
                        previewWindow = window.open( '', 'preview', options.previewInWindow );
                    } else {
                        // Create an iframe for inline preview.
                        iFrame = $( '<iframe class="markItUpPreviewFrame"></iframe>' );
                        if ( options.previewPosition == 'after' ) {
                            iFrame.insertAfter( footer );
                        } else {
                            iFrame.insertBefore( header );
                        }
                        previewWindow = iFrame[ iFrame.length - 1 ].contentWindow || frame[ iFrame.length - 1 ];
                    }
                } else if ( altKey === true ) {
                    // If Alt key is pressed, close the preview.
                    // IE8 fix by Stephen M. Redd.
                    if ( iFrame ) {
                        iFrame.remove();
                    } else {
                        previewWindow.close();
                    }
                    previewWindow = iFrame = false; // Reset preview window/iframe references.
                }
                // If auto-refresh is off, manually refresh when opening/toggling.
                if ( !options.previewAutoRefresh ) {
                    refreshPreview();
                }
            }

            /**
             * Triggers a refresh of the preview window's content.
             */
            function refreshPreview () {
                renderPreview(); // Call the actual rendering function.
            }

            /**
             * Renders the preview content, either via a parser or a template.
             * @returns {boolean} Always returns false.
             */
            function renderPreview () {
                var phtml; // Placeholder, not actually used.

                if ( options.previewParserPath !== '' ) {
                    // Use a server-side parser if configured.
                    $.ajax( {
                        type: 'POST',
                        url: options.previewParserPath,
                        data: options.previewParserVar + '=' + encodeURIComponent( $$.val() ),
                        success: function ( data ) {
                            writeInPreview( localize( data, 1 ) ); // Write parsed data to preview.
                        }
                    } );
                } else {
                    // Use a client-side template if no parser is configured.
                    if ( !template ) {
                        $.ajax( {
                            url: options.previewTemplatePath,
                            success: function ( data ) {
                                // Load template, replace content placeholder, and write to preview.
                                writeInPreview( localize( data, 1 ).replace( /<!-- content -->/g, $$.val() ) );
                            }
                        } );
                    }
                }
                return false;
            }

            /**
             * Writes the given HTML data into the preview window.
             * @param {string} data The HTML content to write.
             */
            function writeInPreview ( data ) {
                if ( previewWindow.document ) {
                    var sp = 0;
                    try {
                        sp = previewWindow.document.documentElement.scrollTop; // Try to preserve scroll position.
                    } catch ( e ) {
                        sp = 0;
                    }
                    previewWindow.document.open(); // Open document stream.
                    previewWindow.document.write( data ); // Write the content.
                    previewWindow.document.close(); // Close document stream.
                    previewWindow.document.documentElement.scrollTop = sp; // Restore scroll position.
                }
                if ( options.previewInWindow ) {
                    previewWindow.focus(); // Focus the popup window.
                }
            }

            /**
             * Handles key press events to update keyboard state flags.
             * @param {Event} e The keyboard event object.
             */
            function keyPressed ( e ) {
                shiftKey = e.shiftKey;
                altKey = e.altKey;
                // Note: ctrlKey is not updated here, it's typically checked on keydown/keyup but used in context of markup function.
            }

            // Initialize the editor.
            init();

        } ); // End of this.each()
    }; // End of $.fn.markItUp

    // Global focus tracking for markItUp instances.
    $.markItUp = { focused: null };

} )( jQuery ); // End of IIFE