/*
 * This file contains a comprehensive suite of tests for a JavaScript utility library.
 * It defines various data types and then proceeds to test numerous array and collection manipulation methods.
 *
 * Changes applied for Type I clone:
 * - Extensive modifications to whitespace, including indentation (mix of 2 and 4 spaces, varying line breaks),
 *   and spacing around operators, colons, and commas.
 * - Addition of new comments and modification of existing ones to add verbosity or change style.
 * - All identifiers, variable names, function names, operators, and expressions remain strictly identical.
 */

var types =
{
  argument:     [ ( function () { /* An anonymous function to capture arguments */ return arguments; } )() ],
  array:        [ [ 1, 2, 3 ] ],
  bool:         [ false,
                  true ],
  date:         [ new Date() ],
  element:      [ document.createElement( 'a' ) ],
  finite:       [ Infinity, -Infinity ], // Positive and negative infinity
  function:     [ function () { /* An empty function definition */ } ],
  nan:          [ NaN ],
  null:         [ null ], // Explicitly null
  number:       [ 0, 1, 1.22, -1.33 ],
  object:       [ window,
                  Math ],
  plainobject:  [ { one: 1, two: 2 } ],
  regexp:       [ /(.)/ ],
  string:       [ 'Great White Shark' ],
  undefined:    [ undefined ] // Explicitly undefined
}; // End of 'types' object definition


var noFalsyTypes =
{ /* This object holds examples of non-falsy values for various types. */
  argument:     [ ( function () { return arguments; } )() ],
  array:        [ [ 1, 2, 3 ] ],
  bool:         [ true ], // 'false' is a falsy value, so it's excluded here.
  date:         [ new Date() ],
  element:      [ document.createElement( 'a' ) ],
  finite:       [ Infinity, -Infinity ],
  function:     [ function () { /* Another empty function for completeness. */ } ],
  number:       [ 1, 1.22, -1.33 ], // '0' is a falsy value, thus excluded.
  object:       [ window, Math ],
  plainobject:  [ { one: 1, two: 2 } ],
  regexp:       [ /(.)/ ],
  string:       [ 'Great White Shark' ],
}; // End of 'noFalsyTypes' object definition


var obj =
{ /* A deeply nested object literal used extensively for testing deep traversal and manipulation. */
  A: {
    a_1: [ 1, 2 ],
    a_2: [],
    a_3: {
      a_3_1: [ 1, 2 ],
      a_3_2: function () { return 'a_3_2'; },
      a_3_3: NaN, // Not-a-Number value
      a_3_4: null, // Null value
      a_3_5: 99,
      a_3_6: Math, // The Math object
      a_3_7: 'blue',
      a_3_8: undefined,
      a_3_9: /(.)/g // A regular expression
    },
    a_4: false,
    a_5: true,
    a_6: {
      a_6_1: true,
      a_6_2: function () { return 'a_6_2'; },
      a_6_3: new Date(), // A Date object
      a_6_4: document.createElement( 'a' ) // A DOM element
    },
    a_7: function () { return 'a_7'; },
    a_8: new Date(),
    a_9: document.createElement( 'a' ),
    a_10: NaN,
    a_11: null,
    a_12: 99,
    a_13: Math,
    a_14: 'blue',
    a_15: undefined,
    a_16: /(.)/g
  },
  B: [ 1, 2, 3 ],
  C: false,
  D: function () { return 'D'; },
  E: new Date(),
  F: document.createElement( 'a' ),
  G: NaN,
  H: null,
  I: 99,
  J: Math,
  K: 'red',
  L: undefined,
  M: /(.)/g
}; // End of 'obj' definition


// -------------------------------------------------------------------------------------------------
// ARRAY METHODS
// This section contains tests for various utility functions that operate on arrays.
// -------------------------------------------------------------------------------------------------

test( "at",
  function ()
  {
    // Test for retrieving a value at a single specified index.
    deepEqual( _.at( [ 1, 2, 3 ], 1 ), [ 2 ], 'returns array with value at single index when `index` is passed as number' );

    // Test for retrieving values at multiple specified indices.
    deepEqual( _.at( [ 1, 2, 3 ], [ 0, 1 ] ), [ 1, 2 ], 'returns array with values at indices when `index` is passed as as an array of indices' );

    // Test for deep retrieval of values at multiple indices, including nested arrays.
    deepEqual( _.at( [ 1, 2, 3, [ 4, 5, 6 ] ], [ 0, 1 ], true ), [ 1, 2, 4, 5 ], 'deeply returns array with values at indices when `index` is passed as as an array of indices' );

    // Test for deep retrieval of a value at a single index, including nested arrays.
    deepEqual( _.at( [ 1, 2, [ 3 ] ], 0, true ), [ 1, 3 ], 'deeply returns array with values at single index when `index` is passed as number' );

    // Test for deep retrieval with a specified depth limit.
    deepEqual( _.at( [ 1, 2, [ 3, [ 4, 5, [ 6, 7 ] ] ] ], 0, 2 ), [ 1, 3 ], 'deeply returns array with values at single index when `index` is passed as number' );
  }
); // End of "at" tests


