/*******************************************************************************
 *
 *  jQuery Copyright Plugin - Version 0.1.1
 *  Project Repository: https://github.com/absentik/copyright
 *
 *  Author: Seleznev Alexander (ABSENT)
 *  Contact: absenteg@gmail.com
 *  Website: http://whoisabsent.ru
 *
 *  License: MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 *  This file contains the Type I clone of the original source code.
 *  Only whitespace and comments have been altered.
 *
 ******************************************************************************/


; ( function ( $,
              window,
              document,
              undefined ) {


    // Define the plugin's name.
    var pluginName = "copyright";


    // Set up default options for the plugin.
    var defaults = {
        text       : "<br>Original: " + window.location.href, // Text to append to the copied content.
        minlength  : 0,                                          // Minimum length of selected text to trigger processing.
        processing : undefined                                   // Optional callback function for custom text processing.
    };


    /**
     *  Copyright constructor function.
     *  Initializes the plugin instance.
     *
     *  @param {HTMLElement} element - The DOM element to which the plugin is attached.
     *  @param {Object|string} options - Configuration options or an action string.
     */
    function Copyright ( element,
                         options ) {

        this.element   = element;           // Store the associated DOM element.
        this._defaults = defaults;          // Reference to the default settings.
        this._name     = pluginName;        // Store the plugin's name.

        // Merge default options with user-provided options.
        this.options   = $.extend( {},
                                   defaults,
                                   options );

        // Determine the action based on options. If a string, it's the action.
        this.action    = typeof options === "string" ? options : "default";


        // Initialize the plugin behavior.
        this.init();

    }


    /**
     *  Prototype method to get the currently selected text from the document.
     *  Supports both W3C and IE selection models.
     *
     *  @returns {string} The selected text.
     */
    Copyright.prototype.getSelectedText = function () {

        var text = ""; // Initialize text variable.


        // Check for W3C selection model (modern browsers).
        if ( window.getSelection ) {

            text = window.getSelection().toString();

        }
        // Check for IE selection model.
        else if ( document.selection ) {

            text = document.selection.createRange().text;

        }

        return text; // Return the retrieved text.

    };


    /**
     *  Prototype method to programmatically set the selection range to a specific div element.
     *  Used for temporary selection during the copy operation.
     */
    Copyright.prototype.setSelectionRange = function () {

        // W3C compliant browsers.
        if ( window.getSelection ) {

            var range = document.createRange(); // Create a new range object.

            range.selectNodeContents( this.div ); // Select all contents within the provided div.

            var sel = window.getSelection();      // Get the current selection object.

            sel.removeAllRanges();                // Clear any existing selections.
            sel.addRange( range );                // Add the new range to the selection.

        }
        // IE specific selection model.
        else if ( document.selection && document.body.createTextRange ) {

            var textRange = document.body.createTextRange(); // Create an IE text range.

            textRange.moveToElementText( this.div );         // Move the range to the content of the div.
            textRange.select();                              // Select the content.

        }

    };


    /**
     *  Prototype method to remove any active selection from the document.
     *  Restores the document to a non-selected state.
     */
    Copyright.prototype.removeSelectionRange = function () {

        // W3C compliant selection removal.
        if ( window.getSelection ) {

            window.getSelection().removeAllRanges(); // Clear all active ranges.

        }
        // IE specific selection removal.
        else if ( document.selection ) {

            document.selection.empty(); // Empty the current selection.

        }

    };


    /**
     *  Prototype method to save the current selection range before modification.
     *  This allows restoring the user's original selection after the copy operation.
     *
     *  @returns {Range|TextRange|null} The saved selection range object, or null if none.
     */
    Copyright.prototype.saveSelectionRange = function () {

        var sel; // Declare selection variable.

        // W3C compliant selection saving.
        if ( window.getSelection ) {

            sel = window.getSelection();

            // Check if there are ranges and if getRangeAt is supported.
            if ( sel.getRangeAt && sel.rangeCount ) {

                return sel.getRangeAt( 0 ); // Return the first range.

            }

        }
        // IE specific selection saving.
        else if ( document.selection ) {

            return document.selection.createRange(); // Return the current text range.

        }

        return null; // No selection found or supported.

    };


    /**
     *  Prototype method to restore a previously saved selection range.
     *  If no range is saved, it attempts to remove any current selection.
     */
    Copyright.prototype.restoreSelectionRange = function () {

        // Check if a range was previously saved.
        if ( this.range ) {

            var sel; // Declare selection variable.

            // W3C compliant selection restoration.
            if ( window.getSelection ) {

                sel = window.getSelection();

                sel.removeAllRanges();     // Clear current selections.
                sel.addRange( this.range ); // Add the saved range.

            }
            // IE specific selection restoration.
            else if ( document.selection ) {

                this.range.select(); // Select the saved range.

            }

        }
        // If no range was saved, ensure no selection remains.
        else {

            this.it.removeSelectionRange();

        }

    };


    /**
     *  Prototype method to handle the copy action.
     *  It appends copyright information to the selected text and temporarily
     *  places it in an invisible div to be copied by the browser's native copy event.
     */
    Copyright.prototype.copy = function () {

        var it         = this;           // Cache 'this' for use in callbacks.
        var body       = $( "body" );    // Get the body element for appending temporary div.
        var selectText = it.getSelectedText(); // Get the text currently selected by the user.
        var range      = it.saveSelectionRange( body[ 0 ] ); // Save the user's current selection.


        // Check if the selected text meets the minimum length requirement.
        if ( selectText.length > it.options.minlength ) {

            // If a processing function is provided, apply it to the selected text.
            if ( typeof it.options.processing == "function" ) {

                selectText = it.options.processing( selectText );

            }

            // Append the copyright text.
            selectText += it.options.text;

        }


        // Create a temporary, invisible div to hold the modified text.
        var div = $( "<div/>",
                     {
                         html  : selectText, // Set the HTML content to the processed text.
                         style : "width: 1px; height: 1px; overflow: hidden; position: absolute; top: -99999px; left: -99999px; opacity: 0.01"
                     } ).appendTo( body ); // Append the div to the body.


        // Temporarily set the selection range to the content of our hidden div.
        // The `call` method is used to ensure `this.div` refers to our temporary div.
        it.setSelectionRange.call( {
                                       div : div[ 0 ]
                                   } );


        // Use a setTimeout with 0 delay to allow the browser's native copy event
        // to complete, then restore the original selection and clean up.
        window.setTimeout( function () {

            // Restore the user's original selection.
            it.restoreSelectionRange.call( {
                                               it    : it,
                                               range : range
                                           } );

            div.remove(); // Remove the temporary div from the DOM.

            // Trigger an '_AfterCopy' event on the original element.
            return $( it.element ).trigger( pluginName + "_AfterCopy" );

        }, 0 );


        // Trigger a '_BeforeCopy' event on the original element immediately.
        return $( it.element ).trigger( pluginName + "_BeforeCopy" );

    };


    /**
     *  Prototype method to remove the copy event listener from the element.
     *  Effectively disables the copyright functionality.
     */
    Copyright.prototype.remove = function () {

        var it = this; // Cache 'this'.

        // Unbind the "copy" event handler from the element.
        $( it.element ).off( "copy" );

    };


    /**
     *  Prototype method to start the copyright functionality.
     *  Attaches the copy event listener to the element.
     */
    Copyright.prototype.start = function () {

        var it = this; // Cache 'this'.

        // Bind the "copy" event to the element.
        // When a copy event occurs, call the 'copy' method.
        $( it.element ).on( "copy",
                            function () {

                                it.copy();

                            } );

    };


    /**
     *  Prototype method to initialize the plugin based on the 'action' option.
     *  This is called once during construction.
     */
    Copyright.prototype.init = function () {

        // Use a switch statement to handle different actions.
        switch ( this.action ) {

            // Case for removing the functionality.
            case "remove":

                return this.remove();

                break; // Not strictly needed after return, but good practice.

            // Default case if no specific action is provided or recognized.
            default:

                return this.start();

                break; // Not strictly needed after return, but good practice.

        }

    };


    /**
     *  jQuery plugin definition.
     *  Allows users to call the plugin via `$(selector).copyright(options)`.
     *
     *  @param {Object|string} options - Configuration options or an action string.
     */
    $.fn[ pluginName ] = function ( options ) {

        // Iterate over each selected element to apply the plugin.
        return this.each( function () {

            // Prevent multiple instantiations on the same element.
            // Store the plugin instance in jQuery's data cache.
            if ( !$.data( this, 'plugin_' + pluginName ) ) {

                $.data( this,
                        'plugin_' + pluginName,
                        new Copyright( this,
                                       options ) );

            }


        } );

    }


} )( jQuery,
     window,
     document );