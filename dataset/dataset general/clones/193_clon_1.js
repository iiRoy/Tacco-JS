// This is a jQuery plugin designed to polyfill the HTML5 placeholder attribute.
// It ensures older browsers behave like modern ones regarding input placeholders.

// Original Author: Lasse Søberg
// Date of Creation: April 6, 2011

( function ( $ )
{

	// Determine if the browser natively supports the 'placeholder' attribute.
	// We create a dummy input element and check for the property.
	var native_support = ( 'placeholder' in document . createElement ( 'input' ) ) ;

	// Extend jQuery's prototype with our new 'placeholder' function.
	$ . fn . placeholder = function ( command )
	{

		// Proceed only if native support is NOT available.
		if ( ! native_support )
		{
			// If a command is provided, handle it.
			if ( command )
			{
				// Use a switch statement for different commands.
				switch ( command )
				{
					// The 'clear' command.
					case 'clear' :
						// Iterate over each selected element.
						this . each ( function ( )
						{
							var el = $ ( this ) ; // Cache the jQuery object for the current element.
							// If the element's data indicates it's empty OR its value matches the placeholder, clear it.
							if ( el . data ( 'isEmpty' ) || el . val ( ) == el . attr ( 'placeholder' ) )
							{
								el . val ( '' ) ; // Set the value to an empty string.
							}
						} ) ;
					break ; // Exit the switch after handling 'clear'.
				} // End of switch statement.

				return this ; // Allow for chaining.
			} // End of 'if (command)' block.


			// If no command is provided, initialize placeholder behavior for each element.
			this . each ( function ( )
			{
				// Check if the placeholder has already been initialized for this element.
				if ( ! $ ( this ) . data ( 'gotPlaceholder' ) )
				{
					// Bind focus, blur, and keyup events.
					$ ( this ) . focus ( function ( )
					{
						var el = $ ( this ) ; // Reference to the current element.
						// If the element is currently empty (i.e., showing the placeholder).
						if ( el . data ( 'isEmpty' ) )
						{
							el . val ( '' ) . removeClass ( 'placeholder' ) ; // Clear value and remove placeholder class.
						}
					} ) . blur ( function ( )
					{
						var el = $ ( this ) ; // Reference to the current element.
						// If the element is empty OR its value length is zero.
						if ( el . data ( 'isEmpty' ) || ! el . val ( ) . length )
						{
							// Set value to placeholder text and add placeholder class.
							el . val ( el . attr ( 'placeholder' ) ) . addClass ( 'placeholder' ) ;
						}
					} ) . keyup ( function ( )
					{
						var el = $ ( this ) ; // Reference to the current element.
						// Update 'isEmpty' data based on current value length.
						el . data ( 'isEmpty' , ( el . val ( ) . length == 0 ) ) ;
					} ) . data ( 'gotPlaceholder' , true ) ; // Mark as initialized.

					// Initial check: if the field is empty or contains the placeholder text, apply placeholder.
					if ( ! $ ( this ) . val ( ) . length || $ ( this ) . val ( ) == $ ( this ) . attr ( 'placeholder' ) )
					{
						$ ( this ) . val ( $ ( this ) . attr ( 'placeholder' ) ) . addClass ( 'placeholder' ) . data ( 'isEmpty' , true ) ;
					}
				} // End of 'if (!$(this).data('gotPlaceholder'))' block.
			} ) ; // End of this.each loop.
		} // End of 'if (!native_support)' block.

		// Always return 'this' for chainability.
		return this ;
	} ; // End of $.fn.placeholder definition.

} ) ( jQuery ) ; // Immediately Invoked Function Expression (IIFE) closure.