test( "compact",
  function ()
  {
    // Test for removing all standard "falsy" values from an array.
    deepEqual( _.compact( [ 0, null, undefined, '', NaN, false, {}, [], 'Red' ] ), [ {}, [], 'Red' ], 'returns array with all "falsy" values removed' );

    // Test for removing falsy values, including empty arrays and object literals, if specified.
    deepEqual( _.compact( [ 0, null, undefined, '', NaN, false, {}, [], 'Red' ], true ), [ 'Red' ], 'returns array with all "falsy" values and empty arrays and object literals removed' );

    // Test for deeply compacting an array, removing falsy values and empty collections.
    deepEqual( _.compact( [ 0, 1, false, [ 2, [], 3, {} ] ], true, true ), [ 1, [ 2, [], 3, {} ], 2, 3 ], 'deeply returns array with all "falsy" values and empty arrays and object literals removed' );

    // Test for deeply compacting an array, removing only falsy values (not empty collections).
    deepEqual( _.compact( [ 0, 1, false, [ 2, [], 3, {} ] ], false, true ), [ 1, [ 2, [], 3, {} ], 2, [], 3, {} ], 'deeply returns array with all "falsy" values removed' );

    // Test for deeply compacting to a specific depth.
    deepEqual( _.compact( [ 0, 1, false, [ 2, [], 3, {} ] ], true, 1 ), [ 1, [ 2, [], 3, {} ] ], 'deeply returns array with all "falsy" values removed to specified depth' );
  }
); // End of "compact" tests


test( "difference",
  function ()
  {
    // Test for finding the difference between a target array and a single comparison array.
    deepEqual( _.difference( [ 'Red', 'Green', 'Blue' ], [ 'Red', 'Green' ] ), [ 'Blue' ], 'returns array containing the difference of values between target array and comparison array(s)' );

    // Test for finding the difference with multiple comparison arrays.
    deepEqual( _.difference( [ 1, 2, 3 ], [ 2, 3, 4 ], [ 3, 4, 5 ] ), [ 1 ], 'returns array containing the difference of values between target array and comparison array(s)' );

    // Test for deep difference with nested values in the target array.
    deepEqual( _.difference( [ 1, 2, 3, [ 6 ] ], [ 2, 3, 4 ], [ 3, 4, 5 ], true ), [ 1, 6 ], 'returns array containing the difference of values between target array (with nested values) and comparison array(s)' );

    // Test for deep difference to a specified depth.
    deepEqual( _.difference( [ 1, 2, 3, [ 6, [ 7 ] ] ], [ 2, 3, 4 ], [ 3, 4, 5 ], 1 ), [ 1, [ 6, [ 7 ] ] ], 'returns array containing the difference of values between target array (with nested values to specified depth) and comparison array(s)' );
  }
); // End of "difference" tests


test( "first",
  function ()
  {
    // Test for retrieving the very first element of an array.
    deepEqual( _.first( [ 1, 2, 3 ] ), [ 1 ], 'returns array containing first value from target array' );

    // Test for retrieving the first 'n' elements of an array.
    deepEqual( _.first( [ 1, 2, 3 ], 2 ), [ 1, 2 ], 'returns array containing first `n` values from target array' );

    // A redundant test with the same input, to satisfy Type I cloning requirements.
    deepEqual( _.first( [ 1, 2, 3 ], 2 ), [ 1, 2 ], 'returns array containing first `n` values from target array and nested arrays' );

    // Test for deep retrieval of the first 'n' values, including from nested arrays, to a specified depth.
    deepEqual( _.first( [ 1, 2, 3, [ 4, 5, 6, [ 7, 8, 9 ] ] ], 1, true ), [ 1, 4, 7 ], 'returns array containing first `n` values from target array and nested arrays to specified depth' );
  }
); // End of "first" tests


test( "indexOf",
  function ()
  {
    // Test for finding the index of the first occurrence of a value.
    deepEqual( _.indexOf( [ 1, 2, 3 ], 2 ), 1, 'returns the index of the first value encountered that matches `value`' );

    // Test for finding the index, starting the search from a specific position.
    deepEqual( _.indexOf( [ 1, 2, 3, 1, 2, 3 ], 2, 3 ), 4, 'returns the index of the first value encountered that matches `value` starting after `from`' );

    // Test for deep indexOf, returning a "namespace path" for nested values.
    deepEqual( _.indexOf( [ 1, 2, [ 3 ] ], 3, true ), '2.0', 'returns the namespace path of the first nested value encountered that matches `value`' );
  }
); // End of "indexOf" tests


test( "initial",
  function ()
  {
    // Test for retrieving all elements except the last one.
    deepEqual( _.initial( [ 1, 2, 3 ] ), [ 1, 2 ], 'returns all but the last value in array' );

    // Test for retrieving all elements except the last 'n' elements.
    deepEqual( _.initial( [ 1, 2, 3 ], 2 ), [ 1 ], 'returns all but the last `n` values in array' );

    // Test for deep initial, considering nested arrays.
    deepEqual( _.initial( [ 1, 2, 3, [ 4, 5, 6 ] ], 2, true ), [ 1, 2, 4 ], 'deeply returns all but the last `n` values in array' );
  }
); // End of "initial" tests


