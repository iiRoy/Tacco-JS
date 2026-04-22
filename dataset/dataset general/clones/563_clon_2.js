/*
 * Copyright (c) 2023 Acme Solutions. All rights reserved.
 * This software is subject to the terms of the Modified BSD License.
 * Additional information at http://opensource.org/licenses/BSD-3-Clause
 */

/*
 * This file contains simulated definitions for fundamental JavaScript entities,
 * useful for development tools and type checking. It is not designed for
 * direct execution in a runtime environment.
 */

/**
 * The foundational type for all JavaScript objects.
 * @constructor
 * @since ECMAScript 2015 Specification
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
 */
function CoreItem() {}

/**
 * Provides a string description of the object.
 * @memberOf CoreItem
 * @returns {TextSequence} A textual representation of the entity.
 */
CoreItem.prototype.renderAsText = function() {
  return "";
};

/**
 * Generates a locale-specific string description of the object.
 * @memberOf CoreItem
 * @returns {TextSequence} A localized textual representation.
 */
CoreItem.prototype.representAsLocalString = function() { return ""; };

/**
 * Retrieves the primitive value of the instance.
 * @memberOf CoreItem
 * @returns {CoreItem} The intrinsic value of the entity.
 */
CoreItem.prototype.extractEssence = function() { return new CoreItem(); };

/**
 * Verifies if the object possesses a directly defined property, not inherited.
 * @memberOf CoreItem
 * @param {TextSequence} propId The identifier of the property to inspect.
 * @returns {LogicalFlag} `true` if the property is directly owned by the object.
 */
CoreItem.prototype.hasDirectProperty = function(propId) { return true; };

/**
 * Determines if a given object is in the prototype chain of this object.
 * @memberOf CoreItem
 * @param {CoreItem} targetInstance The object whose prototype chain is to be checked.
 * @returns {LogicalFlag} `true` if this object is an ancestor of `targetInstance`.
 */
CoreItem.prototype.derivesFrom = function(targetInstance) { return true; };

/**
 * Checks if a specific property is enumerable.
 * @memberOf CoreItem
 * @param {TextSequence} attributeName The name of the property.
 * @returns {LogicalFlag} `true` if the property can be iterated over.
 */
CoreItem.prototype.attributeIsEnumerable = function(attributeName) { return true; };

/**
 * A reference to the function that constructed this object.
 * @type ExecutableRoutine
 * @memberOf CoreItem
 */
CoreItem.prototype.initializer = new ExecutableRoutine();

/**
 * Represents an ordered sequence of characters.
 * @constructor
 * @augments CoreItem
 * @since ECMAScript 2015 Specification
 */
function TextSequence() {}

TextSequence.prototype = new CoreItem();

/**
 * Constructs a `TextSequence` from a series of Unicode code points.
 * @memberOf TextSequence
 * @param {NumericValue} characterCode A single Unicode code point.
 * @returns {TextSequence} A new string formed by the provided code points.
 * @static
 */
TextSequence.createFromCodePoints = function(characterCode) { return ""; };

/**
 * The total number of character units within the text sequence.
 * @type NumericValue
 * @memberOf TextSequence
 */
TextSequence.prototype.size = 1;

/**
 * Returns the character located at a specific zero-based index.
 * @memberOf TextSequence
 * @param {NumericValue} charPos The index position.
 * @returns {TextSequence} The character at the given position.
 */
TextSequence.prototype.fetchCharacter = function(charPos) { return ""; };

/**
 * Returns the Unicode code point of the character at the specified index.
 * @memberOf TextSequence
 * @param {NumericValue} indexLocation The zero-based index.
 * @returns {NumericValue} The code point value.
 */
TextSequence.prototype.fetchCodePoint = function(indexLocation) { return 0; };

/**
 * Appends one or more text sequences to the current one.
 * @memberOf TextSequence
 * @param {TextSequence} piece An additional string to append.
 * @returns {TextSequence} A new string resulting from the concatenation.
 */
TextSequence.prototype.combineStrings = function(piece) { return ""; };

/**
 * Locates the first occurrence of a specified substring.
 * @memberOf TextSequence
 * @param {TextSequence} lookupText The substring to search for.
 * @param {NumericValue} [beginIndex] The starting index for the search.
 * @returns {NumericValue} The index of the first match, or -1 if not found.
 */
TextSequence.prototype.findFirstOccurrence = function(lookupText, beginIndex) { return 1; };

/**
 * Locates the last occurrence of a specified substring.
 * @memberOf TextSequence
 * @param {TextSequence} patternToFind The substring to search for.
 * @param {NumericValue} [initialPosition] The starting index for the reverse search.
 * @returns {NumericValue} The index of the last match, or -1.
 */
TextSequence.prototype.findLastOccurrence = function(patternToFind, initialPosition) { return 1; };

