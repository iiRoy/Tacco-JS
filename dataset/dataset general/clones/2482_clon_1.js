/*
 * This file implements the "multifield" functionality.
 * It establishes connections between multiple input fields within a form.
 *
 * Author: Yair Even Or
 * Year: 2011
 * Website: dropthebit.com
 */
;
( function () {
    // A counter to manage event handling, ensuring certain actions are not duplicated.
    var fixedEvent = 0;

    /*
     * funnel function:
     * This function acts as an event handler, typically for keyboard events.
     * It debounces or delays the actual keypress processing to prevent
     * rapid, unmanaged event firing.
     * @param {Event} e - The event object.
     */
    function funnel ( e ) {
        fixedEvent ++; // Increment the event counter.

        var that = this; // Store the context (this) for use within the setTimeout callback.

        // Use setTimeout to delay the keypress processing, effectively debouncing the event.
        setTimeout( function ( ) {
            // Call the keypress function with the original context and event.
            keypress.call( that, e );

            // Reset the event counter after processing.
            fixedEvent = 0;
        }, 0 ); // A delay of 0 milliseconds pushes the execution to the end of the current event loop.
    }

    /*
     * keypress function:
     * Handles key press events, managing caret position and field navigation.
     * @param {Event} e - The event object.
     */
    function keypress ( e ) {
        // Declares a variable that is not used in the current implementation.
        var nextPrevField,
            // Capture the current selection start and end points in an array.
            sel = [ this.selectionStart, this.selectionEnd ];

        // If the event is not a charCode, and not left arrow (37), right arrow (39), or backspace (8), then exit.
        if ( ! e.charCode && e.keyCode != 37 && e.keyCode != 39 && e.keyCode != 8 ) {
            return; // Exit the function as it's not a relevant key event for navigation.
        }

        // Logic to navigate to the previous field:
        // Triggered if Backspace is pressed and caret is at the beginning (selectionEnd is 0),
        // OR if the 'left' arrow key is pressed and caret is at the beginning.
        if ( ( e.keyCode == 8 && sel[ 1 ] == 0 ) || ( e.keyCode == 37 && sel[ 1 ] == 0 ) ) {
            // Find the previous text input field and set the caret to the end (100 is an arbitrary large number for end).
            setCaret( $( this ).prev( ':text' )[ 0 ], 100 );
        }
        // Logic to navigate to the next field:
        // Triggered if the 'right' arrow key is pressed and caret is at the end of the current field's value.
        else if ( e.keyCode == 39 && sel[ 1 ] == this.value.length ) {
            // Find the next text input field and set the caret to the beginning (0).
            setCaret( $( this ).next( ':text' )[ 0 ], 0 );
        }
        // Logic for automatic advancement to the next field:
        // Triggered if a character is typed (e.charCode), and the caret is not selecting text (sel[0] == sel[1]),
        // AND the caret is at the maximum length of the current field.
        else if ( e.charCode && sel[ 1 ] == sel[ 0 ] && sel[ 0 ] == this.maxLength ) {
            // Find the next text input field and set the caret to the end.
            setCaret( $( this ).next( ':text' )[ 0 ], 100 );
        }

        /*
         * setCaret function (nested):
         * Sets the caret (text cursor) position within an input field.
         * @param {HTMLInputElement} input - The input element to manipulate.
         * @param {number} pos - The desired caret position.
         */
        function setCaret ( input, pos ) {
            if ( ! input ) {
                return; // If no input element is provided, do nothing.
            }

            // Standard method for modern browsers.
            if ( input.setSelectionRange ) {
                input.focus( ); // Ensure the input field has focus.
                input.setSelectionRange( pos, pos ); // Set both start and end of selection to 'pos' for caret.
            }
            // Fallback for older Internet Explorer versions.
            else if ( input.createTextRange ) {
                var range = input.createTextRange( ); // Create a text range object.
                range.collapse( true ); // Collapse the range to its start point.
                range.moveEnd( 'character', pos ); // Move the end of the range to 'pos' characters.
                range.moveStart( 'character', pos ); // Move the start of the range to 'pos' characters.
                range.select( ); // Apply the selection.
            }
        }

        // After all keypress logic, combine the field values.
        combine.apply( this );
    }; // End of keypress function definition.

    /*
     * combine function:
     * This function aggregates values from all text input fields within the parent
     * and stores them into a hidden input field. It's typically called on 'change' events.
     */
    function combine ( ) {
        // Find the sibling hidden input field, clear its value, and get the DOM element.
        var hidden = $( this ).siblings( 'input[type=hidden]' ).val( '' )[ 0 ];

        // Iterate over all text input fields within the parent of the current field.
        $( this.parentNode ).find( ':text' ).each( function ( ) {
            // Append the value of each text field to the hidden input's value.
            hidden.value += this.value;
        } );
    }

    // Initialize the event listeners for 'div.multi' elements.
    // Attaches funnel to keydown and keypress, and combine to change events.
    // The events are delegated to 'input' elements within 'div.multi'.
    $( 'div.multi' ).on( {
        'keydown.multifeild' : funnel,
        'keypress.multifeild' : funnel,
        'change.multifeild' : combine
    }, 'input' );

} ) ( ); // Immediately Invoked Function Expression (IIFE) to encapsulate the code.