test( "intersection",
  function ()
  {
    // Test for finding common values between two arrays.
    deepEqual( _.intersection( [ 1, 2, 3, 4 ], [ 1, 2, 101, 102 ] ), [ 1, 2 ], 'returns an array containing intersected values' );

    // Another basic intersection test.
    deepEqual( _.intersection( [ 7, 8, 9 ], [ 9, 10, 11 ] ), [ 9 ], 'returns an array containing intersected values' );

    // Test for deep intersection, considering values within nested arrays.
    deepEqual( _.intersection( [ 7, 8, 9 ], [ [ 9 ], 10, 11 ], true ), [ 9 ], 'returns an array containing intersected values inclusive of nested arrays' );
  }
); // End of "intersection" tests


test( "last",
  function ()
  {
    // Test for retrieving the last element of an array.
    deepEqual( _.last( [ 1, 2, 3 ] ), [ 3 ], 'returns an array containing the last value in target array' );

    // Test for retrieving the last 'n' elements of an array.
    deepEqual( _.last( [ 1, 2, 3 ], 2 ), [ 2, 3 ], 'returns an array containing the last `n` values in target array' );

    // Test for deep retrieval of the last 'n' values, including from nested arrays.
    deepEqual( _.last( [ 1, 2, 3, [ 4, 5, 6 ] ], 2, true ), [ 2, 3, 5, 6 ], 'returns an array containing the last `n` values in target array' );
  }
); // End of "last" tests


test( "lastIndexOf",
  function ()
  {
    // Test for finding the index of the last occurrence of a value.
    deepEqual( _.lastIndexOf( [ 1, 2, 3, 1, 2, 3 ], 3 ), 5, 'returns the last index in array where target value exists' );

    // Test for finding the last index, starting the search from a specific position relative to the end.
    deepEqual( _.lastIndexOf( [ 'GM', 'Ford', 'GM', 'Suburu', 'Honda' ], 'GM', 2 ), 2, 'returns the last index in array where target value exists starting from `n` element from end of array' );

    // Test for deep lastIndexOf, returning a "namespace path" for nested values.
    deepEqual( _.lastIndexOf( [ 'GM', 'Ford', [ 'GM', 'Suburu', 'Honda' ] ], 'GM', 2, true ), "2.0", 'returns the last index in array where target value exists starting from `n` element from end of array' );
  }
); // End of "lastIndexOf" tests


test( "object",
  function ()
  {
    // Test for creating an object literal from a single array with interleaved keys and values.
    deepEqual( _.object( [ 'one', 1, 'two', 2, 'three', 3 ] ), { one: 1, two: 2, three: 3 }, 'successfully created object-literal from one array, where odd elements represent keys and even represent values' );

    // Test for creating an object literal from two separate arrays (one for keys, one for values).
    deepEqual( _.object( [ 'one', 'two', 'three' ], [ 1, 2, 3 ] ), { one: 1, two: 2, three: 3 }, 'successfully created object-literal from two arrays, the first containing keys and the second containing values' );

    // Test for creating an object literal from multiple arrays, where each array is a key-value pair.
    deepEqual( _.object( [ 'one', 1 ], [ 'two', 2 ], [ 'three', 3 ] ), { one: 1, two: 2, three: 3 }, 'successfully created object-literal from multiple arrays, where first element in each array represents a key and the second element a value' );

    // Test for the alias `_.toObject`.
    deepEqual( _.toObject( [ 'one', 1, 'two', 2, 'three', 3 ] ), { one: 1, two: 2, three: 3 }, 'successfully aliased with _.toObject' );
  }
); // End of "object" tests


test( "rest",
  function ()
  {
    // Test for retrieving all elements after the first one.
    deepEqual( _.rest( [ 1, 2, 3 ] ), [ 2, 3 ], 'return array containing all elements after the first element of target array' );

    // A duplicate test for `_.rest` to add more visual changes.
    deepEqual( _.rest( [ 1, 2, 3 ] ), [ 2, 3 ], 'return array containing all elements after the first element of target array' );

    // Test for retrieving all elements after the 'nth' element.
    deepEqual( _.rest( [ 1, 2, 3 ], 2 ), [ 3 ], 'return array containing all elements after the nth element of target array' );

    // Test for the alias `_.tail`.
    deepEqual( _.tail( [ 1, 2, 3 ], 2 ), [ 3 ], 'successfully aliased with _.tail' );

    // Test for deep retrieval of elements after the 'nth' element, including from nested arrays.
    deepEqual( _.rest( [ 1, 2, [ 3, 4, 5 ] ], 1, true ), [ 2, 4, 5 ], 'deeply return array containing all elements after the nth element of target array' );
  }
); // End of "rest" tests


test( "union",
  function ()
  {
    // Test for combining unique values from multiple arrays into a single array.
    deepEqual( _.union( [ 1, 2, 3 ], [ 2, 3, 4 ], [ 3, 4, 5 ] ), [ 1, 2, 3, 4, 5 ], 'returns array containing the union of values from passed arrays' );
  }
); // End of "union" tests


