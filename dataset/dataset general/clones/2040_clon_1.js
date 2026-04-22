// This file defines the 'betterflow' jQuery UI widget.
// It creates a dynamic, responsive flow layout for elements.

( function ( $ )
{
	// Define the jQuery UI widget 'betterflow' within the 'ui' namespace.
	$.widget ( "ui.betterflow",
	{
		// Widget options. These can be overridden during initialization.
		options:
		{
			// Selector for identifying child elements within the widget container.
			childrenSelector:	"> *",

			// The initial position (1-based index) of the selected element.
			position:			1,

			// Factor influencing the scaling of elements based on their distance from the center.
			scaleFactor:		10,

			// Factor influencing the margin of elements based on their distance from the center.
			marginFactor:		3
		}, // End of options object.


		// The '_create' method is called once when the widget is initialized.
		_create: function ()
		{
			// Initialize the current position of the selected item.
			this.position =	this.options.position;

			// Initialize the flipped state of the selected item.
			this.flipped  =	false;


			// Determine the initial selected element based on the 'position' option.
			var initial	=	$( this.options.childrenSelector + ":nth-child(" + this.position + ")", this.element );


			// Store the initial dimensions of the selected element for later calculations.
			this.size	=
			{
				width:	initial.width(),
				height:	initial.height()
			};


			// Set up event bindings for user interactions.
			this._bind();

			// Select the initial element and render the flow.
			this._select( this.position );
		}, // End of _create method.


		// The '_render' method iterates through all children and renders each one.
		_render: function ()
		{
			// Cache 'this' for use within the 'each' loop.
			var that	=	this;

			// Iterate over each child element specified by 'childrenSelector'.
			$( this.options.childrenSelector, this.element ).each ( function ( i )
			{
				// Render each child, adjusting its position and size.
				that._renderEach ( i + 1 );
			} );
		}, // End of _render method.


		// The '_renderEach' method calculates and applies styles for a single child element.
		// 'i' is the 1-based index of the element to render.
		_renderEach: function ( i )
		{
			// Calculate the absolute difference in position from the currently selected item.
			var diff		=	Math.abs ( this.position - i );

			// Calculate the scaling factor based on the difference and options.
			var diffScale	=	diff / this.options.scaleFactor;


			// Determine the new scale for the element. Closer elements are larger.
			var newscale	=	( 1 - diffScale );

			// Calculate the new width based on the original width and new scale.
			var newsize		=	this.size.width * newscale;

			// Calculate the new margin based on the original width and difference.
			var newmargin	=	this.size.width * ( diff / ( this.options.scaleFactor * 2 ) );


			// Calculate a 'magic' factor for positioning.
			var factor		=	0.5 * diff * ( 2 * newscale + ( diff - 1 ) / this.options.scaleFactor );

			// Calculate the raw position offset.
			var pos			=	this.size.width * factor;

			// Calculate the anchor point for centering the flow.
			var anchor		=	( ( this.element.width () - this.size.width ) * 0.5 );

			// Determine the final 'left' position based on whether the element is before or after the selected one.
			var left		=	i < this.position ? anchor - pos : anchor + pos;

			// Adjust the horizontal margin based on position relative to the selected item.
			var mfixed		=	i < this.position ? newmargin : -newmargin;


			// Select the specific child element and apply animated CSS properties.
			$( this.options.childrenSelector + ":nth-child(" + i + ")", this.element )
				.css ( "z-index", 100 - diff ) // Z-index to ensure correct layering.
				.stop () // Stop any current animations before starting new ones.
				.animate (
				{
					"left":			left, // Horizontal position.
					"width":		newsize, // Element width.
					"height":		newsize, // Element height (maintaining aspect ratio).
					"margin-top":	newmargin, // Vertical margin.
					"margin-left":	mfixed * this.options.marginFactor, // Horizontal margin, potentially negative.
					"opacity":		newscale // Opacity based on scale.
				} );
		}, // End of _renderEach method.


		// The '_bind' method sets up all event listeners for user interaction.
		_bind: function ()
		{
			// Cache 'this' for use in event handler callbacks.
			var that	=	this;

			// Live event binding for clicks on unselected list items.
			// Note: 'live' is deprecated in newer jQuery, but kept for Type I clone.
			$( "li:not(.betterflow-selected)", this.element ).live ( "click", function ( e )
			{
				// Select the clicked element.
				that._select ( $( that.options.childrenSelector, that.element ).index ( e.currentTarget ) + 1 );
				return false; // Prevent default link behavior.
			} );


			// Custom event bindings for programmatic control of the flow.
			this.element.bind ( "betterflow-flip",		function ( e )		{ that._flip ( !that.flipped ); } );
			this.element.bind ( "betterflow-select",	function ( e, i )	{ that._select ( i );           } );
			this.element.bind ( "betterflow-prev",		function ( e )		{ that._prev ();              } );
			this.element.bind ( "betterflow-next",		function ( e )		{ that._next ();              } );


			// Mousewheel event binding for navigation.
			this.element.bind ( "mousewheel", function ( e, delta, deltaX, deltaY )
			{
				// Only respond to horizontal mousewheel movement.
				if ( deltaX == 0 )
					return;

				// Call _next or _prev based on scroll direction.
				that [ deltaX > 0 ? "_next" : "_prev" ] ();
			} );


			// Keyboard event binding for arrow key navigation.
			$( window ).bind ( "keydown", function ( e )
			{
				// Handle specific key presses.
				switch ( e.which )
				{
					case 37: // Left arrow key.
						that._prev (); // Move to the previous item.
						break;

					case 39: // Right arrow key.
						that._next (); // Move to the next item.
						break;

					default: // Any other key.
						break;
				}
			} );
		}, // End of _bind method.


		// The '_flip' method toggles a 'flipped' class on the selected item's children.
		// 'state' determines whether to add (true) or remove (false) the class.
		_flip: function ( state )
		{
			// Find the children of the selected item and toggle the 'betterflow-flipped' class.
			$( this.options.childrenSelector + ".betterflow-selected > *", this.element ).toggleClass ( "betterflow-flipped", state );
			this.flipped	=	state; // Update the internal flipped state.
		}, // End of _flip method.


		// The '_select' method changes the currently selected item in the flow.
		// 'i' is the 1-based index of the item to select.
		_select: function ( i )
		{
			this._flip ( false ); // Ensure the currently selected item is not flipped.

			// Remove the 'betterflow-selected' class from the previously selected item.
			$( this.options.childrenSelector + ".betterflow-selected", this.element ).removeClass ( "betterflow-selected" );

			// Add the 'betterflow-selected' class to the newly selected item.
			$( this.options.childrenSelector + ":nth-child(" + i + ")", this.element ).addClass ( "betterflow-selected" );

			this.position	=	i; // Update the internal position.


			this._render (); // Re-render all elements to reflect the new selection.


			// Trigger a custom event to notify listeners that an item has been selected.
			this.element.trigger ( "betterflow-selected", [ i ] );
		}, // End of _select method.


		// The '_next' method attempts to select the next item in the flow.
		_next: function ()
		{
			// Check if there are more items after the current position.
			if ( $( this.options.childrenSelector, this.element ).size () > this.position )
				this._select ( this.position + 1 ); // Select the next item.
		}, // End of _next method.


		// The '_prev' method attempts to select the previous item in the flow.
		_prev: function ()
		{
			// Check if there are items before the current position.
			if ( this.position > 1 )
				this._select ( this.position - 1 ); // Select the previous item.
		} // End of _prev method.

	} ); // End of $.widget definition.

} ) ( jQuery ); // End of IIFE (Immediately Invoked Function Expression).