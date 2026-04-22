/*
 *  This section contains internal utility functions.
 *  These are not exposed directly but are used by the main color manipulation methods.
 */
/*
 *  ###Render method
 *
 *  `render(map, type)`
 *
 *  The `map` parameter is an object of data to render,
 *  while `type` specifies the color model (e.g., RGB, HSV, HSL).
 */
function render( map , type ) {
	var rtn ; // Variable to store the return value.

	// A switch statement to handle different color types for rendering.
	switch ( type ) {

		case 'hex' :
			// If the type is 'hex', convert the map to RGB first, then to hex.
			var rgb = render ( map , 'rgb' ) ;
			rtn = rgb2hex . apply ( this , rgb ) ;
			break ;

		default :
			// Default case handles 'rgb', 'hsv', 'hsl' directly.
			rtn = { } ; // Initialize return object.
			var keys ; // Array to hold the keys for the return object.

			// Ensure 'map' is an object before proceeding.
			if ( typeof map != "object" ) {
				return ;
			}

			// Assign appropriate keys based on the specified type.
			if ( type === "rgb" ) {
				keys = [ "R" , "G" , "B" , "RGB" ] ;
			}

			if ( type === "hsv" ) {
				keys = [ "H" , "S" , "V" , "HSV" ] ;
			}

			if ( type === "hsl" ) {
				keys = [ "H" , "S" , "L" , "HSL" ] ;
			}

			// Populate the return object with mapped values.
			rtn [ keys [ 0 ] ] = map [ 0 ] ;
			rtn [ keys [ 1 ] ] = map [ 1 ] ;
			rtn [ keys [ 2 ] ] = map [ 2 ] ;
			rtn [ keys [ 3 ] ] = map [ 0 ] + " " + map [ 1 ] + " " + map [ 2 ] ;
			rtn . a = map ; // Store the original map as property 'a'.
			break ;
	}

	return rtn ;
} ;



// ### Padded Hex method
//
// `paddedHex(number)` is a helper function.
// It creates a hexadecimal number string, ensuring it's always two digits
// by adding a leading zero if the number is less than 16 (i.e., one hex digit).
function paddedHex ( n ) {
	var hex = ( ( n < 10 ) ? "0" : "" ) + n . toString ( 16 ) ; // Convert to hex and pad if needed.
	return ( hex . length === 1 ) ? "0" + hex : hex ; // Final check for single-digit hex.
} ;


/*
 *  ## The Colors methods
 *
 *  This section defines the core color conversion functions.
 */

/*
 *  ### rgb2hex method
 *
 *  Converts 3 RGB integer values (0-255) or a single integer (representing a combined RGB value)
 *  into a hexadecimal color string.
 *
 *  `rgb2hex( [multiple Ints: R,G,B] or [single Int: COLOR] )`
 */
function rgb2hex ( r , g , b ) {
	r = paddedHex ( r ) ; // Convert red component to padded hex.
	g = ( g !== undefined ) ? paddedHex ( g ) : r ; // Convert green, or use red if undefined.
	b = ( b !== undefined ) ? paddedHex ( b ) : r ; // Convert blue, or use red if undefined.
	return "#" + r + g + b ; // Concatenate to form the hex string.
} ;


// ### hex2rgb method
//
// This function transforms a hexadecimal color string into an RGB color object.
//
// `hex2rgb( "hex color string" ).[obj R, G, B, RGB or a]`
function hex2rgb( h ) {
    h = h . replace ( "#" , "" ) ; // Remove the '#' prefix if present.

    if ( h . length === 6 ) {
        // If it's a 6-digit hex, parse R, G, B components.
        return render ( [ parseInt ( h . substr ( 0 , 2 ) , 16 ) , parseInt ( h . substr ( 2 , 2 ) , 16 ) , parseInt ( h . substr ( 4 , 2 ) , 16 ) ] , "rgb" ) ;
    } else {
        // If it's a 3-digit hex (or other invalid, treated as single int), parse as a single integer.
        return parseInt ( h , 16 ) ;
    }
} ;

/**
 * ### name2hex method
 *
 * Retrieves the hexadecimal representation of a given HTML color name.
 * It strictly adheres to the 176 HTML color names defined by web standards.
 *
 * `name2hex ( "color name" )`
 */
