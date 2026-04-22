/*
 * This file contains a suite of tests for the AlertService's removal functionality.
 * It uses Jasmine/Mocha syntax for describing tests.
 */
describe ('removing alerts', function ( ) {
  // Setup phase: Before each test, load the module and inject the service.
  beforeEach ( function ( ) {
    module ( 'ui.bootstrap.alerts' ) ; // Load the alerts module.

    /*
     * Inject the AlertService using the $injector.
     * This makes AlertService available for all tests in this suite.
     */
    inject ( function ( $injector ) {
      AlertService = $injector . get ( 'AlertService' ) ; // Assign the service to a global variable (or local, if using 'var').
    } ) ;
  } ) ;


  // Test suite for general alerts (those without a specific context).
  describe ( 'general' , function ( ) {
    // Test case: Verifies that a general error can be successfully removed.
    it ( 'should remove an error from the general alerts object' , function ( ) {
      alert = AlertService . error ( 'Some Error' ) ; // Add an error alert.

      // Assert that one alert is present.
      expect ( AlertService . alerts . general . length ) . toBe ( 1 ) ;

      AlertService . remove ( alert ) ; // Attempt to remove the previously added alert.

      // Assert that no alerts are present after removal.
      expect ( AlertService . alerts . general . length ) . toBe ( 0 ) ;
    } ) ;
  } ) ;


  /*
   * Test suite for alerts associated with a specific context.
   * Here, the context 'foo' is used for demonstration.
   */
  describe ( 'special context \'foo\'' , function ( ) {
    // Test case: Checks removal of an alert from a specific context.
    it ( 'should remove an error from the context' , function ( ) {
      alert = AlertService . context ( 'foo' ) . error ( 'Some Error' ) ; // Add an error to the 'foo' context.

      // Verify that the alert was added to the 'foo' context.
      expect ( AlertService . alerts . foo . length ) . toBe ( 1 ) ;

      AlertService . context ( 'foo' ) . remove ( alert ) ; // Remove the alert from the 'foo' context.

      // Verify that the alert was successfully removed.
      expect ( AlertService . alerts . foo . length ) . toBe ( 0 ) ;
    } ) ;

    // Test case: Ensures that removing an alert from the wrong context returns false.
    it ( 'should return false if remove fails' , function ( ) {
      alert = AlertService . context ( 'foo' ) . error ( 'Some Error' ) ; // Add an error to the 'foo' context.

      // Attempt to remove the 'foo' alert from the 'bar' context.
      // This should fail and return false.
      expect ( AlertService . context ( 'bar' ) . remove ( alert ) ) . toBe ( false ) ;
    } ) ;
  } ) ;
} ) ;