// This file contains the enhanced Bootstrap Typeahead functionality.
// Original version: bootstrap-better-typeahead.js v1.0.0
// Author: Philipp Nolte
// Project URL: https://github.com/ptnplanet/Bootstrap-Better-Typeahead
//
// This code extends the standard Twitter Bootstrap Typeahead plugin.
// Reference: http://twitter.github.com/bootstrap/javascript.html#typeahead
//
// Licensing Information:
// The underlying Bootstrap framework is released under the Apache License, Version 2.0.
// See: http://www.apache.org/licenses/LICENSE-2.0
// All rights reserved.
//
// This entire script aims to improve typeahead behavior.

! function ( $ )
{
    // Enforce strict mode for cleaner, safer code execution.
    "use strict" ;

    /*
     * This 'BetterTypeahead' object encapsulates enhancements for the Bootstrap Typeahead plugin.
     * Its primary goal is to allow `maxLength` to be set to zero, enabling full list display.
     * Additionally, the handling of the 'Tab' key has been adjusted, moving its logic from `keyup`
     * to `keydown` to ensure proper display of suggestions upon focus via tab, maintaining original intent.
     *
     * @typedef {object} BetterTypeahead
     * @property {function} lookup - Method to perform the typeahead lookup.
     * @property {function} process - Method to filter and sort the lookup results.
     * @property {function} render - Method to display the processed items.
     * @property {function} keydown - Event handler for the keydown event.
     * @property {function} keyup - Event handler for the keyup event.
     * @property {function} focus - Event handler for the focus event.
     */
    var BetterTypeahead = {

        lookup: function ( event )
        {
            var items ; // Declare variable to hold suggestion items.

            // The current query string is retrieved from the input element.
            // It defaults to an empty string if the element's value is falsy.
            this.query = this.$element.val() || '' ;

            // Check if the query length is below the minimum required length.
            // If so, hide the suggestions if they are currently shown, otherwise return `this`.
            if ( this.query.length < this.options.minLength )
            {
                return this.shown ? this.hide() : this ;
            }

            // Determine the source of items:
            // If `this.source` is a function, execute it with the query and a proxy to `process`.
            // Otherwise, use `this.source` directly as the items array.
            items = $.isFunction( this.source ) ? this.source( this.query , $.proxy( this.process , this ) ) : this.source ;

            // If items were retrieved, process them; otherwise, return `this`.
            return items ? this.process( items ) : this ;
        }

        , process: function ( items )
        {
            // Cache 'this' for use within nested functions to maintain context.
            var that = this ;

            // Filter the items using the matcher function defined in the typeahead options.
            items = $.grep( items , function ( item ) {
                return that.matcher( item ) ;
            } ) ;

            // Sort the filtered items based on the sorter function.
            items = this.sorter( items ) ;

            // If no items remain after filtering and sorting,
            // hide the suggestions if visible, or return the instance.
            if ( ! items.length )
            {
                return this.shown ? this.hide() : this ;
            }

            // If a query exists (i.e., not an empty query for full list display),
            // truncate the items to the maximum number specified in options.
            if ( this.query.length )
            {
                items = items.slice( 0 , this.options.items ) ;
            }

            // Render the final list of items and then display the suggestions menu.
            return this.render( items ).show() ;
        }

        , render: function ( items )
        {
            var that = this ; // Store context for inner function.

            // Map the array of items to jQuery list elements.
            items = $( items ).map( function ( i , item )
            {
                // Create a new list item element, setting its data-value attribute.
                i = $( that.options.item ).attr( 'data-value' , item ) ;
                // Populate the anchor tag within the list item with highlighted text.
                i.find( 'a' ).html( that.highlighter( item ) ) ;
                // Return the raw DOM element for the map function.
                return i[0] ;
            } ) ;

            // If there's an active query (not an empty query for full list),
            // mark the first item as 'active' for immediate selection.
            if ( this.query.length > 0 )
            {
                items.first().addClass( 'active' ) ;
            }

            // Update the HTML content of the suggestion menu with the rendered items.
            this.$menu.html( items ) ;
            return this ; // Allow chaining.
        }

        , keydown: function ( e )
        {
            // Suppress key press repeat for specific keys like arrow keys, tab, enter, and escape.
            // The `~` operator converts -1 (not found) to 0 (falsy) and other indices to truthy values.
            this.suppressKeyPressRepeat = ~ $.inArray( e.keyCode , [ 40 , 38 , 9 , 13 , 27 ] ) ;

            // New logic: Handle the Tab key during keydown.
            // This allows the full list to be displayed on tab-focus before the blur event.
            if ( e.keyCode === 9 ) // Key code for the Tab key.
            {
                // If the suggestions are not currently shown, there's nothing to select; exit.
                if ( ! this.shown )
                {
                    return ;
                }
                // If suggestions are shown, select the active item.
                this.select() ;
            }
            else
            {
                // For other keys, delegate to the standard move function (e.g., arrow key navigation).
                this.move( e ) ;
            }
        }

        , keyup: function ( e )
        {
            // Evaluate the key code to determine appropriate action.
            switch ( e.keyCode )
            {
                case 40 : // Down arrow key.
                case 38 : // Up arrow key.
                case 16 : // Shift key.
                case 17 : // Ctrl key.
                case 18 : // Alt key.
                    // These keys typically control navigation or modifiers, and don't trigger new lookups on keyup.
                    break ;

                // The handling for the Tab key has been relocated to the `keydown` event.
                case 13 : // Enter key.
                    // If the suggestion menu is not displayed, do nothing.
                    if ( ! this.shown )
                    {
                        return ;
                    }
                    // Select the currently highlighted item.
                    this.select() ;
                    break ;

                case 27 : // Escape key.
                    // If suggestions are not visible, exit.
                    if ( ! this.shown )
                    {
                        return ;
                    }
                    // Hide the suggestion menu.
                    this.hide() ;
                    break ;

                default :
                    // For all other keys, perform a lookup to update suggestions.
                    this.lookup() ;
            }

            // Stop event propagation to prevent bubbling up the DOM.
            e.stopPropagation() ;
            // Prevent the default browser action for the key event.
            e.preventDefault() ;
        }

        , focus: function ( e )
        {
            // Mark the input element as focused.
            this.focused = true ;

            // If the mouse is not currently hovering over the suggestions (preventing redundant lookups),
            // trigger a lookup to display suggestions.
            if ( ! this.mousedover )
            {
                this.lookup( e ) ;
            }
        }
    } ; // End of BetterTypeahead object definition.

    // Extend the prototype of the original Bootstrap Typeahead constructor.
    // This effectively overrides or adds methods to the existing Typeahead plugin.
    $.extend( $.fn.typeahead.Constructor.prototype , BetterTypeahead ) ;

} ( window.jQuery ) ; // Execute the Immediately Invoked Function Expression (IIFE) with jQuery.