function name2hex ( n ) {
    n = n . toLowerCase ( ) ; // Convert the input name to lowercase for case-insensitive matching.
    var nar = {
        "aliceblue" : "#f0f8ff" ,
        "antiquewhite" : "#faebd7" ,
        "aqua" : "#00ffff" ,
        "aquamarine" : "#7fffd4" ,
        "azure" : "#f0ffff" ,
        "beige" : "#f5f5dc" ,
        "bisque" : "#ffe4c4" ,
        "black" : "#000000" ,
        "blanchedalmond" : "#ffebcd" ,
        "blue" : "#0000ff" ,
        "blueviolet" : "#8a2be2" ,
        "brown" : "#a52a2a" ,
        "burlywood" : "#deb887" ,
        "cadetblue" : "#5f9ea0" ,
        "chartreuse" : "#7fff00" ,
        "chocolate" : "#d2691e" ,
        "coral" : "#ff7f50" ,
        "cornflowerblue" : "#6495ed" ,
        "cornsilk" : "#fff8dc" ,
        "crimson" : "#dc143c" ,
        "cyan" : "#00ffff" ,
        "darkblue" : "#00008b" ,
        "darkcyan" : "#008b8b" ,
        "darkgoldenrod" : "#b8860b" ,
        "darkgray" : "#a9a9a9" ,
        "darkgrey" : "#a9a9a9" ,
        "darkgreen" : "#006400" ,
        "darkkhaki" : "#bdb76b" ,
        "darkmagenta" : "#8b008b" ,
        "darkolivegreen" : "#556b2f" ,
        "darkorange" : "#ff8c00" ,
        "darkorchid" : "#9932cc" ,
        "darkred" : "#8b0000" ,
        "darksalmon" : "#e9967a" ,
        "darkseagreen" : "#8fbc8f" ,
        "darkslateblue" : "#483d8b" ,
        "darkslategray" : "#2f4f4f" ,
        "darkslategrey" : "#2f4f4f" ,
        "darkturquoise" : "#00ced1" ,
        "darkviolet" : "#9400d3" ,
        "deeppink" : "#ff1493" ,
        "deepskyblue" : "#00bfff" ,
        "dimgray" : "#696969" ,
        "dimgrey" : "#696969" ,
        "dodgerblue" : "#1e90ff" ,
        "firebrick" : "#b22222" ,
        "floralwhite" : "#fffaf0" ,
        "forestgreen" : "#228b22" ,
        "fuchsia" : "#ff00ff" ,
        "gainsboro" : "#dcdcdc" ,
        "ghostwhite" : "#f8f8ff" ,
        "gold" : "#ffd700" ,
        "goldenrod" : "#daa520" ,
        "gray" : "#808080" ,
        "grey" : "#808080" ,
        "green" : "#008000" ,
        "greenyellow" : "#adff2f" ,
        "honeydew" : "#f0fff0" ,
        "hotpink" : "#ff69b4" ,
        "indianred" : "#cd5c5c" ,
        "indigo" : "#4b0082" ,
        "ivory" : "#fffff0" ,
        "khaki" : "#f0e68c" ,
        "lavender" : "#e6e6fa" ,
        "lavenderblush" : "#fff0f5" ,
        "lawngreen" : "#7cfc00" ,
        "lemonchiffon" : "#fffacd" ,
        "lightblue" : "#add8e6" ,
        "lightcoral" : "#f08080" ,
        "lightcyan" : "#e0ffff" ,
        "lightgoldenrodyellow" : "#fafad2" ,
        "lightgray" : "#d3d3d3" ,
        "lightgrey" : "#d3d3d3" ,
        "lightgreen" : "#90ee90" ,
        "lightpink" : "#ffb6c1" ,
        "lightsalmon" : "#ffa07a" ,
        "lightseagreen" : "#20b2aa" ,
        "lightskyblue" : "#87cefa" ,
        "lightslategray" : "#778899" ,
        "lightslategrey" : "#778899" ,
        "lightsteelblue" : "#b0c4de" ,
        "lightyellow" : "#ffffe0" ,
        "lime" : "#00ff00" ,
        "limegreen" : "#32cd32" ,
        "linen" : "#faf0e6" ,
        "magenta" : "#ff00ff" ,
        "maroon" : "#800000" ,
        "mediumaquamarine" : "#66cdaa" ,
        "mediumblue" : "#0000cd" ,
        "mediumorchid" : "#ba55d3" ,
        "mediumpurple" : "#9370d8" ,
        "mediumseagreen" : "#3cb371" ,
        "mediumslateblue" : "#7b68ee" ,
        "mediumspringgreen" : "#00fa9a" ,
        "mediumturquoise" : "#48d1cc" ,
        "mediumvioletred" : "#c71585" ,
        "midnightblue" : "#191970" ,
        "mintcream" : "#f5fffa" ,
        "mistyrose" : "#ffe4e1" ,
        "moccasin" : "#ffe4b5" ,
        "navajowhite" : "#ffdead" ,
        "navy" : "#000080" ,
        "oldlace" : "#fdf5e6" ,
        "olive" : "#808000" ,
        "olivedrab" : "#6b8e23" ,
        "orange" : "#ffa500" ,
        "orangered" : "#ff4500" ,
        "orchid" : "#da70d6" ,
        "palegoldenrod" : "#eee8aa" ,
        "palegreen" : "#98fb98" ,
        "paleturquoise" : "#afeeee" ,
        "palevioletred" : "#d87093" ,
        "papayawhip" : "#ffefd5" ,
        "peachpuff" : "#ffdab9" ,
        "peru" : "#cd853f" ,
        "pink" : "#ffc0cb" ,
        "plum" : "#dda0dd" ,
        "powderblue" : "#b0e0e6" ,
        "purple" : "#800080" ,
        "red" : "#ff0000" ,
        "rosybrown" : "#bc8f8f" ,
        "royalblue" : "#4169e1" ,
        "saddlebrown" : "#8b4513" ,
        "salmon" : "#fa8072" ,
        "sandybrown" : "#f4a460" ,
        "seagreen" : "#2e8b57" ,
        "seashell" : "#fff5ee" ,
        "sienna" : "#a0522d" ,
        "silver" : "#c0c0c0" ,
        "skyblue" : "#87ceeb" ,
        "slateblue" : "#6a5acd" ,
        "slategray" : "#708090" ,
        "slategrey" : "#708090" ,
        "snow" : "#fffafa" ,
        "springgreen" : "#00ff7f" ,
        "steelblue" : "#4682b4" ,
        "tan" : "#d2b48c" ,
        "teal" : "#008080" ,
        "thistle" : "#d8bfd8" ,
        "tomato" : "#ff6347" ,
        "turquoise" : "#40e0d0" ,
        "violet" : "#ee82ee" ,
        "wheat" : "#f5deb3" ,
        "white" : "#ffffff" ,
        "whitesmoke" : "#f5f5f5" ,
        "yellow" : "#ffff00" ,
        "yellowgreen" : "#9acd32"
    } ,
        r = nar [ n ] ; // Look up the color name in the dictionary.

    if ( r === undefined ) {
        console . log ( 'Invalid color name used: ' + n ) ;
        return "#000000" ; // Return black for invalid names.
    }

    return r ; // Return the hex value.
} ;

