/*
 * This file contains unit tests for the 'mixin' utility function.
 * It uses the Chai assertion library and Mocha test framework.
 *
 * All tests are designed to ensure the 'mixin' function behaves as expected,
 * particularly concerning lifecycle methods like componentDidMount and componentWillUnmount,
 * and state management.
 */

var  chai    =  require('chai') ;  // Import the Chai assertion library
var  expect  =  chai.expect ;     // Extract the 'expect' assertion style
var  mixin   =  require('../src/util/mixin') ; // Import the mixin utility function

// --- Test Suite for 'mixin' function ---
describe ( 'mixin' ,  function ( )  {

    // --- Nested Test Suite: Initialization ---
    describe ( 'init' , function ( ) {

        it ( 'should return an object with two functions' , function ( ) {
            // Call the mixin function without any arguments to get a base object.
            var  obj  =  mixin ( ) ;

            // Assert that the 'componentDidMount' property exists and is a function.
            expect ( obj.componentDidMount ) . to . be . a ( 'function' ) ;

            // Assert that the 'componentWillUnmount' property exists and is a function.
            expect ( obj.componentWillUnmount ) . to . be . a ( 'function' ) ;
        } ) ; // End of 'init' test case

    } ) ; // End of 'init' describe block

    // --- Nested Test Suite: componentDidMount behavior ---
    describe ( 'componentDidMount' ,  function ( )  {

        it ( 'should call getState on the store, which calls setState on the component' ,  function ( )  {
            // Create a mixin instance with a custom getState implementation.
            var  obj  =  mixin ( {
                getState :  function ( callback )  {
                    // This getState implementation immediately calls the callback with 123.
                    callback ( 123 ) ;
                }
            } ) ;

            // Mock the setState method of the component.
            obj.setState  =  function ( state )  {
                // Verify that setState was called with the expected value from getState.
                expect ( state ) . to . equal ( 123 ) ;
            } ;

            // Trigger the componentDidMount lifecycle method.
            obj.componentDidMount ( ) ;
        } ) ;

        it ( 'should also work with a state key' ,  function ( )  {
            // Create a mixin instance, specifying a 'key' for state.
            var  obj  =  mixin ( {
                getState :  function ( callback )  {
                    // Simulate asynchronous data fetching.
                    callback ( 123 ) ;
                }
            } ,  'key' ) ; // The 'key' argument indicates state should be nested.

            // Mock the setState method.
            obj.setState  =  function ( state )  {
                // Verify that setState was called with an object containing the key and value.
                expect ( state.key ) . to . equal ( 123 ) ;
            } ;

            // Simulate the component mounting.
            obj.componentDidMount ( ) ;
        } ) ;

        it ( 'should not allow a mixin to be reused' ,  function ( )  {
            // Initialize a mixin with a dummy getState function.
            var  obj  =  mixin ( {
                getState :  function ( )  {
                    return  function ( ) { } ; // Return an empty function.
                }
            } ) ;

            // Provide a dummy setState implementation.
            obj.setState  =  function ( )  { } ;

            // First call to componentDidMount should succeed.
            obj.componentDidMount ( ) ;

            // Expect that calling componentDidMount a second time will throw an error.
            expect ( function ( )  {
                // Attempt to reuse the mixin.
                obj.componentDidMount ( ) ;

            } ) . to . throw ( 'Cannot reuse a Hoverboard mixin.' ) ;
        } ) ;

    } ) ; // End of 'componentDidMount' describe block

    // --- Nested Test Suite: componentWillUnmount behavior ---
    describe ( 'componentWillUnmount' ,  function ( )  {

        it ( 'should call the function returned by getState, only once' ,  function ( )  {
            // Initialize a counter to track calls.
            var  called  =  0 ,
                 obj     =  mixin ( {
                    getState :  function ( )  {
                        // getState returns a function that increments 'called'.
                        return  function ( )  {
                            called ++ ;
                        } ;
                    }
                } ) ;

            // Simulate mounting, which will set up the unmount handler.
            obj.componentDidMount ( ) ;

            // Call componentWillUnmount multiple times.
            obj.componentWillUnmount ( ) ;
            obj.componentWillUnmount ( ) ;
            obj.componentWillUnmount ( ) ;

            // Assert that the unmount handler was called exactly once.
            expect ( called ) . to . equal ( 1 ) ;
        } ) ;

    } ) ; // End of 'componentWillUnmount' describe block

} ) ; // End of 'mixin' describe block