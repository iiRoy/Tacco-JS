( function ( $ ) {
	'use strict' ; /* This directive enforces strict parsing and error handling in the current JavaScript scope. */


	$.fn.bigSlide = function ( options ) {

		// Variable to hold the menu trigger element.
		// This 'this' refers to the jQuery object on which bigSlide was called.
		var menuLink = this ;


		// Default plugin configuration settings.
		// These can be overridden by passing an 'options' object.
		var settings = $.extend( {
			'menu' : ( '#menu' ) , /* Selector for the menu element. */
			'push' : ( '.push' ) , /* Selector for the element(s) to be pushed. */
			'side' : 'left' ,      /* Side from which the menu slides out (e.g., 'left', 'right'). */
			'menuWidth' : '15.625em' , /* The width of the menu. */
			'speed' : '300' ,      /* Animation speed in milliseconds. */
			'state' : 'closed' ,   /* Initial state of the menu ('open' or 'closed'). */
			'activeBtn' : 'active' , /* CSS class to add to the menuLink when menu is open. */
			'easyClose' : false    /* If true, clicking outside the menu will close it. */
		} , options ) ;


		// The model stores the current state of the menu.
		var model = {
			'state' : settings.state // Initialize state from settings.
		} ;

		// The controller manages interactions between the view and the model (state).
		var controller = {
			/* Initializes the view component. */
			init : function ( ) {
				view.init( ) ;
			} ,
			// Function to update the menu's state.
			changeState : function ( ) {
				if ( model.state === 'closed' ) {
					model.state = 'open' ; // Change state from closed to open.
				} else {
					model.state = 'closed' ; // Change state from open to closed.
				}
			} ,
			// Retrieves the current state of the menu.
			getState : function ( ) {
				return model.state ;
			}
		} ;


		// The view component handles all visual updates and DOM manipulations.
		var view = {
			init : function ( ) {
				// Cache frequently used DOM elements and values for performance.
				this.$menu = $ ( settings.menu ) ;
				this.$push = $ ( settings.push ) ;
				this.width = settings.menuWidth ;

				// Define initial CSS properties to position the menu off-screen.
				var positionOffScreen = {
					'position' : 'fixed' ,
					'top' : '0' ,
					'bottom' : '0' ,
					'height' : '100%'
				} ;

				// Dynamically set the menu's off-screen position based on the 'side' setting.
				positionOffScreen [ settings.side ] = '-' + settings.menuWidth ;
				positionOffScreen.width = settings.menuWidth ;

				// Apply initial CSS positioning if the menu starts closed.
				if ( settings.state === 'closed' ) {
					this.$menu.css( positionOffScreen ) ;
					this.$push.css( settings.side , '0' ) ;
				}

				// Define CSS for the sliding animation transitions.
				var animateSlide = {
					'-webkit-transition' : settings.side + ' ' + settings.speed + 'ms ease' ,
					'-moz-transition' : settings.side + ' ' + settings.speed + 'ms ease' ,
					'-ms-transition' : settings.side + ' ' + settings.speed + 'ms ease' ,
					'-o-transition' : settings.side + ' ' + settings.speed + 'ms ease' ,
					'transition' : settings.side + ' ' + settings.speed + 'ms ease'
				} ;

				// Apply transition CSS to both menu and pushed elements.
				this.$menu.css( animateSlide ) ;
				this.$push.css( animateSlide ) ;

				/*
				 * Set up event listeners for opening/closing the menu.
				 * Uses 'click' for desktop and 'touchstart' for mobile for better responsiveness.
				 * The '.bigSlide' namespace helps in unbinding specific event handlers later if needed.
				 */
				menuLink.on( 'click.bigSlide touchstart.bigSlide' , function ( e ) {
					e.preventDefault( ) ; // Prevent default link behavior.

					if ( controller.getState( ) === 'open' ) {
						view.toggleClose( ) ; // If menu is open, close it.
					} else {
						view.toggleOpen( ) ;  // If menu is closed, open it.
					}
				} ) ;

				/*
				 * Implement the "easyClose" feature.
				 * This allows the menu to close when clicking anywhere outside the menu itself.
				 * While it adds complexity, it's a frequently requested user experience feature.
				 */
				if ( settings.easyClose ) {
					$ ( 'body' ) . on ( 'click.bigSlide' , function ( e ) {
						// Check if the click target or any of its parents is NOT the menuLink AND the menu is currently open.
						if ( ! $ ( e.target ) . parents( ) . andSelf( ) . is( menuLink ) && controller.getState( ) === 'open' ) {
							view.toggleClose( ) ; // Close the menu.
						}
					} ) ;
				}
			} ,

			// Function to open the menu.
			toggleOpen : function ( ) {
				controller.changeState( ) ; // Update model state to 'open'.
				this.$menu.css( settings.side , '0' ) ; // Slide menu into view.
				this.$push.css( settings.side , this.width ) ; // Push content over.
				menuLink.addClass( settings.activeBtn ) ; // Add active class to the trigger.
			} ,

			// Function to close the menu.
			toggleClose : function ( ) {
				controller.changeState( ) ; // Update model state to 'closed'.
				this.$menu.css( settings.side , '-' + this.width ) ; // Slide menu off-screen.
				this.$push.css( settings.side , '0' ) ; // Return content to original position.
				menuLink.removeClass( settings.activeBtn ) ; // Remove active class from the trigger.
			}

		} ;

		// Initialize the controller, which in turn initializes the view.
		controller.init( ) ;

	} ; // End of bigSlide plugin definition.

} ( jQuery ) ) ; // Pass jQuery object to the immediately invoked function expression.