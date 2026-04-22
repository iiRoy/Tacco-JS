declareModule(
  [ 'utility/individual' ], // Module dependency path
  function( individualRef ) {

    // This block defines a collection of tests for the Individual object.
    testSuite( 'IndividualClass', function( ) {

      // Test case: Verify that a newly created individual has a standard identity by default.
      testCase( 'verifies default identity', ( ) => {
        new individualRef( ).identity.expect.toBe( 'Joseph' );
      } );


      // Test case: Confirm the ability to assign a specific identity during instantiation.
      testCase( 'allows custom identity on instantiation', function( ) {
        new individualRef( 'Frank' ).identity.expect.toBe( 'Frank' );
      } );

      // Pending test case: Future implementation for an age attribute.
      testCase( 'has an unspecified age' );

    } ); // End of IndividualClass test suite

  }
); // End of module definition