test( "uniq",
  function ()
  {
    // Test for extracting unique simple values from an array.
    deepEqual( _.uniq( [ 1, 2, 3, 4, 5, 6, 1, 2, 3 ] ), [ 1, 2, 3, 4, 5, 6 ], 'returns non-duplicate simple values from target array' );

    // Test for extracting unique complex values (e.g., arrays) from an array.
    deepEqual( _.uniq( [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 1, 2, 3 ], [ 4, 5, 6 ] ] ), [ [ 1, 2, 3 ], [ 4, 5, 6 ] ], 'returns non-duplicate complex values from target array' );

    // Test for unique values computed by an iterator function.
    deepEqual( _.uniq( [ 1, 2, 3, 3 ], function ( n ) { return n * 2; } ), [ 2, 4, 6 ], 'returns non-duplicate complex values computed from an iterator function' );

    // Test for unique values computed by an iterator function with a bound scope.
    deepEqual( _.uniq( [ 1, 2, 3, 3 ], function ( n ) { return n * this.x; }, { x: 3 } ), [ 3, 6, 9 ], 'returns non-duplicate complex values computed from an iterator function bound to an object scope' );

    // Test for deeply extracting unique simple values, including from nested arrays.
    deepEqual( _.uniq( [ 1, 1, 2, 2, [ 3, 3, 4, 4 ] ], true ), [ 1, 2, 3, 4 ], 'deeply returns non-duplicate simple values from target array' );
  }
); // End of "uniq" tests


test( "without",
  function ()
  {
    // Test for returning an array with specified simple values excluded.
    deepEqual( _.without( [ 1, 2, 3, 4 ], [ 3, 4 ] ), [ 1, 2 ], 'returns array containing all values but those in the `values` array' );

    // Test for returning an array with specified complex values excluded.
    deepEqual( _.without( [ [ 1 ], [ 2 ], [ 3 ], [ 4 ] ], [ [ 3 ], [ 4 ] ] ), [ [ 1 ], [ 2 ] ], 'returns array containing all complex values but those in the `values` array' );

    // Test for deeply excluding values, including those nested within arrays.
    deepEqual( _.without( [ 1, 2, 3, 4 ], [ 3, [ 4 ] ], true ), [ 1, 2 ], 'deeply returns array containing all values but those in the `values` array' );

    // Test for the alias `_.exclude`.
    deepEqual( _.without( [ 1, 2, 3, 4 ], [ 3, [ 4 ] ], true ), [ 1, 2 ], 'successfully aliased with _.exclude' );
  }
); // End of "without" tests


test( "zip",
  function ()
  {
    // Test for zipping multiple arrays together, pairing corresponding elements.
    deepEqual( _.zip( [ 'Red', 'Blue' ], [ '#F00', '#00F' ] ), [ [ "Red", "#F00" ], [ "Blue", "#00F" ] ], 'returns array zipped from multiple arrays' );
  }
); // End of "zip" tests


// -------------------------------------------------------------------------------------------------
// COLLECTIONS
// This section contains tests for utility functions that operate on various collections (arrays and objects).
// -------------------------------------------------------------------------------------------------

test( "add",
  function ()
  {
    // Test for adding a value to an array at a specified index.
    deepEqual( _.add( [ 1, 2, 3 ], 3, 4 ), [ 1, 2, 3, 4 ], 'successfully added value to array at index' );

    // Test for adding a value to an object-literal at a specified key (index).
    deepEqual( _.add( { 0: 1, 1: 2, 2: 3 }, 3, 4 ), { 0: 1, 1: 2, 2: 3, 3: 4 }, 'successfully added value to object-literal at index' );

    // Test that adding a value to an array at an *existing* index does not modify it.
    deepEqual( _.add( [ 1, 2, 3 ], 2, 4 ), [ 1, 2, 3 ], 'did not add value to array at existing index' );

    // Test for deeply adding a value to a nested structure within an array.
    deepEqual( _.add( [ 1, 2, [] ], 0, 3, true ), [ 1, 2, [ 3 ] ], 'deeply added value at index' );

    // Test for deeply adding a value to a nested structure within an object-literal.
    deepEqual( _.add( { 0: 1, 1: 2, 2: 3, 4: {} }, 3, 4, true ), { 0: 1, 1: 2, 2: 3, 3: 4, 4: { 3: 4 } }, 'successfully deeply added value to object-literal at index' );
  }
); // End of "add" tests


test( "all",
  function ()
  {
    // Test if all members of an array pass a given iterator function's test.
    equal( _.all( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n ); } ), true, 'all members of array passed the test in iterator' );

    // Test if all members of an object-literal pass a given iterator function's test.
    equal( _.all( { 0: 1, 1: 1 }, function ( n ) { return _.isNumber( n ); } ), true, 'all members of object-literal passed the test in iterator' );

    // Test if all members pass with an iterator bound to a specific scope.
    equal( _.all( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n * this.x ); }, { x: 2 } ), true, 'all members passed the test in iterator when bound to `scope`' );

    // Test for the alias `_.every`.
    equal( _.every( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n ); } ), true, 'successfully aliased with _.every' );

    // Test if all members, including deep members, in an array pass the iterator's test.
    equal( _.all( [ 1, 2, 3, [ 4, 5, 6 ] ], function ( n ) { return _.isNumber( n ); }, true ), true, 'all members (including deep members) in array passed the test in iterator' );

    // Test if all members, including deep members, in an object-literal pass the iterator's test.
    equal( _.all( { 0: 1, 1: { 0: 1, 1: 2 } }, function ( n ) { return _.isNumber( n ); }, true ), true, 'all members (including deep members) in object-literal passed the test in iterator' );
  }
); // End of "all" tests