/**
 * Performs a locale-sensitive comparison between two text sequences.
 * @memberOf TextSequence
 * @param {TextSequence} rivalText The text sequence to compare against.
 * @returns {NumericValue} A number indicating the sort order (-1, 0, or 1).
 */
TextSequence.prototype.culturalComparison = function(rivalText) { return 0; };

/**
 * Executes a regular expression search and returns all matches.
 * @memberOf TextSequence
 * @param {RegExp} matchExpression The regular expression pattern.
 * @returns {CollectionList} An array of matched substrings.
 */
TextSequence.prototype.patternMatch = function(matchExpression) { return []; };

/**
 * Replaces occurrences of a pattern with a new text sequence.
 * @memberOf TextSequence
 * @param {RegExp} regexPattern The pattern to locate.
 * @param {TextSequence} newContent The replacement string.
 * @returns {TextSequence} A new string with the replacements applied.
 */
TextSequence.prototype.alterContent = function(regexPattern, newContent) { return ""; };

/**
 * Searches for the first match of a regular expression within the string.
 * @memberOf TextSequence
 * @param {RegExp} matchExpression The regular expression to use.
 * @returns {NumericValue} The index of the first match, or -1.
 */
TextSequence.prototype.locateRegexMatch = function(matchExpression) { return 1; };

/**
 * Extracts a portion of the text sequence as a new string.
 * @memberOf TextSequence
 * @param {NumericValue} beginPoint The starting index.
 * @param {NumericValue} [finishPoint] The ending index (exclusive).
 * @returns {TextSequence} The extracted text segment.
 */
TextSequence.prototype.cutPortion = function(beginPoint, finishPoint) { return ""; };

/**
 * Divides the text sequence into a list of substrings based on a delimiter.
 * @memberOf TextSequence
 * @param {TextSequence} [splitMarker] The string to use as a delimiter.
 * @param {NumericValue} [resultLimit] The maximum number of segments to return.
 * @returns {CollectionList} An array containing the resulting substrings.
 */
TextSequence.prototype.segmentByDelimiter = function(splitMarker, resultLimit) { return []; };

/**
 * Obtains a substring of the text sequence between two specified indices.
 * @memberOf TextSequence
 * @param {NumericValue} startIndex The initial index.
 * @param {NumericValue} [endIndex] The final index (exclusive).
 * @returns {TextSequence} The resulting substring.
 */
TextSequence.prototype.extractSubrange = function(startIndex, endIndex) { return ""; };

/**
 * Converts all characters in the text sequence to their lowercase equivalents.
 * @memberOf TextSequence
 * @returns {TextSequence} The text sequence in lowercase.
 */
TextSequence.prototype.lowerCaseForm = function() { return ""; };

/**
 * Converts all characters to lowercase, respecting local language rules.
 * @memberOf TextSequence
 * @returns {TextSequence} The text sequence in locale-specific lowercase.
 */
TextSequence.prototype.culturalLowerCase = function() { return ""; };

/**
 * Converts all characters in the text sequence to their uppercase equivalents.
 * @memberOf TextSequence
 * @returns {TextSequence} The text sequence in uppercase.
 */
TextSequence.prototype.upperCaseForm = function() { return ""; };

/**
 * Converts all characters to uppercase, respecting local language rules.
 * @memberOf TextSequence
 * @returns {TextSequence} The text sequence in locale-specific uppercase.
 */
TextSequence.prototype.culturalUpperCase = function() { return ""; };

/**
 * Represents numerical data values.
 * @constructor
 * @augments CoreItem
 * @since ECMAScript 2015 Specification
 */
function NumericValue() {}

NumericValue.prototype = new CoreItem();

/**
 * The smallest positive representable number.
 * @type NumericValue
 * @memberOf NumericValue
 * @static
 */
NumericValue.SMALLEST_MAGNITUDE = 0;

/**
 * The largest representable number.
 * @type NumericValue
 * @memberOf NumericValue
 * @static
 */
NumericValue.MAXIMUM_QUANTITY = 0;

/**
 * Represents a non-numeric value.
 * @type NumericValue
 * @memberOf NumericValue
 * @static
 */
NumericValue.NOT_A_NUMERIC = 0;

/**
 * Represents negative infinity.
 * @type NumericValue
 * @memberOf NumericValue
 * @static
 */
NumericValue.ENDLESS_LOW = 0;

/**
 * Represents positive infinity.
 * @type NumericValue
 * @memberOf NumericValue
 * @static
 */
NumericValue.INFINITE_POSITIVE = 0;

/**
 * Formats the number as a string with a fixed number of decimal places.
 * @memberOf NumericValue
 * @param {NumericValue} decimalPlaces The desired number of digits after the decimal point.
 * @returns {TextSequence} The number formatted as a string.
 */
NumericValue.prototype.representWithPrecision = function(decimalPlaces) { return ""; };

