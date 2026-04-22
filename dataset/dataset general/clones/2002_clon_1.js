/*************************************************************************
 *
 *              listgroup.js - Version 1.1.2
 *
 *                  Project Homepage:
 *                  http://rickardn.github.io/listgroup.js
 *
 *************************************************************************
 *
 *              Copyright (c) 2014 Rickard Nilsson
 *              Licensed under the MIT License (MIT)
 *              (See: https://github.com/rickardn/listgroup.js/blob/master/LICENSE)
 *
 *************************************************************************/


+function ($) {

    "use strict"; // Enforce strict JavaScript parsing and execution.

    //
    // LISTGROUP PUBLIC CLASS DEFINITION
    // ---------------------------------
    // This defines the core ListGroup functionality.
    //
    var ListGroup = function ( element , options )
    {
        // Store the jQuery-wrapped DOM element.
        this.$element = $( element );

        // Store configuration options, defaulting to an empty object if none provided.
        this.options = options || {};

        // Initialize the component.
        this.init();
    };


    //
    // ListGroup Prototype Methods
    // ---------------------------
    //
    ListGroup.prototype.init = function()
    {
        var me       = this;       // Cache 'this' for use in event handlers.
        var $element = this.$element; // Reference to the main element.
        var options  = this.options;   // Component options.

        // If a 'toggle' option is provided, set it as a data attribute.
        if ( options.toggle )
        {
            $element.attr( 'data-toggle' , options.toggle );
        }


        // Attach a click event listener to all list items within the group.
        $element.on( 'click' , '.list-group-item' , function ()
        {
            var $item = $( this ); // The clicked list item.

            // Only proceed if the item is not disabled.
            if ( ! $item.hasClass( 'disabled' ) )
            {
                // Check the data-toggle attribute to determine selection behavior.
                if ( $element.data( 'toggle' ) == 'items' )
                {
                    // If toggle is 'items', simply toggle the 'active' class.
                    $item.toggleClass( 'active' );
                }
                else
                {
                    // Otherwise, unselect all other items and select the current one.
                    me.unselect( '*' )
                      .select( $item );
                }

                // If a 'click' callback is provided in options, execute it.
                if ( options.click )
                {
                    options.click.apply( this );
                }
            }

            // Remove focus from the clicked item.
            $item.blur();

            // Prevent default link behavior.
            return false;
        } );
    };


    // Select one or more items.
    ListGroup.prototype.select = function ( item )
    {
        // If the item is a jQuery object, just add the 'active' class.
        if ( item instanceof $ )
        {
            item.addClass( 'active' );
        }

        // If the item is a string, convert it to an array for consistent handling.
        if ( typeof item === 'string' )
        {
            item = [ item ];
        }

        // If 'item' is an array, iterate and select each corresponding list item.
        if ( Array.isArray( item ) )
        {
            for ( var i in item )
            {
                var val = item[ i ]; // Get the value for the current item.

                this.$element
                    .find( '.list-group-item[data-value=\'' + val + '\']' ) // Find item by data-value.
                    .addClass( 'active' );                                 // Add active class.
            }
        }
        return this; // Allow method chaining.
    };


    // Unselect one or more items based on a selector.
    ListGroup.prototype.unselect = function ( selector )
    {
        this.$element
                .find( '.list-group-item' ) // Find all list items.
                .filter( selector || '*' )  // Filter by selector (or all if no selector).
                .removeClass( 'active' );   // Remove the 'active' class.

        return this; // Allow method chaining.
    };


    //
    // SELECTLIST PUBLIC CLASS DEFINITION
    // ----------------------------------
    // This defines the SelectList component, which wraps a <select> element.
    //
    var SelectList = function( element , options )
    {
        this.$element   = $( element ); // The original <select> element.
        this.options    = options;      // Options for the SelectList.
        this.$listGroup = this.createListGroup(); // The generated ListGroup.
    };


    // Select values in the underlying <select> element.
    SelectList.prototype.select = function ( values )
    {
        // If 'values' is a jQuery object, extract its values.
        if ( values instanceof $ )
        {
            var vals = [];
            values.each( function( i , element )
            {
                vals.push( $( element ).val() );
            } );
            values = vals;
        }

        // Set the value(s) of the original <select> element and trigger change.
        this.$element.val( values )
                     .change();
    };


    // Unselect specified values from the underlying <select> element.
    SelectList.prototype.unselect = function( values )
    {
        var value = this.$element.val(); // Current selected value(s) from the select.

        // Ensure 'value' is an array for consistent processing.
        if ( ! Array.isArray( value ) )
        {
            value = [ value ];
        }
        // Ensure 'values' to unselect is an array.
        if ( ! Array.isArray( values ) )
        {
            values = [ values ];
        }

        // Iterate through values to be unselected and remove them from the current selection.
        for ( var i in values )
        {
            value.pop( values[ i ] ); // Note: pop removes the last element, this might be a bug in original.
                                      // It should likely use splice or filter for specific value removal.
        }

        // Update the select element's value and trigger change.
        this.$element.val( value )
                     .change();
    };


    // Create the ListGroup structure from the <select> element.
    SelectList.prototype.createListGroup = function()
    {
        var $select    = this.$element; // The original select element.
        var $listGroup = $( '<ul>' )    // Create an unordered list.
                           .addClass( 'list-group' ); // Add the base list-group class.

        // If the original select is 'multiple', enable multi-item toggle for the list group.
        if ( $select.attr( 'multiple' ) )
        {
            $listGroup.attr( 'data-toggle' , 'items' );
        }

        // Iterate over each <option> in the original <select> element.
        $select.find( 'option' ).each( function ( i , item )
        {
            var $item = $( item ); // Current option element.

            // Create a new <a> element to represent the list group item.
            var $new = $( '<a>' )
                        .attr( 'href' , '#' )                         // Set href for clickability.
                        .addClass( 'list-group-item' )                // Add list-group-item class.
                        .attr( 'data-value' , $item.val() )           // Store the option's value.
                        .text( $item.text() );                        // Set the text content.

            // If the original option is disabled, add 'disabled' class to the new item.
            if ( $item.is( ':disabled' ) )
            {
                $new.addClass( 'disabled' );
            }

            // If the original option is hidden, add 'hidden' class to the new item.
            if ( $item.css( 'display' ) === 'none' )
            {
                $new.addClass( 'hidden' );
            }

            // Append the newly created list item to the list group.
            $listGroup.append( $new );
        } );


        // Attach a change event listener to the original <select> element.
        $select.change( function ()
        {
            // When the select changes, update the list group's selection.
            $listGroup.listgroup( {
                unselect : '*' ,                // Unselect all items first.
                select   : $select.val()        // Then select items matching the select's value.
            } );
        } );

        // Initialize the newly created list group.
        $listGroup.listgroup( {
            select : $select.val() , // Initial selection based on the select's current value.
            click  : function ()     // Custom click handler for the list group items.
            {
                var values = []; // Array to store selected values.

                // Find all active list group items and extract their data-value.
                $listGroup.find( '.list-group-item.active' ).each( function( i , item )
                {
                    var value = $( item ).data( 'value' ); // Get the stored value.
                    values.push( value );                   // Add to the array.
                } );

                // If only one item is selected, return its single value, otherwise the array.
                if ( values.length == 1 )
                {
                    values = values[ 0 ];
                }

                // Update the original <select> element's value.
                $select.val( values );
            }
        } );

        // Insert the generated list group before the original <select> element.
        $select.before( $listGroup );

        // Store a reference to the created list group.
        this.$listGroup = $listGroup;

        // Hide the original <select> element.
        $select.hide();

        return $listGroup; // Return the generated list group.
    };


    //
    // LIST GROUP PLUGIN DEFINITION
    // ----------------------------
    // Defines the jQuery plugin interface for listgroup.
    //
    $.fn.listgroup = function ( option )
    {
        // Iterate over each selected element.
        return this.each( function ( i , element )
        {
            var $element = $( element ); // Current element as a jQuery object.

            // Retrieve or create a ListGroup/SelectList instance for the element.
            var list = $element.data( 'listgroup' );
            if ( ! list )
            {
                // If no instance exists, create one based on element type.
                list = $element.is( 'select' )
                    ? new SelectList( element , option ) // If it's a <select>, create a SelectList.
                    : new ListGroup( element , option ); // Otherwise, create a regular ListGroup.

                $element.data( 'listgroup' , list ); // Store the instance.
            }

            // If an 'option' object is provided, apply select/unselect operations.
            if ( option )
            {
                // Check for 'unselect' option.
                if ( option.unselect )
                {
                    list.unselect( option.unselect );
                }

                // Check for 'select' option.
                if ( option.select )
                {
                    list.select( option.select );
                }
            }
        } );
    };

    //
    // Auto-initialization on DOM ready.
    // ---------------------------------
    // Automatically apply listgroup to elements with the class 'list-group'.
    //
    $( function ()
    {
        $( '.list-group' ).listgroup();
    } );

} ( jQuery );