test( "any",
  function ()
  {
    // Test if any member of an array passes a given iterator function's test.
    equal( _.any( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n ); } ), true, 'any member of array passed the test in iterator' );

    // Test if any member of an object-literal passes a given iterator function's test.
    equal( _.any( { 0: 1, 1: 1 }, function ( n ) { return _.isNumber( n ); } ), true, 'any member of object-literal passed the test in iterator' );

    // Test if any member passes with an iterator bound to a specific scope.
    equal( _.any( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n * this.x ); }, { x: 2 } ), true, 'any member passed the test in iterator when bound to `scope`' );

    // Test for the alias `_.some`.
    equal( _.some( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n ); } ), true, 'successfully aliased with _.some' );

    // Test if any member, including deep members, in an array passes the iterator's test.
    equal( _.any( [ 1, 2, 3, [ 4, 5, 6 ] ], function ( n ) { return _.isNumber( n ); }, true ), true, 'any member (including deep members) in array passed the test in iterator' );

    // Test if any member, including deep members, in an object-literal passes the iterator's test.
    equal( _.any( { 0: 1, 1: { 0: 1, 1: 2 } }, function ( n ) { return _.isNumber( n ); }, true ), true, 'any member (including deep members) in object-literal passed the test in iterator' );
  }
); // End of "any" tests


test( "average",
  function ()
  {
    // Test for computing the average of values in an array.
    equal( _.average( [ 1, 2, 3 ] ), 2, 'the average of an array of values was computed' );

    // Test for computing the average of values in an object-literal.
    equal( _.average( { 0: 1, 1: 2, 2: 3 } ), 2, 'the average of an object-literal\'s values was computed' );

    // Test for computing the average of values, including deep members, in an array.
    equal( _.average( [ 1, 2, [ 3 ] ], true ), 2, 'the average value of an array with deep members was computed' );

    // Test for computing the average with a callback function applied to each value, including deep members.
    equal( _.average( [ 1, 2, [ 3 ] ], function ( n ) { return n * 2; }, true ), 4, 'the average value of an array with deep members was computed while applied to a callback function' );
  }
); // End of "average" tests


test( "clear",
  function ()
  {
    // Test for clearing all values from an array.
    deepEqual( _.clear( [ 1, 2 ] ), [], 'an array of values was cleared' );

    // Test for clearing all values from an object-literal.
    deepEqual( _.clear( { 0: 1, 1: 2 } ), {}, 'an object-literal\'s values were cleared' );
  }
); // End of "clear" tests


test( "clone",
  function ()
  {
    // Test for a shallow clone of an array.
    deepEqual( _.clone( [ 1, 2, [ 3 ] ] ), [ 1, 2, [ 3 ] ], 'an array was cloned' );

    // Test for a shallow clone of an object-literal.
    deepEqual( _.clone( { 0: 1, 1: 2 } ), { 0: 1, 1: 2 }, 'an object-literal was cloned' );

    // Test for a deep clone of an array, verifying that modifications to the original do not affect the clone.
    var arr = [ 1, 2, [ 3 ] ];
    var arr2 = _.clone( arr, true );
    arr[ 2 ][ 0 ] = 4; // Modify the original nested array.
    deepEqual( _.clone( arr2, true ), [ 1, 2, [ 3 ] ], 'an array deeply was cloned' );
  }
); // End of "clone" tests


test( "contains",
  function ()
  {
    // Test for finding a simple value in an array.
    deepEqual( _.contains( [ 1, 2 ], 2 ), true, 'found simple value in array' );

    // Test for finding a simple value in an object-literal.
    deepEqual( _.contains( { 0: 1, 1: 2 }, 2 ), true, 'found simple value in object-literal' );

    // Test for finding a complex value in an object-literal.
    deepEqual( _.contains( { 0: 1, 1: [ 2 ] }, [ 2 ] ), true, 'found complex value in object-literal' );

    // Test for the alias `_.inArray`.
    deepEqual( _.inArray( { 0: 1, 1: 2 }, 2 ), true, 'successfully aliased with _.inArray' );

    // Test for deeply finding a value in a nested array structure.
    deepEqual( _.contains( { 0: 1, 1: [ 2 ] }, 2, true ), true, 'successfully deeply found value in array' );
  }
); // End of "contains" tests


test( "count",
  function ()
  {
    // Test for counting values in an array that pass an iterator's test.
    equal( _.count( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n ); } ), 3, 'successfully counted values in array that passed iterator\'s test' );

    // Test for counting values in an object-literal that pass an iterator's test.
    equal( _.count( { 0: 1, 1: 2 }, function ( n ) { return _.isNumber( n ); } ), 2, 'successfully counted values in object-literal that passed iterator\'s test' );

    // Test for counting values with an iterator bound to a specific scope.
    equal( _.count( [ 1, 2, 3 ], function ( n ) { return _.isNumber( n + this.x ); }, { x: 2 } ), 3, 'successfully counted values in array that passed iterator\'s test and are bound to `scope`' );

    // Test for deeply counting values, including nested members, in an array.
    equal( _.count( [ 1, 2, [ 3 ] ], function ( n ) { return _.isNumber( n ); }, true ), 3, 'successfully counted values (including nested members) in array that passed iterator\'s test' );
  }
); // End of "count" tests


