/*
 * This is a modified version of bootstrapSwitch v1.3.
 * Original author: Larentis Mattia @spiritualGuru
 * Project URL: http://www.larentis.eu/switch/
 *
 * This code is licensed under the Apache License, Version 2.0.
 * A copy of the license can be found at: http://www.apache.org/licenses/LICENSE-2.0
 *
 * All original functionality and variable names are preserved.
 * Only whitespace and comments have been altered.
 */

// Immediately Invoked Function Expression (IIFE) for scope encapsulation.
!  function  ( $ )   {
	// Ensure strict mode for cleaner code and error prevention.
  "use strict"  ;

	  $.fn [ 'bootstrapSwitch' ]  =  function ( method ) {
		// Define an object to hold all available methods for the plugin.
		var methods  =  {
		  init : function ( )
		  {
			return this . each ( function ( )
			{
				// Cache the current jQuery element.
				var $element = $ ( this ) ,
					$div , // Main container div for the switch.
					$switchLeft , // Left part of the switch (ON label).
					$switchRight , // Right part of the switch (OFF label).
					$label , // The middle label for interaction.
					myClasses = "" , // Specific size classes (mini, small, large).
					classes = $element . attr ( 'class' ) , // All classes on the original element.
					color , // Color theme for the switch.
					moving , // Flag to track if the switch is being dragged.
					onLabel = "ON" , // Text for the ON state.
					offLabel = "OFF" , // Text for the OFF state.
					icon = false ; // Optional icon for the label.

				// Iterate through known switch size classes to find a match.
				$.each ( [ 'switch-mini' , 'switch-small' , 'switch-large' ] , function ( i , el )
				{
				  if ( classes . indexOf ( el ) >= 0 ) {
					myClasses = el ;
				  }
				} ) ;

				// Add a base class to the element.
				$element . addClass ( 'has-switch' ) ;

				// Check for custom 'on' color from data attributes.
				if  (  $element . data ( 'on' )  !==  undefined  )
				{
					color = "switch-" + $element . data ( 'on' ) ;
				}
				// Check for custom 'on' label text.
				if  (  $element . data ( 'on-label' )  !==  undefined  )
				{
					onLabel = $element . data ( 'on-label' ) ;
				}
				// Check for custom 'off' label text.
				if  (  $element . data ( 'off-label' )  !==  undefined  )
				{
					offLabel = $element . data ( 'off-label' ) ;
				}
				// Check for a custom icon.
				if  (  $element . data ( 'icon' )  !==  undefined  )
				{
					icon = $element . data ( 'icon' ) ;
				}

				// Create the "ON" part of the switch.
				$switchLeft  =  $ ( '<span>' )
					. addClass ( "switch-left" )
					. addClass ( myClasses )
					. addClass ( color )
					. html ( onLabel ) ;

				// Reset color for the 'off' state.
				color = '' ;
				if ( $element . data ( 'off' ) !== undefined ) {
					color = "switch-" + $element . data ( 'off' ) ;
				}
				// Create the "OFF" part of the switch.
				$switchRight = $ ( '<span>' )
					. addClass ( "switch-right" )
					. addClass ( myClasses )
					. addClass ( color )
					. html ( offLabel ) ;

				// Create the central label that acts as the handle.
				$label = $ ( '<label>' )
					. html ( "&nbsp;" ) // Non-breaking space for initial content.
					. addClass ( myClasses )
					. attr ( 'for' , $element . find ( 'input' ) . attr ( 'id' ) ) ;

				// If an icon is specified, use it in the label.
				if ( icon )
				{
					$label . html ( '<i class="icon icon-' + icon + '"></i>' ) ;
				}

				// Wrap the actual checkbox input in a new div.
				$div = $element . find ( ':checkbox' ) . wrap ( $ ( '<div>' ) ) . parent ( ) . data ( 'animated' , false ) ;

				// Check if animation is desired.
				if  (  $element . data ( 'animated' )  !==  false  )
				{
					$div . addClass ( 'switch-animate' ) . data ( 'animated' , true ) ;
				}

				// Append the left, label, and right parts to the main switch div.
				$div
				  . append ( $switchLeft )
				  . append ( $label )
				  . append ( $switchRight ) ;

				// Set initial 'on' or 'off' class based on checkbox state.
				$element . find ( '>div' ) . addClass (
					$element . find ( 'input' ) . is ( ':checked' ) ? 'switch-on' : 'switch-off'
				) ;

				// Add 'deactivate' class if the underlying input is disabled.
				if  (  $element . find ( 'input' ) . is ( ':disabled' )  )
				{
					$ ( this ) . addClass ( 'deactivate' ) ;
				}

				// Helper function to simulate a click on the label, which toggles the switch.
				var changeStatus = function ( $this )
				{
					$this . siblings ( 'label' ) . trigger ( 'mousedown' ) . trigger ( 'mouseup' ) . trigger ( 'click' ) ;
				} ;

				// Handle keyboard interaction (spacebar to toggle).
				$element . on ( 'keydown' , function ( e )
				{
					if ( e . keyCode === 32 )
					{ // Spacebar key code.
						e . stopImmediatePropagation ( ) ;
						e . preventDefault ( ) ;
						changeStatus ( $ ( e . target ) . find ( 'span:first' ) ) ;
					}
				} ) ;

				// Click handler for the 'ON' part.
				$switchLeft . on ( 'click' , function ( e )
				{
					changeStatus ( $ ( this ) ) ;
				} ) ;

				// Click handler for the 'OFF' part.
				$switchRight . on ( 'click' , function ( e )
				{
					changeStatus ( $ ( this ) ) ;
				} ) ;

				// Event handler for when the underlying checkbox's state changes.
				$element . find ( 'input' ) . on ( 'change' , function ( e , skipOnChange )
				{
					var $this = $ ( this ) ,
						$element = $this . parent ( ) ,
						thisState = $this . is ( ':checked' ) ,
						state = $element . is ( '.switch-off' ) ;

					e . preventDefault ( ) ;

					// Reset the 'left' CSS property.
					$element . css ( 'left' , '' ) ;

					// Only proceed if the visual state needs to be updated.
					if ( state === thisState )
					{
						if ( thisState ) { // If checked, set to 'on'.
							$element . removeClass ( 'switch-off' ) . addClass ( 'switch-on' ) ;
						}
						else { // If unchecked, set to 'off'.
							$element . removeClass ( 'switch-on' ) . addClass ( 'switch-off' ) ;
						}

						// Re-add animation class if enabled.
						if ( $element . data ( 'animated' ) !== false ) {
							$element . addClass ( "switch-animate" ) ;
						}

						// If skipOnChange is true, prevent further actions.
						if ( typeof skipOnChange === 'boolean' && skipOnChange ) {
							return ;
						}

						// Trigger a custom event for external listeners.
						$element . parent ( ) . trigger ( 'switch-change' , { 'el' : $this , 'value' : thisState } ) ;
					}
				} ) ;

				// Handle mousedown/touchstart events on the label for dragging.
				$element . find ( 'label' ) . on ( 'mousedown touchstart' , function ( e )
				{
					var $this = $ ( this ) ;
					moving = false ; // Initialize moving flag.

					e . preventDefault ( ) ;
					e . stopImmediatePropagation ( ) ;

					$this . closest ( 'div' ) . removeClass ( 'switch-animate' ) ; // Disable animation during drag.

					// If switch is deactivated, unbind click to prevent interaction.
					if ( $this . closest ( '.has-switch' ) . is ( '.deactivate' ) ) {
						$this . unbind ( 'click' ) ;
					}
					else
					{
						// Bind mousemove/touchmove for dragging behavior.
						$this . on ( 'mousemove touchmove' , function ( e )
						{
							var $element = $ ( this ) . closest ( '.switch' ) ,
								// Calculate horizontal position relative to the switch.
								relativeX = ( e . pageX || e . originalEvent . targetTouches [ 0 ] . pageX ) - $element . offset ( ) . left ,
								// Convert position to percentage.
								percent = ( relativeX / $element . width ( ) ) * 100 ,
								left = 25 , // Left boundary for dragging.
								right = 75 ; // Right boundary for dragging.

							moving = true ; // Set moving flag to true.

							// Constrain the percentage within boundaries.
							if ( percent < left ) {
								percent = left ;
							}
							else if ( percent > right ) {
								percent = right ;
							}

							// Apply the new 'left' CSS property to the inner div.
							$element . find ( '>div' ) . css ( 'left' , ( percent - right ) + "%" ) ;
						} ) ;

						// Handle click/touchend events after dragging or simple click.
						$this . on ( 'click touchend' , function ( e )
						{
							var $this = $ ( this ) ,
								$target = $ ( e . target ) ,
								$myCheckBox = $target . siblings ( 'input' ) ; // Find the associated checkbox.

							e . stopImmediatePropagation ( ) ;
							e . preventDefault ( ) ;

							$this . unbind ( 'mouseleave' ) ; // Unbind mouseleave to prevent unintended state changes.

							if ( moving ) { // If it was a drag, determine state based on final position.
								$myCheckBox . prop ( 'checked' , ! ( parseInt ( $this . parent ( ) . css ( 'left' ) ) < -25 ) ) ;
							}
							else { // If it was a simple click, toggle the state.
								$myCheckBox . prop ( "checked" , ! $myCheckBox . is ( ":checked" ) ) ;
							}

							moving = false ; // Reset moving flag.
							$myCheckBox . trigger ( 'change' ) ; // Trigger change event on the checkbox.
						} ) ;

						// Handle mouseleave event (e.g., if user drags off the switch).
						$this . on ( 'mouseleave' , function ( e )
						{
							var $this = $ ( this ) ,
								$myCheckBox = $this . siblings ( 'input' ) ;

							e . preventDefault ( ) ;
							e . stopImmediatePropagation ( ) ;

							$this . unbind ( 'mouseleave' ) ; // Unbind itself to prevent multiple triggers.
							$this . trigger ( 'mouseup' ) ; // Simulate mouseup to clean up.

							// Set checkbox state based on current visual position and trigger change.
							$myCheckBox . prop ( 'checked' , ! ( parseInt ( $this . parent ( ) . css ( 'left' ) ) < -25 ) ) . trigger ( 'change' ) ;
						} ) ;

						// Handle mouseup event to stop dragging.
						$this . on ( 'mouseup' , function ( e )
						{
							e . stopImmediatePropagation ( ) ;
							e . preventDefault ( ) ;

							$ ( this ) . unbind ( 'mousemove' ) ; // Unbind mousemove to stop drag tracking.
						} ) ;
					}
				} ) ;
			} ) ;
		  } , // End of init method.

		  toggleActivation : function ( )
		  {
			// Toggle the 'deactivate' class to enable/disable the switch.
			$ ( this ) . toggleClass ( 'deactivate' ) ;
		  } ,

		  isActive : function ( )
		  {
			// Returns true if the switch is not deactivated.
			return ! $ ( this ) . hasClass ( 'deactivate' ) ;
		  } ,

		  setActive : function ( active )
		  {
			// Set the activation state.
			if ( active ) {
				$ ( this ) . removeClass ( 'deactivate' ) ;
			}
			else {
				$ ( this ) . addClass ( 'deactivate' ) ;
			}
		  } ,

		  toggleState : function ( skipOnChange )
		  {
			// Toggle the checked state of the underlying checkbox.
			var $input = $ ( this ) . find ( 'input:checkbox' ) ;
			$input . prop ( 'checked' , ! $input . is ( ':checked' ) ) . trigger ( 'change' , skipOnChange ) ;
		  } ,

		  setState : function ( value , skipOnChange )
		  {
			// Set the checked state of the underlying checkbox to a specific value.
			$ ( this ) . find ( 'input:checkbox' ) . prop ( 'checked' , value ) . trigger ( 'change' , skipOnChange ) ;
		  } ,

		  status : function ( )
		  {
			// Get the current checked status of the checkbox.
			return $ ( this ) . find ( 'input:checkbox' ) . is ( ':checked' ) ;
		  } ,

		  destroy : function ( )
		  {
			// Clean up the switch structure and restore the original checkbox.
			var $div = $ ( this ) . find ( 'div' ) ,
				$checkbox ;

			// Remove all elements except the checkbox within the switch div.
			$div . find ( ':not(input:checkbox)' ) . remove ( ) ;

			$checkbox = $div . children ( ) ;
			// Unwrap the checkbox from its two parent divs.
			$checkbox . unwrap ( ) . unwrap ( ) ;

			// Unbind the change event listener.
			$checkbox . unbind ( 'change' ) ;

			return $checkbox ; // Return the original checkbox.
		  }
		} ; // End of methods object.

	// Check if a specific method was called.
	if ( methods [ method ] ) {
		// If a method exists, call it with arguments.
		return methods [ method ] . apply ( this , Array . prototype . slice . call ( arguments , 1 ) ) ;
	}
	// If no method or an object (options) is passed, initialize the plugin.
	else if ( typeof method === 'object' || ! method ) {
		return methods . init . apply ( this , arguments ) ;
	}
	else {
		// Throw an error if an unknown method is called.
		$.error ( 'Method ' + method + ' does not exist!' ) ;
	}
  } ; // End of $.fn['bootstrapSwitch'] definition.
} ( jQuery ) ; // Pass jQuery into the IIFE.

// On document ready, initialize all elements with the 'switch' class.
$ ( function ( ) {
	$ ( '.switch' ) [ 'bootstrapSwitch' ] ( ) ;
} ) ;