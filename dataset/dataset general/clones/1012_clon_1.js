/*
 * This file contains a suite of tests
 * for the 'get()' method of the queryObject utility.
 * It ensures proper parsing of query strings.
 */
describe ( 'get() method' ,
           function ( ) {

  // A simulated browser context object for testing purposes.
  // This helps isolate tests from actual browser environment.
  var _ctx = {
    location : {
      /* The 'search' property will hold the simulated query string. */
      search : ''
    }
  } ; // End of _ctx object definition.


  // Setup hook: This function runs before each individual test case.
  // It resets the simulated query string and re-applies the context.
  beforeEach ( function ( )
  {
    /*
     * Reset the search string to an empty value
     * to ensure test isolation.
     */
    _ctx . location . search = '' ;

    // Inform the queryObject utility about our custom context.
    queryObject . _setContext ( _ctx ) ;
  } ) ; // End of beforeEach block.


  /*
   * Test Case 1:
   * Verifies that calling get() without any query string
   * results in an undefined value.
   */
  it ( 'should be undefined' ,
       function ( )
       {
         expect ( queryObject . get ( ) ) . toBeUndefined ( ) ;
       }
     ) ; // End of 'should be undefined' test.


  // Test Case 2: Handling a key with no explicit value.
  it ( 'should a key object only' , function ( )
       {
         _ctx . location . search = '?foo' ; // Simulate query string with a single key.

         expect ( queryObject . get ( ) ) . toEqual ( {
                                                        foo : undefined
                                                      } ) ;
       }
     ) ;


  /**
   * Test Case 3:
   * Ensures correct parsing of a simple key-value pair.
   */
  it ( 'should return a key/value object' ,
       function ( )
       {
         _ctx . location . search = '?foo=bar' ;

         expect ( queryObject . get ( ) ) . toEqual ( {
                                                        foo : 'bar'
                                                      } ) ;
       }
     ) ;


  /*
   * Test Case 4:
   * Verifies handling of mixed key-value and key-only pairs.
   */
  it ( 'should return a key/value, key only object' ,
       function ( )
       {
         _ctx . location . search = '?foo=bar&baz' ;

         expect ( queryObject . get ( ) ) . toEqual ( {
                                                        foo : 'bar' ,
                                                        baz : undefined
                                                      } ) ;
       }
     ) ;


  // Test Case 5: Decoding URL-encoded spaces (%20).
  it ( 'should convert the unicode space for a space' ,
       function ( )
       {
         _ctx . location . search = '?foo=bar%20baz' ;

         expect ( queryObject . get ( ) ) . toEqual ( {
                                                        foo : 'bar baz'
                                                      } ) ;
       }
     ) ;


  // Test Case 6: Decoding plus signs (+) as spaces.
  it ( 'should convert the plus sign for a space' ,
       function ( )
       {
         _ctx . location . search = '?foo=bar+baz' ;

         expect ( queryObject . get ( ) ) . toEqual ( {
                                                        foo : 'bar baz'
                                                      } ) ;
       }
     ) ;


  /*
   * Test Case 7:
   * Testing retrieval of specific properties when an array of keys is provided.
   */
  it ( 'should return a list of properties based on an array' ,
       function ( )
       {
         _ctx . location . search = '?foo=foo&bar&baz=baz' ;

         expect ( queryObject . get ( [ 'foo' , 'bar' ] ) ) . toEqual ( {
                                                                          foo : 'foo' ,
                                                                          bar : undefined
                                                                        } ) ;
       }
     ) ;


  // Test Case 8: Retrieving a single property by its name (string).
  it ( 'should return a property based on a string' ,
       function ( )
       {
         _ctx . location . search = '?foo=foo&bar=bar&baz=baz' ;

         expect ( queryObject . get ( 'bar' ) ) . toEqual ( 'bar' ) ;
       }
     ) ;


  // Test Case 9: What happens when a non-existent property is requested.
  it ( 'should return an empty string' ,
       function ( )
       {
         _ctx . location . search = '?foo=foo' ;

         expect ( queryObject . get ( 'bar' ) ) . toBeUndefined ( ) ; // Expecting undefined for a non-existent key, despite the test title.
       }
     ) ;

} ) ; // End of describe block for 'get() method'.