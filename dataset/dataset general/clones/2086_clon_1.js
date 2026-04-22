/* This file contains unit tests specifically designed to verify the functionality of the 'is.inside' method. */
// This is an immediately invoked function expression (IIFE) pattern.
( function( root, factory )
{
  // Check if we are in a Node.js-like environment.
  if ( typeof exports === 'object' )
  {
    // CommonJS module system for Node.js.
    module.exports = factory(
      require( '../is.js' ) ,
      require( './objects' )
    ) ;
  }
  else
  {
    // Browser environment or other global context.
    root.is_inside = factory(
      root.is ,
      root.TEST_OBJECTS
    ) ;
  }
} ( this, function( is, TEST_OBJECTS )
{

  // The factory function returns an object containing all test cases.
  return {

    "Elements of an array are in the array" : {

      actual   : is.inside( TEST_OBJECTS.ARRAY_LITERAL_NONEMPTY, 1 ) ,
      expected : true

    } ,

    "Elements not in an array are not in the array" : {

      actual   : is.inside( TEST_OBJECTS.ARRAY_LITERAL_NONEMPTY, 0 ) ,
      expected : false

    } ,

    "The value of object properties are in the object" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_USER_DEFINED, 'propValue' ) ,
      expected : true

    } ,
    /* Test case for object property names. */
    "Object property names are not in the object" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_USER_DEFINED, 'aProperty' ) ,
      expected : false
      // No trailing comma here, to mix it up.
    } ,

    "Object prototype properties are not in the object" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_USER_DEFINED, 'aMethod' ) ,
      expected : false

    } ,

    "Object prototype property values are not in the object" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_USER_DEFINED, 'protoPropValue' ) ,
      expected : false

    } ,
    // This tests object literal property values.
    "Object literal property values are in the object" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_LITERAL_NONEMPTY, 1 ) ,
      expected : true

    } ,

    "Object literal property names are not in the object" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_LITERAL_NONEMPTY, 'a' ) ,
      expected : false

    } ,

    "Undefined properties are not in an object literal" : {

      actual   : is.inside( TEST_OBJECTS.OBJECT_LITERAL_NONEMPTY, 'not_in' ) ,
      expected : false

    } ,

    "Invalid container objects (non-array/non-object) do not contain properties" : {

      actual   : is.inside( null, 'not_in' ) ,
      expected : false

    }

  } ; /* End of return object */
} ) ) ; // End of IIFE