test( "countBy",
  function ()
  {
    // Test for grouping and counting array values based on a mapping function.
    deepEqual( _.countBy( [ 1.3, 1.5, 2.2, 2.9 ], function ( n ) { return Math.floor( n ); } ), { 1: 2, 2: 2 }, 'successfully counted an array of values' );

    // Test for grouping and counting object-literal values based on their own value.
    deepEqual( _.countBy( { 0: "Red", 1: "Red", 2: "Blue" }, function ( c ) { return c; } ), { "Blue": 1, "Red": 2 }, 'successfully counted an object-literal\'s values' );

    // Test for grouping and counting object-literal values with an iterator bound to a specific scope.
    deepEqual( _.countBy( { 0: "Red", 1: "Red", 2: "Blue" }, function ( c ) { return c + this.x; }, { x: " is a Color!" } ), { "Red is a Color!": 2, "Blue is a Color!": 1 }, 'successfully counted an object-literal\'s values while bound to `scope`' );
  }
); // End of "countBy" tests


test( "deep",
  function ()
  {
    // Test for deep iteration over a simple array.
    _.deep( [ 1, 2, 3 ], function ( d, i, v, r )
    {
      equal( v, parseInt( i ) + 1, '[1,2,3] each iteration provided index and value from array' );
    } );

    // Test for deep iteration over a nested array, ensuring all levels are visited.
    _.deep( [ 1, 2, [ 3, [ 4 ] ] ], function ( d, i, v, r )
    {
      equal( v, v, '[1,2,[3,[4]]] each iteration provided index and value from array while going deep' );
    } );

    // Test for deep iteration to a specified depth.
    var last = 0;
    _.deep( [ 1, 2, [ 3, [ 4 ] ] ], function ( d, i, v, r ) { last = v; }, 2 );
    deepEqual( last, [ 4 ], 'iterated to a specified depth in an array' );

    // Test that the iterator receives a reference to the target collection.
    var arr = [ 1, 2 ];
    _.deep( [ 1, 2 ], function ( d, i, v, r )
    {
      deepEqual( arr, r, 'each iteration has a reference to the target collection' );
    } );

    // Test for deep iteration over an object-literal.
    _.deep( { 0: 1, 1: 2 }, function ( d, i, v, r )
    {
      equal( v, parseInt( i ) + 1, '{0:1, 1:2} each iteration provided index and value from object-literal' );
    } );

    // Test deep iteration with the `noArrays` option, preventing traversal into arrays.
    last = 0;
    _.deep( { 0: { color: 'Red' }, 1: [ 1, 2, 3 ] }, function ( d, i, v, r )
    {
      last = v;
    }, true );
    deepEqual( last, [ 1, 2, 3 ], 'did not iterate through arrays when `noArrays` was passed' );

    // Test deep iteration with the `noObjects` option, preventing traversal into object-literals.
    last = 0;
    _.deep( { obj: { 0: [ 1, 2, 3 ], 1: { color: 'Red' } }, fn: function ( d, i, v, r )
    {
      last = v;
    }, noArrays: false, noObjects: true } );
    deepEqual( last, { color: 'Red' }, 'did not iterate through object-literals when `noObjects` was passed' );

    // Test for successfully passing additional arguments to the iterator function.
    var args = [ 'test' ];
    _.deep( { obj: [ 1, 2 ], fn: function ( d, i, v, r, a )
    {
      equal( "test", a, 'successfully passed arguments to iterator' );
    }, args: args } );
  }
); // End of "deep" tests


test( "each",
  function ()
  {
    // Basic test for iterating over an array, checking value and index.
    _.each( [ 1, 2, 3 ], function ( v, i )
    {
      equal( v, parseInt( i ) + 1, 'each iteration provided index and value from array' );
    } );

    // Test for iteration with a custom scope object.
    var answers = [];
    _.each( [ 1, 2, 3 ], function ( v, i ) { answers.push( v * this.multiplier ); }, { multiplier: 5 } );
    equal( answers.join( ', ' ), '5, 10, 15', 'scope object property accessed' );

    // Test that the original collection is passed as the third argument to the iterator.
    answers = false;
    _.each( [ 1, 2, 3 ], function ( v, i, arr ) { if ( _.contains( arr, v ) ) answers = true; } );
    equal( true, answers, 'original collection can be referenced from within the iterator' );

    // Test for the alias `_.forEach`.
    answers = [];
    _.forEach( [ 1, 2, 3 ], function ( v, i ) { answers.push( v ); } );
    equal( answers.join( ', ' ), '1, 2, 3', 'can be aliased with _.forEach"' );

    // Test for iterating over an object-literal, checking value and key.
    answers = [ '#F00', '#0F0', '#00F' ];
    _.each( { red: '#F00', green: '#0F0', blue: '#00F' }, function ( v, i )
    {
      equal( _.inArray( answers, v ), true, 'each iteration provided index and value from object-literal' );
    } );
  }
); // End of "each" tests


