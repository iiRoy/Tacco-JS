// This file defines the ImageMenu class for interactive image displays.
//
// Project: Image Menu Script
// Version: 2.3.0
// Author:  Samuel Birch
// License: MIT Open Source License
//
// This script enables dynamic menu behavior with image elements,
// allowing for expansion and collapse based on user interaction.
//

var ImageMenu = new Class(
{
    // Default configuration options for the ImageMenu instance.
    getOptions: function()
    {
        return {
            OnOpen:        $lambda(false),           // Callback function when an element opens.
            OnClose:       $lambda(false),           // Callback function when an element closes.
            OnClickOpen:   $lambda(),                // Callback when an element is clicked to open.
            OnClickClose:  $lambda(),                // Callback when an element is clicked to close.
            openWidth:     200,                      // The target width for the opened element.
            transition:    Fx.Transitions.Quad.easeOut, // Easing function for the animation.
            duration:      400,                      // Duration of the animation in milliseconds.
            open:          null,                     // Index or ID of the initially open element.
            border:        0                         // Border width applied to elements (for calculation).
        };
    },

    // Constructor method for the ImageMenu class.
    initialize: function( elements, options )
    {
        // Merge default options with user-provided options.
        this.setOptions( this.getOptions(), options );

        // Store the collection of elements to be managed by this menu.
        this.elements = $$( elements );

        // Initialize an object to store calculated widths.
        this.widths = {};

        // Calculate the width for closed elements.
        this.widths.closed       = this.elements[0].getStyle( 'width' ).toInt();

        // Set the width for the currently selected/open element.
        this.widths.openSelected = this.options.openWidth;

        // Calculate the width for other (non-selected) open elements.
        // This ensures the total width remains consistent.
        this.widths.openOthers   = Math.round( ( ( this.widths.closed * this.elements.length ) - ( this.widths.openSelected + this.options.border ) ) / ( this.elements.length - 1 ) );


        // Initialize the Fx.Elements instance for animating multiple elements.
        this.fx = new Fx.Elements( this.elements, {
            wait:       false,
            duration:   this.options.duration,
            transition: this.options.transition
        } );

        // Iterate over each element to attach event listeners.
        this.elements.each( function( el, i )
        {
            // Attach mouseenter event listener.
            el.addEvent( 'mouseenter', function( e )
            {
                // Stop default event behavior.
                new Event( e ).stop();

                // Reset the menu to highlight the current element.
                this.reset( i );

                // Execute the OnOpen callback if defined.
                if ( this.options.OnOpen )
                {
                    this.options.OnOpen( el, i );
                }
            }.bind( this ) ); // Ensure 'this' refers to the ImageMenu instance.

            // Attach mouseleave event listener.
            el.addEvent( 'mouseleave', function( e )
            {
                // Stop default event behavior.
                new Event( e ).stop();

                // Reset the menu, returning to the previously open state or closed.
                this.reset( this.options.open );

                // Execute the OnClose callback if defined.
                if ( this.options.OnClose )
                {
                    this.options.OnClose( el, i );
                }
            }.bind( this ) ); // Ensure 'this' refers to the ImageMenu instance.

            // Store a reference to 'this' for the click event handler's scope.
            var obj = this;

            // Attach click event listener.
            el.addEvent( 'click', function( e )
            {
                // Check if an OnClickOpen callback is defined.
                if ( obj.options.OnClickOpen )
                {
                    // Stop default event behavior (e.g., navigating to href).
                    new Event( e ).stop();

                    // Determine if the clicked element is already open.
                    if ( obj.options.open == i )
                    {
                        // If already open, close it.
                        obj.options.open = null;
                        obj.options.OnClickClose( this.href, i );
                    }
                    else
                    {
                        // If not open, open it.
                        obj.options.open = i;
                        obj.options.OnClickOpen( this.href, i );
                    }
                }
            } ); // The click handler's 'this' refers to the element 'el'.

        }.bind( this ) ); // Ensure 'this' in the .each callback refers to the ImageMenu instance.

        // Handle initial open state if specified in options.
        if ( this.options.open != null )
        {
            // If the 'open' option is a number (index).
            if ( $type( this.options.open ) == 'number' )
            {
                this.reset( this.options.open );
            }
            else
            {
                // If the 'open' option is an ID (string).
                this.elements.each( function( el, i )
                {
                    if ( el.id == this.options.open )
                    {
                        this.reset( i ); // Find and open by ID.
                    }
                }, this ); // Pass 'this' as the scope for the .each callback.
            }
        }
    },

    // Resets the widths of the menu elements based on the provided number (index of element to open).
    reset: function( num )
    {
        // Determine the base width for elements.
        if ( $type( num ) == 'number' )
        {
            // If a specific element is to be opened, use 'openOthers' width.
            var width = this.widths.openOthers;

            // Adjust width for the last element to account for border.
            if ( num + 1 == this.elements.length )
            {
                width += this.options.border;
            }
        }
        else
        {
            // If no specific element is open, all elements should have 'closed' width.
            var width = this.widths.closed;
        }

        // Prepare an object to hold the target width for each element in the animation.
        var obj = {};

        // Iterate through all elements to set their widths.
        this.elements.each( function( el, i )
        {
            var w = width; // Default width for this element.

            // Special adjustment for the last element if it's the last one.
            // This 'magic number' 5 might be for visual alignment or another border.
            if ( i == this.elements.length - 1 )
            {
                w = width + 5;
            }
            obj[i] = { 'width': w }; // Assign the calculated width.
        }.bind( this ) ); // Ensure 'this' refers to the ImageMenu instance.

        // If a specific element is designated to be open, override its width.
        if ( $type( num ) == 'number' )
        {
            obj[num] = { 'width': this.widths.openSelected };
        }

        // Start the animation with the prepared width object.
        this.fx.start( obj );
    }
} );

// Implement MooTools Options and Events classes into ImageMenu.
// This provides standard methods for setting options and handling events.
ImageMenu.implement( new Options );
ImageMenu.implement( new Events );

// End of ImageMenu script definition.
// ************************************************************