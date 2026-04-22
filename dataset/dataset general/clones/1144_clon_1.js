/*
 * This file is part of the "Arrows and Boxes" library.
 *
 * Original Author: Dennis Treder, www.headjump.de, info@dennistreder.de
 *
 * Description:
 * A JavaScript library designed to render simple diagrams of boxes and arrows
 * from a straightforward text-based description. This format is intended
 * to be human-readable even without JavaScript processing.
 *
 * Basic Usage Example:
 * (Person A) >communicates with (Person B)
 *
 * Advanced Example demonstrating node properties and multi-line definitions:
 * (user:Dennis {admin}) >>sends request to (sys:Server {web}) ||
 * (sys:Server {web}) >responds to (user:Dennis {admin})
 *
 *
 *
 * LICENSE INFORMATION:
 * This software is free software; you are free to redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License (LGPL)
 * as published by the Free Software Foundation; either version 2.1 of the
 * License, or (at your option) any later version.
 *
 * This library is provided "as is", WITHOUT ANY WARRANTY, express or
 * implied, including but not limited to the warranties of MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, and NONINFRINGEMENT. In no event shall
 * the authors or copyright holders be liable for any claim, damages, or other
 * liability, whether in an action of contract, tort, or otherwise, arising
 * from, out of, or in connection with the software or the use or other
 * dealings in the software.
 *
 * For a complete copy of the GNU Lesser General Public License, please refer to:
 * http://www.gnu.org/copyleft/lesser.html
 * Or write to:
 * Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */
