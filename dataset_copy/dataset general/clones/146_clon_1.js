/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects remain absolutely identical.
 * Only whitespace (spacing, indentation, newlines) and comments have been altered
 * to create a visually distinct, but logically equivalent, version.
 */
( function( $ ) {

    // --- Private Utility Functions Start ---

    /**
     * Retrieves the current selection start and end positions within a text field.
     * Handles differences between modern browsers and older Internet Explorer versions.
     *
     * @param   {jQuery} $field  The jQuery wrapped text input or textarea element.
     * @returns {Object|undefined} An object with 'start' and 'end' properties,
     *                               or undefined if the field is not valid.
     */
    getSelectionPosition = function( $field ) {
        // Ensure the jQuery object actually contains an element.
        if ( $field . length ) {
            var start = 0,
                end   = 0;
            var el    = $field . get( 0 ); // Get the raw DOM element.

            // --- Modern Browser (W3C standard) selection handling ---
            if ( typeof el . selectionStart === "number" &&
                 typeof el . selectionEnd   === "number" )
            {
                start = el . selectionStart;
                end   = el . selectionEnd;
            }
            // --- Older Internet Explorer (IE) selection handling using TextRange ---
            else
            {
                var range        = document . selection . createRange();
                var stored_range = range    . duplicate();
                stored_range     . moveToElementText( el );
                stored_range     . setEndPoint( 'EndToEnd', range );

                // Calculate start and end based on TextRange lengths.
                start = stored_range . text . length - range . text . length;
                end   = start + range . text . length;

                // Important IE specific adjustment:
                // IE counts line breaks (\r\n) as two characters in TextRange,
                // but as one in the actual value string. We need to compensate.
                var s  = start;
                var lb = 0; // Line break counter
                var i;

                // Adjust 'start' position for line breaks.
                for ( i = 0 ; i < s ; i++ ) {
                    if ( el . value . charAt( i ) . match( /\r/ ) ) {
                        ++lb;
                    }
                }

                if ( lb ) {
                    start = start - lb;
                    lb    = 0; // Reset for 'end' calculation.
                }

                // Adjust 'end' position for line breaks.
                var e = end;
                for ( i = 0 ; i < e ; i++ ) {
                    if ( el . value . charAt( i ) . match( /\r/ ) ) {
                        ++lb;
                    }
                }
                if ( lb ) {
                    end = end - lb;
                }
            }

            // Return the calculated positions.
            return {
                start : start,
                end   : end
            };
        }
    }; // End of getSelectionPosition function.


    /**
     * Retrieves the currently selected text from a text field.
     *
     * @param   {jQuery} $field The jQuery wrapped text input or textarea element.
     * @returns {string|boolean} The selected text as a string, or false if no field is present.
     */
    getSelection = function( $field ) {
        var selStr   = '';
        var selPos; // Variable to hold selection position object.

        if ( $field . length ) {
            selPos = getSelectionPosition( $field );
            selStr = $field . val() . substring( selPos . start, selPos . end );
            return selStr;
        }

        // No valid field, return false.
        return false;
    }; // End of getSelection function.


    /**
     * Replaces the currently selected text in a field with new text,
     * and optionally re-selects the replaced text or sets a cursor position.
     *
     * @param {jQuery} $field       The jQuery wrapped text input or textarea element.
     * @param {string} replaceText  The text to insert/replace with.
     * @param {boolean} reselect    If true, the new text will be selected. If false, no selection.
     * @param {number} cursorOffset Optional. If provided, cursor will be placed at
     *                              `selPos.start + cursorOffset` instead of selecting `replaceText`.
     */
    replaceSelection = function( $field, replaceText, reselect, cursorOffset ) {
        var selPos    = getSelectionPosition( $field );
        var fullStr   = $field . val();
        var selectNew = true; // Default to re-selecting the new text.

        if ( reselect === false ) {
            selectNew = false;
        }

        // Store scrollTop to prevent jumping in some browsers (e.g., Firefox).
        var scrollTop = null;
        if ( $field[0] . scrollTop ) {
            scrollTop = $field[0] . scrollTop;
        }

        // Update the field's value with the replaced text.
        $field . val( fullStr . substring( 0, selPos . start ) +
                      replaceText +
                      fullStr . substring( selPos . end ) );

        // Set focus back to the field.
        $field[0] . focus();

        // Handle re-selection or cursor placement.
        if ( selectNew ) {
            // Modern browser selection API.
            if ( $field[0] . setSelectionRange ) {
                if ( cursorOffset ) {
                    // Place cursor at a specific offset.
                    $field[0] . setSelectionRange( selPos . start + cursorOffset,
                                                   selPos . start + cursorOffset );
                } else {
                    // Select the newly inserted text.
                    $field[0] . setSelectionRange( selPos . start,
                                                   selPos . start + replaceText . length );
                }
            }
            // Older IE selection API.
            else if ( $field[0] . createTextRange ) {
                var range = $field[0] . createTextRange();
                range . collapse( true ); // Collapse the range to its start.

                if ( cursorOffset ) {
                    // Move range ends to place cursor.
                    range . moveEnd( 'character', selPos . start + cursorOffset );
                    range . moveStart( 'character', selPos . start + cursorOffset );
                } else {
                    // Move range ends to select the new text.
                    range . moveEnd( 'character', selPos . start + replaceText . length );
                    range . moveStart( 'character', selPos . start );
                }
                range . select(); // Apply the selection.
            }
        }

        // Restore scroll position if it was saved.
        if ( scrollTop ) {
            // Note: This operation can sometimes cause a slight jump in Firefox.
            $field[0] . scrollTop = scrollTop;
        }
    }; // End of replaceSelection function.


    /**
     * Expands the current selection in a text field to cover the entire line(s).
     *
     * @param {jQuery} $field The jQuery wrapped text input or textarea element.
     */
    selectWholeLine = function( $field ) {
        var selPos = getSelectionPosition( $field );
        var el     = $field . get( 0 ); // Get the raw DOM element.
        var i;

        // Find the start of the line by looking backward for a newline character.
        for ( i = selPos . start - 1 ; i >= 0 ; i-- ) {
            if ( el . value . charAt( i ) . match( /\n/ ) ) {
                break;
            }
        }
        i++; // Move past the newline character to the actual start of the line.

        // Set the selection range from the determined line start to the original selection end.
        $field[0] . setSelectionRange( i, selPos . end );
    }; // End of selectWholeLine function.


    // --- Public Interface for Markdown Editor ---

    // Initialize the markdownEditor namespace on the jQuery object.
    $. markdownEditor = {};


    /**
     * Executes a specific action on the markdown editor's textarea,
     * such as applying formatting, inserting text, etc.
     *
     * @param {jQuery} $editor     The root jQuery object of the markdown editor component.
     * @param {RegExp|boolean} search    A regular expression to search for in the selected text.
     *                                   If false, no search/replace is performed on selected text.
     * @param {string|function|boolean} replace   The replacement string or function for the search.
     *                                   If false, no search/replace is performed on selected text.
     * @param {boolean} whole_line If true, the selection will be expanded to the whole line(s) first.
     * @param {string|boolean} append      Text to append to the (potentially modified) selected text.
     *                                   If false, no text is appended.
     */
    $. markdownEditor . executeAction = function( $editor, search, replace, whole_line, append ) {
        var textElement = $editor . find( 'textarea' );

        // Optionally expand selection to whole lines.
        if ( whole_line ) {
            selectWholeLine( textElement );
        }

        var txt     = textElement . val();
        var selPos  = getSelectionPosition( textElement );
        var selText = getSelection( textElement );
        var repText = selText; // The text that will eventually replace the selection.
        var reselect = true;   // Flag to control if the new text should be re-selected.
        var cursor  = null;    // Optional cursor offset after replacement.

        // Perform search and replace if both are provided.
        if ( search && replace ) {
            repText = repText . replace( search, replace );
            // Clean up any remaining backreferences ($1, $2, etc.) that weren't matched.
            repText = repText . replace( /\$[\d]/g, '' );

            // If the replacement resulted in an empty string, handle cursor placement.
            if ( repText === '' ) {
                cursor = replace . indexOf( '$1' ); // Try to find a specific backreference.

                repText = replace . replace( /\$[\d]/g, '' ); // Remove backreferences from replacement string.
                if ( cursor === -1 ) {
                    cursor = Math . floor( replace . length / 2 ); // Default cursor to middle.
                }
            }
        }

        // Append text if 'append' is provided.
        if ( append ) {
            // If the text to be replaced is identical to the original selection,
            // we might not want to re-select it after appending.
            if ( repText === selText ) {
                reselect = false;
            }
            repText += append;
        }

        // Only perform replacement if there's text to replace with.
        if ( repText ) {
            replaceSelection( textElement, repText, reselect, cursor );
        }

        // Trigger a keyup event on the editor body to update previews, etc.
        $editor . find( ".editor-body" ) . keyup();
    }; // End of executeAction function.


    /**
     * Adds the markdown function bar (buttons) above the given text field.
     *
     * @param {jQuery} $field The jQuery wrapped text input or textarea element.
     */
    addFunctionBar = function( $field ) {
        $field . before(
            '\
            <div class="function-bar">\
                <div class="function-buttons">\
                    <a href="#" class="function-bold function-button">\
                        <span>Bold</span></a>\
                    <a href="#" class="function-italic function-button">\
                        <span>Italic</span></a>\
                    <a href="#" class="function-code function-button">\
                        <span>Code</span></a>\
                    <span class="function-divider">&nbsp;</span>\
                    <a href="#" class="function-ul function-button">\
                        <span>Unordered List</span></a>\
                    <a href="#" class="function-ol function-button">\
                        <span>Ordered List</span></a>\
                    <a href="#" class="function-blockquote function-button">\
                        <span>Blockquote</span></a>\
                    <a href="#" class="function-hr function-button">\
                        <span>Horizontal Rule</span></a>\
                    <span class="function-divider">&nbsp;</span>\
                    <a href="#" class="function-h1 function-button">\
                        <span>h1</span></a>\
                    <a href="#" class="function-h2 function-button">\
                        <span>h2</span></a>\
                    <a href="#" class="function-h3 function-button">\
                        <span>h3</span></a>\
                    <span class="function-divider">&nbsp;</span>\
                    <a href="#" class="function-link function-button">\
                        <span>Link</span></a>\
                    <a href="#" class="function-image function-button">\
                        <span>Image</span></a>\
                    <span class="function-divider">&nbsp;</span>\
                    <a href="#" class="function-help function-button">\
                        <span>Help</span></a>\
                </div>\
            </div>'
        );
    }; // End of addFunctionBar function.


    /**
     * Sets up event bindings for the markdown editor, including button clicks
     * and live preview updates.
     *
     * @param {jQuery} $editor The root jQuery object of the markdown editor component.
     */
    makeBindings = function( $editor ) {
        var converter = new Showdown . converter(); // Initialize Showdown converter.

        // Delegate click handlers for the function buttons.
        $editor
            . delegate( ".function-button", "click", function( e ) {
                e . preventDefault(); // Prevent default link behavior.
            })
            . delegate( ".function-bold", "click", function() {
                // Wrap selection in bold markdown.
                $. markdownEditor . executeAction( $editor, /([^\n]+)([\n\s]*)/g, "**$1**$2" );
            })
            . delegate( ".function-italic", "click", function() {
                // Wrap selection in italic markdown.
                $. markdownEditor . executeAction( $editor, /([^\n]+)([\n\s]*)/g, "_$1_$2" );
            })
            . delegate( ".function-code", "click", function() {
                // Wrap selection in inline code markdown.
                $. markdownEditor . executeAction( $editor, /([\s\S]*)/, "`$1`" );
            })
            . delegate( ".function-hr", "click", function() {
                // Insert a horizontal rule.
                $. markdownEditor . executeAction( $editor, false, false, false, "\n***\n" );
            })
            . delegate( ".function-ul", "click", function() {
                // Convert selection to unordered list items.
                $. markdownEditor . executeAction( $editor, /(.+)([\n]?)/g, "* $1$2", true );
            })
            . delegate( ".function-ol", "click", function() {
                var n = 0; // Counter for ordered list numbering.
                // Convert selection to ordered list items, numbering them.
                $. markdownEditor . executeAction( $editor, /(.+)([\n]?)/g, function( str, p1, p2, offset, s ) {
                    return ++n + ". " + p1 + p2;
                }, true );
            })
            . delegate( ".function-blockquote", "click", function() {
                // Convert selection to blockquote.
                $. markdownEditor . executeAction( $editor, /(.+)([\n]?)/g, "> $1$2" );
            })
            . delegate( ".function-h1", "click", function() {
                // Convert selection to H1 heading.
                $. markdownEditor . executeAction( $editor, /(.+)([\n]?)/g, "# $1$2", true );
            })
            . delegate( ".function-h2", "click", function() {
                // Convert selection to H2 heading.
                $. markdownEditor . executeAction( $editor, /(.+)([\n]?)/g, "## $1$2", true );
            })
            . delegate( ".function-h3", "click", function() {
                // Convert selection to H3 heading.
                $. markdownEditor . executeAction( $editor, /(.+)([\n]?)/g, "### $1$2", true );
            })
            . delegate( ".function-link", "click", function() {
                // Handle link insertion via a dialog (e.g., Facebox).
                console . log( $editor ); // For debugging.
                $. facebox( '<div id="markdown-editor-dialog">' +
                            '<h4>Insert Link</h4>' +
                            '<fieldset>' +
                                '<div class="field">' +
                                    '<label for="Link Text">Link Text</label>' +
                                    '<input type="text" class="text" value="' + getSelection( $editor . find( ".editor-body" ) ) + '">' +
                                '</div>' +
                                '<div class="field">' +
                                    '<label for="URL">URL</label>' +
                                    '<input type="text" class="href">' +
                                '</div>' +
                            '</fieldset>' +
                            '<div class="buttons">' +
                                '<a href="#" title="Cancel" class="cancel minibutton">Cancel</a>' +
                                '<a href="#" title="OK" class="ok minibutton">OK</a>' +
                            '</div>' +
                        '</div>'
                );
                // Store the editor instance with the dialog for later use.
                $( "#markdown-editor-dialog" ) . data( "editor", $editor );
            }); // End of editor delegate chain.

        // Delegate handler for the 'OK' button in the link insertion dialog.
        $( "body" ) . delegate( ".ok", "click", function() {
            dialog = $( this ) . closest( "#markdown-editor-dialog" );
            href   = dialog . find( ".href" ) . val();
            text   = dialog . find( ".text" ) . val();

            if ( href && text ) {
                // Apply link markdown if both href and text are provided.
                $. markdownEditor . executeAction( dialog . data( "editor" ),
                                                   /([\s\S]*)/,
                                                   '[' + text + '](' + href + ')' );
            }
            $. facebox . close(); // Close the dialog.
        });

        // Delegate handler for the 'Cancel' button in the dialog.
        $( "body" ) . delegate( ".cancel", "click", function() {
            $. facebox . close(); // Simply close the dialog.
        });

        // Handle click on the preview button.
        $editor . find( '.preview' ) . bind( "click", function() {
            // Open a facebox with the HTML preview of the current markdown.
            $. facebox( '<div class="preview">' +
                         converter . makeHtml( $editor . find( '.editor-body' ) . val() ) +
                         '</div>'
            );
        });

        // Update live preview on keyup in the editor body.
        $editor . find( '.editor-body' ) . keyup( function() {
            var txt  = $editor . find( '.editor-body' ) . val();
            var html = converter . makeHtml( txt );
            $editor . find( ".live-preview" ) . html( html );
        });
    }; // End of makeBindings function.


    // --- jQuery Plugin Definition ---

    // Internal methods object for the plugin.
    var methods = {
        /**
         * Initializes the markdown editor on a set of elements.
         *
         * @param {Object} options Configuration options for the editor.
         */
        init: function( options ) {
            var result = this . each( function() {
                // Merge default settings with provided options.
                if ( options ) {
                    $. extend( settings, options );
                }
                $( this ) . addClass( 'editor-body' ); // Mark the textarea.

                // Add 'editor' class to the closest fieldset or form.
                if ( $( this ) . closest( 'fieldset' ) . length ) {
                    $( this ) . closest( 'fieldset' ) . addClass( 'editor' );
                }
                else {
                    $( this ) . closest( 'form' ) . addClass( 'editor' );
                }

                addFunctionBar( $( this ) ); // Add the toolbar.
                // Apply bindings to the entire editor container.
                makeBindings( $( this ) . closest( ".editor" ) );
            });
            return result;
        },

        /**
         * Adds a function bar to the current set of selected elements.
         * (This method seems redundant if init already does it, but kept as per original).
         */
        addFunctionBar: function() {
            this . each( function() {
                addFunctionBar( $( this ) );
            });
        }
    }; // End of methods object.


    /**
     * jQuery plugin entry point for markdownEditor.
     * Allows calling methods or initializing the editor.
     *
     * Usage:
     *   $( 'textarea' ) . markdownEditor();             // Initializes
     *   $( 'textarea' ) . markdownEditor( 'methodName', arg1, arg2 ); // Calls a method
     */
    $. fn . markdownEditor = function( method ) {
        // Default settings for the plugin.
        var settings = {
            'function-bar' : 'basic'
        };

        // Check if a specific method is being called.
        if ( methods[ method ] ) {
            return methods[ method ] . apply( this, Array . prototype . slice . call( arguments, 1 ) );
        }
        // If no method name or an object (options) is passed, initialize.
        else if ( typeof method === 'object' || ! method ) {
            return methods . init . apply( this, arguments );
        }
        // If an unknown method name is passed, throw an error.
        else {
            $. error( 'Method ' + method + ' does not exist on jQuery.markdownEditor' );
        }
    }; // End of $.fn.markdownEditor plugin definition.

} )( jQuery ); // End of the IIFE.