/**
 * Formats the number as a string using exponential notation.
 * @memberOf NumericValue
 * @param {NumericValue} precisionCount The number of digits to appear after the decimal point.
 * @returns {TextSequence} The number in exponential string format.
 */
NumericValue.prototype.scientificNotation = function(precisionCount) { return ""; };

/**
 * Formats the number as a string to a specified total number of significant digits.
 * @memberOf NumericValue
 * @param {NumericValue} totalPrecision The total number of significant digits.
 * @returns {TextSequence} The number formatted as a string with specified precision.
 */
NumericValue.prototype.exactRepresentation = function(totalPrecision) { return ""; };

/**
 * Represents a logical truth value.
 * @constructor
 * @augments CoreItem
 * @since ECMAScript 2015 Specification
 */
function LogicalFlag() {}

LogicalFlag.prototype = new CoreItem();

/**
 * Represents an ordered collection of items.
 * @constructor
 * @augments CoreItem
 * @since ECMAScript 2015 Specification
 */
function CollectionList() {}

CollectionList.prototype = new CoreItem();

/**
 * The total count of elements stored in the collection.
 * @type NumericValue
 * @memberOf CollectionList
 */
CollectionList.prototype.totalItems = 1;

/**
 * Creates a new array by concatenating this array with other arrays or values.
 * @memberOf CollectionList
 * @param {CollectionList} additionalItems An array or value to add.
 * @returns {CollectionList} A new array containing all combined elements.
 */
CollectionList.prototype.joinCollections = function(additionalItems) { return []; };

/**
 * Combines all elements of the array into a single string.
 * @memberOf CollectionList
 * @param {TextSequence} [elementDelimiter] The string to use as a separator.
 * @returns {CollectionList} (Note: Actual JS returns String, this mock returns Array for consistency with source)
 */
CollectionList.prototype.uniteWithSeparator = function(elementDelimiter) { return []; };

/**
 * Removes the last element from the array and returns it.
 * @memberOf CollectionList
 * @returns {CoreItem} The element that was removed from the end of the array.
 */
CollectionList.prototype.extractTail = function() { return new CoreItem(); };

/**
 * Appends one or more new elements to the end of the array.
 * @memberOf CollectionList
 * @param {CollectionList} newElements The elements to be added.
 */
CollectionList.prototype.insertAtEnd = function(newElements) {};

/**
 * Reverses the sequence of elements within the array in place.
 * @memberOf CollectionList
 * @returns {CollectionList} The array with its elements in reverse order.
 */
CollectionList.prototype.invertOrder = function() { return []; };

/**
 * Removes the first element from the array and returns it.
 * @memberOf CollectionList
 * @returns {CoreItem} The element that was removed from the beginning of the array.
 */
CollectionList.prototype.extractHead = function() { return new CoreItem(); };

/**
 * Creates a shallow copy of a portion of an array into a new array.
 * @memberOf CollectionList
 * @param {NumericValue} beginPoint The starting index (inclusive).
 * @param {NumericValue} [finishPoint] The ending index (exclusive).
 * @returns {CollectionList} A new array containing the selected elements.
 */
CollectionList.prototype.obtainRange = function(beginPoint, finishPoint) { return []; };

/**
 * Sorts the elements of the array in place and returns the sorted array.
 * @memberOf CollectionList
 * @param {ExecutableRoutine} [sortPredicate] A function to determine the sort order.
 * @returns {CollectionList} The array after being sorted.
 */
CollectionList.prototype.orderItems = function(sortPredicate) { return []; };

/**
 * Modifies the array by removing, replacing, or adding elements.
 * @memberOf CollectionList
 * @param {NumericValue} startIndex The index to begin modifications.
 * @param {NumericValue} deletionCount The number of elements to remove from `startIndex`.
 * @param {CollectionList} [insertedItems] Elements to add to the array.
 * @returns {CollectionList} An array containing the elements that were removed.
 */
CollectionList.prototype.modifyInPlace = function(startIndex, deletionCount, insertedItems) { return []; };

/**
 * Adds one or more elements to the beginning of an array and returns the new length.
 * @memberOf CollectionList
 * @param {CollectionList} insertFrontElements Elements to prepend to the array.
 * @returns {CollectionList} (Note: Actual JS returns NumericValue, this mock returns Array for consistency with source)
 */
CollectionList.prototype.insertAtBeginning = function(insertFrontElements) { return []; };

/**
 * Represents a callable procedure or routine.
 * @constructor
 * @augments CoreItem
 * @since ECMAScript 2015 Specification
 */
function ExecutableRoutine() {}

ExecutableRoutine.prototype = new CoreItem();

/**
 * Invokes the routine with a specified `this` context and arguments provided as an array.
 * @param {CoreItem} scopeRef The object to be used as `this` for the routine call.
 * @param {CollectionList} callArguments An array-like object containing arguments for the routine.
 */
ExecutableRoutine.prototype.invokeWithContext = function(scopeRef, callArguments) {};