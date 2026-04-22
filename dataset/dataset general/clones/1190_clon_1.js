/*
 *  Markdown Editor by Nacho and Carlos Coloma.
 *  This work is based on showdown by John Fraser and markdown by John Gruber.
 *  The license is MIT. Use it however you please.
 *
 *  Available options for configuration:
 *  - resources: JSON object holding all internationalization (i18n) entries.
 *  - buttons: A list specifying which buttons to display in the toolbar.
 *  - value: The initial text content for the textarea element.
 *  - historyRate: Time in milliseconds without user input before a new history entry is recorded.
 *  - renderRate: Time in milliseconds without user input before the HTML preview is re-rendered.
 */

( function ( $ ) {

    /*
     * Mathias Bynens' innovative proposal to track changes within a textarea.
     * For a detailed explanation of its functionality, refer to: http://mathiasbynens.be/notes/oninput
     */
    $.fn.input = function ( fn ) {

        var $this = this; // Cache the jQuery object for efficiency.

        if ( !fn ) {
            // If no function is provided, simply trigger the keydown event.
            return $this.trigger( 'keydown.input' );
        }

        // Bind event handlers for both 'input' and 'keydown' events.
        return $this.bind( {
            'input.input': function ( event ) {
                // When 'input' event fires, unbind 'keydown' to avoid duplicate calls.
                $this.unbind( 'keydown.input' );
                fn.call( this, event );
            },
            'keydown.input': function ( event ) {
                // 'keydown' is used as a fallback for browsers not supporting 'input' fully.
                fn.call( this, event );
            }
        } );
    };


    $.fn.markdownEditor = function ( options ) {

        // Extend default options with user-provided settings.
        options = $.extend( {

            historyRate: 2000, // Default history update interval.

            renderRate: 300, // Default HTML render update interval.

            buttons: [ 'b', 'i', 'a', 'blockquote', 'code', 'img', 'h', 'ul', 'undo', 'redo', 'help' ], // Default button set.

            resources: { // Default internationalization strings.
                'md-btn-b': 'Bold',
                'md-btn-i': 'Italic',
                'md-btn-a': 'Create link',
                'md-btn-blockquote': 'Quote',
                'md-btn-code': 'Code',
                'md-btn-img': 'Add image',
                'md-btn-h': 'Header',
                'md-btn-ul': 'Bullet list',
                'md-btn-undo': 'Undo',
                'md-btn-redo': 'Redo',
                'md-btn-help': 'Help',
                'md-btn-accept': 'Accept',
                'md-btn-cancel': 'Cancel'
            }

        }, options );


        var

            // history of text modifications (String []) - stores textarea content snapshots.
            history = [],

            // hcursor: current step in the modification history, points to the current state.
            hcursor = 0,

            // converter: ShowDown converter instance, used to transform Markdown to HTML.
            converter = new Showdown.converter(),

            // createButton: a utility function to generate HTML for a toolbar button.
            createButton = function ( button ) {
                var name = 'md-btn-' + button; // Construct the full button class name.
                return '<a class="md-btn ' + name + '" title="' + options.resources[name] + '"><span class="md-icon md-icon-' + button + '">' + options.resources[name] + '</span></a>'
            },

            // $container: The main wrapper element for the entire editor component.
            $container = $( '<div class="markdown-container"><div class="markdown-toolbar"></div><textarea class="markdown-editor"></textarea><div class="markdown-preview"></div></div>' ),

            // $toolbar: The jQuery object for the toolbar div within the container.
            $toolbar = $container.find( '.markdown-toolbar' ),

            // $editor: The jQuery object for the textarea where markdown is written.
            $editor = $container.find( '.markdown-editor' ),

            // $preview: The jQuery object for the div where the HTML preview is displayed.
            $preview = $container.find( '.markdown-preview' )
        ;

        /*
         * getSelection: This function is adapted from the fieldSelection jQuery plugin by Alex Brem <alex@0xab.cd>.
         * It retrieves information about the currently selected text in the textarea.
         */
        var e = $editor[0], // Direct reference to the DOM element for performance.

            /*
             * @return if block == true, returns the starting index of the line containing the current selection.
             *         Otherwise, returns the original start index.
             */
            getStart = function ( value, start, block ) {
                if ( !block ) {
                    return start;
                }
                while ( start > 1 ) {
                    if ( value[start - 1] == '\n' ) {
                        break;
                    }
                    start--;
                }
                return start;
            },

            /*
             * getEnd: Determines the end index of the selection, optionally extending to the end of the line.
             * @param value The full text content of the editor.
             * @param end The original end index of the selection.
             * @param block Boolean, if true, extends selection to the end of the line.
             * @returns The calculated end index.
             */
            getEnd = function ( value, end, block ) {
                if ( !block ) {
                    return end;
                }
                while ( end < value.length - 1 ) {
                    if ( value[end] == '\n' ) {
                        break;
                    }
                    end++;
                }
                return end;
            },

            /*
             * getSelection: Retrieves the current text selection details.
             * This is a cross-browser implementation.
             */
            getSelection =

                /* mozilla / dom 3.0 compliant browsers */
                ( 'selectionStart' in e && function ( block ) {
                    var start = getStart( e.value, e.selectionStart, block );
                    var end = getEnd( e.value, e.selectionEnd, block );
                    var l = end - start;
                    return {
                        start: start,
                        end: end,
                        length: l,
                        text: e.value.substr( start, l )
                    };
                } ) ||

                /* exploder (Internet Explorer) specific implementation */
                ( document.selection && function () {

                    e.focus(); // Ensure the textarea is focused.

                    var r = document.selection.createRange();
                    if ( r === null ) {
                        return {
                            start: 0,
                            end: e.value.length,
                            length: 0
                        }
                    }

                    var re = e.createTextRange();
                    var rc = re.duplicate();
                    re.moveToBookmark( r.getBookmark() );
                    rc.setEndPoint( 'EndToStart', re );

                    // TODO: The original code notes a missing `getStart()` invocation here for selecting entire lines.

                    return {
                        start: rc.text.length,
                        end: rc.text.length + r.text.length,
                        length: r.text.length,
                        text: r.text
                    };
                } ) ||

                /* Fallback for browsers not supported by the above methods */
                function () {
                    return null;
                };


        /*
         * replaceSelection: This function is also extracted from the fieldSelection jQuery plugin by Alex Brem.
         * It replaces the currently selected text with new content.
         */
        var replaceSelection =

            /* mozilla / dom 3.0 compliant browsers */
            ( 'selectionStart' in e && function ( text, block ) {
                var start = getStart( e.value, e.selectionStart, block );
                var end = getEnd( e.value, e.selectionEnd, block );
                e.value = e.value.substr( 0, start ) + text + e.value.substr( end, e.value.length );
                e.selectionStart = start;
                e.selectionEnd = start + text.length;
                e.focus(); // Restore focus to the editor.
            } ) ||

            // TODO: Still missing the getStart() invocation to correctly handle block-level selections in IE.
            /* exploder (Internet Explorer) specific implementation */
            ( document.selection && function ( text ) {
                e.focus();
                document.selection.createRange().text = text;
            } ) ||

            /* Fallback for unsupported browsers */
            function ( text ) {
                e.value += text; // Simply append text if selection replacement is not possible.
            };

        /**
         * pushHistory: Adds a new entry to the editor's history stack.
         * New entries are only pushed if the content has changed after a delay.
         */
        var historyID = 0; // Timer ID for throttling history pushes.
        var pushHistory = function () {
            clearTimeout( historyID ); // Clear any pending history push.
            historyID = setTimeout( function () {
                // Only push if the current value is different from the last history entry.
                if ( e.value != history[hcursor] ) {
                    history[++hcursor] = e.value; // Increment cursor and store new value.
                    // console.log("push " + hcursor + " " + e.value); // Debugging log.
                    if ( history.length > hcursor + 1 ) {
                        // If 'undo' was used and then something new is typed,
                        // truncate future entries that are now invalid.
                        history = history.slice( 0, hcursor + 1 );
                        $redoBtn.attr( 'disabled', '' ); // Disable redo button if history is truncated.
                    }
                }
            }, options.historyRate ); // Wait for the configured historyRate.
            $undoBtn.removeAttr( 'disabled' ); // Enable undo button, as a change has occurred.
            renderHTML(); // Trigger an HTML re-render.
        }

        /**
         * popHistory: Reverts the editor's content to the previous state in history (undo).
         */
        var popHistory = function () {
            if ( hcursor ) { // Check if there's a previous state to revert to.
                e.value = history[--hcursor]; // Decrement cursor and set editor value.
                // console.log("pop " + hcursor + " " + e.value); // Debugging log.
                $redoBtn.removeAttr( 'disabled' ); // Enable redo button.
                renderHTML(); // Update the HTML preview.
            }
            hcursor || $undoBtn.attr( 'disabled', '' ); // Disable undo if at the beginning of history.
        }

        /**
         * redoHistory: Advances the editor's content to a future state in history (redo).
         */
        var redoHistory = function () {
            if ( hcursor < history.length - 1 ) { // Check if there's a future state.
                e.value = history[++hcursor]; // Increment cursor and set editor value.
                // console.log("redo " + hcursor + " " + e.value); // Debugging log.
                if ( hcursor === history.length - 1 ) {
                    $redoBtn.attr( 'disabled', '' ); // Disable redo button if at the end of history.
                }
                renderHTML(); // Update the HTML preview.
                $undoBtn.removeAttr( 'disabled' ); // Ensure undo button is enabled.
            }
        }

        /**
         * renderHTML: Updates the preview container with the latest Markdown conversion.
         * @param sync {boolean} If true, renders synchronously. Otherwise, the call is throttled.
         */
        var renderID = 0; // Timer ID for throttling renders.
        var renderHTML = function ( sync ) {
            if ( !sync ) {
                clearTimeout( renderID ); // Clear any pending render.
                renderID = setTimeout( function () {
                    $preview.html( converter.makeHtml( e.value ) ); // Convert and update preview.
                    $editor.trigger( 'md.change', e ); // Trigger custom event.
                }, options.renderRate ); // Wait for the configured renderRate.
            } else {
                // Synchronous render: update immediately.
                $preview.html( converter.makeHtml( e.value ) );
            }
        }

        // Iterate through the specified buttons and append them to the toolbar.
        $.each( options.buttons, function ( index, button ) {
            $toolbar.append( createButton( button ) );
        } );

        // Cache references to the undo and redo buttons.
        var $undoBtn = $toolbar.find( '.md-btn-undo' );
        var $redoBtn = $toolbar.find( '.md-btn-redo' );

        /**
         * addLink: Prompts the user for a link title and href, then applies it to the selection.
         * @param callback Function to be called with the title and href to format the link.
         */
        var addLink = function ( callback ) {
            var
                selection = getSelection().text.replace( /\n/g, '' ).trim(), // Get current selection, clean newlines.
                $linkForm = $( // Create the link input form HTML.
                    '<form class="md-link-form" action="#">' +
                    '<input placeholder="Title" type="text" class="md-input md-title">' +
                    '<input placeholder="http://" type="url" class="md-input md-href">' +
                    createButton( 'accept' ) + createButton( 'cancel' ) +
                    '</form>'
                ),
                cancel = function () {
                    $linkForm.remove(); // Remove the form.
                    $toolbar.show(); // Show the main toolbar again.
                    return false; // Prevent default form submission.
                },
                accept = function () {
                    var $href = $linkForm.find( '.md-href' ), // Get href input.
                        $title = $linkForm.find( '.md-title' ), // Get title input.
                        href = $href.val(), // Get href value.
                        title = $title.val() || href // Use href as title if title is empty.
                    ;
                    replaceSelection( callback( title, href ) ); // Apply link markdown.
                    pushHistory(); // Record this change in history.
                    $linkForm.remove(); // Remove the form.
                    $toolbar.show(); // Show the main toolbar.
                    return false; // Prevent default form submission.
                };

            $toolbar
                .hide() // Hide the toolbar temporarily.
                .after( $linkForm ); // Insert the link form after the toolbar.

            $linkForm
                .on( 'click', '.md-btn-accept', accept ) // Handle accept button click.
                .on( 'click', '.md-btn-cancel', cancel ) // Handle cancel button click.
                .on( 'keyup', '.md-input', function ( e ) {
                    if ( e.keyCode === 13 ) { // Enter key.
                        accept();
                    } else if ( e.keyCode === 27 ) { // Escape key.
                        cancel();
                    }
                } );

            // Pre-fill form fields based on selection.
            if ( !selection || /^http(s?):\/\//.exec( selection ) ) {
                $linkForm.find( '.md-href' ).val( selection );
                $linkForm.find( '.md-title' ).focus()
            } else {
                $linkForm.find( '.md-title' ).val( selection );
                $linkForm.find( '.md-href' ).focus()
            }

        };

        /**
         * updateSelection: Applies a Markdown transformation to the current selection.
         * @param o Object containing:
         *   - regex: Pattern to check if the mark is already set or needs to be removed.
         *   - modify: Callback function to apply the markdown.
         *   - undo: Optional callback function to remove the markdown.
         *   - block: Boolean, if true, operates on entire lines regardless of selection.
         */
        var updateSelection = function ( o ) {
            var selection = getSelection( o.block ).text; // Get the selection, possibly block-extended.
            // For commands affecting a single line, ignore multiline selections unless block is true.
            if ( !o.block && /\n/.exec( selection ) ) {
                return;
            }
            var parts = o.regex.exec( selection ); // Check if the regex matches the selection.
            var value = !parts ? o.modify( selection ) : // If no match, apply modification.
                o.undo ? o.undo( selection, o ) : // If undo function exists, use it.
                    parts[1]; // Otherwise, use the captured group (e.g., inner text).
            replaceSelection( value, o.block ); // Replace selection with the new value.
        };

        // Definition of all available Markdown commands and their handlers.
        var commands = [
            {
                cmd: 'b', // Bold command.
                handler: function () {
                    updateSelection( {
                        modify: function ( value ) {
                            return '**' + value.trim() + '**'; // Add bold markdown.
                        },
                        regex: /^\*\*(.*)\*\*$/ // Regex to detect existing bold.
                    } );
                    pushHistory(); // Record the change.
                }
            },
            {
                cmd: 'i', // Italic command.
                handler: function () {
                    updateSelection( {
                        modify: function ( value ) {
                            return '*' + value.trim() + '*'; // Add italic markdown.
                        },
                        regex: /^\*((\*\*|\_)?([^*_]*)(\*\*|\_))?\*$/ // Regex to detect existing italic/bold-italic.
                    } );
                    pushHistory(); // Record the change.
                }
            },
            {
                cmd: 'a', // Link command.
                shortcut: '⌘+k, ctrl+k', // Keyboard shortcut.
                handler: function () {
                    addLink( function ( title, href ) {
                        return '[' + title + '](' + href + ')'; // Format as a Markdown link.
                    } );
                }
            },
            {
                cmd: 'code', // Inline code command.
                shortcut: 'shift+⌘+p, shift+ctrl+p', // Keyboard shortcut.
                handler: function () {
                    updateSelection( {
                        modify: function ( value ) {
                            return '`' + value + '`'; // Add inline code markdown.
                        },
                        regex: /^`([^`]*)`$/ // Regex to detect existing inline code.
                    } );
                    pushHistory(); // Record the change.
                }
            },
            {
                cmd: 'blockquote', // Blockquote command.
                shortcut: '⌘+\', ctrl+\'', // Keyboard shortcut.
                handler: function () {
                    updateSelection( {
                        modify: function ( value ) {
                            return '> ' + value.replace( /\n/g, '\n> ' ); // Add blockquote prefix to lines.
                        },
                        undo: function ( value ) {
                            return value.replace( /(^|\n)>[ \t]*(.*)/g, "$1$2" ); // Remove blockquote prefix.
                        },
                        regex: /((^|\n)>(.*))+$/, // Regex to detect existing blockquote.
                        block: true // Operate on entire lines.
                    } );
                    pushHistory(); // Record the change.
                }
            },
            {
                cmd: 'img', // Image command.
                shortcut: 'shift+⌘+i, shift+ctrl+i', // Keyboard shortcut.
                handler: function () {
                    addLink( function ( title, href ) {
                        return '![' + title + '](' + href + ' "' + title + '")'; // Format as a Markdown image.
                    } );
                }
            },
            {
                cmd: 'h', // Header command.
                handler: function () {
                    updateSelection( {
                        modify: function ( value ) {
                            return '#' + value; // Add a single hash for a header.
                        },
                        regex: /^#(.*)$/, // Regex to detect existing header.
                        block: true // Operate on entire lines.
                    } );
                    pushHistory(); // Record the change.
                }
            },
            {
                cmd: 'ul', // Unordered list command.
                shortcut: 'shift+⌘+l, shift+ctrl+l', // Keyboard shortcut.
                handler: function () {
                    updateSelection( {
                        modify: function ( value ) {
                            return '* ' + value.replace( /\n/g, '\n* ' ); // Add list item prefix.
                        },
                        undo: function ( value ) {
                            return value.replace( /^[\s\t]*\*[ \t]*/mg, "" ); // Remove list item prefix.
                        },
                        regex: /^([\s\t]*\*.*)*$/, // Regex to detect existing list.
                        block: true // Operate on entire lines.
                    } );
                    pushHistory(); // Record the change.
                }
            },
            {
                cmd: 'undo', // Undo command.
                shortcut: '⌘+z, ctrl+z', // Keyboard shortcut.
                handler: popHistory // Calls the history undo function.
            },
            {
                cmd: 'redo', // Redo command.
                shortcut: '⌘+y, ctrl+y', // Keyboard shortcut.
                handler: redoHistory // Calls the history redo function.
            },
            {
                cmd: 'help', // Help command.
                shortcut: 'shift+⌘+h, shift+ctrl+h', // Keyboard shortcut.
                handler: function () {
                    window.open( 'http://en.wikipedia.org/wiki/Markdown' ); // Opens Markdown Wikipedia page.
                }
            }
        ];

        // Disable the default key.filter behavior when inside the textarea.
        // This allows keybindings to work within the editor without being filtered.
        key.filter = function ( event ) {
            var tagName = ( event.target || event.srcElement ).tagName; // Get the tag name of the event target.
            return !( tagName == 'INPUT' || tagName == 'SELECT' ); // Filter out INPUT and SELECT elements.
        }

        // Loop through each command and assign its handler to both mouse clicks and keyboard shortcuts.
        for ( var i = 0; i < commands.length; i++ ) {
            var action = commands[i], // Current command object.
                cmd = action.cmd, // Command name.
                handler = action.handler // Command handler function.
            ;

            // Assign handler for mouse clicks on toolbar buttons.
            $toolbar.on( 'click', '.md-btn-' + cmd, handler );

            // Assign handler for keyboard shortcuts using the 'key' library.
            key( action.shortcut || '⌘+' + cmd + ', ctrl+' + cmd, 'markdown', handler );
        }

        // Set up focusin and focusout event handlers for the editor textarea.
        $editor
            .focusin( function () {
                // When editor gains focus, set the keybinding scope to 'markdown'.
                key.setScope( 'markdown' );
            } )
            .focusout( function () {
                // When editor loses focus, reset the keybinding scope to default.
                key.setScope();
            } )
        ;

        // This block is primarily for testing purposes.
        if ( options.internals ) {
            var i = options.internals;
            i.pushHistory = pushHistory; // Expose pushHistory.
            i.popHistory = popHistory;   // Expose popHistory.
            i.history = history;         // Expose history array.
        }

        // If an initial value is provided in options, set it to the editor.
        options.value && $editor.val( options.value );

        // Bind the pushHistory function to the editor's custom 'input' event.
        $editor.input( pushHistory );

        // Initialize history with the current content of the editor.
        history[hcursor] = e.value;

        // Perform an initial synchronous render of the HTML preview.
        renderHTML( true );

        // Initially disable the redo button as there's no history to redo yet.
        $redoBtn.attr( 'disabled', '' );

    } // End of $.fn.markdownEditor function.

} )( jQuery ); // Pass jQuery object into the IIFE.