(function($) {

	// Configuration object for various visual parameters of the diagram.
	var CONFIG = {

		"arrow": {
			"color_normal": "#cacaca",		// Default color for arrows.
			"color_highlighted": "#4a4a4a"	// Color for highlighted arrows.
		},

		"node": {
			"width": 146,						// Standard width of a node box.
			"height": 32,						// Standard height of a node box.
			"height_with_subtitle": 56,		// Height when a subtitle is present.
			"center_y": 15,					// Y-offset for centering text within a node.
			"margin_right": 64,				// Horizontal spacing between nodes.
			"margin_bottom": 56,				// Vertical spacing between node rows.
			"border_size": 2					// Thickness of the node border.
		}

	};

	// Prefix for generated element IDs to ensure uniqueness.
	var prefix = "arrowsandboxes";


	// Base for generating unique IDs, using a timestamp to reduce collision risk.
	var unique_id_prefix = "" + new Date().getTime();
	// Counter for unique IDs within the current session.
	var unique_id_index = 0;


	// Characters that can initiate an arrow definition.
	var arrow_starter = ["<", ">", "-"];

	// Characters that can initiate a node definition.
	var node_starter = ["("];



	// Defines characters that mark the end of an element, based on its starting character.
	var ends_with = {
		"(": [")"],						// Node definitions end with a closing parenthesis.
		"<": [" <", " >", " -", " ("],	// Arrow definitions can end with various delimiters or node starts.
		"-": [" <", " >", " -", " ("],	// Same as above.
		">": [" <", " >", " -", " ("]		// Same as above.
	};


	/**
	 * Generates a unique identifier string.
	 * This ID is used for nodes that do not explicitly specify one in the input.
	 * The generated ID includes a timestamp and an incrementing index to minimize
	 * conflicts with other elements on a page.
	 *
	 * @returns {string} A unique ID string.
	 */
	var getUniqueId = function() {
		var res = unique_id_prefix + "_" + prefix + unique_id_index;

		unique_id_index++; // Increment the counter for the next ID.

		return res; // The ID is intentionally long to prevent conflicts.
	};


	/**
	 * List of characters that have special syntactical meaning within the diagram
	 * description language. These characters must be escaped if they are meant
	 * to appear literally in node titles or arrow labels.
	 * Each entry is an array: [ 'character_to_escape', 'escape_code_suffix' ].
	 */
	var esc_list = [
		["<", "LT"],	// Less Than
		[">", "GT"],	// Greater Than
		["-", "LN"],	// Line (hyphen)
		["|", "PP"],	// Pipe
		["{", "BE"],	// Brace Start
		["}", "B3"],	// Brace End
		["[", "BCC"],	// Bracket Start
		["]", "BJJ"],	// Bracket End
		["(", "BC"],	// Parenthesis Start
		[")", "BJ"],	// Parenthesis End
		[":", "DP"],	// Colon
		["/", "SL"]	// Slash
	];


	/**
	 * Creates an escaped string representation for a given value.
	 * This is used internally to replace syntax-relevant characters.
	 *
	 * @param {string} val The value to be embedded in the escape sequence.
	 * @returns {string} The escaped string, e.g., "%ESC_GT_%".
	 */
	var escaped = function(val) {
		return "%ESC_" + val + "_%";
	};


	/**
	 * An IIFE (Immediately Invoked Function Expression) that generates
	 * the array for bulk replacement of original characters with their escaped versions.
	 * This array is used by the `bulkReplace` utility function.
	 *
	 * @type {Array<string>} An array of [originalChar, escapedChar] pairs.
	 */
	var esc_replaces = (function() {
		var res = [];
		for (var i = 0; i < esc_list.length; i++) {
			res.push(esc_list[i][0]);			// Add the original character.
			res.push(escaped(esc_list[i][1]));	// Add its escaped form.
		}
		return res;
	})();


	/**
	 * An IIFE that generates the array for bulk replacement of escaped characters
	 * back to their original forms. This is used for de-escaping parsed strings.
	 *
	 * @type {Array<string>} An array of [escapedChar, originalChar] pairs.
	 */
	var de_esc_replaces = (function() {
		var res = [];
		for (var i = 0; i < esc_list.length; i++) {
			res.push(escaped(esc_list[i][1]));	// Add the escaped form.
			res.push(esc_list[i][0]);			// Add the original character.
		}
		return res;
	})();


	/**
	 * Parses an array of input lines (text description) and constructs
	 * a structured representation of nodes and arrows.
	 *
	 * @param {Array<string>} lines An array where each element is a line of the diagram description.
	 * @returns {object} An object containing two properties:
	 *                   - `nodes`: An array of arrays, where each inner array represents nodes in a single line.
	 *                   - `arrows`: A flat array of all arrow definitions.
	 */
	var buildStructureFromLines = function(lines) {
		var nodes = [];		// Accumulates nodes, grouped by line.
		var arrows = [];	// Accumulates all arrows.

		for (var i = 0; i < lines.length; i++) {
			var line_struct = parseLine(trim(lines[i]));

			// Only add lines that actually contained nodes.
			if (line_struct["nodes"].length != 0) {
				nodes = nodes.concat([line_struct["nodes"]]);
			}
			arrows = arrows.concat(line_struct["arrows"]); // Collect all arrows.
		}

		return { "nodes": nodes, "arrows": arrows };
	};


	/**
	 * Parses a single line of the diagram description, identifying all nodes and arrows within it.
	 *
	 * @param {string} line The input string representing a single line of the diagram description.
	 * @returns {object} An object with `nodes` (an array of node objects) and `arrows` (an array of arrow objects) found in the line.
	 * @throws {string} An error message if a syntactical error is encountered, such as an arrow before a node or an unclosed arrow.
	 */
	var parseLine = function(line) {
		var original_line = line; // Store original line for error reporting.

		line = handleEscapes(line); // Process custom escape sequences first.

		// Remove any comments starting with "//" from the line.
		var comments_start = line.indexOf("//");
		if (comments_start != -1) {
			line = line.substring(0, comments_start);
		}

		var line_nodes = [];		// Nodes discovered in this specific line.
		var line_arrows = [];		// Arrows discovered in this specific line.
		var previous_node_id = "";	// Tracks the ID of the last processed node for arrow connections.

		try {
			while (true) {
				// Find the next starting element (either an arrow or a node).
				var start_pos = -1;
				var start_elem = "";

				var next_start_pos = startPosOfNext(arrow_starter.concat(node_starter), line);

				if (!next_start_pos) {
					break; // No more elements found in the line.
				}

				start_elem = next_start_pos[0];
				start_pos = next_start_pos[1];

				// Advance the line string past the start element.
				line = line.substring(start_pos + 1);

				// Determine where the current element ends.
				var end_pos = endposForElement(start_elem, line);

				// Extract the source string for the current element.
				var element_source = trim(line.substring(0, end_pos));

				switch (start_elem) {
					case "(": // It's a node.
						var new_node = parseNode(element_source);

						// If there are pending arrows, connect them to this newly found node.
						if (line_arrows.length != 0) {
							for (var line_arrows_from_behind_i = 0; line_arrows_from_behind_i < line_arrows.length; line_arrows_from_behind_i++) {
								var current_arrow = line_arrows[line_arrows.length - line_arrows_from_behind_i - 1];

								if (current_arrow["target_nodes"].length === 0) {
									current_arrow["target_nodes"] = [new_node["id"]]; // Assign this node as the target.
								} else {
									break; // Stop if an arrow already has targets.
								}
							}
						}

						previous_node_id = new_node["id"]; // Update the last node ID.
						line_nodes.push(new_node); // Add the new node to the line's node list.

						// Also parse any arrows defined *inside* the node's definition.
						line_arrows = line_arrows.concat(parseArrowsInsideNode(new_node["id"], element_source));
						break;

					case "<":
					case "-":
					case ">": // It's an arrow.
						if (line_nodes.length === 0) {
							// An arrow must follow a node.
							throw "arrow in line before node: ".concat(start_elem).concat(element_source);
						}
						// Parse the single arrow and add it to the line's arrow list.
						line_arrows.push(parseSingleArrow(start_elem, previous_node_id, element_source, false));
						break;
				}

				// Advance the line string past the processed element.
				line = line.substring(end_pos + 1);
			}

			// After parsing the entire line, check if the last arrow has a target.
			if (line_arrows.length !== 0 && line_arrows[line_arrows.length - 1]["target_nodes"].length === 0) {
				throw "last arrow in line has no target";
			}

			return { "nodes": line_nodes, "arrows": line_arrows };

		} catch (e) {
			// Catch and re-throw with context for better error reporting.
			throw "Error in line: " + deEscape("" + original_line) + "<br/>&nbsp;&nbsp;" + e;
		}
	};


	/**
	 * Finds the first occurrence of any character from a given `type_array` within a `source` string.
	 *
	 * @param {Array<string>} type_array An array of single-character strings to search for (e.g., ["<", ">"]).
	 * @param {string} source The string to search within.
	 * @returns {Array<string, number>|null} An array containing the found character and its position,
	 *                                        or `null` if no character from `type_array` is found.
	 */
	var startPosOfNext = function(type_array, source) {
		var start_pos = -1;		// Initialize with no position found.
		var start_type = "";	// Initialize with no type found.

		for (var i = 0; i < type_array.length; i++) {
			var pos = source.indexOf(type_array[i]); // Find current type's position.

			// If found and it's earlier than any previous find, update.
			if (pos != -1 && (start_pos === -1 || pos < start_pos)) {
				start_pos = pos;
				start_type = type_array[i];
			}
		}

		if (start_pos === -1) {
			return null; // No matching character found.
		}

		return [start_type, start_pos]; // Return the first found type and its position.
	};


	/**
	 * Parses and extracts arrow definitions that are embedded *within* a node's source string.
	 * For example, `(NodeA : >relates to [NodeB])`.
	 *
	 * @param {string} node_id The ID of the node that contains these internal arrow definitions.
	 * @param {string} source The complete source string of the node.
	 * @returns {Array<object>} An array of parsed arrow objects.
	 */
	var parseArrowsInsideNode = function(node_id, source) {
		var res = []; // Array to store discovered arrows.

		// Similar logic to parseNode for finding the start of arrows.
		// Skip title/id part of the node definition.
		var colon_pos = source.indexOf(":");
		if (colon_pos != -1) {
			source = source.substring(colon_pos);
		}

		while (true) {
			var next_start_pos = startPosOfNext(arrow_starter, source);

			if (!next_start_pos) {
				break; // No more arrow starters found.
			}

			var elem = next_start_pos[0];
			var pos = next_start_pos[1];

			source = source.substring(pos + 1); // Move past the arrow starter.

			var end_pos = endposForElement(elem, source); // Find where this arrow definition ends.
			var current_elem_source = source.substring(0, end_pos); // Extract the arrow's source string.

			// Parse the arrow, requiring targets as it's defined inside a node.
			res.push(parseSingleArrow(elem, node_id, current_elem_source, true));

			source = source.substring(end_pos); // Move past the parsed arrow.
		}
		return res;
	};


	/**
	 * Processes a source string to handle custom escape sequences defined by `{{...}}`.
	 * Inside `{{...}}`, syntax-relevant characters are replaced with their internal escaped forms.
	 *
	 * @param {string} source The input string potentially containing escape sequences.
	 * @returns {string} The string with `{{...}}` sequences resolved to internal escape codes.
	 * @throws {string} An error if an escape sequence is improperly formatted (e.g., `{{` without `}}`).
	 */
	var handleEscapes = function(source) {
		while (true) {
			var esc_start = source.indexOf("{{");
			var esc_end = source.indexOf("}}");

			if (esc_start === -1) {
				break; // No more escape sequences found.
			}

			// Ensure the escape sequence is properly closed and in order.
			if (esc_end < esc_start) {
				throw ("escaped text without proper end. '}}' must occure in same line. '" + source.substring(esc_start) + "'");
			}

			// Split the string into three parts: before, inside, and after the escape sequence.
			var p1 = source.substring(0, esc_start);
			var p2 = bulkReplace(source.substring(esc_start + 2, esc_end), esc_replaces); // Apply bulk replacement to the content.
			var p3 = source.substring(esc_end + 2);

			// Reconstruct the source string with the escaped content.
			source = p1.concat(p2).concat(p3);
		}
		return source;
	};


	/**
	 * De-escapes a string by replacing internal escape codes (e.g., "%ESC_GT_%")
	 * back to their original syntax-relevant characters (e.g., ">").
	 *
	 * @param {string} source The string containing internal escape codes.
	 * @returns {string} The de-escaped string.
	 */
	var deEscape = function(source) {
		return bulkReplace(source, de_esc_replaces);
	};


	/**
	 * Parses a single arrow definition from a source string.
	 *
	 * @param {string} arrow_type The character indicating the type of arrow ("<", ">", or "-").
	 * @param {string} source_node_id The ID of the node from which this arrow originates.
	 * @param {string} source The raw string content of the arrow definition (excluding the initial arrow_type char).
	 * @param {boolean} require_targets If `true`, an error is thrown if no target nodes are specified.
	 * @returns {object} A hash containing details about the parsed arrow.
	 * @throws {string} An error if the arrow definition is malformed, especially regarding targets.
	 */
	var parseSingleArrow = function(arrow_type, source_node_id, source, require_targets) {
		source = trim(source); // Clean up whitespace.
		var original_source = source; // Keep for error reporting.

		// Check for highlighted arrow (e.g., ">>" instead of ">").
		var highlighted = false;
		if (source.charAt(0) === arrow_type) {
			highlighted = true;
			source = trim(source.substring(1)); // Remove the extra arrow character.
		}

		// Check for bidirectional arrow (e.g., "->" or "<->").
		var also_back = false;
		if ((arrow_type === "<" && source.charAt(0) === ">") || (arrow_type === ">" && source.charAt(0) === "<")) {
			also_back = true;
		}

		// Consume any remaining arrow characters from the start (e.g., multiple ">>>").
		while (source.charAt(0) === ">" || source.charAt(0) === "<") {
			source = source.substring(1);
		}
		source = trim(source); // Clean up again.

		var arrow_label = "";		// The text label for the arrow.
		var arrow_targets = [];	// IDs of nodes this arrow points to.

		if (require_targets) {
			var target_node_start = source.lastIndexOf("[");
			var target_node_end = source.lastIndexOf("]");

			if (target_node_start === -1) {
				throw "no targets for arrow '" + arrow_type + original_source + "'";
			}
			if (target_node_end < target_node_start) {
				throw "arrow definition not closed properly: " + original_source;
			}
			if (target_node_end != source.length - 1) {
				throw "don't know what to do with '" + source.substring(target_node_end + 1) + "' at end of an arrow definition '" + original_source + "'";
			}

			source = source.substring(0, target_node_end); // Remove the closing bracket.

			if (target_node_start != -1) {
				arrow_label = source.substring(0, target_node_start); // Label is before the targets.
				source = trim(source.substring(target_node_start + 1)); // Source becomes just the target list.
			}

			if (source.length === 0) {
				throw "no targets for arrow: " + arrow_type + original_source;
			}

			// Split target IDs by comma and trim each.
			arrow_targets = trim(source).split(",");
			for (var a_i = 0; a_i < arrow_targets.length; a_i++) {
				arrow_targets[a_i] = trim(arrow_targets[a_i]);
			}
		} else {
			arrow_label = source; // If no explicit targets, the whole remaining string is the label.
		}

		return {
			"type": arrow_type,
			"highlighted": highlighted,
			"also_back": also_back,
			"source_node": source_node_id,
			"target_nodes": arrow_targets,
			"label": arrow_label
		};
	};


	/**
	 * Parses a single node definition from a source string.
	 * This function specifically handles node properties (ID, class, title, subtitle)
	 * but *does not* parse internal arrows within the node definition.
	 * Use `parseArrowsInsideNode` for that purpose.
	 *
	 * @param {string} source The raw string content of the node definition (excluding the initial "(").
	 * @returns {object} A hash containing details about the parsed node.
	 */
	var parseNode = function(source) {

		// First, remove any internal arrow definitions from the source string
		// so that they don't interfere with node property parsing.

		// Similar logic also found in `parseArrowsInNode`.
		var search_for_arrows_offset = source.indexOf(":");
		if (search_for_arrows_offset == -1) {
			search_for_arrows_offset = 0; // If no colon, start search from the beginning.
		}

		// Find the first arrow starter *after* any potential ID/class definition.
		var inside_arrows_start = startPosOfNext(arrow_starter, source.substring(search_for_arrows_offset));
		if (inside_arrows_start) {
			// If internal arrows are found, truncate the source string before them.
			source = source.substring(0, inside_arrows_start[1] + search_for_arrows_offset);
		}

		// Check if the node is highlighted (e.g., "((NodeName))").
		var highlighted = source.charAt(0) === "(";
		if (highlighted) {
			source = trim(source.substring(1)); // Remove the extra parenthesis.
		}

		var node_id = "";			// Identifier for the node.
		var custom_class = "";		// Custom CSS class for the node.

		// Look for ID and custom class definition (e.g., "id:{class}").
		var id_end_pos = source.indexOf(":");
		if (id_end_pos != -1) {
			node_id = trim(source.substring(0, id_end_pos));

			var class_start = node_id.indexOf("{");
			var class_end = node_id.indexOf("}");

			// If a class definition is found (e.g., "myId{myClass}").
			if (class_start != -1 && class_end === (node_id.length - 1)) {
				custom_class = trim(node_id.substring(class_start + 1, class_end));
				node_id = trim(node_id.substring(0, class_start)); // The ID is before the class.
			}
			source = trim(source.substring(id_end_pos + 1)); // Remaining source is title/subtitle.
		}

		// If no explicit ID was provided, generate a unique one.
		if (node_id === "") {
			node_id = getUniqueId();
		}

		var node_title = "";		// Main title text of the node.
		var node_subtitle = "";	// Optional subtitle text.
		var is_dummy = false;		// Indicates if this is a placeholder node (no title/subtitle).

		if (source.length === 0) {
			is_dummy = true; // An empty node definition implies a dummy node.
		} else {
			var slash_index = source.indexOf("|"); // Check for subtitle separator.

			if (slash_index != -1) {
				node_title = trim(source.substring(0, slash_index));
				node_subtitle = trim(source.substring(slash_index + 1));
			} else {
				node_title = source; // No subtitle, entire remaining string is the title.
			}
		}

		return {
			"id": node_id,
			"highlighted": highlighted,
			"is_dummy": is_dummy,
			"custom_class": custom_class,
			"title": node_title,
			"subtitle": node_subtitle
		};
	};


	/**
	 * Determines the ending position of an element (node or arrow) within a source string,
	 * based on its starting character.
	 *
	 * @param {string} elem The starting character of the element (e.g., "(", "<", ">", "-").
	 * @param {string} source The string content following the element's starting character.
	 * @returns {number} The index within `source` where the element ends.
	 * @throws {string} An error if no end characters are defined for the given element type.
	 */
	var endposForElement = function(elem, source) {
		// Check if end characters are defined for this element type.
		if (ends_with[elem] === undefined || ends_with[elem].length === 0) {
			throw "no end characters for element starting with '" + elem + "'";
		}

		var endpos = -1; // Initialize end position as not found.

		// Iterate through all possible end characters for this element type.
		for (var i = 0; i < ends_with[elem].length; i++) {
			var pos = source.indexOf(ends_with[elem][i]); // Find the position of the current end character.

			// If found and it's earlier than any previous end position, update `endpos`.
			if (pos != -1 && (endpos === -1 || pos < endpos)) {
				endpos = pos;
			}
		}

		// If no explicit end character is found, the element extends to the end of the source string.
		return endpos != -1 ? endpos : source.length;
	};


	/**
	 * Calculates the squared Euclidean distance between two points (P1 and P2).
	 * Using squared distance avoids a square root calculation, which is often
	 * sufficient for comparisons (e.g., checking if one distance is greater than another).
	 *
	 * @param {number} p1x X-coordinate of the first point.
	 * @param {number} p1y Y-coordinate of the first point.
	 * @param {number} p2x X-coordinate of the second point.
	 * @param {number} p2y Y-coordinate of the second point.
	 * @returns {number} The squared distance between P1 and P2.
	 */
	var dist_sq = function(p1x, p1y, p2x, p2y) {
		var s1 = p1x - p2x;
		var s2 = p1y - p2y;

		return s1 * s1 + s2 * s2;
	};


	/**
	 * Calculates the intersection point of two lines.
	 * The lines are defined by two points each: (ax, ay)-(bx, by) and (ex, ey)-(fx, fy).
	 *
	 * @param {number} ax X-coordinate of the first point of line 1.
	 * @param {number} ay Y-coordinate of the first point of line 1.
	 * @param {number} bx X-coordinate of the second point of line 1.
	 * @param {number} by Y-coordinate of the second point of line 1.
	 * @param {number} ex X-coordinate of the first point of line 2.
	 * @param {number} ey Y-coordinate of the first point of line 2.
	 * @param {number} fx X-coordinate of the second point of line 2.
	 * @param {number} fy Y-coordinate of the second point of line 2.
	 * @param {boolean} as_seg If `true`, treats the lines as line segments and returns `null`
	 *                         if the intersection point falls outside either segment.
	 * @returns {Array<number, number>|null} An array `[x, y]` representing the intersection point,
	 *                                        or `null` if the lines are parallel or if `as_seg` is `true`
	 *                                        and the intersection is outside the segments.
	 */
	var line_intersection = function(ax, ay, bx, by, ex, ey, fx, fy, as_seg) {
		var ipx = 0; // Intersection point X.
		var ipy = 0; // Intersection point Y.

		var a1 = 0;
		var a2 = 0;
		var b1 = 0;
		var b2 = 0;
		var c1 = 0;
		var c2 = 0;

		// Calculate coefficients for the first line (A1x + B1y = C1).
		a1 = by - ay;
		b1 = ax - bx;
		c1 = bx * ay - ax * by;

		// Calculate coefficients for the second line (A2x + B2y = C2).
		a2 = fy - ey;
		b2 = ex - fx;
		c2 = fx * ey - ex * fy;

		// Calculate the determinant (denom). If zero, lines are parallel.
		var denom = a1 * b2 - a2 * b1;
		if (denom == 0) {
			return null;
		}

		// Calculate intersection point using Cramer's rule.
		ipx = (b1 * c2 - b2 * c1) / denom;
		ipy = (a2 * c1 - a1 * c2) / denom;

		if (as_seg) {
			// If treating as segments, check if intersection point lies within both segments.
			if (dist_sq(ipx, ipy, bx, by) > dist_sq(ax, ay, bx, by)) {
				return null;
			}
			if (dist_sq(ipx, ipy, ax, ay) > dist_sq(ax, ay, bx, by)) {
				return null;
			}

			if (dist_sq(ipx, ipy, fx, fy) > dist_sq(ex, ey, fx, fy)) {
				return null;
			}
			if (dist_sq(ipx, ipy, ex, ey) > dist_sq(ex, ey, fx, fy)) {
				return null;
			}
		}
		return [ipx, ipy];
	};


	/**
	 * Centers all child nodes vertically within their parent wrapper.
	 * This functionality is currently commented out or unused due to potential
	 * compatibility issues (e.g., jQuery WebKit bugs mentioned in original comments).
	 *
	 * @param {jQuery} wrapper The jQuery object representing the parent wrapper containing the nodes.
	 */
	var centerNodes = function(wrapper) {
		var max_height = 0; // Stores the maximum height found among children.

		// First pass: find the highest child element.
		var get_highest_children = function(ind, ch) {
			var current_height = $(ch).innerHeight();
			if (current_height > max_height) {
				max_height = current_height;
			}
		};

		// Second pass: apply margin-top to center children based on max_height.
		var place_centered = function(ind, ch) {
			var c = $(ch);
			var current_height = c.height();
			var current_margin = parseInt(c.css('marginTop'));

			// Calculate required top margin to center the element.
			c.css('marginTop', current_margin + Math.floor((max_height - current_height) / 2));
		};

		wrapper.children().each(get_highest_children).each(place_centered);
	};


	/**
	 * Renders the HTML structure for the graph and draws arrows between the nodes.
	 * This is the main rendering function.
	 *
	 * @param {jQuery} outer_wrapper The jQuery object representing the external HTML element
	 *                                that will contain the entire graph. This is crucial for
	 *                                correctly identifying nodes by their IDs within the DOM.
	 * @param {object} struct A hash containing the parsed `nodes` and `arrows` arrays.
	 */
	var drawStructure = function(outer_wrapper, struct) {
		try {
			var nodes = struct["nodes"];
			var arrows = struct["arrows"];

			var node_positions = {}; // Will store the calculated positions of each node.

			// NODELINES - The code for rendering node lines would typically follow here.
			// ...
		} catch (e) {
			// Error handling for the drawing process.
			console.error("Error drawing structure:", e);
		}
	};
})(jQuery);

/*
 * Utility functions for string manipulation and array operations.
 */


// --- Helper Functions ---

/**
 * Removes leading and trailing whitespace from a string.
 *
 * @param {string} val The input string.
 * @returns {string} The trimmed string.
 */
var trim = function(val) {
	return val.replace(/^\s+|\s+$/g, "");
};


/**
 * Performs multiple string replacements in a single pass.
 *
 * @param {string} str The input string.
 * @param {Array<string>} replaces An array of [search1, replace1, search2, replace2, ...] pairs.
 * @returns {string} The string after all replacements have been applied.
 */
var bulkReplace = function(str, replaces) {
	for (var i = 0; i < replaces.length; i += 2) {
		str = str.replace(new RegExp(replaces[i], 'g'), replaces[i + 1]);
	}
	return str;
};