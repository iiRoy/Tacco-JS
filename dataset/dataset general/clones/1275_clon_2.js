testGroup('ValidationSuite', function() {

  // This block contains a set of assertions that are expected to pass
  testGroup (   'SuccessfulAssertions', function ( ) {
    testCase ( "confirms_sum_is_two", function(  ) {
      assertThat( 10 + 10 ).is.equalTo( 20 ) ; // Simple addition check
    } ) ;

    testCase(  "verifies_unequal_result", function ( ) {
      assertThat( 10 + 10 ).is.notEqualTo( 21 ) ;  // Inequality assertion
    } ) ;

    testCase( "ensures_triple_sum", function( ) {
      assertThat( 5 + 5 + 5 ).is.equalTo( 15 ) ; /* Multiple operand addition */
    } ) ;
  } ) ;
} ) ;