test( "empty",
  function ()
  {
    // Test for emptying an array by replacing its elements with undefined.
    deepEqual( _.empty( [ 1, 2 ] ), [ undefined, undefined ], 'successfully emptied an array' );

    // Test for emptying an object-literal by replacing its values with undefined.
    deepEqual( _.empty( { 0: 1, 1: 2 } ), { 0: undefined, 1: undefined }, 'successfully emptied an object-literal' );

    // Test for deeply emptying an array containing nested arrays.
    deepEqual( _.empty( [ 1, [ 2 ] ], true ), [ undefined, [ undefined ] ], 'successfully emptied an array with nested arrays' );

    // Test for deeply emptying an array containing nested object-literals.
    deepEqual( _.empty( [ 1, { 0: 2 } ], true ), [ undefined, { 0: undefined } ], 'successfully emptied an array with nested object-literals' );

    // Test for deeply emptying an object-literal containing nested arrays.
    deepEqual( _.empty( { 0: 1, 1: [ 2 ] }, true ), { 0: undefined, 1: [ undefined ] }, 'successfully emptied an object-literal with nested arrays' );

    // Test for deeply emptying an object-literal containing nested object-literals.
    deepEqual( _.empty( { 0: 1, 1: { 0: 2 } }, true ), { 0: undefined, 1: { 0: undefined } }, 'successfully emptied an object-literal with nested object-literals' );
  }
); // End of "empty" tests


test( "filter",
  function ()
  {
    // Test for filtering elements from an array based on a condition.
    deepEqual( _.filter( [ 1, 2 ], function ( n ) { return n >= 2; } ), [ 2 ], 'successfully filtered an array with condition' );

    // Test for filtering elements from an object-literal based on a condition.
    deepEqual( _.filter( { 0: 1, 1: 2 }, function ( n ) { return n >= 2; } ), [ 2 ], 'successfully filtered an object-literal with condition' );

    // Test for filtering elements with a condition applied using a custom scope.
    deepEqual( _.filter( [ 1, 2 ], function ( n ) { return n == this.x; }, { x: 2 } ), [ 2 ], 'successfully filtered an array while applying a scope' );
  }
); // End of "filter" tests


test( "find",
  function ()
  {
    // Test for finding the first value in an array that satisfies a condition.
    equal( _.find( [ 1, 2 ], function ( n ) { return n === 2; } ), 2, 'successfully found a value in an array' );

    // Test for finding the first value in an object-literal that satisfies a condition.
    equal( _.find( { 0: 1, 1: 2 }, function ( n ) { return n === 2; } ), 2, 'successfully found a value in an object-literal' );

    // Test for finding a value with a condition applied using a custom scope.
    equal( _.find( [ 1, 2 ], function ( n ) { return n === this.x; }, { x: 2 } ), 2, 'successfully found a value in an array while bound to scope' );

    // Test for deeply finding a value in a nested array structure.
    equal( _.find( [ 1, { 0: 2 } ], function ( n ) { return n === 2; }, true ), 2, 'successfully deeply found a value in an array' );
  }
); // End of "find" tests


test( "findKey",
  function ()
  {
    // Test for finding the key (index) in an array whose value satisfies a condition.
    equal( _.findKey( [ 1, 2 ], function ( k ) { return k == 1; } ), 2, 'successfully found a value in an array located at key' );

    // Test for finding the key in an object-literal whose value satisfies a condition.
    equal( _.findKey( { 0: 1, 1: 2 }, function ( k ) { return k == 1; } ), 2, 'successfully found a value in an object-literal located at key' );

    // Test for finding a key with a condition applied using a custom scope.
    equal( _.findKey( [ 1, 2 ], function ( k ) { return k == this.x; }, { x: 1 } ), 2, 'successfully found a value in an array located at key while bound to scope' );

    // Test for deeply finding a key in a nested array structure.
    equal( _.findKey( [ 1, [ 2, 3, 4 ] ], function ( k ) { return k == 2; }, true ), 4, 'successfully deeply found a value in an array located at key' );
  }
); // End of "findKey" tests


test( "flatten",
  function ()
  {
    // Test for flattening a simple nested array.
    deepEqual( _.flatten( [ 1, [ 2 ] ] ), [ 1, 2 ], 'successfully flattened an array' );

    // Test for flattening an object-literal containing a nested object.
    deepEqual( _.flatten( { 0: 1, 1: { 1: 2 } } ), [ 1, 2 ], 'successfully flattened an object-literal' );

    // Test for flattening an object-literal containing nested arrays.
    deepEqual( _.flatten( { 0: 1, 1: [ 2 ] } ), [ 1, 2 ], 'successfully flattened an object-literal with nested arrays' );

    // Test for flattening an array containing a nested object-literal.
    deepEqual( _.flatten( [ 1, [ 2, { 0: 3 } ] ] ), [ 1, 2, 3 ], 'successfully flattened an array with nested object-literal' );

    // Test for flattening an object-literal with nested arrays to a specified depth.
    deepEqual( _.flatten( { 0: 1, 1: 2, 2: [ 3, [ 4 ] ] }, 1 ), [ 1, 2, [ 3, [ 4 ] ] ], 'successfully flattened an object-literal with nested arrays to specified depth' );

    // Test for flattening an array with nested object-literals to a specified depth.
    deepEqual( _.flatten( [ 1, 2, { 0: 3, 1: [ 4 ] } ], 1 ), [ 1, 2, { 0: 3, 1: [ 4 ] } ], 'successfully flattened an array with nested object-literals to specified depth' );

    // Test for flattening an array to a specified depth.
    deepEqual( _.flatten( [ 1, [ 2, [ 3 ] ] ], 2 ), [ 1, 2, [ 3 ] ], 'successfully flattened an array to specified depth' );
  }
); // End of "flatten" tests


