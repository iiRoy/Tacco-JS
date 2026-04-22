// This is a Type I clone of the original JavaScript code.
// Variations have been introduced solely through changes in
// whitespace and comments, ensuring that the code's
// logical and structural integrity remains identical.

// Original Copyright Notice and License Information:
// Copyright (c) 2008, 2010 IBM Corporation and others.
// All rights reserved.
// This program and the accompanying materials are made available
// under the terms of the Eclipse Public License v1.0
// which accompanies this distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
//
// Contributors: IBM Corporation - initial API and implementation
//
// For more details, please refer to the DOM Level 2 Core specification:
// http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html


/**
 *   @constructor
 *   @name Object
 *   @description Global Object constructor.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
function Object ( ) {
} ;


/**
 *   @function toString
 *   @memberOf Object.prototype
 *   @returns {String} A string representation of the object.
 *   @see Object
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.toString = function ( ) {
    return "" ;
} ;


/**
 *   @function toLocaleString
 *   @memberOf Object.prototype
 *   @returns {String} A localized string representation of the object.
 *   @see Object
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.toLocaleString = function ( ) {
    return "" ;
} ;


/**
 *   @function valueOf
 *   @memberOf Object.prototype
 *   @returns {Object} The primitive value of the object.
 *   @see Object
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.valueOf = function ( ) {
    return new Object ( ) ;
} ;


/**
 *   @function hasOwnProperty
 *   @memberOf Object.prototype
 *   @param {String} name - The name of the property to test.
 *   @returns {Boolean} True if the object has the specified property as its own property, false otherwise.
 *   @see Object
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.hasOwnProperty = function ( name ) {
    return true ;
} ;


/**
 *   @function isPrototypeOf
 *   @memberOf Object.prototype
 *   @param {Object} o - The object to be checked against the prototype chain.
 *   @returns {Boolean} True if the object on which the method is called is in the prototype chain of 'o'.
 *   @see Object
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.isPrototypeOf = function ( o ) {
    return true ;
} ;


/**
 *   @function propertyIsEnumerable
 *   @memberOf Object.prototype
 *   @param {Object} name - The name of the property to check for enumerability.
 *   @returns {Boolean} True if the specified property is enumerable, false otherwise.
 *   @see Object
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.propertyIsEnumerable = function ( name ) {
    return true ;
} ;


/**
 *   @property {Function} constructor
 *   @memberOf Object.prototype
 *   @description A reference to the Object function that created the instance.
 *   @type Function
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Object.prototype.constructor = new Function ( ) ;


// === Start of String Object Definitions ===

/**
 *   @constructor
 *   @name String
 *   @extends Object
 *   @description Global String constructor.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
function String ( ) {
}
String.prototype = new Object ( ) ;


/**
 *   @static
 *   @function fromCharCode
 *   @memberOf String
 *   @param {Number} charCode - A sequence of numbers that are Unicode values.
 *   @returns {String} A string created by using the specified sequence of Unicode values.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.fromCharCode = function ( charCode ) {
    return "" ;
} ;


/**
 *   @property {Number} length
 *   @memberOf String.prototype
 *   @description The length of the string.
 *   @type Number
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.length = 1 ;


/**
 *   @function charAt
 *   @memberOf String.prototype
 *   @param {Number} position - The index of the character to return.
 *   @returns {String} The character at the specified position.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.charAt = function ( position ) {
    return "" ;
} ;


/**
 *   @function charCodeAt
 *   @memberOf String.prototype
 *   @param {Number} position - The index of the character whose Unicode value is to be returned.
 *   @returns {Number} The Unicode value of the character at the specified position.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.charCodeAt = function ( position ) {
    return 0 ;
} ;


/**
 *   @function concat
 *   @memberOf String.prototype
 *   @param {String} value - The strings to concatenate.
 *   @returns {String} A new string combining the text of the original string and the given strings.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.concat = function ( value ) {
    return "" ;
} ;


/**
 *   @function indexOf
 *   @memberOf String.prototype
 *   @param {String} searchString - The string to search for.
 *   @param {Number} startPosition - The index at which to start the search.
 *   @returns {Number} The index of the first occurrence of the specified value, or -1 if not found.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.indexOf = function ( searchString, startPosition ) {
    return 1 ;
} ;


/**
 *   @function lastIndexOf
 *   @memberOf String.prototype
 *   @param {String} searchString - The string to search for.
 *   @param {Number} startPosition - The index at which to start the search backwards.
 *   @returns {Number} The index of the last occurrence of the specified value, or -1 if not found.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.lastIndexOf = function ( searchString, startPosition ) {
    return 1 ;
} ;


/**
 *   @function localeCompare
 *   @memberOf String.prototype
 *   @param {String} otherString - The string to compare against.
 *   @returns {Number} A number indicating whether the reference string comes before, after, or is the same as the given string in sort order.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.localeCompare = function ( otherString ) {
    return 0 ;
} ;


/**
 *   @function match
 *   @memberOf String.prototype
 *   @param {RegExp} regexp - A regular expression object.
 *   @returns {Array} An array containing the results of the match, or null if no match is found.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.match = function ( regexp ) {
    return [ ] ;
} ;


/**
 *   @function replace
 *   @memberOf String.prototype
 *   @param {RegExp} regexp - A regular expression or a string to be replaced.
 *   @param {String} replaceValue - The string or function to replace the matches.
 *   @returns {String} A new string with some or all matches of a pattern replaced by a replacement.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.replace = function ( regexp, replaceValue ) {
    return "" ;
} ;


/**
 *   @function search
 *   @memberOf String.prototype
 *   @param {RegExp} regexp - A regular expression object.
 *   @returns {Number} The index of the first match, or -1 if no match is found.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.search = function ( regexp ) {
    return 1 ;
} ;


/**
 *   @function slice
 *   @memberOf String.prototype
 *   @param {Number} start - The zero-based index at which to begin extraction.
 *   @param {Number} end - The zero-based index before which to end extraction (exclusive).
 *   @returns {String} A new string containing the extracted section of the string.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.slice = function ( start, end ) {
    return "" ;
} ;


/**
 *   @function split
 *   @memberOf String.prototype
 *   @param {String} separator - The pattern describing where each split should occur.
 *   @param {Number} limit - A non-negative integer specifying the maximum number of splits to be found.
 *   @returns {Array} An array of strings, split at each point where the separator occurs in the original string.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.split = function ( separator, limit ) {
    return [ ] ;
} ;


/**
 *   @function substring
 *   @memberOf String.prototype
 *   @param {Number} start - The starting index.
 *   @param {Number} end - The ending index (exclusive).
 *   @returns {String} A new string containing the extracted section of the string.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.substring = function ( start, end ) {
    return "" ;
} ;


/**
 *   @function toLowerCase
 *   @memberOf String.prototype
 *   @returns {String} The calling string value converted to lowercase.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.toLowerCase = function ( ) {
    return "" ;
} ;


/**
 *   @function toLocaleLowerCase
 *   @memberOf String.prototype
 *   @returns {String} The calling string value converted to lowercase, according to any locale-specific case mappings.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.toLocaleLowerCase = function ( ) {
    return "" ;
} ;


/**
 *   @function toUpperCase
 *   @memberOf String.prototype
 *   @returns {String} The calling string value converted to uppercase.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.toUpperCase = function ( ) {
    return "" ;
} ;


/**
 *   @function toLocaleUpperCase
 *   @memberOf String.prototype
 *   @returns {String} The calling string value converted to uppercase, according to any locale-specific case mappings.
 *   @see String
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
String.prototype.toLocaleUpperCase = function ( ) {
    return "" ;
} ;


// === Start of Number Object Definitions ===

/**
 *   @constructor
 *   @name Number
 *   @extends Object
 *   @description Global Number constructor.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
function Number ( ) {
}
Number.prototype = new Object ( ) ;


/**
 *   @property {Number} MIN_VALUE
 *   @memberOf Number
 *   @static
 *   @description The smallest positive representable number.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.MIN_VALUE = 0 ;


/**
 *   @property {Number} MAX_VALUE
 *   @memberOf Number
 *   @static
 *   @description The largest representable number.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.MAX_VALUE = 0 ;


/**
 *   @property {Number} NaN
 *   @memberOf Number
 *   @static
 *   @description Represents "Not-a-Number".
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.NaN = 0 ;


/**
 *   @property {Number} NEGATIVE_INFINITY
 *   @memberOf Number
 *   @static
 *   @description Represents negative infinity.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.NEGATIVE_INFINITY = 0 ;


/**
 *   @property {Number} POSITIVE_INFINITY
 *   @memberOf Number
 *   @static
 *   @description Represents positive infinity.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.POSITIVE_INFINITY = 0 ;


/**
 *   @function toFixed
 *   @memberOf Number.prototype
 *   @param {Number} fractionDigits - The number of digits to appear after the decimal point.
 *   @returns {String} A string representation of the number with a fixed number of digits after the decimal point.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.prototype.toFixed = function ( fractionDigits ) {
    return "" ;
} ;


/**
 *   @function toExponential
 *   @memberOf Number.prototype
 *   @param {Number} fractionDigits - The number of digits after the decimal point.
 *   @returns {String} A string representation of the number in exponential notation.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.prototype.toExponential = function ( fractionDigits ) {
    return "" ;
} ;


/**
 *   @function toPrecision
 *   @memberOf Number.prototype
 *   @param {Number} precision - The number of significant digits.
 *   @returns {String} A string representation of the number to a specified precision.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Number.prototype.toPrecision = function ( fractionDigits ) {
    return "" ;
} ;


// === Start of Boolean Object Definitions ===

/**
 *   @constructor
 *   @name Boolean
 *   @extends Object
 *   @description Global Boolean constructor.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
function Boolean ( ) {
} ;
Boolean.prototype = new Object ( ) ;


// === Start of Array Object Definitions ===

/**
 *   @constructor
 *   @name Array
 *   @extends Object
 *   @description Global Array constructor.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
function Array ( ) {
} ;
Array.prototype = new Object ( ) ;


/**
 *   @property {Number} length
 *   @memberOf Array.prototype
 *   @description The number of elements in the array.
 *   @type Number
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.length = 1 ;


/**
 *   @function concat
 *   @memberOf Array.prototype
 *   @param {Array} args - Arrays and/or values to concatenate.
 *   @returns {Array} A new array comprised of the current array joined with the other array(s) and/or value(s).
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.concat = function ( args ) {
    return [ ] ;
} ;


/**
 *   @function join
 *   @memberOf Array.prototype
 *   @param {String} seperator - A string to separate each pair of adjacent elements of the array in the resulting string.
 *   @returns {Array} All elements of an array joined into a string.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.join = function ( seperator ) {
    return [ ] ;
} ;


/**
 *   @function pop
 *   @memberOf Array.prototype
 *   @returns {Object} The last element from the array.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.pop = function ( ) {
    return new Object ( ) ;
} ;


/**
 *   @function push
 *   @memberOf Array.prototype
 *   @param {Array} args - Elements to add to the end of the array.
 *   @returns {Number} The new length of the array.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.push = function ( args ) {
} ;


/**
 *   @function reverse
 *   @memberOf Array.prototype
 *   @returns {Array} The array with its elements reversed in place.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.reverse = function ( ) {
    return [ ] ;
} ;


/**
 *   @function shift
 *   @memberOf Array.prototype
 *   @returns {Object} The first element from the array.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.shift = function ( ) {
    return new Object ( ) ;
} ;


/**
 *   @function slice
 *   @memberOf Array.prototype
 *   @param {Number} start - The beginning index of the specified portion of the array.
 *   @param {Number} end - The end index of the specified portion of the array.
 *   @returns {Array} A new array containing the extracted elements.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.slice = function ( start, end ) {
    return [ ] ;
} ;


/**
 *   @function sort
 *   @memberOf Array.prototype
 *   @param {Function} funct - A function that defines the sort order.
 *   @returns {Array} The array with its elements sorted in place.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.sort = function ( funct ) {
    return [ ] ;
} ;


/**
 *   @function splice
 *   @memberOf Array.prototype
 *   @param {Number} start - The index at which to start changing the array.
 *   @param {Number} deletecount - The number of elements to remove.
 *   @param {Array} items - The elements to add to the array, starting at the start index.
 *   @returns {Array} An array containing the deleted elements.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.splice = function ( start, deletecount, items ) {
    return [ ] ;
} ;


/**
 *   @function unshift
 *   @memberOf Array.prototype
 *   @param {Array} start - Elements to add to the front of the array.
 *   @returns {Array} The new length of the array.
 *   @see Array
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Array.prototype.unshift = function ( start ) {
    return [ ] ;
} ;


// === Start of Function Object Definitions ===

/**
 *   @constructor
 *   @name Function
 *   @extends Object
 *   @description Global Function constructor.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
function Function ( ) {
} ;
Function.prototype = new Object ( ) ;


/**
 *   @function apply
 *   @memberOf Function.prototype
 *   @param {Object} thisObject - The value of 'this' provided for the call to func.
 *   @param {Array} argArray - An array or an array-like object, specifying the arguments with which func should be called.
 *   @returns {*} The result of calling the function with the specified 'this' value and arguments.
 *   @since Standard ECMA-262 3rd. Edition
 *   @since Level 2 Document Object Model Core Definition.
 */
Function.prototype.apply = function ( thisObject, argArray ) {
    // This is a placeholder for the actual apply method implementation.
} ;