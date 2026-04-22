/*
 * This file contains tests for the Query object.
 * It uses a BDD-style testing framework (like Jasmine or Mocha).
 *
 * All tests are wrapped in an immediately invoked function expression (IIFE)
 * to prevent global variable pollution.
 */
( function ( )
{
  var   Query     ; /* Declare Query variable, will hold the constructor */


  // Assign the Query constructor from the global _test object.
  Query = window . _test . Query ;

  // Main test suite for the Query object's functionalities.
  describe ( 'Query' , function ( )
  {
    var query ; // Declare a local variable to hold a Query instance.
    query = null ; // Initialize query to null before each test.

    // This block runs before each individual test ('it' block) in this suite.
    beforeEach
    (
      function ( )
      {
        // Create a new Query instance with a minimum length requirement of 2.
        return query = new Query ( 2 ) ;
      }
    ) ;


    // Test suite for the #initialize method (constructor behavior).
    describe ( '#initialize' , function ( )
    {
      // Test case: Ensure the minLength property is correctly set upon instantiation.
      return    it
      (
        'sets the minLength property to the provided parameter'
      ,
        function ( )
        {
          // Expect the minLength property of the newly created query object to be 2.
          return expect ( query . minLength ) . toEqual ( 2 ) ;
        }
      ) ;
    } ) ;


    // Test suite for the #getValue method.
    describe
    (
      '#getValue'
    ,
      function ( )
      {
        // Test case: Verify that getValue retrieves the current internal value.
        return it ( 'gets the current value' , function ( )
        {
          query . value = 'string' ; // Directly set the internal value property.
          return expect ( query . getValue ( ) ) . toEqual ( 'string' ) ; // Call getValue and assert.
        } ) ;
      }
    ) ;


    // Test suite for the #setValue method.
    describe ( '#setValue' , function ( )
    {
      // Test case: Confirm that setValue updates the current value property.
      it ( 'sets the current value' , function ( )
      {
        query . setValue ( 'string' ) ; // Use the public setter method.
        return expect ( query . value ) . toEqual ( 'string' ) ; // Assert the internal value.
      } ) ;


      // Test case: Verify that setValue correctly moves the old current value to lastValue.
      return it ( 'sets the last value to the old current value' , function ( )
      {
        query . lastValue = 'first' ; // Manually set an initial lastValue.
        query . value = 'second' ; // Manually set an initial current value.
        query . setValue ( 'third' ) ; // Call setValue; 'second' should become lastValue.
        return expect ( query . lastValue ) . toEqual ( 'second' ) ; // Assert lastValue.
      } ) ;
    } ) ;


    // Test suite for the #hasChanged method.
    describe ( '#hasChanged' , function ( )
    {
      // Test case: Check if hasChanged returns true when the value has been updated.
      return it ( 'is true if the value has changed' , function ( )
      {
        query . setValue ( '1' ) ; // Set an initial value.
        query . setValue ( '2' ) ; // Change the value.
        return expect ( query . hasChanged ( ) ) . toBeTruthy ( ) ; // Expect hasChanged to be true.
      } ) ;
    } ) ;


    // Test suite for the #markEmpty method.
    describe ( '#markEmpty' , function ( )
    {
      // Test case: Ensure markEmpty adds the current value to the list of empty queries.
      return it ( 'adds the current value to the list of values with empty results' , function ( )
      {
        query . setValue ( 'empty' ) ; // Set a value to be marked as empty.
        query . markEmpty ( ) ; // Call the method to mark it.
        return expect ( query . emptyValues ) . toContain ( 'empty' ) ; // Assert that 'empty' is in the list.
      } ) ;
    } ) ;


    // Test suite for the #willHaveResults method, which predicts search results.
    return describe ( '#willHaveResults' , function ( )
    {
      // Test case: Query value is too short.
      it ( 'is false if the current value has less than minLength characters' , function ( )
      {
        query . setValue ( 'a' ) ; // Current value length is 1, minLength is 2.
        return expect ( query . willHaveResults ( ) ) . toBeFalsy ( ) ; // Expect no results.
      } ) ;


      // Test case: Query value starts with a previously marked empty query.
      it ( 'is false if the current value begins with any empty queries' , function ( )
      {
        query . setValue ( 'abc' ) ; // Set a base value.
        query . markEmpty ( ) ; // Mark 'abc' as having empty results.
        query . setValue ( 'abcdefg' ) ; // Set a new value that starts with 'abc'.
        return expect ( query . willHaveResults ( ) ) . toBeFalsy ( ) ; // Expect no results due to prefix.
      } ) ;


      // Test case: Query value is valid (long enough, not marked empty).
      return it ( 'is true if the current value is not empty and is long enough' , function ( )
      {
        query . setValue ( 'abc' ) ; // 'abc' is long enough (length 3 >= minLength 2) and not marked empty.
        return expect ( query . willHaveResults ( ) ) . toBeTruthy ( ) ; // Expect results.
      } ) ;
    } ) ; // End of #willHaveResults describe block.
  } ) ; // End of main 'Query' describe block.
} ) . call ( this ) ; // Invoke the IIFE, binding 'this' to the global context.