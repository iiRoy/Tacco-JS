// This is a comprehensive test suite for the 'isStyleSupported' utility function.
describe ( 'isStyleSupported' , function ( ) {
  'use strict' ; // Enforcing strict mode for safer JavaScript execution.

  // Initialize the 'expect' assertion library from Chai.
  var expect = chai.expect ,

      // Check for the standard CSS.supports API in the window object.
      hasStandardSupports = 'CSS' in window && 'supports' in window.CSS ,

      // Check for Opera's legacy supportsCSS API.
      hasOperaSupports = 'supportsCSS' in window ,

      // Determine if any native CSS support detection mechanism is available.
      hasNativeSupports = hasStandardSupports || hasOperaSupports ;

  /**
   * A helper function designed to execute a set of assertions.
   * It temporarily disables and then re-enables any native CSS support
   * detection mechanisms (like `CSS.supports` or `supportsCSS`)
   * to ensure consistent test results across different browser environments,
   * especially when dealing with feature detection.
   *
   * @param {Function} assertions - A callback function containing the actual test assertions.
   */
  function testAssertions ( assertions ) {
    assertions ( ) ; // Execute assertions once with native support potentially active.

    // If a native CSS support mechanism is detected, proceed to disable and re-enable it.
    if ( hasNativeSupports ) {
      var ref ; // Variable to hold a reference to the original native support function.

      // Temporarily disable the standard CSS.supports function.
      if ( hasStandardSupports ) {
        ref = window.CSS.supports ; // Store original function.
        window.CSS.supports = undefined ; // Set to undefined to simulate absence.
      }
      // Or, if Opera's supportsCSS is present, disable that instead.
      else if ( hasOperaSupports ) {
        ref = window.supportsCSS ; // Store original function.
        window.supportsCSS = undefined ; // Set to undefined.
      }

      assertions ( ) ; // Execute assertions again, this time with native support disabled.

      // Restore the original native support function after the tests.
      if ( hasStandardSupports ) {
        window.CSS.supports = ref ; // Restore standard CSS.supports.
      } else if ( hasOperaSupports ) {
        window.supportsCSS = ref ; // Restore Opera's supportsCSS.
      }
    }
  }


  // --- Test Cases for Property Support ---

  // Test block for properties that are expected to be supported.
  it ( 'should return true for supported properties' , function ( ) {
    testAssertions ( function ( ) {
      // Assertions for common, supported CSS properties.
      expect ( isStyleSupported ( 'background' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'border' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'display' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'font-size' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'margin' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'padding' ) ) . to . equal ( true ) ;
    } ) ;
  } ) ;


  // Test block for properties that are expected to be unsupported.
  it ( 'should return false for unsupported properties' , function ( ) {
    testAssertions ( function ( ) {
      // Assertions for non-existent or invalid CSS properties.
      expect ( isStyleSupported ( 'foo' ) ) . to . equal ( false ) ;
      expect ( isStyleSupported ( 'bar' ) ) . to . equal ( false ) ;
      expect ( isStyleSupported ( 'foo-bar' ) ) . to . equal ( false ) ;
    } ) ;
  } ) ;


  // --- Test Cases for Property and Value Support ---

  // Test block for properties with valid, supported values.
  it ( 'should return true for supported properties and values' , function ( ) {
    testAssertions ( function ( ) {
      // Assertions for properties with valid CSS values.
      expect ( isStyleSupported ( 'display' , 'block' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'display' , 'inline' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'margin' , '5px' ) ) . to . equal ( true ) ;
      expect ( isStyleSupported ( 'padding' , '5em' ) ) . to . equal ( true ) ;
    } ) ;
  } ) ;


  // Test block for properties with invalid or unsupported values.
  it ( 'should return false for unsupported properties and values' , function ( ) {
    testAssertions ( function ( ) {
      // Assertions for properties with invalid or non-standard CSS values.
      expect ( isStyleSupported ( 'display' , 'foo' ) ) . to . equal ( false ) ;
      expect ( isStyleSupported ( 'font-size' , 'bar' ) ) . to . equal ( false ) ;
      expect ( isStyleSupported ( 'margin' , '5foo' ) ) . to . equal ( false ) ;
      expect ( isStyleSupported ( 'padding' , '3bar' ) ) . to . equal ( false ) ;
    } ) ;
  } ) ;

} ) ; // End of the 'isStyleSupported' test suite definition.