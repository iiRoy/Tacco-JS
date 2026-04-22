/*
 *  yaselect: A jQuery Plugin for Customizing Select Element Appearance.
 *  -------------------------------------------------------------------
 *  This script enables styling of standard HTML <select> elements
 *  using CSS, overcoming browser limitations.
 *
 *  Project Homepage: http://github.com/choonkeat/yaselect
 *
 *  Copyright (c) 2011 Chew Choon Keat. All rights reserved.
 *  Licensed under the MIT License.
 *
 *  Configuration Options:
 *    - topOffset:   (Number) Vertical offset in pixels. Default is 0.
 *    - leftOffset:  (Number) Horizontal offset in pixels. Default is 0.
 *    - size:        (Number) Specifies the maximum number of options to display
 *                   when the select dropdown is open. Default is 5.
 *    - hoverOnly:   (Boolean) If true, the native select is shown directly (e.g., for touch devices).
 *                   Default is false.
 */


jQuery.fn.yaselect  =  function ( options )
{
    // Initialize options object if not provided, ensuring it's always an object.
    options = options || {};


    /*
     *  Iterate over each selected <select> element to apply the yaselect functionality.
     *  The 'this' context within 'each' refers to the DOM element.
     */
    return this.each( function ( index , select )
    {
        // Cache the jQuery-wrapped select element and apply initial styling for positioning.
        // It's absolutely positioned and given a high z-index to overlay other elements.
        var jselect = jQuery(select) .css ( { position:'absolute' , top:0 , left:0 , zIndex:1 } ) .addClass('yaselect-select') ;

        // Create the wrapper elements: an outer anchor and an inner wrapper with the current selection display.
        var wrap    = jQuery('<div class="yaselect-wrap" tabindex="0"><div class="yaselect-current"></div></div>') ;

        // Wrap the 'wrap' element in an anchor div, setting its position to relative for proper positioning context.
        var anchor  = wrap .wrap ( '<div class="yaselect-anchor" style="position:relative;"></div>' ) .parent() ;

        // Define a helper function to toggle the 'yaselect-open' class on the anchor,
        // reflecting the visibility state of the original select.
        var toggle  = function () { anchor.toggleClass('yaselect-open', jselect.is(':visible')); } ;

        // Define a helper function to retrieve the text of the currently selected option.
        // Defaults to the first option if no selection is made.
        var gettext = function () { return jselect.find('option:nth(' + (select.selectedIndex || 0) + ')').text(); } ;

        // Initialize the 'curr' variable, which refers to the element displaying the current selection text.
        // Set its initial text based on the currently selected option.
        var curr    = wrap .find ( '.yaselect-current' ) .text ( gettext() ) ;

        // Define the 'confirm' function, which updates the displayed text,
        // hides the native select, and optionally focuses the wrapper.
        var confirm = function (to_focus_wrap)
        {
            // Blur the native select to close its dropdown.
            jselect.blur();

            // Update the displayed text to reflect the current selection.
            curr.text(gettext());

            // Position the native select just below the wrapper.
            jselect.css({top: wrap.outerHeight()});

            // If requested, focus the custom wrapper element.
            if (to_focus_wrap) wrap.focus();
        };


        // Check if 'hoverOnly' option is enabled or if the user agent indicates an iOS device.
        // This path is for devices where native select interaction is preferred (e.g., touch screens).
        if  (  options.hoverOnly  ||  ( window.navigator  &&  navigator.userAgent.match(/iphone|ipod|ipad/i) )  )
        {
            /*
             *  For touch devices or 'hoverOnly' mode, the native select is made invisible
             *  and positioned directly over the custom wrapper to capture native tap events.
             *  This triggers the device's native select picker.
             */
            return jselect
                .before(anchor) // Insert the anchor/wrapper before the native select.
                .css({opacity: 0.001}) // Make the native select nearly transparent to allow clicks to pass through.
                .change(function(e) { curr.text(gettext()); }) // Update displayed text when native select changes.
                .appendTo(anchor); // Move the native select inside the anchor.
        }

        // --- Standard Desktop/Non-Touch Device Behavior ---

        // Place the custom anchor/wrapper before the native select.
        jselect.before(anchor)
          // Handle keyboard events on the native select.
          // Enter (13) or Space (32) keys will confirm the selection and focus the wrapper.
          .keydown(function(e) { if (e.which==13||e.which==32) { e.preventDefault(); confirm(true); } })
          // Update the displayed text when the native select's value changes.
          .change(function(e) { curr.text(gettext()); })
          // When the native select loses focus, hide it and update the open/closed state.
          .blur(function(e) { jselect.hide(); toggle(); })
          // Handle click events on the native select.
          .click(function(e)
          {
            // If the native select is currently hidden (closed)...
            if (jselect.is(':hidden'))
            {
              jselect.show(); // Show the native select.
              toggle();       // Update the visual state (e.g., add 'yaselect-open' class).
              // Use a timeout to focus the native select, avoiding conflicts with blur events
              // that might occur immediately after the click and cause confusion.
              setTimeout(function() { jselect.focus(); });
            }
            // If the native select is already visible (open), clicking it again confirms the selection.
            else
            {
              confirm(true); // Confirm selection and focus the wrapper.
            }
          })
          // Finally, move the native select into the anchor/wrapper.
          .appendTo(anchor);


        // --- Event Handlers for the Custom Wrapper ---
        wrap
          // When the custom wrapper is clicked (mousedown), simulate a click on the native select.
          .mousedown(function(e) { jselect.click(); })
          // Handle keyboard events on the custom wrapper.
          .keydown(function(e)
          {
            // If Enter (13), Space (32), or arrow keys (37-40) are pressed...
            switch (e.which)
            {
              case 13: // Enter key
              case 32: // Spacebar
              case 37: // Left arrow
              case 38: // Up arrow
              case 39: // Right arrow
              case 40: // Down arrow
                e.preventDefault(); // Prevent default browser actions (e.g., page scrolling or native select opening).
                jselect.click();    // Simulate a click on the native select to open/toggle it.
            }
          }); // End of keydown event handler for the custom wrapper.

        // Set the 'size' attribute of the native select, limiting the number of visible options.
        // This uses the provided 'options.size' or defaults to 10 if not specified.
        select.size = Math.min(select.options.length, options.size || 10);

        // Perform an initial confirmation to set up the displayed text and positioning.
        confirm();

    } ); // End of 'each' function.

}; // End of yaselect plugin definition.