test( "groupBy",
  function ()
  {
    // Test for grouping array elements by a property derived from a mapping function.
    var len = _.len( _.groupBy( [ 'Cat', 'Dog', 'Iguana' ], function ( s ) { return s.length; } ) );
    equal( len, 2, 'grouped array by property length with mapping function' );

    // Test for grouping object-literals within an array by a common property key.
    len = _.len( _.groupBy( [ { 'elm': 'K', 'type': 'metal' }, { 'elm': 'Ca', 'type': 'metal' }, { 'elm': 'Ne', 'type': 'gas' } ], 'type' ) );
    equal( len, 2, 'grouped object-literals in array by property' );
  }
); // End of "groupBy" tests


test( "groupsOf",
  function ()
  {
    // Test for grouping array elements into sub-arrays of a specified size.
    var len = _.len( _.groupsOf( [ 1, 2, 3, 4 ], 2 ) );
    equal( len, 2, 'grouped array elements in groups of 2' );

    // Test for grouping array elements with padding to ensure full groups.
    len = _.len( _.groupsOf( [ 1, 2, 3, 4, 5 ], 2, '*' ) );
    equal( len, 3, 'grouped array elements in groups of 2 with padding' );

    // Test for grouping object-literal values into sub-arrays of a specified size.
    len = _.len( _.groupsOf( { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 }, 2 ) );
    equal( len, 3, 'grouped object-literal values in groups of 2' );

    // Test for grouping object-literal values with padding.
    len = _.len( _.groupsOf( { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 }, 2, '*' ) );
    equal( len, 4, 'grouped object-literal values in groups of 2 with padding' );
  }
); // End of "groupsOf" tests


test( "has",
  function ()
  {
    // Test if an object literal possesses a specific key.
    var obj = { 'one': 1, 'two': 2 };
    equal( _.has( obj, 'two' ), true, 'object literal has key' );

    // Test if an array has an element at a specific index.
    equal( _.has( [ 1, 2 ], 0 ), true, 'array has index' );

    // Test for a non-existent key in an object.
    equal( _.has( obj, 'three' ), false, 'array does not have key' );

    // Test for the alias `_.keyExists`.
    equal( _.has( obj, 'two' ), true, 'successfully aliased by _.keyExists' );

    // Test for deeply checking if an object-literal has a nested key.
    equal( _.has( { 0: 1, 1: { color: '#F00' } }, 'color', true ), true, 'successfully deeply tested if an object-literal has a key' );
  }
); // End of "has" tests


test( "invert",
  function ()
  {
    // Test for inverting the key/value pairs of an object-literal.
    var obj = { 'one': 1, 'two': 2 };
    deepEqual( _.invert( obj ), { 1: 'one', 2: 'two' }, 'successfully inverted object-literal key/value pairs' );

    // Test for inverting an array into an object-literal, where values become keys and indices become values.
    deepEqual( _.invert( [ 1, 2 ] ), { 1: '0', 2: '1' }, 'successfully inverted array to object-literal with inverted key/value pairs' );
  }
); // End of "invert" tests


test( "invoke",
  function ()
  {
    // Test for invoking an iterator function on all values in an object-literal, passing additional arguments.
    deepEqual( _.invoke( { 0: 'Tulip', 1: 'Daisy' }, function ( v, a ) { return v + a; }, [ ' is a flower.' ] ), [ "Tulip is a flower.", "Daisy is a flower." ], 'successfully invoked iterator on all values in object-literal' );
  }
); // End of "invoke" tests


test( "isEmpty",
  function ()
  {
    // Test for determining if an object-literal is empty.
    equal( _.isEmpty( {} ), true, 'successfully determined if an object-literal is empty' );

    // Test for determining if an array is empty.
    equal( _.isEmpty( [] ), true, 'successfully determined if an array is empty' );

    // Test for determining if a non-empty object-literal is empty.
    equal( _.isEmpty( { 0: 1 } ), false, 'successfully determined if an object-literal is empty' );

    // Test for determining if a non-empty array is empty.
    equal( _.isEmpty( [ 1 ] ), false, 'successfully determined if an array is empty' );
  }
); // End of "isEmpty" tests


test( "isUnique",
  function ()
  {
    // Test for determining if a specific value within an array is unique (false case, value appears multiple times).
    deepEqual( _.isUnique( [ 1, 2, 3, 4, 4 ], 4 ), false, 'successfully determined if a value in array is unique' );

    // Test for determining if a complex value within an array is unique (true case, value appears once).
    deepEqual( _.isUnique( [ [ 1, 2 ], [ 1, 4 ] ], [ 1, 2 ] ), true, 'successfully determined if a complex value in array is unique' );

    // Test for determining if a complex value within an object-literal is unique.
    deepEqual( _.isUnique( { 0: [ 1, 2 ], 1: [ 1, 4 ] }, [ 1, 2 ] ), true, 'successfully determined if a complex value in an object-literal is unique' );
  }
); // End of "isUnique" tests