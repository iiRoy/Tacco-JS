/*******************************************************************************
 *
 *  Bootstrap Select Plugin - Core Logic
 *  Description: Enhances standard dropdowns with custom styling and functionality.
 *  Version: 1.0.0
 *  Author: Original Author (as per source)
 *
 ******************************************************************************/


( function( $ )
{

    // Ensure strict mode for better code quality and error prevention
    'use strict'; /* This directive enforces stricter parsing and error handling in JavaScript. */


    /**
     *  Main plugin definition for dropSelect.
     *  Attaches the custom select functionality to jQuery objects.
     *
     *  @param {object} option - Configuration options for the plugin instance. (Currently unused in this version)
     *  @returns {jQuery} - The jQuery object to maintain chainability.
     */
    $.fn.dropSelect = function( option )
    {
        // Iterate over each matched element to apply the plugin
        return this.each( function()
        {

            // Cache the current element as a jQuery object
            var $this = $( this );

            // Locate the visible display element for the selected value
            var display = $this.find( '.dropdown-display' );

            // Locate the hidden input field that stores the actual selected value
            var field = $this.find( 'input.dropdown-field' );

            // Identify all selectable options within the dropdown menu
            var options = $this.find( 'ul.dropdown-menu > li > a' );


            /**
             *  Handles changes to the hidden input field.
             *  Updates the visible display text based on the new value.
             *
             *  @param {Event} event - The change event object.
             */
            var onFieldChange = function( event )
            {
                // Retrieve the current value from the hidden field
                var val = $( this ).val();

                // Find the option element whose 'data-value' matches the hidden field's value
                // and extract its inner HTML for display.
                var displayText = options
                                    .filter( "[data-value='" + val + "']" )
                                    .html();

                // Update the display element with the retrieved text
                display.html( displayText );
            };


            /**
             *  Handles click events on individual dropdown options.
             *  Updates the hidden input field and triggers its change event.
             *
             *  @param {Event} event - The click event object.
             */
            var onOptionClick = function( event )
            {
                // Prevent the default link behavior (e.g., page refresh or navigation)
                event.preventDefault();

                // Set the hidden field's value to the 'data-value' attribute of the clicked option
                field.val( $( this ).attr( 'data-value' ) );

                // Manually trigger the change event on the hidden field
                // This will in turn call the onFieldChange handler
                field.change();
            };


            // Bind the change event handler to the hidden input field
            field.change( onFieldChange );

            // Bind the click event handler to all selectable options
            options.click( onOptionClick );

        } );
    };


    /**
     *  Auto-initialization block.
     *  This function executes once the DOM is fully loaded.
     */
    $( function()
    {
        // Find all div elements with the 'data-select=true' attribute
        // and initialize them with the dropSelect plugin.
        $( 'div[data-select=true]' ).dropSelect();
    } );


} )( window.jQuery ); // Pass the jQuery object into the immediately invoked function expression (IIFE)
                      // ensuring '$' refers to jQuery within this scope.