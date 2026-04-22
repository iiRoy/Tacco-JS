/*
 * This is a Type I clone of the jQuery.placeholder plugin.
 *
 * Original code written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com).
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date of original version: 2008/10/14
 *
 * @author Blair Mitchelmore (original)
 * @version 1.0.1 (original)
 * @description
 *    This JavaScript code provides a jQuery plugin to emulate the HTML5 placeholder
 *    attribute behavior for input fields in browsers that do not natively support it.
 *    It handles initial display, focus/blur events, and various submit scenarios.
 *
 * NOTE: This file is a clone. Only whitespace and comments have been altered.
 *       The functional logic and structure remain absolutely identical to the original.
 */
new function ( $ )
{
    // Extend jQuery's prototype to add the 'placeholder' function.
    $.fn.placeholder = function ( settings )
    {
        // Initialize settings; use an empty object if no settings are provided.
        settings = settings || {};

        // Define configuration variables, using provided settings or sensible defaults.
        var key          = settings.dataKey         || "placeholderValue";  // Key for storing placeholder text in jQuery's data.
        var attr         = settings.attr            || "placeholder";       // The HTML attribute to read the placeholder text from.
        var className    = settings.className       || "placeholder";       // CSS class to apply when placeholder text is visible.
        var values       = settings.values          || [];                  // Optional array of custom placeholder values per input.
        var block        = settings.blockSubmit     || false;               // If true, prevents form submission if a field still has its placeholder.
        var blank        = settings.blankSubmit     || false;               // If true, clears placeholder fields before form submission.
        var submit       = settings.onSubmit        || false;               // Custom function to call on form submission.
        var value        = settings.value           || "";                  // Default empty string for input value when cleared.
        var position     = settings.cursor_position || 0;                   // Desired cursor position when field gains focus.


        // Begin processing the selected elements.
        // First, filter to ensure we're only working with input elements.
        return this.filter( ":input" )
                   // Store the actual placeholder value for each input element.
                   .each( function ( index )
                   {
                       // Get placeholder text either from the 'values' array (if available)
                       // or directly from the element's 'placeholder' attribute.
                       $.data( this, key, values[ index ] || $( this ).attr( attr ) );
                   } )
                   // Initialize the display of placeholder text for empty fields.
                   .each( function ()
                   {
                       // If the input field's current value is empty (after trimming whitespace)...
                       if ( $.trim( $( this ).val() ) === "" )
                           // ...add the placeholder CSS class and set its value to the stored placeholder text.
                           $( this ).addClass( className )
                                    .val( $.data( this, key ) );
                   } )
                   // Attach the focus event handler.
                   .focus( function ()
                   {
                       // If the input's current value is the placeholder text...
                       if ( $.trim( $( this ).val() ) === $.data( this, key ) )
                           // ...remove the placeholder class and clear the input's value.
                           $( this ).removeClass( className )
                                    .val( value );

                       // If the 'setCursorPosition' plugin is available, set the cursor position.
                       // Note: This 'if' block is intentionally not enclosed by the outer 'if' block's braces,
                       // matching the original code's structure.
                       if ( $.fn.setCursorPosition )
                       {
                           $( this ).setCursorPosition( position );
                       }
                   } )
                   // Attach the blur (lose focus) event handler.
                   .blur( function ()
                   {
                       // If the input field is currently empty (its value is the 'value' variable, usually "").
                       if ( $.trim( $( this ).val() ) === value )
                           // ...add the placeholder class and restore the placeholder text.
                           $( this ).addClass( className )
                                    .val( $.data( this, key ) );
                   } )
                   // Attach form submission handlers based on plugin settings.
                   .each( function ( index, elem )
                   {
                       // Case 1: If 'blockSubmit' is enabled.
                       if ( block )
                           new function ( e )
                           {
                               // Attach a submit handler to the element's parent form.
                               $( e.form ).submit( function ()
                               {
                                   // Return true to allow submission only if the field's value is NOT the placeholder.
                                   // Otherwise, submission is blocked (return false implicitly if handler returns false).
                                   return $.trim( $( e ).val() ) != $.data( e, key );
                               } );
                           } ( elem ); // Immediately invoke this function with 'elem' as 'e'.
                       // Case 2: If 'blankSubmit' is enabled (and 'blockSubmit' is not).
                       else if ( blank )
                           new function ( e )
                           {
                               // Attach a submit handler to the element's parent form.
                               $( e.form ).submit( function ()
                               {
                                   // If the field's value IS the placeholder text...
                                   if ( $.trim( $( e ).val() ) == $.data( e, key ) )
                                       // ...remove the placeholder class and clear the field's value.
                                       $( e ).removeClass( className )
                                             .val( "" );

                                   // Always allow the form to submit after this processing.
                                   return true;
                               } );
                           } ( elem ); // Immediately invoke this function with 'elem' as 'e'.
                       // Case 3: If a custom 'onSubmit' handler is provided (and block/blank are not).
                       else if ( submit )
                           new function ( e )
                           {
                               // Attach the custom submit handler directly to the form.
                               $( e.form ).submit( submit );
                           } ( elem ); // Immediately invoke this function with 'elem' as 'e'.
                   } ); // End of the final .each() block.
    }; // End of $.fn.placeholder definition.

} ( jQuery ); // Immediately invoke the wrapper function, passing the jQuery object.