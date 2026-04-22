// Auto-Complete Widget - a straightforward text completion utility
//
// Based on work by Honza Pokorny (2011)
// Distributed under an open-source license (e.g., MIT, BSD-style)
// Project repository: some_other_url/auto-complete.js

( function ( jQ ) {

    // Declare global-like variables within this scope for key mappings and styling definitions
    var navigationKeycodes, highlightStyle, normalStyle, containerStyle;


    // Define special key codes for navigation within the suggestion list
    navigationKeycodes = {
        upArrow   : 38,   // Key code for the 'up' arrow
        downArrow : 40,   // Key code for the 'down' arrow
        returnKey : 13    // Key code for the 'enter' or 'return' key
    };


    // CSS properties for a highlighted (active) suggestion item
    highlightStyle = {
        listStyleType   : 'none',        // Remove default list bullet
        backgroundColor : '#e0e0e0',   // Light gray background for active item
        color           : '#333'         // Darker text color
    };


    // CSS properties for a regular (inactive) suggestion item
    normalStyle = {
        listStyleType   : 'none',        // Ensure no list bullet
        backgroundColor : '#ffffff',   // White background for inactive items
        color           : '#000'         // Black text color
    };


    // Base CSS for the suggestion container box
    containerStyle = {
        minWidth    : '220px',             // Minimum width for the suggestion box
        position    : 'absolute',          // Position absolutely relative to parent
        zIndex      : '9999',              // Ensure it appears above other elements
        border      : '1px solid #ccc',    // Light gray border
        boxShadow   : '2px 2px 5px rgba(0,0,0,0.1)' // Subtle shadow
    };


    // Extend jQuery's prototype with our new auto-complete functionality
    jQ.fn.autoComplete = function ( sourceData ) {

        // Declare local variables for the suggestion interface, the input field, and current text
        var displayElement, currentInput, currentInputValue;

        // 'this' refers to the jQuery object of the input field this plugin is called on
        currentInput = this;

        // Retrieve or create the suggestion display container
        // If an element with the specific ID exists, use it; otherwise, create a new div
        displayElement = document.getElementById( 'auto-complete-box' ) || jQ( '<div id="auto-complete-box"></div>' );

        // Apply the container's base styling
        displayElement.css( containerStyle );

        // Initialize the active item index to 0 (the first item) in the data cache
        displayElement.data( 'selectedIndex', 0 );


        // Attach event handlers to list items within the display container using event delegation
        // When mouse hovers over a list item, apply the highlight style
        displayElement.on( 'mouseover', 'li', function () {
            jQ( this ).css( highlightStyle );
        } );

        // When mouse leaves a list item, apply the normal style
        displayElement.on( 'mouseout', 'li', function () {
            jQ( this ).css( normalStyle );
        } );

        // When a list item is clicked, set the input field's value
        displayElement.on( 'click', 'li', function () {
            var selectedText = jQ( this ).text(); // Get the text content of the clicked item
            currentInput.val( selectedText );      // Update the input field with the selected text
            clearAndReset();                       // Clear suggestions and reset display state
        } );


        // Helper function to navigate through the suggestion list
        function adjustSelection ( movementDirection ) {
            var currentIndex, nextIndex; // Variables to hold current and future indices

            // Retrieve the currently active item's index from the display element's data
            currentIndex = displayElement.data( 'selectedIndex' );

            // Determine the next index based on the direction of movement (up or down arrow)
            if ( movementDirection === navigationKeycodes.upArrow ) {
                nextIndex = currentIndex - 1; // Move up the list by decrementing the index
            } else {
                nextIndex = currentIndex + 1; // Move down the list by incrementing the index
            }

            // Check if the calculated next index is within the valid range of list items
            if ( nextIndex > -1 && nextIndex < displayElement.children().length ) {
                // If valid, first reset all items to their normal style
                displayElement.children().each( function ( idx, listItem ) {
                    jQ( listItem ).css( normalStyle );
                } );

                // Then apply the highlight style to the new active item
                jQ( displayElement.children()[ nextIndex ] ).css( highlightStyle );

                // Update the stored active index in the data cache
                displayElement.data( 'selectedIndex', nextIndex );
            }
        }


        // Function to clear all suggestions and reset the active index
        function clearAndReset () {
            displayElement.data( 'selectedIndex', 0 ); // Reset active index to the first item (0)
            displayElement.children().remove();        // Remove all current suggestion list items from the DOM
        }


        // Event handler for when the input field loses focus
        currentInput.on( 'blur', function ( blurEvt ) {
            // Remove the entire suggestion display element from the DOM
            displayElement.remove();
        } );


        // Event handler for key presses while the input field is focused
        currentInput.on( 'keydown', function ( keyEvt ) {

            // Check if the 'Enter' key was pressed
            if ( keyEvt.keyCode === navigationKeycodes.returnKey ) {
                // Get the text of the currently active (selected) suggestion
                var selectedText = jQ( displayElement.children()[ displayElement.data( 'selectedIndex' ) ] ).text();

                // Set the input field's value to the selected text
                currentInput.val( selectedText );

                // Clear the suggestions and reset the state
                clearAndReset();

                // Prevent default browser actions for the 'Enter' key (e.g., form submission)
                if ( keyEvt.preventDefault ) {
                    keyEvt.preventDefault();
                } else {
                    keyEvt.returnValue = false; // For older Internet Explorer versions
                }
                // Stop event propagation to prevent other handlers from firing
                if ( keyEvt.stopPropagation ) {
                    keyEvt.stopPropagation();
                }
                if ( keyEvt.cancelBubble ) {
                    keyEvt.cancelBubble = true; // For older Internet Explorer versions
                }

                return false; // Prevent further processing of this keydown event
            }

            // Check if 'Up' or 'Down' arrow keys were pressed
            if ( keyEvt.keyCode === navigationKeycodes.upArrow || keyEvt.keyCode === navigationKeycodes.downArrow ) {
                // Move the selection within the suggestion list
                adjustSelection( keyEvt.keyCode );

                // Prevent default browser actions (e.g., scrolling the page with arrow keys)
                if ( keyEvt.preventDefault ) keyEvt.preventDefault();
                    else keyEvt.returnValue = false;
                if ( keyEvt.stopPropagation ) keyEvt.stopPropagation();
                if ( keyEvt.cancelBubble ) keyEvt.cancelBubble = true;

                return false; // Prevent further processing of this keydown event
            }

        } ); // End of keydown event handler


        // Event handler for key releases while the input field is focused
        currentInput.on( 'keyup', function ( keyEvt ) {

            // Ignore 'Enter' key for keyup event processing as it's handled in keydown
            if ( keyEvt.keyCode === navigationKeycodes.returnKey )
                return;

            // Ignore 'Up' or 'Down' arrow keys for keyup event processing
            if ( keyEvt.keyCode === navigationKeycodes.upArrow || keyEvt.keyCode === navigationKeycodes.downArrow ) {
                return;
            }

            // Remove any previously displayed suggestions before generating new ones
            displayElement.children().remove();

            // Get the current value from the input field and convert to lowercase for case-insensitive matching
            currentInputValue = currentInput.val().toLowerCase();

            // If the input field is empty, there are no suggestions to show, so exit
            if ( !currentInputValue.length )
                return;

            // Iterate through the provided source data to find matching items
            jQ.each( sourceData, function ( dataIdx, dataItem ) {
                // Check if the data item contains the current input value (case-insensitive)
                if ( dataItem.toLowerCase().indexOf( currentInputValue ) > -1 ) {
                    // Create a regular expression to highlight the matched part within the suggestion
                    // This regex ensures we don't accidentally match parts of HTML entities or tags
                    var matchPattern = new RegExp( "(?![^&;]+;)(?!<[^<>]*)(" + currentInputValue + ")(?![^<>]*>)(?![^&;]+;)", "gi" );
                    // Replace the matched part with strong tags for visual highlighting
                    dataItem = dataItem.replace( matchPattern, "<strong>$1</strong>" );

                    // Create a new list item element for the suggestion
                    var entryElement = jQ( '<li>' + dataItem + '</li>' );
                    // Apply the normal (inactive) style to the newly created item
                    jQ( entryElement ).css( normalStyle );
                    // Add the new item to the suggestion display container
                    displayElement.append( entryElement );
                }
            } );

            // Insert the suggestion display element into the DOM, right after the input field
            currentInput.after( displayElement );

            // Highlight the first suggestion item by default, making it the initially active one
            displayElement.children().first().css( highlightStyle );

        } ); // End of keyup event handler

    }; // End of autoComplete function definition

} )( jQuery ); // End of Immediately Invoked Function Expression (IIFE) with jQuery alias