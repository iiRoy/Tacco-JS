/*
 * This is a modified version of the jQuery Hotkeys Plugin.
 * Original Copyright (c) 2010, John Resig.
 * Licensed under the MIT or GPL Version 2 licenses.
 *
 * It is based on the work by Tzury Bar Yochay (http://github.com/tzuryby/hotkeys).
 * The initial concept was provided by Binny V A (http://www.openjs.com/scripts/events/keyboard_shortcuts/).
 *
 * This version retains all original functionality and variable names.
 * Changes are limited to whitespace and comments only, as per Type I clone definition.
 */
( function ( jQuery ) {


	// Define the hotkeys object within the jQuery namespace
	jQuery . hotkeys = {

		version : "0.8+" , // Current version of the plugin

		// Mapping of special key codes to their names
		specialKeys : {

			8   : "backspace",
			9   : "tab",
			13  : "return",
			16  : "shift",
			17  : "ctrl",
			18  : "alt",
			19  : "pause",
			20  : "capslock",
			27  : "esc",
			32  : "space",
			33  : "pageup",
			34  : "pagedown",
			35  : "end",
			36  : "home",
			37  : "left",
			38  : "up",
			39  : "right",
			40  : "down",
			45  : "insert",
			46  : "del",
			96  : "0",
			97  : "1",
			98  : "2",
			99  : "3",
			100 : "4",
			101 : "5",
			102 : "6",
			103 : "7",
			104 : "8",
			105 : "9",
			106 : "*",
			107 : "+",
			109 : "-",
			110 : ".",
			111 : "/",
			112 : "f1",
			113 : "f2",
			114 : "f3",
			115 : "f4",
			116 : "f5",
			117 : "f6",
			118 : "f7",
			119 : "f8",
			120 : "f9",
			121 : "f10",
			122 : "f11",
			123 : "f12",
			144 : "numlock",
			145 : "scroll",
			188 : ",",
			190 : ".",
			191 : "/",
			224 : "meta"

		},

		// Mapping of character keys to their shifted equivalents
		shiftNums : {

			"`" : "~",
			"1" : "!",
			"2" : "@",
			"3" : "#",
			"4" : "$",
			"5" : "%",
			"6" : "^",
			"7" : "&",
			"8" : "*",
			"9" : "(",
			"0" : ")",
			"-" : "_",
			"=" : "+",
			";" : ": ",
			"'" : "\"",
			"," : "<",
			"." : ">",
			"/" : "?",
			"\\" : "|"

		}
	};


	/**
	 * Main handler function for keyboard events.
	 * This function wraps the original event handler to add hotkey logic.
	 * @param {object} handleObj The event handler object from jQuery.
	 */
	function keyHandler( handleObj ) {

		var origHandler = handleObj . handler, // Store the original handler
			// Use the event namespace as keys; this supports event delegation
			// and allows removing specific key combination listeners, and data objects.
			keys = ( handleObj . namespace || "" ) . toLowerCase() . split( " " );

		// Map the keys to handle dot-separated namespaces (e.g., "ctrl.a")
		keys = jQuery . map( keys, function( key ) { return key . split( "." ); } );

		// If no keys are specified in the namespace, or if it's a known UI component,
		// there's no need to modify the handler.
		// The `substring` checks are for compatibility with jQuery UI 1.9.0+
		// for autocomplete, accordion, tabs, and menu components.
		if ( keys . length === 1 && ( keys[0] === "" ||
			keys[0] . substring( 0, 12 ) === "autocomplete" ||
			keys[0] . substring( 0, 9 ) === "accordion" ||
			keys[0] . substring( 0, 4 ) === "tabs" ||
			keys[0] . substring( 0, 4 ) === "menu" ) ) {
			return ;
		}


		// Replace the original handler with our custom logic
		handleObj . handler = function( event ) {

			// Do not fire hotkeys in text-accepting input fields unless
			// the event was directly bound to them.
			// Note: $.fn.prop is available from jQuery 1.6 onwards.
			if ( this !== event . target && ( /textarea|select/i . test( event . target . nodeName ) ||
				event . target . type === "text" || jQuery( event . target ) . prop( 'contenteditable' ) === 'true' ) ) {
				return ; // Exit if conditions met
			}

			// Determine if the key is a special key or a character key.
			// Keypress represents characters, not special keys like Shift, Ctrl, Alt.
			var special = event . type !== "keypress" && jQuery . hotkeys . specialKeys[ event . which ],
				character = String . fromCharCode( event . which ) . toLowerCase(),
				key, modif = "", possible = {};

			// Check for modifier key combinations (Alt, Ctrl, Shift, Meta)
			if ( event . altKey && special !== "alt" ) {
				modif += "alt_";
			}

			if ( event . ctrlKey && special !== "ctrl" ) {
				modif += "ctrl_";
			}

			// TODO: Ensure consistent behavior across different operating systems
			// for the Meta key (e.g., Command key on Mac, Windows key on Windows).
			if ( event . metaKey && ! event . ctrlKey && special !== "meta" ) {
				modif += "meta_";
			}

			if ( event . shiftKey && special !== "shift" ) {
				modif += "shift_";
			}


			// Populate `possible` object with potential key combinations
			if ( special ) {
				possible[ modif + special ] = true;

			} else {
				possible[ modif + character ] = true;
				// Also check for the shifted version of the character
				possible[ modif + jQuery . hotkeys . shiftNums[ character ] ] = true;

				// Special case: a character like "$" can be triggered as "Shift+4"
				// or "Shift+$" or just "$" depending on the keyboard layout/event.
				if ( modif === "shift_" ) {
					possible[ jQuery . hotkeys . shiftNums[ character ] ] = true;
				}
			}

			// Iterate through the registered hotkeys and execute the original
			// handler if a match is found.
			for ( var i = 0, l = keys . length; i < l; i++ ) {
				if ( possible[ keys[i] ] ) {
					return origHandler . apply( this, arguments ); // Execute and return
				}
			}
		};
	}


	// Extend jQuery's event system to include special handling for
	// 'keydown', 'keyup', and 'keypress' events.
	jQuery . each( [ "keydown", "keyup", "keypress" ], function() {
		// For each event type, set its 'add' method to our custom keyHandler.
		jQuery . event . special[ this ] = { add : keyHandler };
	} ) ;

} ) ( jQuery ) ;