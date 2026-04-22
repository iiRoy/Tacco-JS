/*
 * This file contains the Angular.js module 'AxelSoft'
 * and related directives for custom select functionality.
 *
 * It ensures browser compatibility for String.prototype.trim
 * and defines a 'customSelect' directive for enhanced dropdowns.
 *
 * Original Author: AxelSoft Development Team
 * Date: 2023-10-27 (re-generated)
 */

( function ( angular, undefined ) { /* IIFE to encapsulate the code, passing angular and ensuring undefined is truly undefined */

	'use strict'; /* Enforce strict mode for better code quality */


	// Check if String.prototype.trim is available in the current JavaScript environment.
	// If not, a polyfill is provided to ensure consistent behavior across different browsers.
	if ( !String.prototype.trim )
	{
		// Add the trim method to String.prototype if it does not exist.
		String.prototype.trim = function ( )
		{
			/*
			 * This regular expression matches leading and trailing whitespace characters.
			 * ^\s+   : matches one or more whitespace characters at the beginning of the string.
			 * |      : OR operator.
			 * \s+$   : matches one or more whitespace characters at the end of the string.
			 * g      : global flag, ensures all matches are replaced, not just the first.
			 */
			return this.replace( /^\s+|\s+$/g, '' ) ;
		} ;
	}


	// Declare the main module for the application.
	// It depends on no other modules, indicated by the empty array.
	var module = angular.module( 'AxelSoft', [ ] ) ;


	/*
	 * Configuration defaults for the customSelect directive.
	 * These values can be overridden by attributes on the directive itself.
	 */
	module.value( 'customSelectDefaults', {
		displayText: 'Select...', /* Default text displayed when no item is selected */
		emptyListText: 'There are no items to display', /* Text for an empty dropdown list */
		emptySearchResultText: 'No results match "$0"', /* Text when search yields no results */
		addText: 'Add', /* Text for the 'Add' button, if onAdd function is provided */
		searchDelay: 1000 /* Delay in milliseconds before executing a remote search */
	} ) ;


	// Definition of the 'customSelect' directive.
	// This directive transforms a standard <select> element into a custom dropdown.
	module.directive( 'customSelect', [
		'$parse', /* Service for parsing Angular expressions */
		'$compile', /* Service for compiling HTML strings or DOM into templates */
		'$timeout', /* Angular's wrapper for window.setTimeout */
		'customSelectDefaults', /* Custom defaults for the directive */
		function ( $parse, $compile, $timeout, baseOptions ) {

			/*
			 * Regular expression to parse the ng-options attribute.
			 * This is a complex regex designed to break down the ng-options syntax
			 * into its constituent parts: value, label, group, key, and collection.
			 */
			var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/ ;


			return {
				restrict: 'A', /* Restrict directive to attribute usage */
				require: 'ngModel', /* Requires ngModel controller for data binding */
				link: function ( scope, elem, attrs, controller ) {

					// Ensure the ng-options attribute is present on the element.
					if ( ! attrs.ngOptions )
					{
						throw new Error( 'Expected ng-options attribute.' ) ;
					}

					// Attempt to match the ng-options attribute value against the predefined regular expression.
					var match = attrs.ngOptions.match( NG_OPTIONS_REGEXP ) ;

					// If the ng-options attribute format is invalid, throw an error.
					if ( ! match )
					{
						throw new Error( "Expected expression in form of " +
							"'_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
							" but got '" + attrs.ngOptions + "'." ) ;
					}

					// Add CSS classes to the element for styling the custom dropdown.
					elem.addClass( 'dropdown custom-select' ) ;


					/*
					 * Parse the ng-options expression into functions for later use.
					 * These functions extract display text, value names, and the collection itself.
					 */
					var displayFn = $parse( match[2] || match[1] ) ,
						valueName = match[4] || match[6] ,
						valueFn = $parse( match[2] ? match[1] : valueName ) ,
						values = match[7] ,
						valuesFn = $parse( values ) ;

					/*
					 * Initialize various options and state variables for the directive.
					 * This includes merging default options with user-provided ones,
					 * setting up search models, and managing timeouts for remote searches.
					 */
					var options = getOptions( ) ,
						searchModel = match[2] ? ( match[2] ).replace( new RegExp( '^' + valueName + '\\.' ), 'search.' ) : 'search' ,
						remoteSearch = typeof options.onSearch === 'function' ,
						timeoutHandle ,
						lastSearch = '' ,
						focusedIndex = -1 ,
						getInitialSearchModel = function ( ) {
							return match[2] ? { } : '' ;
						} ;

					// Determine the item template for rendering individual list items.
					// If no custom template is provided, it defaults to displaying the parsed value.
					var itemTemplate = elem.html( ).trim( ) || '{{' + ( match[2] || match[1] ) + '}}' ;


					/*
					 * Define the HTML templates for the hidden native select element
					 * and the custom dropdown UI.
					 * The select element is used by ngModel for binding, while the dropdown
					 * provides the enhanced user interface.
					 */
					var selectTemplate = '<select class="hide" ng-options="' + attrs.ngOptions + '" ng-model="' + attrs.ngModel + '" ' + ( attrs.ngChange ? 'ng-change="' + attrs.ngChange + '"' : '' ) + '></select>' ;

					var dropdownTemplate =
						'<a class="dropdown-toggle" data-toggle="dropdown" href ng-class="{ disabled: disabled }">' +
							'<span>{{displayText}}</span>' +
							'<b></b>' +
						'</a>' +
						'<div class="dropdown-menu">' +
							'<div stop-propagation="click" class="custom-select-search">' +
								'<input class="' + attrs.selectClass + '" type="text" autocomplete="off" ng-model="' + searchModel + '" />' +
							'</div>' +
							'<ul role="menu">' +
								'<li role="presentation" ng-repeat="' + valueName + ' in ' + values + ( remoteSearch ? '' : ' | filter: search' ) + '">' +
									'<a role="menuitem" tabindex="-1" href ng-click="select(' + valueName + ')">' +
										itemTemplate +
									'</a>' +
								'</li>' +
								'<li ng-hide="(' + values + ( remoteSearch ? '' : ' | filter: search' ) + ').length" class="empty-result" stop-propagation="click">' +
									'<em class="muted">' +
										'<span ng-hide="' + searchModel + '">{{emptyListText}}</span>' +
										'<span class="word-break" ng-show="' + searchModel + '">{{emptySearchResultText | format:' + searchModel + '}}</span>' +
									'</em>' +
								'</li>' +
							'</ul>' +
							'<div class="custom-select-action">' +
								( typeof options.onAdd === "function" ?
								'<button type="button" class="btn btn-primary btn-block add-button" ng-click="add()">{{addText}}</button>' : '' ) +
							'</div>' +
						'</div>' ;

					// Remove any existing content from the directive's element.
					elem.empty( ) ;

					// Convert the select template string into an Angular element.
					var selectElement = angular.element( selectTemplate ) ;

					// Convert the dropdown template string into an Angular element
					// and identify key sub-elements for interaction.
					var dropdownElement = angular.element( dropdownTemplate ) ,
						anchorElement = dropdownElement.eq( 0 ).dropdown( ) , // The toggle button for the dropdown
						inputElement = dropdownElement.eq( 1 ).find( ':text' ) , // The search input field
						ulElement = dropdownElement.eq( 1 ).find( 'ul' ) ; // The list of options


					// Create an isolated child scope for the dropdown components
					// to prevent scope pollution and manage data cleanly.
					var childScope = scope.$new( true ) ;
					// Initialize the child scope with configuration and event handlers.
					configChildScope( ) ;

					/*
					 * Event handler for when the dropdown toggle (anchorElement) is clicked.
					 * It manages the dropdown state, search model, and input focus.
					 */
					anchorElement.on( 'click', function ( event ) {
						// If the dropdown is disabled, do not proceed with the click.
						if ( childScope.disabled ) {
							return ;
						}
						// If not performing a remote search, reset the search model.
						if ( ! remoteSearch ) {
							childScope.$apply( function ( ) {
								lastSearch = '' ;
								childScope.search = getInitialSearchModel( ) ;
							} ) ;
						}
						// Reset focused index and focus on the search input.
						focusedIndex = -1 ;
						inputElement.focus( ) ;
					} ) ;

					/*
					 * Event handler for key presses on the anchor element.
					 * If specific modifier keys are not pressed, it simulates a click
					 * to open the dropdown when a key is typed.
					 */
					anchorElement.on( 'keypress', function ( event ) {
						if ( ! ( event.altKey || event.ctrlKey ) ) {
							anchorElement.click( ) ;
						}
					} ) ;


					/*
					 * Event handler for keydown events on the search input.
					 * Handles navigation (Esc, Enter, Down) and closing (Tab).
					 */
					inputElement.on( 'keydown', function ( event ) {
						// Only process specific key codes: Enter (13), Esc (27), Down (40), Tab (9).
						if ( ! /(13|27|40|^9$)/.test( event.keyCode ) ) {
							return ;
						}
						event.preventDefault( ) ; // Prevent default browser actions
						event.stopPropagation( ) ; // Stop event propagation

						switch ( event.keyCode ) {
							case 27: // Esc key
								anchorElement.dropdown( 'toggle' ) ; // Close dropdown
								break ;
							case 13: // Enter key
								selectFromInput( ) ; // Select item
								break ;
							case 40: // Down arrow key
								focusFirst( ) ; // Focus first item in list
								break ;
							case 9: // Tab key
								anchorElement.dropdown( 'toggle' ) ; // Close dropdown
								break ;
						}
					} ) ;

					/*
					 * Event handler for Up and Down arrow keys on the dropdown menu (ulElement).
					 * Enables keyboard navigation through the list items.
					 */
					ulElement.on( 'keydown', function ( event ) {
						// Only handle Up (38) and Down (40) arrow keys.
						if ( ! /(38|40)/.test( event.keyCode ) ) {
							return ;
						}
						event.preventDefault( ) ;
						event.stopPropagation( ) ;

						var items = ulElement.find( 'li > a' ) ; // Get all selectable list items.

						if ( ! items.length ) {
							return ; // If no items, do nothing.
						}

						if ( event.keyCode == 38 ) {
							focusedIndex-- ; // Move focus up
						}
						if ( event.keyCode == 40 && focusedIndex < items.length - 1 ) {
							focusedIndex++ ; // Move focus down
						}
						// The commented line below was an alternative for wrapping focus, but currently unused.
						//if (!~focusedIndex) focusedIndex = 0;

						if ( focusedIndex >= 0 ) {
							items.eq( focusedIndex )
								.focus( ) ; // Set focus to the selected item.
						} else {
							focusedIndex = -1 ; // Reset if focus goes out of bounds.
							inputElement.focus( ) ; // Move focus back to the input.
						}
					} ) ;

					// Compile and append the hidden native select element.
					// This is crucial for ngModel to work correctly.
					$compile( selectElement )( scope ) ;
					elem.append( selectElement ) ;

					// Compile and append the custom dropdown UI.
					// It's compiled against the childScope to manage its own state.
					$compile( dropdownElement )( childScope ) ;
					elem.append( dropdownElement ) ;

					/*
					 * Override the ngModel controller's $render method.
					 * This ensures that when the model value changes externally,
					 * the custom dropdown's display text is updated accordingly.
					 */
					controller.$render = function ( ) {
						// A small timeout is added to allow Angular's digest cycle
						// to update the native select element before reading its value.
						$timeout( setDisplayText, 50 ) ;
					} ;

					// Watch for changes in the display text configuration.
					childScope.$watch( getDisplayText, setDisplayText ) ;

					// Watch for changes in the 'disabled' attribute of the element.
					// This propagates the disabled state to the child scope for UI updates.
					childScope.$watch( function ( ) { return elem.attr( 'disabled' ) ; }, function ( value ) {
						childScope.disabled = value ;
					} ) ;

					// Watch for changes in the original data collection (values).
					// When the collection changes, update the child scope's representation.
					scope.$watch( values, function ( value ) {
						// childScope[values] = value;  // Original commented line, valuesFn.assign is more robust.
						valuesFn.assign( childScope, value ) ;
					} ) ;

					/*
					 * Helper function to set the display text of the dropdown.
					 * It retrieves the selected item's text based on the ngModel value.
					 */
					function setDisplayText ( ) {
						var collection ,
							locals = { } ,
							text = undefined ,
							key = selectElement.val( ) ; // Get the value from the hidden select.

						// If a key (selected value) exists and is not the default Angular empty value.
						if ( key && key !== '?' ) {
							collection = valuesFn( childScope ) || [ ] ; // Get the collection of items.
							locals[valueName] = collection[key] ; // Find the selected item.
							text = displayFn( childScope, locals ) ; // Get the display text for the selected item.
						}

						// Set the display text on the child scope, falling back to options.displayText if no item is selected.
						childScope.displayText = text || options.displayText ;
					}

					/*
					 * Helper function to retrieve and merge configuration options.
					 * It combines base defaults with any custom options provided via the 'customSelect' attribute.
					 */
					function getOptions ( ) {
						return angular.extend( { }, baseOptions, scope.$eval( attrs.customSelect ) ) ;
					}

					/*
					 * Helper function to get the current display text option.
					 * It re-evaluates options to ensure they are up-to-date.
					 */
					function getDisplayText ( ) {
						options = getOptions( ) ; // Re-evaluate options.
						return options.displayText ;
					}

					/*
					 * Helper function to focus the first selectable item in the dropdown list.
					 */
					function focusFirst ( ) {
						var opts = ulElement.find( 'li > a' ) ; // Get all clickable list items.
						if ( opts.length > 0 ) {
							focusedIndex = 0 ; // Set focused index to the first item.
							opts.eq( 0 ).focus( ) ; // Focus the first item.
						}
					}

					/*
					 * Handles selection when the user presses Enter in the search input.
					 * It selects the first item in the filtered list.
					 */
					function selectFromInput ( ) {
						var opts = ulElement.find( 'li > a' ) ;
						if ( opts.length > 0 ) {
							var ngRepeatItem = opts.eq( 0 ).scope( ) ; // Get the scope of the first item.
							var item = ngRepeatItem[valueName] ; // Extract the item object.
							childScope.$apply( function ( ) {
								childScope.select( item ) ; // Select the item.
							} ) ;
							anchorElement.dropdown( 'toggle' ) ; // Close the dropdown after selection.
						}
					}


					/*
					 * Configures the child scope with initial values and functions.
					 * This includes `select` and `add` functions, and sets up remote search.
					 */
					function configChildScope ( ) {
						childScope.addText = options.addText ; // Set 'Add' button text.
						childScope.emptySearchResultText = options.emptySearchResultText ; // Set empty search result text.
						childScope.emptyListText = options.emptyListText ; // Set empty list text.

						// Function to handle item selection.
						childScope.select = function ( item ) {
							var locals = { } ;
							locals[valueName] = item ;
							var value = valueFn( childScope, locals ) ;
							//setDisplayText(displayFn(scope, locals)); // Original commented line.
							childScope.displayText = displayFn( childScope, locals ) || options.displayText ; // Update display.
							controller.$setViewValue( value ) ; // Update ngModel value.

							childScope.search = getInitialSearchModel( ) ; // Reset search model.
							anchorElement.focus( ) ; // Return focus to the dropdown toggle.

							// If an onSelect callback is provided, invoke it.
							typeof options.onSelect === "function" && options.onSelect( item ) ;
						} ;
						// Function to handle adding new items (if onAdd is configured).
						childScope.add = function ( ) {
							options.onAdd( childScope.select ) ;
						} ;

						// Configuration for remote search functionality.
						if ( remoteSearch ) {
							inputElement.attr( 'ng-change', 'onSearch(' + searchModel + ')' ) ; // Bind ng-change.
							childScope.onSearch = function ( term ) {
								// Cancel any pending search timeout.
								if ( timeoutHandle ) {
									timeoutHandle = $timeout.cancel( timeoutHandle ) ;
								}

								term = ( term || '' ).trim( ) ; // Normalize the search term.

								// Set a new timeout for the search.
								timeoutHandle = $timeout( function ( ) {
									timeoutHandle = $timeout.cancel( timeoutHandle ) ; // Clear this timeout handle.

									// If the search term has changed, perform the remote search.
									if ( term != lastSearch ) {
										options.onSearch( ( lastSearch = term ) ) ;
									}
								},
								// Apply delay only if the search term is not empty.
								( term && options.searchDelay ) || 0 ) ;
							} ;
						}

						setDisplayText( ) ; // Initial setup of display text.
					}
				}
			} ;
		}
	] ) ;

	// Directive to stop event propagation.
	// Useful for elements within the dropdown that shouldn't close the dropdown.
	module.directive( 'stopPropagation', function ( ) {
		return {
			restrict: 'A', // Attribute directive.
			link: function ( scope, elem, attrs, ctrl ) {
				var events = attrs['stopPropagation'] ; // Get the event names to stop propagation for.
				elem.bind( events, function ( event ) {
					event.stopPropagation( ) ; // Stop the event from bubbling up.
				} ) ;
			}
		} ;
	} ) ;

} )( angular ) ; // Pass angular and undefined (for safety) to the IIFE.