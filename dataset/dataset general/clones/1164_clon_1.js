/*
 * Suggestr - A simple and straightforward autocompleter utility for jQuery.
 *
 * This software is freely distributable under the terms of the BSD license.
 * For more details, please visit: https://github.com/honza/suggestr.js
 *
 * Copyright (c) 2011, Honza Pokorny
 * All rights reserved.
 */

( function ( $ ) {

    // Declare all module-level variables at the top for clarity.
    var keyMap
      , activeCss
      , inactiveCss
      , boxCss
      ;

    // Define a map for keyboard key codes to improve readability.
    keyMap = {
          up    : 38  // Up arrow key
        , down  : 40  // Down arrow key
        , enter : 13  // Enter key
    };

    // Styles for the currently active suggestion item.
    activeCss = {
          listStyle       : 'none'
        , backgroundColor : '#ececec'
    };

    // Styles for inactive suggestion items.
    inactiveCss = {
          listStyle       : 'none'
        , backgroundColor : '#fff'
    };

    // Base styles for the suggestion box container.
    boxCss = {
          width    : '200px'
        , position : 'absolute'
    };


    /*
     * Extends jQuery's prototype with a new function 'suggestr'.
     * This function initializes the autocompletion behavior on a selected input element.
     *
     * @param {Array} data - An array of strings to be used as suggestions.
     */
    $.fn.suggestr = function ( data ) {

        var ui
          , that
          , value
          ;

        // Store a reference to the input element on which suggestr is called.
        that = this;


        // Initialize or retrieve the suggestion UI div.
        // If it doesn't exist, create it and append it to the DOM.
        ui = document.getElementById( 'suggestr-div' )
             || $( '<div id="suggestr-div"></div>' )
             ;

        // Apply the base CSS styles to the suggestion box.
        ui.css( boxCss );

        // Initialize the 'active' data attribute to 0, representing the first item.
        ui.data( 'active', 0 );


        // Set up event delegation for mouseover on list items within the suggestion box.
        ui.delegate( 'li'
                   , 'mouseover'
                   , function () {
                       // Apply active CSS when mouse hovers over an item.
                       $( this ).css( activeCss );
                   }
        );


        // Set up event delegation for mouseout on list items.
        ui.delegate( 'li'
                   , 'mouseout'
                   , function () {
                       // Revert to inactive CSS when mouse leaves an item.
                       $( this ).css( inactiveCss );
                   }
        );


        // Set up event delegation for click on list items.
        ui.delegate( 'li'
                   , 'click'
                   , function () {
                       var val = $( this ).text(); // Get the text content of the clicked item.
                       that.val( val );            // Set the input field's value to the selected item.
                       reset();                    // Reset the suggestion box.
                   }
        );


        /*
         * Moves the active selection up or down within the suggestion list.
         *
         * @param {number} direction - The key code indicating direction (keyMap.up or keyMap.down).
         */
        function moveSelection ( direction ) {

            var index
              , newIndex
              ;

            // Get the current active index from the UI element's data.
            index = ui.data( 'active' );

            // Determine the new index based on the direction.
            if ( direction == keyMap.up ) {
                newIndex = index - 1;
            } else {
                newIndex = index + 1;
            }

            // Check if the new index is within the valid range of suggestions.
            if ( -1 < newIndex && newIndex < ui.children().length ) {

                // Iterate through all children (list items) and set them to inactive.
                ui.children().each( function ( i, item ) {
                    $( item ).css( inactiveCss );
                });

                // Set the newly selected item to active.
                $( ui.children()[ newIndex ] ).css( activeCss );

                // Update the active index in the UI element's data.
                ui.data( 'active', newIndex );
            }
        }


        /*
         * Resets the suggestion box, clearing its content and active selection.
         */
        function reset () {
            ui.data( 'active', 0 );       // Reset the active index to the first item.
            ui.children().remove();       // Remove all suggestion list items.
        }


        // Attach a blur event handler to the input field.
        this.blur( function ( e ) {
            ui.remove(); // Remove the entire suggestion UI when the input loses focus.
        });


        // Attach a keydown event handler to the input field.
        this.keydown( function ( k ) {

            // Handle the Enter key press.
            if ( k.keyCode == keyMap.enter ) {

                // Get the text of the currently active suggestion item.
                var val = $( ui.children()[ ui.data( 'active' ) ] ).text();

                that.val( val ); // Set the input field's value.
                reset();         // Reset the suggestion box.

                // Prevent default browser behavior for the Enter key.
                if ( k.preventDefault ) {
                    k.preventDefault();
                } else {
                    k.returnValue = false;
                }

                // Stop event propagation.
                if ( k.stopPropagation ) {
                    k.stopPropagation();
                }

                // Cancel event bubbling for older IE versions.
                if ( k.cancelBubble ) {
                    k.cancelBubble = true;
                }

                return false; // Prevent further processing of the keydown event.
            }


            // Handle Up and Down arrow key presses.
            if ( k.keyCode == keyMap.up || k.keyCode == keyMap.down ) {

                moveSelection( k.keyCode ); // Move the selection based on the key pressed.

                // Prevent default browser behavior for arrow keys (e.g., scrolling).
                if ( k.preventDefault )
                    k.preventDefault();
                else
                    k.returnValue = false;

                // Stop event propagation.
                if ( k.stopPropagation )
                    k.stopPropagation();

                // Cancel event bubbling.
                if ( k.cancelBubble )
                    k.cancelBubble = true;

                return false; // Prevent further processing.
            }

        }); // End of keydown handler.


        // Attach a keyup event handler to the input field.
        this.keyup( function ( k ) {

            // Ignore Enter key on keyup as it's handled on keydown.
            if ( k.keyCode == keyMap.enter )
                return;

            // Ignore Up/Down arrow keys on keyup.
            if ( k.keyCode == keyMap.up || k.keyCode == keyMap.down ) {
                return;
            }

            // Remove existing suggestion list items before generating new ones.
            ui.children().remove();


            // Get the current value of the input field and convert to lowercase for case-insensitive matching.
            value = that.val().toLowerCase();


            // If the input field is empty, there are no suggestions to show.
            if ( !value.length )
                return;


            // Iterate through the provided data array to find matching suggestions.
            $.each( data, function ( index, item ) {

                // Check if the current data item contains the input value.
                if ( item.toLowerCase().indexOf( value ) > -1 ) {

                    // Create a regular expression to highlight the matched part.
                    // The regex handles various HTML contexts to avoid breaking tags/entities.
                    var regx = new RegExp( "(?![^&;]+;)(?!<[^<>]*)(" + value + ")(?![^<>]*>)(?![^&;]+;)", "gi" );

                    // Replace the matched part with a strong tag for highlighting.
                    item = item.replace( regx, "<strong>$1</strong>" );

                    // Create a new list item element for the suggestion.
                    var x = $( '<li>' + item + '</li>' );

                    // Apply inactive CSS to the new item initially.
                    $( x ).css( inactiveCss );

                    // Append the new list item to the suggestion UI.
                    ui.append( x );
                }
            });

            // After populating the UI, insert it after the input field in the DOM.
            that.after( ui );

            // Set the first child (first suggestion) as active by applying its CSS.
            ui.children().first().css( activeCss );

        }); // End of keyup handler.

    }; // End of $.fn.suggestr function definition.

})( jQuery ); // Pass jQuery to the immediately invoked function expression.