/*
 * (c) 2010 D. Treder, www.headjump.de, info@dennistreder.de
 *
 * "Connections and Containers"
 * Constructs straightforward visual containers and links them with arrows based on an easily
 * parsable text description that also remains readable without JavaScript.
 *
 * Illustration:
 * 	(Person) >knows (Concept)
 *
 * More elaborate illustration:
 * 	(p:Participant >has [r,t]) >>owns most (Asset) ||
 * 	(r:Role) (t:Task)
 *
 *
 *
 * USAGE TERMS: LGPL
 *
 * This software library is free; you are permitted to redistribute it and/or
 * modify it under the conditions of the GNU Lesser General Public
 * License (LGPL) as issued by the Free Software Foundation; either
 * version 2.1 of the License, or (at your discretion) any subsequent version.
 *
 * This library is provided with the expectation that it will be useful,
 * but WITHOUT ANY ASSURANCE; without even the implicit guarantee of
 * MARKETABILITY or SUITABILITY FOR A PARTICULAR PURPOSE. Refer to the GNU
 * Lesser General Public License for further particulars.
 *
 * You should have been supplied with a copy of the GNU Lesser General Public
 * License accompanying this library; if not, contact the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA,
 * or consult http://www.gnu.org/copyleft/lesser.html
 */
