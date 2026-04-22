// This file is part of the Stylish Select project.
// Version 0.4.1
// A jQuery plugin for styling select elements.
// Project home: http://scottdarby.com/
// Requires jQuery 1.3+
// Special thanks to Justin Beasley (http://www.harvest.org/) and Anatoly Ressin (http://www.artazor.lv/) for their valuable contributions.
// Licensed under MIT and GPL.
// (C) 20XX Scott Darby. All rights reserved.
( function ( $ ) { /* start of jQuery plugin definition */

    // Initialize the plugin by adding a class to the HTML element.
    // This helps in CSS targeting for JavaScript-enabled environments.
    $( 'html' ) . addClass ( 'stylish-select' ) ;

    // Define utility methods for the jQuery prototype.
    $.fn . extend ( {

        // Method to get or set the value of the stylish select.
        getSetSSValue : function ( value ) {
            if ( value ) {
                // If a value is provided, set it and trigger the change event.
                $( this ) . val ( value ) . change ( ) ;
                return this ; // Return the jQuery object for chaining.
            } else {
                // If no value is provided, return the currently selected option's value.
                return $( this ) . find ( ':selected' ) . val ( ) ;
            }
        } , // Separator for multiple methods

        // This method was kindly contributed by Justin Beasley.
        // It allows resetting the stylish select to its initial state.
        resetSS : function ( ) {
            var oldOpts = $( this ) . data ( 'ssOpts' ) ; // Retrieve stored options.
            $this = $( this ) ; // Cache the current element.
            $this . next ( ) . remove ( ) ; // Remove the generated DOM elements.
            // Unbind all previous event handlers and reinitialize the sSelect plugin.
            $this . unbind ( ) . sSelect ( oldOpts ) ;
        }

    } ) ; // End of $.fn.extend block

    // Main sSelect plugin definition.
    $.fn . sSelect = function ( options ) {

        return this . each ( function ( ) { // Iterate over each matched element.

            // Default configuration options for the plugin.
            var defaults = {
                defaultText : 'Please select' , // Placeholder text when nothing is selected.
                animationSpeed : 0 , // Speed of dropdown animation in milliseconds (0 for no animation).
                ddMaxHeight : '' // Maximum height for the dropdown list (e.g., '200px').
            } ;

            // Declare and initialize essential variables.
            var opts = $ . extend ( defaults , options ) , // Merge defaults with user-provided options.
            $input = $( this ) , // The original <select> element.
            $containerDivText = $( '<div class="selected"></div>' ) , // Div to display selected text.
            $containerDiv = $( '<div class="menuContainer" tabindex="0"></div>' ) , // Main container for the custom select.
            $newUl = $( '<ul class="menu"></ul>' ) , // The new unordered list for options.
            itemIndex = -1 , // Used for tracking item index within optgroups.
            currentIndex = -1 , // Current selected index.
            keys = [ ] , // Array to store first letters for quick navigation.
            prevKey = false , // Previous key pressed for sequential key navigation.
            prevented = false , // Flag to prevent redundant change events.
            $newLi ; // Variable to hold the list item elements.

            // Store the original options for potential resetting (credit: Justin Beasley).
            $( this ) . data ( 'ssOpts' , options ) ;

            // Construct the new custom select DOM structure.
            $containerDiv . insertAfter ( $input ) ; // Place the container after the original select.
            $containerDivText . prependTo ( $containerDiv ) ; // Add the text display div to the container.
            $newUl . appendTo ( $containerDiv ) ; // Add the unordered list to the container.
            $input . hide ( ) ; // Hide the original select element.

            // Check if the original select element contains <optgroup> elements.
            if ( $input . children ( 'optgroup' ) . length == 0 ) {
                // If no optgroups, process direct <option> children.
                $input . children ( ) . each ( function ( i ) {
                    var option = $( this ) . text ( ) ; // Get option text.
                    var key = $( this ) . val ( ) ; // Get option value.

                    // Store the first character of each option for keyboard navigation.
                    keys . push ( option . charAt ( 0 ) . toLowerCase ( ) ) ;
                    if ( $( this ) . attr ( 'selected' ) == true ) {
                        opts . defaultText = option ; // Update default text if an option is pre-selected.
                        currentIndex = i ; // Set the initial selected index.
                    }

                    // Append the new list item to the unordered list.
                    $newUl . append ( $ ( '<li><a href="JavaScript:void(0);">' + option + '</a></li>' ) . data ( 'key' , key ) ) ;

                } ) ; // End of each option iteration.

                // Add a class to the last list item for styling purposes.
                $newUl . find ( 'li' ) . filter ( ':last' ) . addClass ( 'last-li' ) ;

                // Cache the list items (anchors) for quicker access.
                $newLi = $newUl . children ( ) . children ( ) ;

            } else { // Handle selects with <optgroup> elements.
                $input . children ( 'optgroup' ) . each ( function ( ) {

                    var optionTitle = $( this ) . attr ( 'label' ) , // Get the optgroup label.
                    $optGroup = $( '<li class="menuOptionTitle">' + optionTitle + '</li>' ) ; // Create a list item for the optgroup title.

                    $optGroup . appendTo ( $newUl ) ; // Add the optgroup title to the main list.

                    var $optGroupList = $( '<ul></ul>' ) ; // Create a sub-list for optgroup options.

                    $optGroupList . appendTo ( $optGroup ) ; // Append the sub-list to the optgroup title item.

                    $( this ) . children ( ) . each ( function ( ) {
                        ++ itemIndex ; // Increment item index for overall tracking.
                        var option = $( this ) . text ( ) ; // Get option text.
                        var key = $( this ) . val ( ) ; // Get option value.
                        // Store the first character for keyboard navigation.
                        keys . push ( option . charAt ( 0 ) . toLowerCase ( ) ) ;
                        if ( $( this ) . attr ( 'selected' ) == true ) {
                            opts . defaultText = option ; // Update default text.
                            currentIndex = itemIndex ; // Set the initial selected index.
                        }
                        // Append the option to the optgroup's sub-list.
                        $optGroupList . append ( $ ( '<li><a href="JavaScript:void(0);">' + option + '</a></li>' ) . data ( 'key' , key ) ) ;
                    } ) ; // End of each optgroup option iteration.
                } ) ; // End of each optgroup iteration.

                // Cache all selectable list items (anchors within sub-lists).
                $newLi = $newUl . find ( 'ul li a' ) ;
            }

            // Retrieve and store dimensions of the new elements for later calculations.
            var newUlHeight = $newUl . height ( ) , // Height of the dropdown list.
            containerHeight = $containerDiv . height ( ) , // Height of the main container.
            newLiLength = $newLi . length ; // Total number of selectable list items.

            // Check if an option was pre-selected in the original <select>.
            if ( currentIndex != -1 ) {
                navigateList ( currentIndex , true ) ; // Initialize the display with the selected item.
            } else {
                // If no option is selected, display the default placeholder text.
                $containerDivText . text ( opts . defaultText ) ;
            }

            // Function to determine the vertical positioning of the dropdown list.
            // It decides whether to display it above or below the container.
            function newUlPos ( ) {
                var containerPosY = $containerDiv . offset ( ) . top , // Y-position of the container.
                docHeight = jQuery ( window ) . height ( ) , // Current height of the browser window.
                scrollTop = jQuery ( window ) . scrollTop ( ) ; // Scroll position of the window.

                // If the calculated list height exceeds the maximum allowed height,
                // cap it at the maximum height.
                if ( newUlHeight > parseInt ( opts . ddMaxHeight ) ) {
                    newUlHeight = parseInt ( opts . ddMaxHeight ) ;
                }

                // Adjust container Y-position relative to the scroll.
                containerPosY = containerPosY - scrollTop ;
                // If the list would extend beyond the bottom of the viewport,
                // position it above the container.
                if ( containerPosY + newUlHeight >= docHeight ) {
                    $newUl . css ( {
                        top : '-' + newUlHeight + 'px' , // Position above.
                        height : newUlHeight // Set the adjusted height.
                    } ) ;
                    $input . onTop = true ; // Mark that the list is displayed on top.
                } else {
                    $input . onTop = false ; // Mark that the list is displayed below.
                }
            }

            // Execute the positioning function immediately on page load.
            newUlPos ( ) ;

            // Re-run the positioning function whenever the browser window is resized.
            $( window ) . resize ( function ( ) {
                newUlPos ( ) ;
            } ) ;

            // Re-run the positioning function whenever the browser window is scrolled.
            $( window ) . scroll ( function ( ) {
                newUlPos ( ) ;
            } ) ;

            // Helper function to set container position to 'relative' when dropdown is open.
            function positionFix ( ) {
                $containerDiv . css ( 'position' , 'relative' ) ;
            }

            // Helper function to reset container position to 'static' when dropdown is closed.
            function positionHideFix ( ) {
                $containerDiv . css ( 'position' , 'static' ) ;
            }

            // Event handler for clicking the visible selected text area.
            $containerDivText . click ( function ( event ) {

                event . stopPropagation ( ) ; // Prevent the click from propagating up the DOM.

                // Hide all other open custom select menus on the page,
                // and remove their focus class.
                $( '.menu' ) . not ( $( this ) . next ( ) ) . hide ( ) . parent ( ) . removeClass ( 'menuSelFocus' ) ;

                // Toggle the visibility of the current dropdown menu.
                $newUl . toggle ( ) ;
                positionFix ( ) ; // Apply positioning fixes.
                // Attempt to focus on the currently selected item within the list.
                $newLi . eq ( currentIndex ) . focus ( ) ;

            } ) ; // End of $containerDivText click handler.

            // Event handler for clicking on an item within the new list.
            $newLi . click ( function ( e ) {

                var $clickedLi = $( e . target ) ; // Get the specific list item that was clicked.

                // Update the current index to reflect the newly selected item.
                currentIndex = $newLi . index ( $clickedLi ) ;

                // Prevent the original select's change event from firing immediately.
                prevented = true ;
                // Update the display and the hidden select's value.
                navigateList ( currentIndex ) ;
                $newUl . hide ( ) ; // Hide the dropdown list.
                $containerDiv . css ( 'position' , 'static' ) ; // Reset container position (IE fix).

            } ) ; // End of $newLi click handler.

            // Hover event handlers for list items.
            $newLi . hover (
                function ( e ) {
                    var $hoveredLi = $( e . target ) ; // Get the hovered list item.
                    $hoveredLi . addClass ( 'menuHover' ) ; // Add hover class.
                } ,
                function ( e ) {
                    var $hoveredLi = $( e . target ) ; // Get the unhovered list item.
                    $hoveredLi . removeClass ( 'menuHover' ) ; // Remove hover class.
                }
            ) ; // End of $newLi hover handler.

            // Function to update the selected item visually and internally.
            function navigateList ( currentIndex , init ) {
                $newLi . removeClass ( 'hiLite' ) // Remove highlight from all items.
                . eq ( currentIndex ) // Select the item at the current index.
                . addClass ( 'hiLite' ) ; // Add highlight to the selected item.

                if ( $newUl . is ( ':visible' ) ) {
                    $newLi . eq ( currentIndex ) . focus ( ) ; // If visible, focus the selected item.
                }

                var text = $newLi . eq ( currentIndex ) . text ( ) ; // Get the text of the selected item.
                var val = $newLi . eq ( currentIndex ) . parent ( ) . data ( 'key' ) ; // Get the associated value (key).

                // Special handling for initial page load.
                if ( init == true ) {
                    $input . val ( val ) ; // Set the value of the original hidden select.
                    $containerDivText . text ( text ) ; // Update the displayed text.
                    return false ; // Exit early for initialization.
                }

                $input . val ( val ) ; // Set the value of the original hidden select.
                $input . change ( ) ; // Trigger the change event on the original select.
                $containerDivText . text ( text ) ; // Update the displayed text.
            } ; // End of navigateList function.

            // Event handler for when the original hidden select's value changes.
            $input . change ( function ( event ) {
                $targetInput = $( event . target ) ; // Get the target element of the event.
                // If change was programmatically prevented, reset flag and exit.
                if ( prevented == true ) {
                    prevented = false ;
                    return false ;
                }
                $currentOpt = $targetInput . find ( ':selected' ) ; // Find the currently selected option.

                // Determine the index of the selected option.
                currentIndex = $targetInput . find ( 'option' ) . index ( $currentOpt ) ;

                navigateList ( currentIndex , true ) ; // Update the custom select display based on the original select's value.
            }
            ) ; // End of $input change handler.

            // Function to handle keyboard interactions for navigation.
            function keyPress ( element ) {
                // Attach the keydown event handler to the provided element.
                element . onkeydown = function ( e ) {
                    var keycode ; // Variable to store the key code.
                    if ( e == null ) { // Check for Internet Explorer's event model.
                        keycode = event . keyCode ; // IE uses window.event.keyCode.
                    } else { // For other modern browsers.
                        keycode = e . which ; // Use event.which for cross-browser compatibility.
                    }

                    // Set a flag to prevent the change event from firing unnecessarily.
                    prevented = true ;

                    // Use a switch statement to handle different key codes.
                    switch ( keycode )
                    {
                        case 40 : // Down arrow key.
                        case 39 : // Right arrow key.
                            incrementList ( ) ; // Move to the next item.
                            return false ; // Prevent default browser action.
                            break ; // Not strictly needed due to return, but good practice.
                        case 38 : // Up arrow key.
                        case 37 : // Left arrow key.
                            decrementList ( ) ; // Move to the previous item.
                            return false ; // Prevent default browser action.
                            break ;
                        case 33 : // Page Up key.
                        case 36 : // Home key.
                            gotoFirst ( ) ; // Jump to the first item.
                            return false ; // Prevent default browser action.
                            break ;
                        case 34 : // Page Down key.
                        case 35 : // End key.
                            gotoLast ( ) ; // Jump to the last item.
                            return false ; // Prevent default browser action.
                            break ;
                        case 13 : // Enter key.
                        case 27 : // Escape key.
                            $newUl . hide ( ) ; // Hide the dropdown list.
                            positionHideFix ( ) ; // Reset container positioning.
                            return false ; // Prevent default browser action.
                            break ;
                    }

                    // Attempt to handle alphanumeric keyboard shortcuts for quick selection.
                    keyPressed = String . fromCharCode ( keycode ) . toLowerCase ( ) ;

                    var currentKeyIndex = keys . indexOf ( keyPressed ) ; // Find the key in the stored array.

                    if ( typeof currentKeyIndex != 'undefined' ) { // If the key was found (i.e., it's a valid option start letter).
                        ++ currentIndex ; // Increment current index to start search from next item.
                        currentIndex = keys . indexOf ( keyPressed , currentIndex ) ; // Search for the key starting from the incremented index.
                        // If no entry found or a new key is pressed, search from the beginning.
                        if ( currentIndex == -1 || currentIndex == null || prevKey != keyPressed ) currentIndex = keys . indexOf ( keyPressed ) ;


                        navigateList ( currentIndex ) ; // Navigate to the found item.
                        prevKey = keyPressed ; // Store the current key as the previous key.
                        return false ; // Prevent default browser action.
                    }
                }
            }

            // Helper function to move to the next item in the list.
            function incrementList ( ) {
                if ( currentIndex < ( newLiLength - 1 ) ) { // Check if not at the end of the list.
                    ++ currentIndex ; // Move to the next index.
                    navigateList ( currentIndex ) ; // Update the display.
                }
            }

            // Helper function to move to the previous item in the list.
            function decrementList ( ) {
                if ( currentIndex > 0 ) { // Check if not at the beginning of the list.
                    -- currentIndex ; // Move to the previous index.
                    navigateList ( currentIndex ) ; // Update the display.
                }
            }

            // Helper function to jump to the first item.
            function gotoFirst ( ) {
                currentIndex = 0 ; // Set index to the first item.
                navigateList ( currentIndex ) ; // Update the display.
            }

            // Helper function to jump to the last item.
            function gotoLast ( ) {
                currentIndex = newLiLength - 1 ; // Set index to the last item.
                navigateList ( currentIndex ) ; // Update the display.
            }

            // Attach click event to the container div for keyboard navigation.
            $containerDiv . click ( function ( ) {
                keyPress ( this ) ; // Enable keyboard navigation on click.
            } ) ;

            // Attach focus event to the container div.
            $containerDiv . focus ( function ( ) {
                $( this ) . addClass ( 'menuSelFocus' ) ; // Add focus class for styling.
                keyPress ( this ) ; // Enable keyboard navigation.
            } ) ;

            // Attach blur event to the container div.
            $containerDiv . blur ( function ( ) {
                $( this ) . removeClass ( 'menuSelFocus' ) ; // Remove focus class on blur.
            } ) ;

            // Hide the dropdown list and reset focus when clicking anywhere else on the body.
            $( 'body' ) . click ( function ( ) {
                $containerDiv . removeClass ( 'menuSelFocus' ) ; // Remove focus class from container.
                $newUl . hide ( ) ; // Hide the dropdown.
                positionHideFix ( ) ; // Reset positioning.
            } ) ;

            // Add/remove hover classes for the displayed text area.
            $containerDivText . hover ( function ( e ) {
                var $hoveredTxt = $( e . target ) ; // Get the hovered element.
                $hoveredTxt . parent ( ) . addClass ( 'menuSelHover' ) ; // Add hover class to parent.
            } ,
            function ( e ) {
                var $hoveredTxt = $( e . target ) ; // Get the unhovered element.
                $hoveredTxt . parent ( ) . removeClass ( 'menuSelHover' ) ; // Remove hover class from parent.
            }
            ) ; // End of $containerDivText hover handler.

            // Ensure the new UL is positioned correctly and initially hidden.
            $newUl . css ( 'left' , '0' ) . hide ( ) ;

        } ) ; // End of this.each function.

    } ; // End of $.fn.sSelect definition.

} ) ( jQuery ) ; // End of IIFE, passing jQuery.