// ### complement method
//
// This method calculates the complementary color for various input types.
//
// ```complement ( "#ffffff" )
// complement ( [obj R, G, B] or R, G, B )```
module . exports = function ( c , g , b ) {
	var cval , rtn , passedType ; // Declare variables for color value, return, and detected type.

	// Handle named colors first: if 'c' is a string, and 'g'/'b' are undefined, and no '#'.
	if ( typeof c == "string" && g === undefined && b === undefined && c . indexOf ( '#' ) === -1 ) {
		c = name2hex ( c ) ; // Convert the named color to its hex string.
	}

	// Process hexadecimal color inputs.
	if ( typeof c == "string" && / ( # ( [ A-Fa-f0-9 ] ) { 3 } ( ( [ A-Fa-f0-9 ] ) { 3 } ) ? ) / . test ( c ) ) {
		passedType = 'hex' ; // Set the detected type to hexadecimal.

		c = c . replace ( "#" , "" ) ; // Remove the hash symbol from the hex string.
		rtn = "#" ; // Initialize the return hex string with a hash.

		if ( c . length === 6 ) {
			// For 6-digit hex (e.g., #RRGGBB).
			rtn += paddedHex ( 255 - hex2rgb ( c . substr ( 0 , 2 ) ) ) ; // Complement Red.
			rtn += paddedHex ( 255 - hex2rgb ( c . substr ( 2 , 2 ) ) ) ; // Complement Green.
			rtn += paddedHex ( 255 - hex2rgb ( c . substr ( 4 , 2 ) ) ) ; // Complement Blue.
		}

		if ( c . length === 3 ) {
			// For 3-digit hex (e.g., #RGB, which expands to #RRGGBB).
			rtn += paddedHex ( 255 - hex2rgb ( c . substr ( 0 , 1 ) + c . substr ( 0 , 1 ) ) ) ; // Complement Red.
			rtn += paddedHex ( 255 - hex2rgb ( c . substr ( 1 , 1 ) + c . substr ( 1 , 1 ) ) ) ; // Complement Green.
			rtn += paddedHex ( 255 - hex2rgb ( c . substr ( 2 , 1 ) + c . substr ( 2 , 1 ) ) ) ; // Complement Blue.
		}
		return rtn ; // Return the complementary hex color.
	} else {
		passedType = 'rgb' ; // Assume RGB if not hex.

		// Handle explicit R, G, B integer inputs.
		if ( c !== undefined && g !== undefined && b !== undefined ) {
			cval = [ ( 255 - c ) , ( 255 - g ) , ( 255 - b ) ] ; // Calculate complements.
		}

		// Handle RGB array/object input.
		if ( typeof c == "object" ) {
			cval = [ ( 255 - c [ 0 ] ) , ( 255 - c [ 1 ] ) , ( 255 - c [ 2 ] ) ] ; // Calculate complements.
		}
		return render ( cval , passedType ) ; // Render the complementary RGB color.
	}
} ;