( function ( $ ) {
	var SETTINGS = {
		"connector": {
			"shade_default": "#bbbbbb",
			"shade_emphasized": "#3c3c3c"
		},
		"element_box": {
			"visual_width": 150,
			"visual_height": 35,
			"tall_height": 60,
			"vertical_mid": 18,
			"right_clearance": 70,
			"bottom_clearance": 60,
			"frame_thickness": 3
		}
	};

	var module_tag = "connections_n_containers";
	var identifier_base_stamp = "" + new Date().getTime(); // Unique IDs for elements without explicit IDs
	var identifier_counter = 0;

	var connector_begin_chars = ["<", ">", "-"]; // Symbols initiating a connection
	var box_begin_chars = ["("];

	var termination_markers = { // Delimiters indicating the end of a segment
		"(": [")"],
		"<": [" <", " >", " -", " ("],
		"-": [" <", " >", " -", " ("],
		">": [" <", " >", " -", " ("]
	};

	var obtainNextIdentifier = function () {
		var result_id = identifier_base_stamp + "_" + module_tag + identifier_counter;
		identifier_counter++;
		return result_id; // Long ID to reduce collision risk with user's existing code
	};

	/**
	 * Symbols carrying structural significance. Escape them if literal use is needed!
	 */
	var special_chars_map = [
		["<", "LT_SYM"],
		[">", "GT_SYM"],
		["-", "HYPH_SYM"],
		["|", "VERT_BAR"],
		["{", "OPEN_BRACE"],
		["}", "CLOSE_BRACE"],
		["[", "OPEN_SQ_BRACKET"],
		["]", "CLOSE_SQ_BRACKET"],
		["(", "OPEN_PAREN"],
		[")", "CLOSE_PAREN"],
		[":", "COLON_SYM"],
		["/", "FWD_SLASH"]
	];

	/**
	 * Generates an escaped string. Utilized for escaping ">" and other syntactically relevant characters.
	 */
	var createEscapedToken = function ( input_value ) {
		return "%ESCAPED_" + input_value + "_%";
	};

	var escape_substitutions = ( function () {
		var collection = [];
		for ( var idx = 0; idx < special_chars_map.length; idx++ ) {
			collection.push( special_chars_map[idx][0] );
			collection.push( createEscapedToken( special_chars_map[idx][1] ) );
		}
		return collection;
	} )();

	var unescape_substitutions = ( function () {
		var collection = [];
		for ( var idx = 0; idx < special_chars_map.length; idx++ ) {
			collection.push( createEscapedToken( special_chars_map[idx][1] ) );
			collection.push( special_chars_map[idx][0] );
		}
		return collection;
	} )();

	/**
	 * Parses the provided input and generates graph structure data.
	 * @param {Array<string>} input_text_lines - An array of input text lines.
	 */
	var constructLayoutFromText = function ( input_text_lines ) {
		var diagram_elements = []; // Will contain arrays of elements per line
		var diagram_connections = [];

		for ( var idx = 0; idx < input_text_lines.length; idx++ ) {
			var parsed_line_data = processSingleLine( stripWhitespace( input_text_lines[idx] ) );
			if ( parsed_line_data["diagram_elements"].length !== 0 ) {
				diagram_elements = diagram_elements.concat( [ parsed_line_data["diagram_elements"] ] );
			}
			diagram_connections = diagram_connections.concat( parsed_line_data["diagram_connections"] );
		}

		return { "diagram_elements": diagram_elements, "diagram_connections": diagram_connections };
	};

	/**
	 * Processes a single line to create elements and connections, adding them to respective arrays.
	 */
	var processSingleLine = function ( current_text_line ) {
		var initial_line_content = current_text_line;

		current_text_line = manageEscapeSequences( current_text_line );

		// Strip out comments
		var comment_start_point = current_text_line.indexOf( "//" );
		if ( comment_start_point !== -1 ) {
			current_text_line = current_text_line.substring( 0, comment_start_point );
		}

		var current_line_elements = []; // Error if connection is made before an element
		var current_line_links = []; // If an element is created and previous connections exist, they are linked to it
		var last_element_id = "";
		try {
			while ( true ) {
				// Locate the next initiating symbol
				var initial_position = -1;
				var starting_symbol = "";
				var next_beginning_info = findNextStartingPoint( connector_begin_chars.concat( box_begin_chars ), current_text_line );
				if ( !next_beginning_info ) break;
				starting_symbol = next_beginning_info[0];
				initial_position = next_beginning_info[1];

				// Process the identified segment
				current_text_line = current_text_line.substring( initial_position + 1 );
				var final_position = findElementTermination( starting_symbol, current_text_line );
				var segment_content = stripWhitespace( current_text_line.substring( 0, final_position ) );
				switch ( starting_symbol ) {
					case "(":
						var newly_created_element = interpretElementBox( segment_content );
						// Assign target for preceding connections between elements
						if ( current_line_links.length !== 0 ) {
							for ( var reverse_link_idx = 0; reverse_link_idx < current_line_links.length; reverse_link_idx++ ) {
								var active_link_object = current_line_links[current_line_links.length - reverse_link_idx - 1];
								if ( active_link_object["target_elements"].length === 0 ) {
									active_link_object["target_elements"] = [ newly_created_element["id"] ];
								} else {
									break;
								}
							}
						}
						last_element_id = newly_created_element["id"];
						current_line_elements.push( newly_created_element );
						current_line_links = current_line_links.concat( extractInternalConnections( newly_created_element["id"], segment_content ) );
						break;
					case "<":
					case "-":
					case ">":
						if ( current_line_elements.length === 0 ) {
							throw "connection symbol encountered before any element: ".concat( starting_symbol ).concat( segment_content );
						}
						current_line_links.push( analyzeSingleConnector( starting_symbol, last_element_id, segment_content, false ) );
						break;
				}
				current_text_line = current_text_line.substring( final_position + 1 );
			}
			if ( current_line_links.length !== 0 && current_line_links[current_line_links.length - 1]["target_elements"].length === 0 ) {
				throw "final connection in line lacks a target";
			}
			return { "diagram_elements": current_line_elements, "diagram_connections": current_line_links };
		} catch ( exception_obj ) {
			throw "Parsing error in line: " + restoreUnescaped( "" + initial_line_content ) + "<br/>&nbsp;&nbsp;" + exception_obj;
		}
	};

	/**
	 * Determines which of the symbols in `symbol_list` appears earliest.
	 * @param {Array<string>} symbol_list - Symbols to search for (e.g., ["<", ">"]).
	 * @param {string} source_string_data - The string to search within.
	 * @returns {[string, number] | null} An array containing [symbol_type, position] or null if none found.
	 */
	var findNextStartingPoint = function ( symbol_list, source_string_data ) {
		var initial_position = -1;
		var symbol_type = "";
		for ( var idx = 0; idx < symbol_list.length; idx++ ) {
			var found_position = source_string_data.indexOf( symbol_list[idx] );
			if ( found_position !== -1 && ( initial_position === -1 || found_position < initial_position ) ) {
				initial_position = found_position;
				symbol_type = symbol_list[idx];
			}
		}
		if ( initial_position === -1 ) return null;
		return [symbol_type, initial_position];
	};

	/**
	 * @param {string} element_identifier - The ID string of the element.
	 * @param {string} source_string_data - The full source string for the element.
	 * @returns {Array<object>} An array containing all connections defined within the element's definition.
	 */
	var extractInternalConnections = function ( element_identifier, source_string_data ) {
		var collection_of_links = [];

		// Similar logic also in interpretElementBox
		var delimiter_index = source_string_data.indexOf( ":" );
		if ( delimiter_index !== -1 ) {
			source_string_data = source_string_data.substring( delimiter_index );
		}

		while ( true ) {
			var next_beginning_info = findNextStartingPoint( connector_begin_chars, source_string_data );
			if ( !next_beginning_info ) break;

			var current_symbol = next_beginning_info[0];
			var found_position = next_beginning_info[1];
			source_string_data = source_string_data.substring( found_position + 1 );
			var final_position = findElementTermination( current_symbol, source_string_data );
			var active_segment_data = source_string_data.substring( 0, final_position );
			collection_of_links.push( analyzeSingleConnector( current_symbol, element_identifier, active_segment_data, true ) );
			source_string_data = source_string_data.substring( final_position );
		}
		return collection_of_links;
	};

	/**
	 * Takes a source string and escapes symbols like <, >, -, etc.
	 * @param {string} source_string_data - The original string.
	 * @returns {string} The string with escape sequences applied.
	 */
	var manageEscapeSequences = function ( source_string_data ) {
		while ( true ) {
			var escape_block_start = source_string_data.indexOf( "{{" );
			var escape_block_end = source_string_data.indexOf( "}}" );
			if ( escape_block_start === -1 ) break;
			if ( escape_block_end < escape_block_start ) {
				throw ( "escaped content without proper closing. '}}' must be on the same line. '" + source_string_data.substring( escape_block_start ) + "'" );
			}
			var part_one = source_string_data.substring( 0, escape_block_start );
			var part_two = performBulkSubstitution( source_string_data.substring( escape_block_start + 2, escape_block_end ), escape_substitutions );
			var part_three = source_string_data.substring( escape_block_end + 2 );
			source_string_data = part_one.concat( part_two ).concat( part_three );
		}
		return source_string_data;
	};

	/**
	 * Unescapes a string (e.g., "%ESCAPED_GT_SYM_%" back to ">").
	 */
	var restoreUnescaped = function ( source_string_data ) {
		return performBulkSubstitution( source_string_data, unescape_substitutions );
	};

	/**
	 * Parses a single connection from a source string. (e.g., ">> connection_label [first_element_id, second_element_id]")
	 * @param {string} connector_kind - The type of connector ("<" | ">" | "-").
	 * @param {string} origin_element_id - The ID string of the source element.
	 * @param {string} source_string_data - The source string *without* the initial character (the connector_kind)!
	 * @param {boolean} targets_mandatory - If true, throws an error if no targets are specified.
	 * @returns {object} A hash structure for a single connection (which may point to multiple targets).
	 */
	var analyzeSingleConnector = function ( connector_kind, origin_element_id, source_string_data, targets_mandatory ) {
		source_string_data = stripWhitespace( source_string_data );
		var original_source_content = source_string_data;

		// Is it emphasized?
		var is_emphasized = false;
		if ( source_string_data.charAt( 0 ) === connector_kind ) {
			is_emphasized = true;
			source_string_data = stripWhitespace( source_string_data.substring( 1 ) );
		}

		// Is it bidirectional?
		var bidirectional_link = false;
		if ( ( connector_kind === "<" && source_string_data.charAt( 0 ) === ">" ) || ( connector_kind === ">" && source_string_data.charAt( 0 ) === "<" ) ) {
			bidirectional_link = true;
		}
		while ( source_string_data.charAt( 0 ) === ">" || source_string_data.charAt( 0 ) === "<" ) {
			source_string_data = source_string_data.substring( 1 );
		}
		source_string_data = stripWhitespace( source_string_data );

		// Targets & label
		var connector_caption = "";
		var connector_destinations = [];
		if ( targets_mandatory ) {
			var target_list_begin = source_string_data.lastIndexOf( "[" );
			var target_list_end = source_string_data.lastIndexOf( "]" );
			if ( target_list_begin === -1 ) {
				throw "no targets specified for connection '" + connector_kind + original_source_content + "'";
			}
			if ( target_list_end < target_list_begin ) {
				throw "connection definition not properly terminated: " + original_source_content;
			}
			if ( target_list_end !== source_string_data.length - 1 ) {
				throw "unrecognized content '" + source_string_data.substring( target_list_end + 1 ) + "' at the end of a connection definition '" + original_source_content + "'";
			}
			source_string_data = source_string_data.substring( 0, target_list_end );
			if ( target_list_begin !== -1 ) {
				connector_caption = source_string_data.substring( 0, target_list_begin );
				source_string_data = stripWhitespace( source_string_data.substring( target_list_begin + 1 ) );
			}
			if ( source_string_data.length === 0 ) {
				throw "no targets for connection: " + connector_kind + original_source_content;
			}
			connector_destinations = stripWhitespace( source_string_data ).split( "," );
			for ( var target_idx = 0; target_idx < connector_destinations.length; target_idx++ ) {
				connector_destinations[target_idx] = stripWhitespace( connector_destinations[target_idx] );
			}
		} else {
			connector_caption = source_string_data;
		}

		return {
			"kind": connector_kind,
			"is_emphasized": is_emphasized,
			"bidirectional_link": bidirectional_link,
			"origin_element": origin_element_id,
			"target_elements": connector_destinations,
			"caption": connector_caption
		};
	};

	/**
	 * Parses an element box from a given source string. *DOES NOT* build internal connections! Use `extractInternalConnections` for that!
	 * @param {string} source_string_data - Element source string *without* the initial character ("(").
	 * @returns {object} Element hash constructed from the source string.
	 */
	var interpretElementBox = function ( source_string_data ) {
		// Remove any internal connections for parsing the element itself
		// Similar logic also in extractInternalConnections
		var connection_search_offset = source_string_data.indexOf( ":" );
		if ( connection_search_offset === -1 ) {
			connection_search_offset = 0;
		}

		var internal_links_start = findNextStartingPoint( connector_begin_chars, source_string_data.substring( connection_search_offset ) );
		if ( internal_links_start ) {
			source_string_data = source_string_data.substring( 0, internal_links_start[1] + connection_search_offset );
		}

		// Is it emphasized?
		var is_emphasized = source_string_data.charAt( 0 ) === "(";
		if ( is_emphasized ) {
			source_string_data = stripWhitespace( source_string_data.substring( 1 ) );
		}

		// ID + style_modifier
		var element_identifier = "";
		var id_terminator_pos = source_string_data.indexOf( ":" );
		var style_modifier = "";
		if ( id_terminator_pos !== -1 ) {
			element_identifier = stripWhitespace( source_string_data.substring( 0, id_terminator_pos ) );
			var class_block_start = element_identifier.indexOf( "{" );
			var class_block_end = element_identifier.indexOf( "}" );
			if ( class_block_start !== -1 && class_block_end === ( element_identifier.length - 1 ) ) {
				style_modifier = stripWhitespace( element_identifier.substring( class_block_start + 1, class_block_end ) );
				element_identifier = stripWhitespace( element_identifier.substring( 0, class_block_start ) );
			}
			source_string_data = stripWhitespace( source_string_data.substring( id_terminator_pos + 1 ) );
		}

		if ( element_identifier === "" ) {
			element_identifier = obtainNextIdentifier();
		}

		// Caption || placeholder?
		var element_caption = "";
		var element_subtext = "";
		var is_placeholder = false;
		if ( source_string_data.length === 0 ) {
			is_placeholder = true;
		} else {
			var separator_marker = source_string_data.indexOf( "|" );
			if ( separator_marker !== -1 ) {
				element_caption = stripWhitespace( source_string_data.substring( 0, separator_marker ) );
				element_subtext = stripWhitespace( source_string_data.substring( separator_marker + 1 ) );
			} else {
				element_caption = source_string_data;
			}
		}

		return {
			"id": element_identifier,
			"is_emphasized": is_emphasized,
			"is_placeholder": is_placeholder,
			"style_modifier": style_modifier,
			"caption": element_caption,
			"subtext": element_subtext
		};
	};

	/**
	 * @param {string} current_symbol - The symbol initiating the element.
	 * @param {string} source_string_data - The string content.
	 * @returns {number} The termination_point for the given element in the text source.
	 */
	var findElementTermination = function ( current_symbol, source_string_data ) {
		if ( termination_markers[current_symbol] === undefined || termination_markers[current_symbol].length === 0 ) {
			throw "no closing symbols defined for element beginning with '" + current_symbol + "'";
		}
		var termination_point = -1;
		for ( var idx = 0; idx < termination_markers[current_symbol].length; idx++ ) {
			var found_position = source_string_data.indexOf( termination_markers[current_symbol][idx] );
			if ( found_position !== -1 && ( termination_point === -1 || found_position < termination_point ) ) {
				termination_point = found_position;
			}
		}
		return termination_point !== -1 ? termination_point : source_string_data.length;
	};

	/**
	 * @returns {number} The squared distance between two points.
	 */
	var squared_distance = function ( coord1x, coord1y, coord2x, coord2y ) {
		var diff_x = coord1x - coord2x;
		var diff_y = coord1y - coord2y;
		return diff_x * diff_x + diff_y * diff_y;
	};

	/**
	 * Calculates the intersection point [x,y] between lines defined by (line1_p1x, line1_p1y)-(line1_p2x, line1_p2y) and (line2_p1x, line2_p1y)-(line2_p2x, line2_p2y).
	 * @returns {[number, number] | null} The intersection point [x,y] or null if no intersection.
	 */
	var calculateLineIntersection = function ( line1_p1x, line1_p1y, line1_p2x, line1_p2y, line2_p1x, line2_p1y, line2_p2x, line2_p2y, as_segment ) {
		var intersect_x = 0;
		var intersect_y = 0;
		var coeff1a = 0;
		var coeff1b = 0;
		var coeff1c = 0;
		var coeff2a = 0;
		var coeff2b = 0;
		var coeff2c = 0;

		coeff1a = line1_p2y - line1_p1y;
		coeff1b = line1_p1x - line1_p2x;
		coeff1c = line1_p2x * line1_p1y - line1_p1x * line1_p2y;
		coeff2a = line2_p2y - line2_p1y;
		coeff2b = line2_p1x - line2_p2x;
		coeff2c = line2_p2x * line2_p1y - line2_p1x * line2_p2y;

		var denominator_val = coeff1a * coeff2b - coeff2a * coeff1b;
		if ( denominator_val === 0 ) {
			return null;
		}
		intersect_x = ( coeff1b * coeff2c - coeff2b * coeff1c ) / denominator_val;
		intersect_y = ( coeff2a * coeff1c - coeff1a * coeff2c ) / denominator_val;

		if ( as_segment ) {
			if ( squared_distance( intersect_x, intersect_y, line1_p2x, line1_p2y ) > squared_distance( line1_p1x, line1_p1y, line1_p2x, line1_p2y ) ) {
				return null;
			}
			if ( squared_distance( intersect_x, intersect_y, line1_p1x, line1_p1y ) > squared_distance( line1_p1x, line1_p1y, line1_p2x, line1_p2y ) ) {
				return null;
			}

			if ( squared_distance( intersect_x, intersect_y, line2_p2x, line2_p2y ) > squared_distance( line2_p1x, line2_p1y, line2_p2x, line2_p2y ) ) {
				return null;
			}
			if ( squared_distance( intersect_x, intersect_y, line2_p1x, line2_p1y ) > squared_distance( line2_p1x, line2_p1y, line2_p2x, line2_p2y ) ) {
				return null;
			}
		}
		return [intersect_x, intersect_y];
	};

	/**
	 * Vertically centers all elements (currently unused due to jQuery webkit bug).
	 * @param {jQuery} container_element - The jQuery object representing the container.
	 */
	var alignVerticalCenters = function ( container_element ) {
		var greatest_height = 0;

		var determineTallestChild = function ( child_index, child_element ) {
			var child_current_height = $( child_element ).innerHeight();
			if ( child_current_height > greatest_height ) {
				greatest_height = child_current_height;
			}
		};
		var positionToCenter = function ( child_index, child_element ) {
			var current_child = $( child_element );
			var child_current_height = current_child.height();
			var existing_margin = parseInt( current_child.css( 'marginTop' ), 10 );
			current_child.css( 'marginTop', existing_margin + Math.floor( ( greatest_height - child_current_height ) / 2 ) );
		};
		container_element.children().each( determineTallestChild ).each( positionToCenter );

	};

	/**
	 * Constructs the HTML structure for the diagram and draws connections between elements.
	 * @param {jQuery} enclosing_container - The outer HTML element enclosing the current diagram. Essential for identifying elements by their IDs!
	 * @param {object} layout_data - Hash containing arrays of elements and connections.
	 */
	var renderDiagramLayout = function ( enclosing_container, layout_data ) {
		try {
			var diagram_elements = layout_data["diagram_elements"];
			var diagram_connections = layout_data["diagram_connections"];

			var element_coordinates = {};

			// ELEMENT LINES
}( jQuery ) );