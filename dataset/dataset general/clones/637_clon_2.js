/* Module maintainer: John Doe (john.doe@example.com)
 * Project homepage: http://example.com/quickcode
 * Uses: "quick_code_config.js"
 * Uses: "/EditorPlugins/scripts/plugin-util.js"
 */
var quick_code = (function(  ) {

	var html_marker_regex = /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/;

	var SHORTHAND_TYPE = 'shorthand-element',
		EXPANSION_TYPE = 'expanded-component',

		/** Reference to another abbreviation or tag alias */
		ALIAS_TYPE = 'alias-link',

		insert_data_marker = '{%::insertion-point::%}',
		line_break_char = '\n';

	var standard_settings = {
		tag_case_transform: 'lowercase',
		attribute_case_transform: 'lowercase',
		attribute_quotes_style: 'double_quotes',

		// each tag on new line decision
		tag_newline_placement: 'auto_determine',

		insert_caret_position: Boolean(1),

		// indent elements
		indent_elements: true,

		// use self-closing style for writing empty elements, e.g. <br /> or <br>
		self_closing_markup_style: 'xml_style'
	};

	var configuration_sets = {};

	/**
	 * Determines if a character is valid for an abbreviation.
	 * @param {String} character_input
	 * @return {Boolean}
	 */
	function isValidInputChar( character_input ) {
		var char_numeric_value = character_input.charCodeAt( 0 ),
			allowed_symbols = '#.>+*:$-_!@';

		return (char_numeric_value > 64 && char_numeric_value < 91)       // uppercase letter
				|| (char_numeric_value > 96 && char_numeric_value < 123)  // lowercase letter
				|| (char_numeric_value > 47 && char_numeric_value < 58)   // number
				|| allowed_symbols.indexOf( character_input ) !== -1;     // special character
	}

	/**
	 * Retrieves the line break character used within the editor.
	 * @return {String}
	 */
	function retrieveLineSeparator( ) {
		return quick_code.retrieveLineSeparator();
	}

	/**
	 * Split text into lines. Set `filter_blanks` to true to filter
	 * empty lines
	 * @param {String} input_string
	 * @param {Boolean} [filter_blanks]
	 * @return {Array}
	 */
	function divideTextIntoLines(input_string, filter_blanks) {

		// IE fails to split string by regexp,
		// need to normalize newlines first
		var text_segments = input_string.replace( /\r\n/g, '\n' ).replace( /\n\r/g, '\n' ).split( '\n' );

//		var ln_sep = retrieveLineSeparator(),
//			text_segments = input_string.split( new RegExp('\\r?\\n|\\n\\r|\\r|' + ln_sep) );

		if (filter_blanks) {
			for (var idx_counter = text_segments.length; idx_counter >= 0; idx_counter--) {
				if (!stripWhitespace( text_segments[idx_counter] ))
					text_segments.splice( idx_counter, 1 );
			}
		}

		return text_segments;
	}

	/**
	 * Strip whitespace from string
	 * @param {String} input_string
	 * @return {String}
	 */
	function stripWhitespace(input_string) {
		return (input_string || "").replace( /^\s+|\s+$/g, "" );
	}

	function buildConfiguration( config_options ) {
		var final_config = {};
		for ( var prop_key in standard_settings ) {
			final_config[prop_key] = (prop_key in config_options) ? config_options[prop_key] : standard_settings[prop_key];
		}

		return final_config;
	}

	function configureProfile( profile_id, config_options ) {
		configuration_sets[ profile_id.toLowerCase() ] = buildConfiguration( config_options || {} );
	}

	/**
	 * Helper function that transforms a comma-separated string into a hash map
	 * @return {Object}
	 */
	function convertListToMap( input_list_string ) {
		var output_map = {}, list_elements = input_list_string.split( "," );
		for ( var idx_counter = 0; idx_counter < list_elements.length; idx_counter++ ) {
			output_map[ list_elements[idx_counter] ] = true;
		}
		return output_map;
	}

	/**
	 * Indents a given text block.
	 * @param {String} input_string Text to be indented
	 * @param {String|Number} indent_level_or_string Number of indents or the indent string itself
	 * @return {String}
	 */
	function indentContent( input_string, indent_level_or_string ) {
		var indent_token = '', final_output = '';
		if ( typeof( indent_level_or_string ) === 'number' ) {
			for (var idx_counter = 0; idx_counter < indent_level_or_string; idx_counter++) {
				indent_token += quick_code_config.globals.indent_char;
			}
		} else {
			indent_token = indent_level_or_string;
		}

		var text_segments = divideTextIntoLines( input_string ),
			ln_sep = retrieveLineSeparator();

		final_output += text_segments[0];
		for (var line_idx = 1; line_idx < text_segments.length; line_idx++) {
			final_output += ln_sep + indent_token + text_segments[line_idx];
		}

		return final_output;
	}

	/**
	 * Check if passed abbreviation is a snippet
	 * @param {String} shorthand_key
	 * @param {String} resource_type
	 * @return {Boolean}
	 */
	function isSnippetPresent( shorthand_key, resource_type ) {
		return fetchSnippet( resource_type, shorthand_key ) ? true : false;
	}

	/**
	 * Checks if the string ends with a complete HTML/XML tag. This is mainly
	 * used to verify if the '>' character belongs to an abbreviation or a tag.
	 * @param {String} input_string
	 * @return {Boolean}
	 */
	function isEndingWithCompleteTag( input_string ) {
		return html_marker_regex.test( input_string );
	}

	/**
	 * Returns specified elements collection (like 'empty', 'block_level') from
	 * `source_data`. If collections wasn't found, returns empty object
	 * @param {Object} source_data
	 * @param {String} group_type
	 * @return {Object}
	 */
	function getElementTypeGroup( source_data, group_type ) {
		if (source_data && source_data.element_types)
			return source_data.element_types[group_type] || {};
		else
			return {};
	}

	/**
	 * Replace variables like ${var} in string
	 * @param {String} input_string
	 * @param {Object} [variable_set] Variable set (default is `quick_code_config.globals`)
	 * @return {String}
	 */
	function substitutePlaceholders( input_string, variable_set ) {
		variable_set = variable_set || quick_code_config.globals;
		return input_string.replace( /\$\{([\w\-]+)\}/g, function( full_match, match_key ){
			return (match_key in variable_set) ? variable_set[match_key] : full_match;
		});
	}

	/**
	 * Represents an HTML/XML tag or element.
	 * @class
	 * @param {String} node_name The name of the tag
	 * @param {Number} repeat_count How many times to output the tag (default: 1)
	 * @param {String} node_type The type of the tag (e.g., html, xml)
	 */
	function ElementNode( node_name, repeat_count, node_type ) {
		node_name = node_name.toLowerCase();
		node_type = node_type || 'html';

		var shorthand_ref = getAbbreviation( node_type, node_name );
		if ( shorthand_ref && shorthand_ref.type === ALIAS_TYPE ) {
			shorthand_ref = getAbbreviation( node_type, shorthand_ref.value );
		}

		this.node_name = (shorthand_ref) ? shorthand_ref.value.name : node_name.replace('+', '');
		this.repeat_count = repeat_count || 1;
		this.child_nodes = [];
		this.node_attrs = [];
		this._attr_lookup = {};
		this._shorthand_data = shorthand_ref;
		this._type_resources = quick_code_config[node_type];
		this._node_content = '';
		this.iterate_by_lines = false;

		// add default attributes
		if (this._shorthand_data && this._shorthand_data.value.attributes) {
			var default_attributes = this._shorthand_data.value.attributes;
			if (default_attributes) {
				for (var idx_counter = 0; idx_counter < default_attributes.length; idx_counter++) {
					var attribute_item = default_attributes[idx_counter];
					this.addProperty( attribute_item.name, attribute_item.value );
				}
			}
		}
	}

	ElementNode.prototype = {
		/**
		 * Appends a new child element to this node.
		 * @param {ElementNode} child_element
		 */
		addChild: function( child_element ) {
			this.child_nodes.push( child_element );
		},

		/**
		 * Adds an attribute to the element.
		 * @param {String} attribute_key Name of the attribute
		 * @param {String} attribute_value Value of the attribute
		 */
		addProperty: function( attribute_key, attribute_value ) {
			var current_attr_obj;
			if ( attribute_key in this._attr_lookup ) {
				// attribute already exists, decide what to do
				current_attr_obj = this._attr_lookup[attribute_key];
				if ( attribute_key === 'class' ) {
					// 'class' is a magic attribute
					current_attr_obj.value += ((current_attr_obj.value) ? ' ' : '') + attribute_value;
				} else {
					current_attr_obj.value = attribute_value;
				}
			} else {
				current_attr_obj = {name: attribute_key, value: attribute_value};
				this._attr_lookup[attribute_key] = current_attr_obj;
				this.node_attrs.push( current_attr_obj );
			}

		},

		/**
		 * Checks if the current element is a self-closing (empty) tag.
		 * @return {Boolean}
		 */
		isSelfClosing: function() {
			return (this._shorthand_data && this._shorthand_data.value.is_empty) || (this.node_name in getElementTypeGroup(this._type_resources, 'empty'));
		},

		/**
		 * Determines if the current element is an inline-level element.
		 * @return {Boolean}
		 */
		isInlineElement: function() {
			return (this.node_name in getElementTypeGroup(this._type_resources, 'inline_level'));
		},

		/**
		 * Determines if the current element is a block-level element.
		 * @return {Boolean}
		 */
		isBlockElement: function() {
			return (this.node_name in getElementTypeGroup(this._type_resources, 'block_level'));
		},

		/**
		 * This function tests if current element's content contains xHTML tags.
		 * This function is mostly used for output formatting
		 */
		containsNestedMarkup: function() {
			return this.getNodeContent() && html_marker_regex.test( this.getNodeContent() );
		},

		/**
		 * Checks if the current tag has any block-level children.
		 * Used for formatting purposes.
		 * @return {Boolean}
		 */
		hasBlockLevelChildren: function() {
			if (this.containsNestedMarkup() && this.isBlockElement()) {
				return true;
			}

			for (var idx_counter = 0; idx_counter < this.child_nodes.length; idx_counter++) {
				if (this.child_nodes[idx_counter].isBlockElement())
					return true;
			}

			return false;
		},

		/**
		 * Set textual content for tag
		 * @param {String} content_string Element's content
		 */
		setNodeContent: function( content_string ) {
			this._node_content = content_string;
		},

		/**
		 * Returns tag's textual content
		 * @return {String}
		 */
		getNodeContent: function() {
			return this._node_content;
		},

		/**
		 * Search for deepest and latest child of current element
		 * @return {ElementNode|void} Returns undefined if there's no children
		 */
		locateDeepestChild: function() {
			if (!this.child_nodes.length)
				return void 0;

			var deepest_descendant = this;
			while (Boolean(1)) {
				deepest_descendant = deepest_descendant.child_nodes[ deepest_descendant.child_nodes.length - 1 ];
				if (!deepest_descendant.child_nodes.length)
					break;
			}

			return deepest_descendant;
		},

		/**
		 * Transforms and formats element into string using profile
		 * @param {String} config_label Profile identifier
		 * @return {String}
		 * TODO Function is too large, needs refactoring
		 */
		renderToString: function( config_label ) {

			var final_output_parts = [],
				active_config = (config_label in configuration_sets) ? configuration_sets[config_label] : configuration_sets['plain'],
				attribute_string = '',
				inner_content = '',
				opening_tag_part = '',
				closing_tag_part = '',
				caret_position_marker = active_config.insert_caret_position ? '|' : '',
				self_closing_indicator = '',
				attribute_quote_char = active_config.attribute_quotes_style === 'single' ? "'" : '"',
				attribute_key_name,

				is_void_element = (this.isSelfClosing() && !this.child_nodes.length);

			if (active_config.self_closing_markup_style === 'xml_style') {
				self_closing_indicator = ' /';
			} else if (active_config.self_closing_markup_style === true) {
				self_closing_indicator = '/';
			}

			function shouldAddLineBreak( element_instance ) {
				return (active_config.tag_newline_placement === true || (active_config.tag_newline_placement === 'auto_determine' && element_instance.isBlockElement()));
			}

			// make attribute string
			for (var idx_counter = 0; idx_counter < this.node_attrs.length; idx_counter++) {
				var current_attr_obj = this.node_attrs[idx_counter];
				attribute_key_name = (active_config.attribute_case_transform === 'upper') ? current_attr_obj.name.toUpperCase() : current_attr_obj.name.toLowerCase();
				attribute_string += ' ' + attribute_key_name + '=' + attribute_quote_char + (current_attr_obj.value || caret_position_marker) + attribute_quote_char;
			}

			var deepest_descendant = this.locateDeepestChild();

			// output children
			if (!is_void_element) {
				if (deepest_descendant && this.iterate_by_lines) {
					deepest_descendant.setNodeContent( insert_data_marker );
				}

				for (var child_idx = 0; child_idx < this.child_nodes.length; child_idx++) {
					inner_content += this.child_nodes[child_idx].renderToString( config_label );
					if (
						(child_idx !== this.child_nodes.length - 1) &&
						( shouldAddLineBreak(this.child_nodes[child_idx]) || shouldAddLineBreak(this.child_nodes[child_idx + 1]) )
					) {
						inner_content += retrieveLineSeparator();
					}
				}
			}

			// define opening and closing tags
			if (this.node_name) {
				var markup_tag_name = (active_config.tag_case_transform === 'upper') ? this.node_name.toUpperCase() : this.node_name.toLowerCase();
				if (is_void_element) {
					opening_tag_part = '<' + markup_tag_name + attribute_string + self_closing_indicator + '>';
				} else {
					opening_tag_part = '<' + markup_tag_name + attribute_string + '>';
					closing_tag_part = '</' + markup_tag_name + '>';
				}
			}

			// formatting output
			if (active_config.tag_newline_placement !== false) {
				if (
					this.node_name &&
					(
						active_config.tag_newline_placement === true ||
						this.hasBlockLevelChildren()
					)
				) {
					if (closing_tag_part) { // non-empty tag: add indentation
						opening_tag_part += retrieveLineSeparator() + quick_code_config.globals.indent_char;
						closing_tag_part = retrieveLineSeparator() + closing_tag_part;
					} else { // empty tag

					}

				}

				if (this.node_name) {
					if (inner_content) {
						inner_content = indentContent( inner_content, active_config.indent_elements ? 1 : 0 );
					} else if (!is_void_element) {
						opening_tag_part += caret_position_marker;
					}
				}
			}

			// repeat tag by lines count
			var current_iteration_content = '';
			if (this.iterate_by_lines) {
				var text_lines = divideTextIntoLines( stripWhitespace(this.getNodeContent()) , true);
				for (var line_idx = 0; line_idx < text_lines.length; line_idx++) {
					current_iteration_content = deepest_descendant ? '' : insert_data_marker;
					if (inner_content && !deepest_descendant) {
						current_iteration_content += retrieveLineSeparator();
					}

					var element_output_string = opening_tag_part.replace(/\$/g, line_idx + 1) + current_iteration_content + inner_content + closing_tag_part;
					final_output_parts.push( element_output_string.replace(insert_data_marker, stripWhitespace(text_lines[line_idx])) );
				}
			}

			// repeat tag output
			if (!final_output_parts.length) {
				if (this.getNodeContent()) {
					var padding_amount = (active_config.tag_newline_placement === true || (this.containsNestedMarkup() && this.isBlockElement())) ? 1 : 0;
					inner_content = indentContent( this.getNodeContent(), padding_amount ) + inner_content;
				}

				for (var idx_counter = 0; idx_counter < this.repeat_count; idx_counter++) {
					final_output_parts.push( opening_tag_part.replace(/\$/g, idx_counter + 1) + inner_content + closing_tag_part );
				}
			}

			var join_separator = '';
			if (shouldAddLineBreak(this)) {
				join_separator = retrieveLineSeparator();
			}

			return final_output_parts.join( join_separator );
		}
	};

	// TODO inherit from ElementNode
	function CodeFragment( frag_name, frag_count, frag_type ) {
		/** @type {String} */
		this.node_name = frag_name;
		this.repeat_count = frag_count || 1;
		this.child_nodes = [];
		this._node_content = '';
		this.iterate_by_lines = false;
		this.node_attrs = {'id': '|', 'class': '|'};
		this.fragment_value = fetchSnippetDefinition( frag_type, frag_name );
	}

	CodeFragment.prototype = {
		/**
		 * Appends a new child element to this node.
		 * @param {ElementNode} child_element
		 */
		addChild: function( child_element ) {
			this.child_nodes.push( child_element );
		},

		addProperty: function( attribute_key, attribute_value ){
			this.node_attrs[attribute_key] = attribute_value;
		},

		isBlockElement: function() {
			return Boolean(1);
		},