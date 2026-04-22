/**
 * jQuery UI Virtual Keyboard Scramble Extension v1.4 for Keyboard v1.18+ (updated 11/19/2014)
 *
 * This extension provides functionality to scramble the layout of a virtual keyboard.
 *
 * Authored by Rob Garrison (also known as Mottie & Fudgey).
 * Distributed under the terms of the MIT License.
 *
 * Purpose: Integrate with the Virtual Keyboard plugin to dynamically rearrange
 *          the keys on the keyboard interface.
 *
 * Prerequisites:
 *  - jQuery library (version 1.4.4 or newer)
 *  - Virtual Keyboard plugin (version 1.17.14 or newer) - Available at: https://github.com/Mottie/Keyboard
 *
 * Usage Examples:
 *  1. For all virtual keyboard instances on the page:
 *     $('.ui-keyboard-input')
 *       .keyboard(options) // Initialize the keyboard plugin
 *       .addScramble();    // Apply the scramble extension
 *
 *  2. For a specific virtual keyboard instance identified by its ID:
 *     $('#keyboard1')
 *       .keyboard(options) // Initialize the keyboard plugin for this element
 *       .addScramble();    // Apply the scramble extension specifically to this keyboard
 *
 */
/* jshint browser: true, jquery: true, unused: false */
( function ( $ ) {
"use strict";

// Ensure the $.keyboard namespace exists, or create it if it doesn't.
$.keyboard = $.keyboard || {};

/**
 * Extends jQuery's prototype to add the 'addScramble' method.
 * This method initializes the scrambling functionality for selected keyboard instances.
 * @param {object} options - Configuration options for the scramble extension.
 */
$.fn.addScramble = function ( options ) {

		// Define the default configuration values for the scramble extension.
		var defaults = {
						targetKeys    : /[a-z\d]/i,  // Regular expression to identify keys that should be randomized.
						byRow         : true,       // If true, keys are randomized within each row; otherwise, all keys are randomized together.
						byKeySet      : false,      // If true, only the first keyset is randomized, and its layout is duplicated across other keysets.
						randomizeOnce : true        // If true, randomization occurs only once when the keyboard is built; otherwise, it scrambles every time the keyboard becomes visible.
		};

		// Iterate over each selected element to apply the scramble functionality.
		return this.each( function () {

						// Retrieve the keyboard instance associated with the current element.
						var o,
								base = $( this ).data( 'keyboard' ),
								opts = base.options;

						// If no keyboard instance is found, or if scramble options are already set,
						// then this element has already been processed or is not a keyboard.
						if ( !base || base.scramble_options ) {
										return;
						}

						// Merge default options with user-provided options and store them.
						o = base.scramble_options = $.extend( {}, defaults, options );

						/**
						 * Function to set up the scrambled keyboard layout.
						 * This method performs the actual rearrangement of keys.
						 * @param {jQuery} $keyboard - The jQuery object representing the keyboard element.
						 * @returns {jQuery} The modified keyboard element with scrambled keys.
						 */
						base.scramble_setup = function ( $keyboard ) {

										// Declare local variables for processing keyboard sets, keys, and mapping.
										var $sets, set, $keys, key, index, tmp,
												rowIndex, keyboardmap, map, keyboard, row;

										// Find all keysets within the keyboard.
										$sets = $keyboard.find( '.ui-keyboard-keyset' );

										// Proceed only if a keyboard element is found.
										if ( $keyboard.length ) {

														// If 'byKeySet' is true, we only process the first keyset.
														if ( o.byKeySet ) {
																		$sets = $sets.eq( 0 );
														}

														// Iterate through each keyset found.
														for ( set = 0; set < $sets.length; set++ ) {
																		/* jshint loopfunc: true */ // Suppress JSHint warning for function in loop.

																		// Get the current keyset.
																		$keys = $sets.eq( set );

																		// Initialize variables for row processing.
																		rowIndex = 0;
																		row        = [];
																		map        = [];
																		keyboardmap = [];
																		keyboard    = [];

																		// Iterate over each child element (buttons, spans, or <br>) in the keyset.
																		$keys.children( 'button, span, br' ).each( function () {

																						// Check if the current element is a line break.
																						if ( this.tagName === 'BR' ) {

																										// If scrambling by row, add the break to the current row and then finalize the row.
																										if ( o.byRow ) {
																														row.push( this );
																														map.push( false ); // Mark break as not-shufflable.
																														keyboard[ rowIndex ] = row;
																														keyboardmap[ rowIndex ] = map;
																														row = []; // Reset row for next set of keys.
																														map = []; // Reset map for next set of keys.
																														rowIndex++;
																										} else {
																														// If not scrambling by row, add the break directly to the keyboard array.
																														keyboard[ rowIndex ] = this;
																														keyboardmap[ rowIndex ] = false; // Mark break as not-shufflable.
																														rowIndex++;
																										}

																						} else {
																										// For non-break elements (buttons/spans), get their data-value.
																										tmp = $( this ).attr( 'data-value' ) || '';

																										// Check if the key's value matches the targetKeys pattern and is a single character.
																										tmp = tmp.length === 1 && o.targetKeys.test( tmp ) ? tmp : false;

																										// If scrambling by row, add the key and its shufflable status to the current row.
																										if ( o.byRow ) {
																														row.push( this );
																														map.push( tmp );
																										} else {
																														// If not scrambling by row, add the key and its shufflable status directly.
																														keyboard[ rowIndex ] = this;
																														keyboardmap[ rowIndex ] = tmp;
																														rowIndex++;
																										}
																						}
																		} );

																		// Remove the original <br> elements which are used for layout by the keyboard plugin.
																		// These will be re-added in the correct positions after shuffling.
																		$keys.find( '.ui-keyboard-button-endrow' ).remove();

																		// Re-map and re-append keys based on the shuffling logic.
																		if ( !o.byRow ) {
																						// If not scrambling by row, shuffle the entire keyboard array.
																						row = base.shuffle( keyboard, keyboardmap );
																						for ( key = 0; key < row.length; key++ ) {
																										$keys.append( row[ key ] );
																						}
																		} else {
																						// If scrambling by row, shuffle each row independently.
																						for ( index = 0; index < keyboard.length; index++ ) {
																										row = base.shuffle( keyboard[ index ], keyboardmap[ index ] );
																										for ( key = 0; key < row.length; key++ ) {
																														$keys.append( row[ key ] );
																										}
																						}
																		}
														}

														// If 'byKeySet' is true, realign other keysets to match the scrambled first keyset.
														if ( o.byKeySet ) {
																		$keyboard = base.realign( $keyboard );
														}

														// Return the modified keyboard element.
														return $keyboard;
										}
						};

						/**
						 * Custom shuffle function, modified from Fisher-Yates algorithm.
						 * It allows specific elements (marked as 'false' in the map) to remain unshuffled.
						 * @param {Array} array - The array of elements (keys) to be shuffled.
						 * @param {Array} map - A parallel array indicating which elements are shufflable (true/value) or not (false).
						 * @returns {Array} The shuffled array.
						 */
						base.shuffle = function ( array, map ) {
										var swap, random,
												index = array.length; // Start from the last element.

										// While there are elements remaining to shuffle...
										while ( index > 0 ) {

														// Pick a remaining element at random.
														random = Math.floor( Math.random() * index );

														// If the current element (from the end) is not shufflable, just decrement index and skip.
														if ( map[ index - 1 ] === false ) {
																		index--;
														}
														// Only swap if both the current element and the randomly picked element are shufflable.
														else if ( map[ index - 1 ] !== false && map[ random ] !== false ) {
																		// Decrement index to move to the next unsorted element.
																		index--;
																		// Perform the swap.
																		swap = array[ index ];
																		array[ index ] = array[ random ];
																		array[ random ] = swap;
														}
										}
										// Return the shuffled array.
										return array;
						};

						/**
						 * Realigns subsequent keysets to match the layout of the first (possibly scrambled) keyset.
						 * This is typically used when `byKeySet` option is enabled.
						 * @param {jQuery} $keyboard - The jQuery object representing the keyboard element.
						 * @returns {jQuery} The modified keyboard element with realigned keysets.
						 */
						base.realign = function ( $keyboard ) {
										var selector, typ, pos,
												// Get all keysets.
												$sets = $keyboard.find( '.ui-keyboard-keyset' ),
												// Identify the original (first) keyset, which serves as the template.
												$orig = $sets.eq( 0 );

										// Filter to get all keysets *after* the first one.
										$sets = $sets.filter( ':gt(0)' );

										// Iterate through each child element of the original keyset.
										$orig.children().each( function ( i, cell ) {
														// Determine if the cell is a line break or a regular key.
														typ = cell.tagName === 'BR';
														// Get the data-pos attribute for regular keys, which indicates their original position.
														pos = $( cell ).attr( 'data-pos' );

														/* jshint loopfunc: true */ // Suppress JSHint warning for function in loop.
														// For each other keyset, find the corresponding key/break and append it to itself.
														// This effectively reorders them to match the first keyset's order.
														$sets.each( function ( j, k ) {
																		// Construct the selector based on whether it's a break or a key.
																		selector = typ ? 'br:first' : 'button[data-pos="' + pos + '"]';
																		// Find the element in the current keyset and append it to its parent (k),
																		// moving it to the end of the children, thus reordering it.
																		$( k ).find( selector ).appendTo( k );
														} );
										} );

										// Return the keyboard with realigned keysets.
										return $keyboard;
						};

						/**
						 * Overrides the default `opts.create` function of the keyboard plugin.
						 * This custom `create` function manages the scrambling of the keyboard layout.
						 */
						opts.create = function () {
										var layout = opts.layout;

										// Initialize a new entry in builtLayouts for the scrambled layout.
										$.keyboard.builtLayouts[ layout ] = {
														mappedKeys   : {},
														acceptedKeys : [],
														$keyboard: null
										};

										// If the original layout hasn't been built yet (e.g., "qwerty"), build it first.
										if ( typeof $.keyboard.builtLayouts[ base.orig_layout ] === 'undefined' ) {
														// Temporarily set the layout to the original to build it.
														base.layout = opts.layout = base.orig_layout;
														base.buildKeyboard(); // Call the base keyboard's build method.
														// Restore the scrambled layout name.
														base.layout = opts.layout = layout;
										}

										// Clone the original layout and then scramble its keys.
										// This ensures that the original layout remains untouched for other uses.
										$.keyboard.builtLayouts[ layout ] = $.extend( true, {}, $.keyboard.builtLayouts[ base.orig_layout ] );

										// If 'randomizeOnce' is true, scramble the layout when it's first created.
										if ( o.randomizeOnce ) {
														// Clone the original keyboard element and then scramble it.
														$.keyboard.builtLayouts[ layout ].$keyboard = base.scramble_setup( $.keyboard.builtLayouts[ base.orig_layout ].$keyboard.clone() );
										}

										// Assign the (potentially scrambled) keyboard element to the base instance.
										base.$keyboard = $.keyboard.builtLayouts[ layout ].$keyboard;

										// If 'randomizeOnce' is false, scramble the keyboard every time it becomes visible.
										if ( !o.randomizeOnce ) {
														// Bind to the 'beforeVisible.keyboard' event.
														base.$el.bind( 'beforeVisible.keyboard', function ( e, kb ) {
																		// Scramble the keyboard element just before it becomes visible.
																		kb.$keyboard = kb.scramble_setup( kb.$keyboard );
														} );
										}
						};

						// Check if the keyboard's layout name has already been set to a scrambled layout.
						// If not, store the original layout name and generate a new unique scrambled layout name.
						if ( !/^scrambled/.test( base.options.layout ) ) {
										base.orig_layout = base.options.layout;
										base.options.layout = "scrambled" + Math.round( Math.random() * 10000 ); // Append a random number to ensure uniqueness.
						}

						// Handle a special case where the keyboard is configured to be always open.
						// In this scenario, the 'create' event might have already fired before scramble setup.
						// We defer the scramble setup using setTimeout to ensure the keyboard is fully rendered.
						if ( opts.alwaysOpen && base.$keyboard.length ) {
										setTimeout( function () {
														// Scramble the keyboard after a short delay.
														base.$keyboard = base.scramble_setup( base.$keyboard );
										}, 0 ); // A timeout of 0 ms pushes the execution to the end of the current event loop.
						}

		} ); // End of this.each()
} ; // End of $.fn.addScramble

} ) ( jQuery ) ; // End of IIFE (Immediately Invoked Function Expression)