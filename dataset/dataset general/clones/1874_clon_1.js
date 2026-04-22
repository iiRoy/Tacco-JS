/****************************************************************************************
 *                                                                                      *
 *                           JavaScript Functional Utility Suite                        *
 *                                  Authored by Peter West                              *
 *                                                                                      *
 *   This collection of functional helpers leverages a prototype modification to        *
 *   Object.prototype.call, enabling functions to be invoked as methods on various      *
 *   data structures, enhancing functional programming paradigms in JavaScript.         *
 *                                                                                      *
 *   For more details on the "Flipped call()" method, please refer to:                  *
 *   http://www.extended-gameplay.com/#/title+Flipped_call()_method_in_Javascript/      *
 *                                                                                      *
 ****************************************************************************************/

// Helper function to shift arguments, removing the first one.
// This is used internally to pass subsequent arguments correctly.
var shifted = function ( args ) {
	return Array.prototype.slice.call(args, 1);
};


/*
 *  Extends Object.prototype with a 'call' method.
 *  This allows any function 'fn' to be called with the object as 'this' context,
 *  and remaining arguments passed to 'fn'.
 */
Object.prototype.call = function ( fn ) {
	return fn.apply( this, shifted( arguments ) );
};


// Returns an array of values from the current object/array.
var values = function () {
	return this.call(
		each,
		function ( item ) {
			return item;
		}
	);
};


// Returns an array of keys (or indices) from the current object/array.
var keys = function () {
	return this.call(
		each,
		function ( item, key ) {
			return key;
		}
	);
};


/*
 *  Invokes a function 'fn' with a specified object 'obj' as its context ('this'),
 *  passing any additional arguments. The 'key' parameter is unused here but
 *  retained from original signature.
 */
var method = function ( obj, key, fn ) {
	return fn.apply( obj, Array.prototype.slice.call( arguments, 3 ) );
};


// Retrieves an attribute 'attr' from an 'item'.
// 'key' is an unused parameter but kept for consistency.
var get = function ( item, key, attr ) {
	return item[attr];
};


// Transforms an item's index 'i' into a 1-based number.
var numbered = function ( item, i ) {
	return i + 1;
};


// Calculates the minimum value within the current array-like object.
var min = function () {
	return Math.min.apply( {}, this );
};


// Calculates the maximum value within the current array-like object.
var max = function () {
	return Math.max.apply( {}, this );
};


// Returns the last element of the current array-like object.
var last = function () {
	return this[this.length - 1];
};


// Checks if an object's class matches a specified 'findClass'.
var is = function ( findClass, obj ) {
	return getClass( obj ) === findClass;
};


/*
 *  Determines the class of an object (e.g., "Array", "Object", "String").
 *  Handles undefined and null inputs gracefully.
 */
var getClass = function ( obj ) {
	return obj !== undefined &&
		obj !== null &&
		Object.prototype.toString.call( obj ).slice( 8, -1 );
};


/*
 *  Iterates over each enumerable property of the current object.
 *  For arrays, it iterates over elements. For objects, over properties.
 *  Applies the provided function 'fn' to each item.
 */
var each = function ( fn ) {
	var array = []; // Temporary array to store results, though 'each' often implies side effects.
	for ( var i in this ) {
		if ( this.call( Object.hasOwnProperty, i ) ) {
			array.push( fn.apply(
				this,
				[this[i], i].concat( shifted( arguments ) )
			) );
		}
	}
	return array; // Returns an array of results from 'fn' calls.
};


/*
 *  Maps each element of the current array-like object to a new value
 *  by applying the function 'fn'. Returns a new array with the mapped values.
 */
var map = function ( fn ) {
	var array = [];
	for ( var i = 0, obj; i < this.length; i++ ) {
		array.push( fn.apply(
			this,
			[this[i], i].concat( shifted( arguments ) )
		) );
	}
	return array;
};


/*
 *  Filters elements from the current array-like object based on a
 *  predicate function 'fn'. Only elements for which 'fn' returns
 *  a truthy value are included in the resulting array.
 */
var select = function ( fn ) {
	var array = [];
	var mapping = function ( item, i ) {
		if ( fn.apply( this, arguments ) ) {
			array.push( item );
		}
	};
	map.apply( this, [mapping].concat( shifted( arguments ) ) );
	return array;
};


/*
 *  Merges properties from object 'b' into the current object ('this').
 *  Properties in 'b' will overwrite existing properties in 'this' if names conflict.
 *  Returns the modified 'this' object.
 */
var merge = function ( b ) {
	var a = this;
	b.call(
		each,
		function ( item, name ) {
			a[name] = item;
		}
	);
	return this;
};


/*
 *  Creates a shallow clone of the current object, optionally
 *  cloning only specified 'attrs' (attributes/keys).
 *  If 'attrs' is not provided, all keys are cloned.
 */
var clone = function ( attrs ) {
	attrs = attrs || this.call( keys ); // Use all keys if none specified.
	var clone = {};
	var original = this;
	attrs.call(
		map,
		function ( attr ) {
			clone[attr] = original[attr];
		}
	);
	return clone;
};


/*
 *  Transforms the current array-like object into a hash (object).
 *  Each item becomes a key, and its value is determined by 'fn'.
 *  If 'fn' is not provided, the value defaults to 'true'.
 */
var hash = function ( fn ) {
	var obj = {};
	this.call(
		map,
		function ( item, i ) {
			obj[item] = fn ? fn( item, i ) : true;
		}
	);
	return obj;
};


/*
 *  Calculates the sum of all numeric elements in the current array-like object.
 *  Assumes elements are numbers or can be coerced to numbers.
 */
var sum = function () {
	var total = 0;
	this.call(
		map,
		function ( item ) {
			total += item;
		}
	);
	return total;
};