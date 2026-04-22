/*
 *****************************************************************************
 *                                                                           *
 *                 Copyright (c) 2010 Maxim Vasiliev                         *
 *                                                                           *
 * Permission is hereby granted, free of charge, to any person obtaining a   *
 * copy of this software and associated documentation files (the "Software"),*
 * to deal in the Software without restriction, including without limitation *
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,  *
 * and/or sell copies of the Software, and to permit persons to whom the     *
 * Software is furnished to do so, subject to the following conditions:      *
 *                                                                           *
 * The above copyright notice and this permission notice shall be included   *
 * in all copies or substantial portions of the Software.                    *
 *                                                                           *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   *
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,*
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL   *
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER*
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING   *
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER       *
 * DEALINGS IN THE SOFTWARE.                                                 *
 *                                                                           *
 * @author Maxim Vasiliev                                                    *
 * Date: 2010-09-09                                                          *
 * Time: 19:02:33 (original creation time)                                   *
 *                                                                           *
 *****************************************************************************
 */


var form2js = (function()
{
	// Strict mode for cleaner code and error prevention.
	"use strict";

	/**
	 * Transforms HTML form elements into a JavaScript object.
	 * The 'name' attribute of form fields dictates the structure of the resulting object.
	 *
	 * @param {Element|String|Array<Element|String>} rootNode The root form element(s) or its ID.
	 * @param {String} delimiter The string used to separate parts of a name for nested objects (defaults to '.').
	 * @param {Boolean} skipEmpty If true, skips form fields with empty text values (defaults to true).
	 * @param {Function} nodeCallback An optional custom function to get a node's value.
	 * @param {Boolean} useIdIfEmptyName If true, uses the 'id' attribute as the name if 'name' is empty.
	 * @returns {Object} A JavaScript object representing the form's data.
	 */
	function form2js ( rootNode, delimiter, skipEmpty, nodeCallback, useIdIfEmptyName )
	{
		// Set default values for optional parameters if they are undefined or null.
		if ( typeof skipEmpty == 'undefined' || skipEmpty == null ) {
			skipEmpty = true;
		}

		if ( typeof delimiter == 'undefined' || delimiter == null ) {
			delimiter = '.';
		}

		// useIdIfEmptyName is false by default unless explicitly provided.
		if ( arguments.length < 5 ) {
			useIdIfEmptyName = false;
		}


		// Resolve rootNode if it's a string ID.
		if ( typeof rootNode == 'string' ) {
			rootNode = document.getElementById( rootNode );
		}


		var formValues = [], // Array to hold {name, value} pairs from form fields.
			currNode,        // Current node being processed in a loop.
			i = 0;           // Loop counter.


		/* If rootNode is an array-like structure (e.g., NodeList),
		 * concatenate values from all contained elements. */
		if ( rootNode.constructor == Array || ( typeof NodeList != "undefined" && rootNode.constructor == NodeList ) )
		{
			// Iterate through each node in the array/NodeList.
			while ( ( currNode = rootNode[i++] ) )
			{
				// Collect form values from the current node and add them to the main array.
				formValues = formValues.concat( getFormValues( currNode, nodeCallback, useIdIfEmptyName ) );
			}
		}
		else // Otherwise, process a single root node.
		{
			formValues = getFormValues( rootNode, nodeCallback, useIdIfEmptyName );
		}

		// Finally, process the collected name-value pairs into the desired object structure.
		return processNameValues( formValues, skipEmpty, delimiter );
	}

	/**
	 * Processes a collection of { name: 'field_name', value: 'field_value' } objects
	 * and transforms them into a structured JavaScript object.
	 *
	 * @param {Array<Object>} nameValues An array of objects, each containing 'name' and 'value' properties.
	 * @param {boolean} skipEmpty If true, elements with an empty string or null value are skipped.
	 * @param {string} delimiter The character used to denote nested object properties in field names.
	 * @returns {Object} The resulting JavaScript object.
	 */
	function processNameValues ( nameValues, skipEmpty, delimiter )
	{
		var result = {}; // The final object to be returned.
		var arrays = {}; // Helper object to manage array elements by their full name and index.

		var i, j, k, l; // Loop counters.

		var value;       // Current field's value.
		var nameParts;   // Array of name segments after splitting by delimiter.
		var currResult;  // Reference to the current level of the result object being built.
		var arrNameFull; // Full name of an array, including indices, for unique identification.
		var arrName;     // Base name of an array (e.g., "items" from "items[0]").
		var arrIdx;      // Index of an array element.
		var namePart;    // Current segment of the field name being processed.
		var name;        // Original field name.
		var _nameParts;  // Temporary array for initial split of name.


		// Iterate over each name-value pair collected from the form.
		for ( i = 0; i < nameValues.length; i++ )
		{
			value = nameValues[i].value;

			// Skip if value is empty and skipEmpty is true.
			if ( skipEmpty && ( value === '' || value === null ) ) {
				continue;
			}

			name = nameValues[i].name;
			_nameParts = name.split( delimiter ); // Split the name by the delimiter.
			nameParts = [];                       // Initialize the final name parts array.
			currResult = result;                  // Start from the root of the result object.
			arrNameFull = '';                     // Reset array full name for current field.

			// Process each segment of the name to handle array notation like `field[idx]` or `field[][prop]`.
			for( j = 0; j < _nameParts.length; j++ )
			{
				namePart = _nameParts[j].split( '][' ); // Check for bracket notation within a segment.

				if ( namePart.length > 1 ) // If brackets were found (e.g., 'arr[0][prop]').
				{
					for( k = 0; k < namePart.length; k++ )
					{
						// Reconstruct the bracket notation correctly.
						if ( k == 0 ) {
							namePart[k] = namePart[k] + ']';
						}
						else if ( k == namePart.length - 1 ) {
							namePart[k] = '[' + namePart[k];
						}
						else {
							namePart[k] = '[' + namePart[k] + ']';
						}

						// Extract array name and index from the reconstructed part.
						arrIdx = namePart[k].match( /([a-z_]+)?\[([a-z_][a-z0-9_]+?)\]/i );
						if ( arrIdx )
						{
							for( l = 1; l < arrIdx.length; l++ )
							{
								if ( arrIdx[l] ) {
									nameParts.push( arrIdx[l] ); // Push non-null matches.
								}
							}
						}
						else {
							nameParts.push( namePart[k] ); // If no array index, just push the part.
						}
					}
				}
				else {
					nameParts = nameParts.concat( namePart ); // No brackets, just add the segment.
				}
			}

			// Now, iterate through the final processed name parts to build the object structure.
			for ( j = 0; j < nameParts.length; j++ )
			{
				namePart = nameParts[j]; // The current segment of the field name.

				// Handle array notation for elements with `[]` at the end (e.g., `items[]`).
				if ( namePart.indexOf( '[]' ) > -1 && j == nameParts.length - 1 )
				{
					arrName = namePart.substr( 0, namePart.indexOf( '[' ) ); // Get the base array name.
					arrNameFull += arrName; // Append to the full array name identifier.

					if ( !currResult[arrName] ) {
						currResult[arrName] = []; // Initialize array if it doesn't exist.
					}
					currResult[arrName].push( value ); // Push the value to the array.
				}
				// Handle array notation with specific indices (e.g., `items[0]`).
				else if ( namePart.indexOf( '[' ) > -1 )
				{
					arrName = namePart.substr( 0, namePart.indexOf( '[' ) ); // Get base array name.
					// Extract array index, removing surrounding brackets and optional base name.
					arrIdx = namePart.replace( /(^([a-z_]+)?\[)|(\]$)/gi, '' );

					/* Create a unique identifier for the array and its index path. */
					arrNameFull += '_' + arrName + '_' + arrIdx;

					/*
					 * Because `arrIdx` in field name can be non-zero-based and step can be
					 * other than 1, we cannot use them directly as array indices.
					 * Instead, we use a hash map (`arrays`) where the key is `arrIdx`
					 * and the value is a reference to the actual array element.
					 */

					if ( !arrays[arrNameFull] ) {
						arrays[arrNameFull] = {}; // Initialize a map for this specific array path.
					}
					if ( arrName != '' && !currResult[arrName] ) {
						currResult[arrName] = []; // Initialize the array in the result object if needed.
					}

					if ( j == nameParts.length - 1 ) // If this is the last part of the name (the value itself).
					{
						if ( arrName == '' ) // If array name is empty (e.g., `[0]`, `[1]`).
						{
							currResult.push( value ); // Push to the current result (which should be an array).
							arrays[arrNameFull][arrIdx] = currResult[currResult.length - 1]; // Store reference.
						}
						else // If array has a name (e.g., `items[0]`).
						{
							currResult[arrName].push( value ); // Push to the named array.
							arrays[arrNameFull][arrIdx] = currResult[arrName][currResult[arrName].length - 1]; // Store reference.
						}
					}
					else // If there are more parts after this (i.e., nested objects/arrays).
					{
						if ( !arrays[arrNameFull][arrIdx] ) // If this specific indexed element hasn't been created yet.
						{
							// Determine if the next part is an array or object.
							if ( ( /^[a-z_]+\[?/i ).test( nameParts[j+1] ) ) {
								currResult[arrName].push( {} ); // Push an object if next part implies it.
							}
							else {
								currResult[arrName].push( [] ); // Push an array if next part implies it.
							}

							arrays[arrNameFull][arrIdx] = currResult[arrName][currResult[arrName].length - 1]; // Store reference.
						}
					}

					currResult = arrays[arrNameFull][arrIdx]; // Move to the newly created/referenced array element.
				}
				else // Standard object property (no array notation).
				{
					arrNameFull += namePart; // Append to the full name for unique path tracking.

					if ( j < nameParts.length - 1 ) /* Not the last part of name - implies a nested object */
					{
						if ( !currResult[namePart] ) {
							currResult[namePart] = {}; // Create an object if it doesn't exist.
						}
						currResult = currResult[namePart]; // Move to the nested object.
					}
					else // This is the last part, assign the value.
					{
						currResult[namePart] = value;
					}
				}
			}
		}

		return result; // Return the fully constructed object.
	}

    /**
     * Recursively extracts values from a given DOM node and its children.
     *
     * @param {Element} rootNode The DOM element to start extraction from.
     * @param {Function} nodeCallback Optional callback function for custom node value extraction.
     * @param {boolean} useIdIfEmptyName Flag to use ID if name is empty.
     * @returns {Array<Object>} An array of {name, value} objects.
     */
    function getFormValues( rootNode, nodeCallback, useIdIfEmptyName )
    {
        // First, try to extract values directly from the rootNode itself.
        var result = extractNodeValues( rootNode, nodeCallback, useIdIfEmptyName );

        // If no values were extracted from the rootNode itself,
        // then recursively get values from its sub-elements.
        return result.length > 0 ? result : getSubFormValues( rootNode, nodeCallback, useIdIfEmptyName );
    }

    /**
     * Iterates through child nodes of a given root node and collects form values.
     *
     * @param {Element} rootNode The parent DOM element whose children will be processed.
     * @param {Function} nodeCallback Optional custom callback for node value.
     * @param {boolean} useIdIfEmptyName Flag to use ID if name is empty.
     * @returns {Array<Object>} An array of collected {name, value} objects.
     */
    function getSubFormValues( rootNode, nodeCallback, useIdIfEmptyName )
	{
		var result = []; // Initialize an empty array to store collected values.
		var currentNode = rootNode.firstChild; // Start with the first child of the rootNode.
		
		// Loop through all sibling nodes.
		while ( currentNode )
		{
			// Recursively extract values from the currentNode and its descendants, then concatenate.
			result = result.concat( extractNodeValues( currentNode, nodeCallback, useIdIfEmptyName ) );
			currentNode = currentNode.nextSibling; // Move to the next sibling.
		}

		return result; // Return the combined results.
	}

    /**
     * Extracts the value from a single DOM node if it's an input, textarea, or select element.
     * Calls itself recursively for child nodes if the current node is not a form field.
     *
     * @param {Element} node The DOM element to extract value from.
     * @param {Function} nodeCallback Optional callback function for custom node value extraction.
     * @param {boolean} useIdIfEmptyName Flag to use ID if name is empty.
     * @returns {Array<Object>} An array containing a single {name, value} object or an empty array.
     */
    function extractNodeValues( node, nodeCallback, useIdIfEmptyName ) {
        var callbackResult; // Result from the optional nodeCallback.
        var fieldValue;     // The extracted value of the field.
        var result;         // The array to return.
        var fieldName = getFieldName( node, useIdIfEmptyName ); // Get the name for the current field.

        // If a custom callback is provided and returns a valid name-value pair, use it.
        callbackResult = nodeCallback && nodeCallback( node );

        if ( callbackResult && callbackResult.name ) {
            result = [ callbackResult ];
        }
        // If it's an INPUT or TEXTAREA with a valid name.
        else if ( fieldName != '' && node.nodeName.match( /INPUT|TEXTAREA/i ) ) {
            fieldValue = getFieldValue( node );
			result = [ { name: fieldName, value: fieldValue } ];
        }
        // If it's a SELECT element with a valid name.
        else if ( fieldName != '' && node.nodeName.match( /SELECT/i ) ) {
	        fieldValue = getFieldValue( node );
	        // For SELECT, remove `[]` if present, as select values are not typically treated as arrays directly.
	        result = [ { name: fieldName.replace( /\[\]$/, '' ), value: fieldValue } ];
        }
        // If the node is not a direct form field, recursively get values from its children.
        else {
            result = getSubFormValues( node, nodeCallback, useIdIfEmptyName );
        }

        return result;
    }

	/**
	 * Determines the effective name of a form field.
	 * Prioritizes the 'name' attribute, then 'id' if `useIdIfEmptyName` is true.
	 *
	 * @param {Element} node The DOM element (form field).
	 * @param {boolean} useIdIfEmptyName If true, will use the element's ID if its name is empty.
	 * @returns {string} The determined field name, or an empty string if none found.
	 */
	function getFieldName( node, useIdIfEmptyName )
	{
		if ( node.name && node.name != '' ) {
			return node.name; // Return the 'name' attribute if it exists and is not empty.
		}
		else if ( useIdIfEmptyName && node.id && node.id != '' ) {
			return node.id; // Return the 'id' attribute if useIdIfEmptyName is true and 'id' exists.
		}
		else {
			return ''; // Return an empty string if no suitable name is found.
		}
	}


	/**
	 * Retrieves the value of a single form field node.
	 * Handles different input types and select elements.
	 *
	 * @param {Element} fieldNode The DOM element of the form field.
	 * @returns {*} The value of the field, or null if disabled or unhandled type.
	 */
	function getFieldValue( fieldNode )
	{
		// If the field is disabled, its value should not be submitted.
		if ( fieldNode.disabled ) {
			return null;
		}
		
		switch ( fieldNode.nodeName ) {
			case 'INPUT':
			case 'TEXTAREA':
				switch ( fieldNode.type.toLowerCase() ) {
					case 'radio':
					case 'checkbox':
                        // Special handling for boolean values (e.g., "true" string).
                        if ( fieldNode.checked && fieldNode.value === "true" ) {
							return true;
						}
                        if ( !fieldNode.checked && fieldNode.value === "true" ) {
							return false;
						}
						// For other checkbox/radio values, return value if checked.
						if ( fieldNode.checked ) {
							return fieldNode.value;
						}
						// If not checked, fall through to default (or return undefined/null based on behavior).
						break;

					case 'button':
					case 'reset':
					case 'submit':
					case 'image':
						// Buttons typically don't contribute values to the data object.
						return '';
						// break; // No break needed after return.

					default:
						// For text, password, hidden, etc., return the value property.
						return fieldNode.value;
						// break; // No break needed after return.
				}
				break;

			case 'SELECT':
				// Handle select elements, including multi-selects.
				return getSelectedOptionValue( fieldNode );
				// break; // No break needed after return.

			default:
				// For any other unexpected node types, do nothing specific.
				break;
		}

		// If no value was determined by the switch statement, return null.
		return null;
	}

	/**
	 * Retrieves the selected value(s) from a <select> element.
	 * Handles both single and multiple selection types.
	 *
	 * @param {HTMLSelectElement} selectNode The <select> DOM element.
	 * @returns {string|Array<string>} The selected value(s).
	 */
	function getSelectedOptionValue( selectNode )
	{
		var multiple = selectNode.multiple; // Check if it's a multi-select.
		var result = [];                   // Array to hold multiple selected values.
		var options;                       // Reference to the option elements.
		var i, l;                          // Loop counters.

		// If it's a single-select, just return its value property.
		if ( !multiple ) {
			return selectNode.value;
		}

		// For multi-select, iterate through all options and collect selected ones.
		options = selectNode.getElementsByTagName( "option" );
		for ( i = 0, l = options.length; i < l; i++ )
		{
			if ( options[i].selected ) {
				result.push( options[i].value ); // Add value of selected option to result array.
			}
		}

		return result; // Return the array of selected values.
	}

	// Expose the main form2js function.
	return form2js;

})(); // Immediately-invoked function expression ends here.