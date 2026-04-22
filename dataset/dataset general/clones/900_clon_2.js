var dataAccessLayer = obtainModule('mongoose');

function formatSingleDigit(numericInput) { // Helper to add leading zero for numbers less than 10
	return numericInput < 10 ? '0' + numericInput : numericInput;
}

var controlCharPattern = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	specialCharEscapePattern = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	currentDepthIndentation, // Stores the current indentation string
	indentationString,       // The string representing a single level of indentation
	charEscapeMap = {        // Maps special characters to their escaped representations
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	},
	customSerializationFunction; // An optional function to modify values during serialization

function wrapAndEscapeString(targetString) { // Encloses a string in quotes and escapes internal characters
	specialCharEscapePattern.lastIndex = 0;
	return specialCharEscapePattern.test(targetString) ?
		'"' + targetString.replace(specialCharEscapePattern, function (matchedCharacter) {
			var replacementValue = charEscapeMap[matchedCharacter];
			return typeof replacementValue === 'string' ?
				replacementValue :
				'\\u' + ('0000' + matchedCharacter.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' :
		'"' + targetString + '"';
}

function processValueForSerialization(currentPropertyKey, containingObject) { // Recursively serializes object properties or array elements
	var loopIndex,
		propertyIdentifier,
		serializedSegment,
		itemCount,
		parentIndentation = currentDepthIndentation,
		segmentCollection,
		itemToProcess = containingObject[currentPropertyKey];

	// Special handling for specific data types from the data access layer
	if (itemToProcess instanceof dataAccessLayer.Types.ObjectId) {
		return 'ObjectId("' + itemToProcess + '")';
	} else if (itemToProcess instanceof Date) {
		return 'ISODate("' + itemToProcess.toJSON() + '")';
	}

	// If the value has a custom toJSON method, invoke it to get the serializable representation
	if (itemToProcess && typeof itemToProcess === 'object' &&
			typeof itemToProcess.toJSON === 'function') {
		itemToProcess = itemToProcess.toJSON(currentPropertyKey);
	}

	// Apply a user-defined custom serialization function if provided
	if (typeof customSerializationFunction === 'function') {
		itemToProcess = customSerializationFunction.call(containingObject, currentPropertyKey, itemToProcess);
	}

	// Serialize based on the determined type of the item
	switch (typeof itemToProcess) {
	case 'string':
		return wrapAndEscapeString(itemToProcess);

	case 'number':
		// Numbers are converted to string, non-finite numbers become 'null'
		return isFinite(itemToProcess) ? String(itemToProcess) : 'null';

	case 'boolean':
	case 'null': // Null values are also handled here, converting to string
		return String(itemToProcess);

	case 'object':
		// Null objects are explicitly handled as 'null'
		if (!itemToProcess) {
			return 'null';
		}

		// Increase the indentation level for nested structures
		currentDepthIndentation += indentationString;
		segmentCollection = [];

		// Handle array serialization
		if (Object.prototype.toString.call(itemToProcess) === '[object Array]') {
			itemCount = itemToProcess.length;
			for (loopIndex = 0; loopIndex < itemCount; loopIndex += 1) {
				segmentCollection[loopIndex] = processValueForSerialization(loopIndex, itemToProcess) || 'null';
			}
			serializedSegment = segmentCollection.length === 0
				? '[]'
				: currentDepthIndentation
				? '[\n' + currentDepthIndentation + segmentCollection.join(',\n' + currentDepthIndentation) + '\n' + parentIndentation + ']'
				: '[' + segmentCollection.join(',') + ']';
			currentDepthIndentation = parentIndentation; // Restore previous indentation
			return serializedSegment;
		}

		// Handle object serialization with a custom replacer array
		if (customSerializationFunction && typeof customSerializationFunction === 'object') {
			itemCount = customSerializationFunction.length;
			for (loopIndex = 0; loopIndex < itemCount; loopIndex += 1) {
				if (typeof customSerializationFunction[loopIndex] === 'string') {
					propertyIdentifier = customSerializationFunction[loopIndex];
					serializedSegment = processValueForSerialization(propertyIdentifier, itemToProcess);
					if (serializedSegment) {
						segmentCollection.push(wrapAndEscapeString(propertyIdentifier) + (currentDepthIndentation ? ': ' : ':') + serializedSegment);
					}
				}
			}
		} else {
			// Handle generic object serialization by iterating own properties
			for (propertyIdentifier in itemToProcess) {
				if (Object.prototype.hasOwnProperty.call(itemToProcess, propertyIdentifier)) {
					serializedSegment = processValueForSerialization(propertyIdentifier, itemToProcess);
					if (serializedSegment) {
						segmentCollection.push(wrapAndEscapeString(propertyIdentifier) + (currentDepthIndentation ? ': ' : ':') + serializedSegment);
					}
				}
			}
		}
		serializedSegment = segmentCollection.length === 0
			? '{}'
			: currentDepthIndentation
			? '{\n' + currentDepthIndentation + segmentCollection.join(',\n' + currentDepthIndentation) + '\n' + parentIndentation + '}'
			: '{' + segmentCollection.join(',') + '}';
		currentDepthIndentation = parentIndentation; // Restore previous indentation
		return serializedSegment;
	}
}

// Main function to format an object into a string, similar to JSON.stringify
module.exports.formatObject = function (objectToFormat, customReplacer, indentationSpacing) {
	var idxCounter;
	currentDepthIndentation = ''; // Initialize global indentation state
	indentationString = '';       // Initialize indentation unit

	// Determine the indentation string based on the 'indentationSpacing' parameter
	if (typeof indentationSpacing === 'number') {
		for (idxCounter = 0; idxCounter < indentationSpacing; idxCounter += 1) {
			indentationString += ' ';
		}
	} else if (typeof indentationSpacing === 'string') {
		indentationString = indentationSpacing;
	}

	customSerializationFunction = customReplacer; // Set the global custom replacer

	// Validate the type of the custom replacer
	if (customReplacer && typeof customReplacer !== 'function' &&
			(typeof customReplacer !== 'object' ||
			typeof customReplacer.length !== 'number')) {
		throw new Error('ObjectFormatter.formatObject: Invalid replacer argument.');
	}

	// Start the recursive serialization process
	return processValueForSerialization('', {'': objectToFormat});
};