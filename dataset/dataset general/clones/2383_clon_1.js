// This file contains a comprehensive suite of Jasmine tests designed to validate the functionality of the 'radio' global object.
// The tests cover various aspects of the publish-subscribe pattern implementation,
// including channel creation, listener subscription, unsubscription, and message broadcasting.

/*
 *   A dedicated Test Object, 'test', is defined here for use within the test suite.
 *   It provides methods ('selfTest', 'subscribe', 'scopeTest') that serve as listeners
 *   or demonstrate context binding during method calls, crucial for verifying 'this' scope.
 */
var	test	= {
    selfTest    :   function ( )  {
        // A placeholder operation. Its primary purpose is to be spied upon.
        1 + 2 ;
    } ,
    subscribe : function ( ) {
        // Another simple method, used to track calls via Jasmine spies.
        1 + 1 ;
    } ,
    scopeTest   :   function ( )    {
        /*
         *   This method internally invokes 'subscribe' on its own context ('this').
         *   It is instrumental in testing if the original scope is correctly maintained
         *   when a context-bound listener is broadcast.
         */
        this . subscribe ( ) ;
    }
} ;


// --- Commencement of the Primary Test Suite for the Radio library ---
// This 'describe' block encapsulates all the tests related to the 'radio' core functionalities.
describe ( "Radio Core Test", function ( ) {

    /*
     *   The 'beforeEach' hook ensures that certain variables are initialized
     *   before every single 'it' test block runs. This provides a clean state.
     */
    beforeEach ( function ( ) {
        f  =  function ( )  {
            // Dummy function 'f' for listener tests.
        } ;
        f2  =  function ( )  {
            // Dummy function 'f2' for listener tests.
        } ;
        f3  =  function ( )  {
            // Dummy function 'f3' for listener tests.
        } ;
    } ) ;


    /*
     *   This nested 'describe' block focuses on the initial state and accessibility
     *   of the 'radio' object upon its loading into the environment.
     */
    describe ( "When radio is loaded", function ( ) {

        // Test case: Verifies that the 'radio' object is indeed present in the global scope.
        it ( "should be global and accessible", function ( ) {
            expect ( radio ) . toBeDefined ( ) ;
        } ) ;

        // Test case: Checks if the 'radio' library exposes a version number property.
        it ( "should return a version number", function ( ) {
            expect ( radio . $ . version ) . toBeDefined ( ) ;
        } ) ;

    } ) ; // End of "When radio is loaded" describe block.


    /*
     *   This 'describe' block contains tests specifically for the main 'radio()' function,
     *   which is used to select or create a channel.
     */
    describe ( "radio() method", function ( ) {

        // Test case: Asserts that invoking 'radio' with a string sets the current channel name.
        it ( "should set the channel name", function ( ) {
            radio ( 'channel1' ) ;
            expect ( radio . $ . channelName ) . toBe ( 'channel1' ) ;
        } ) ;

        // Test case: Confirms that the 'radio()' method requires a string argument.
        it ( "requires a string", function ( ) {
            radio ( 'channel1' ) ;
            expect ( radio . $ . channelName ) . toBe ( 'channel1' ) ;
        } ) ;

    } ) ; // End of "radio() method" describe block.


    /*
     *   This 'describe' block is dedicated to testing the 'radio.channel' method,
     *   which allows for explicit channel selection in a chainable manner.
     */
    describe ( "radio.channel method", function ( ) {

        // Test case: Checks if 'channel()' method correctly switches the active channel.
        it ( "should set the channel name", function ( ) {
            radio ( 'test' ) . channel ( 'channel1' ) ;
            expect ( radio . $ . channelName ) . toBe ( 'channel1' ) ;
        } ) ;

        // Test case: Verifies the ability to chain multiple 'channel()' calls and subscriptions.
        it ( "should make multiple channels chainable", function ( ) {
            radio ( 'channel1' ) . subscribe ( f , f ) . channel ( 'channel2' ) . subscribe ( f ) ;
            expect ( radio . $ . channelName ) . toBe ( 'channel2' ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
            expect ( radio . $ . channels . channel2 . length ) . toBe ( 1 ) ;
        } ) ;

        // Test case: Ensures that a new channel is instantiated if it does not already exist.
        it ( "should create a new channel if it doesn't exists", function ( ) {
            expect ( radio . $ . channels [ 'test' ] ) . not . toBeDefined ( ) ;
            radio ( 'test' ) ;
            expect ( radio . $ . channels [ 'test' ] ) . toBeDefined ( ) ;
        } ) ;

    } ) ; // End of "radio.channel method" describe block.


    /*
     *   This 'describe' block comprehensively tests the 'radio.subscribe' method,
     *   which is responsible for adding listeners to channels.
     */
    describe ( "radio.subscribe method", function ( ) {

        // Test case: Verifies that a single function can be successfully subscribed as a listener.
        it ( "should register a single listener to a channel", function ( ) {
            var test = radio ( 'channel1' ) . subscribe ( f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 1 ) ;
        } ) ;

        // Test case: Confirms that multiple listeners can be subscribed in a single call.
        it ( "should subscribe multiple listeners to a channel", function ( ) {
            radio ( 'channel1' ) . subscribe ( f , f , f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 3 ) ;
        } ) ;

        // Test case: Ensures support for subscribing listeners along with a specific 'this' context.
        it ( "should suppport subscribeing listerners with setting the context of 'this'", function ( ) {
            radio ( 'channel1' ) . subscribe ( [ test . selfTest , test ] ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 1 ) ;
        } ) ;

        // Test case: Checks the flexibility of subscribing a mix of plain functions and context-bound listeners.
        it ( "should support a combination of subscribeing functions in different ways", function ( ) {
            radio ( 'channel1' ) . subscribe ( f , [ test . selfTest , test ] , f2 ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 3 ) ;
        } ) ;

        // Test case: Asserts that non-function or non-array types are not registered as valid listeners.
        it ( "should not allow a non-function or array to be subscribeed", function ( ) {
            radio ( 'channel1' ) . subscribe ( "string" , f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 1 ) ; // Only 'f' should be subscribed.
            radio ( 'channel1' ) . subscribe ( 2 , f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ; // Only the second 'f' should be subscribed.
        } ) ;

        // Test case: Verifies that the 'subscribe' method itself is chainable.
        it ( "should be chainable", function ( ) {
            radio ( 'channel1' ) . subscribe ( f ) . subscribe ( f2 ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
        } ) ;

    } ) ; // End of "radio.subscribe method" describe block.


    /*
     *   This 'describe' block contains tests for the 'radio.unsubscribe' method,
     *   which handles the removal of listeners from channels.
     */
    describe ( "radio.unsubscribe method", function ( ) {

        // Test case: Confirms the ability to remove a single subscribed listener.
        it ( "should unsubscribe a listener from a channel", function ( ) {
            radio ( 'channel1' ) . subscribe ( f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 1 ) ;
            radio ( 'channel1' ) . unsubscribe ( f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 0 ) ;
        } ) ;

        // Test case: Checks if 'unsubscribe' correctly removes a specified listener when multiple are present.
        it ( "should unsubscribe multiple listeners from a channel", function ( ) {
            radio ( 'channel1' ) . subscribe ( f , f2 , f3 ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 3 ) ;
            radio ( 'channel1' ) . unsubscribe ( f ) ; // Should only remove 'f'.
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
        } ) ;

        // Test case: Verifies the handling of duplicate listeners and context-bound listeners during unsubscription.
        it ( "should unsubscribe duplicate listeners from a channel", function ( ) {
            // Scenario 1: Multiple identical function subscriptions.
            radio ( 'channel1' ) . subscribe ( f , f , f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 3 ) ;
            radio ( 'channel1' ) . unsubscribe ( f ) ; // All instances of 'f' should be removed.
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 0 ) ;

            // Scenario 2: A mix of functions and context-bound listeners, with sequential unsubscription.
            radio ( 'channel1' ) . subscribe ( f , f , f , f2 , f3 , [ test . selfTest , test ] , test . selfTest ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 7 ) ;
            radio ( 'channel1' ) . unsubscribe ( f ) ; // Removes all 'f's.
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 4 ) ;
            radio ( 'channel1' ) . unsubscribe ( test . selfTest ) ; // Removes both 'test.selfTest' versions.
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
            radio ( 'channel1' ) . unsubscribe ( f2 , f3 ) ; // Removes the remaining listeners.
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 0 ) ;
        } ) ;

        // Test case: Ensures that listeners subscribed with a context can be correctly unsubscribed by their function.
        it ( "should unsubscribe listeners subscribe with context from channel", function ( ) {
            radio ( 'channel1' ) . subscribe ( [ test . selfTest , test ] , f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
            radio ( 'channel1' ) . unsubscribe ( test . selfTest ) ; // Should remove the context-bound 'test.selfTest'.
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 1 ) ;
        } ) ;

        // Test case: Verifies that attempting to unsubscribe a non-existent item or from a non-existent channel does not throw an error.
        it ( "should not throw an error if unsubscribe an item that doesn't exists", function ( ) {
            radio ( 'newChannel' ) . unsubscribe ( f2 ) ;
        } ) ;

        // Test case: Checks if the 'unsubscribe' method is also chainable.
        it ( "should be chainable", function ( ) {
            radio ( 'channel1' ) . subscribe ( f , f2 , f3 ) . unsubscribe ( f2 ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
        } ) ;

    } ) ; // End of "radio.unsubscribe method" describe block.


    /*
     *   This 'describe' block contains tests for the 'radio.broadcast' method,
     *   which is responsible for invoking all subscribed listeners on a channel.
     */
    describe ( "radio.broadcast method", function ( ) {

        // Test case 1: Basic functionality - ensuring all subscribed listeners are called.
        it ( "should call each listener - test 1", function ( ) {
            spyOn ( test , 'subscribe' ) ; // Sets up a Jasmine spy on 'test.subscribe'.
            spyOn ( test , 'selfTest' ) ; // Sets up a Jasmine spy on 'test.selfTest'.
            radio ( 'channel1' ) . subscribe ( [ test . selfTest , test ] , [ test . subscribe , test ] ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;
            radio ( 'channel1' ) . broadcast ( 'test' ) ;
            expect ( test . selfTest ) . toHaveBeenCalled ( ) ;
            expect ( test . subscribe ) . toHaveBeenCalled ( ) ;
            expect ( test . selfTest . callCount ) . toBe ( 1 ) ;
            expect ( test . subscribe . callCount ) . toBe ( 1 ) ;
            // Resets the spies to clear call counts for subsequent tests.
            test . selfTest . reset ( ) ;
            test . subscribe . reset ( ) ;
        } ) ;

        // Test case 2: Verifies correct call counts when broadcasting to multiple instances of functions.
        it ( "should call each listener - test 2", function ( ) {
            spyOn ( window , 'f' ) ; // Spies on the global function 'f'.
            spyOn ( window , 'f2' ) ; // Spies on the global function 'f2'.
            spyOn ( window , 'f3' ) ; // Spies on the global function 'f3'.
            radio ( 'channel1' ) . subscribe ( f , f , f , f , f2 , f2 , f3 ) . broadcast ( 'test' ) ;
            expect ( window . f . callCount ) . toBe ( 4 ) ;
            expect ( window . f2 . callCount ) . toBe ( 2 ) ;
            expect ( window . f3 . callCount ) . toBe ( 1 ) ;
            // Resets the global spies.
            window . f . reset ( ) ;
            window . f2 . reset ( ) ;
            window . f3 . reset ( ) ;
        } ) ;

        // Test case: Ensures that arguments passed to 'broadcast' are correctly forwarded to listeners.
        it ( "should pass it's broadcast arguments to the listener", function ( ) {
            spyOn ( test , 'subscribe' ) ;
            spyOn ( test , 'selfTest' ) ;
            radio ( 'channel1' ) . subscribe ( [ test . selfTest , test ] ) ;
            radio ( 'channel2' ) . subscribe ( [ test . subscribe , test ] ) ;
            radio ( 'channel1' ) . broadcast ( 'data1' , [ 'somearray' , 'item2' ] , 'data3' ) ;
            radio ( 'channel2' ) . broadcast ( 'data1' ) ;
            expect ( test . selfTest ) . toHaveBeenCalledWith ( 'data1' , [ 'somearray' , 'item2' ] , 'data3' ) ;
            expect ( test . subscribe ) . toHaveBeenCalledWith ( 'data1' ) ;
        } ) ;


        // Test case: Confirms that a listener's explicitly set 'this' context is preserved during broadcast.
        it ( "should call the listener and maintain it's set scope", function ( ) {
            spyOn ( test , 'subscribe' ) ;
            // Subscribing 'test.scopeTest' with 'test' as its context. 'scopeTest' calls 'this.subscribe()'.
            radio ( 'channel1' ) . subscribe ( [ test . scopeTest , test ] ) . broadcast ( 'test' ) ;
            expect ( test . subscribe . callCount ) . toBe ( 1 ) ; // Verifies that 'subscribe' was called with 'test' as its context.
        } ) ;

        // Test case: Asserts that if no 'this' context is specified, the 'window' object becomes the default scope.
        it ( "should call the listener and set the scope as window if it wasn't specified", function ( ) {
            spyOn ( window , 'f' ) ;
            // Subscribing a plain function 'f'. Its context should default to 'window'.
            radio ( 'channel1' ) . subscribe ( f ) . broadcast ( 'test' ) ;
            expect ( window . f . callCount ) . toBe ( 1 ) ;
            window . f . reset ( ) ;
        } ) ;

    } ) ; // End of "radio.broadcast method" describe block.


    /*
     *   This 'describe' block provides integrated tests for the combined and chained usage
     *   of 'subscribe', 'unsubscribe', and 'broadcast' methods.
     */
    describe ( "radio subscribe unsubscribe and broadcast methods ", function ( ) {

        // Test case: Verifies that all three methods can be chained effectively and produce expected results.
        it ( "should work all together in a chain", function ( ) {
            // Sub-test 1: Chaining subscribe and unsubscribe.
            radio ( 'channel1' ) . subscribe ( f , f2 , f3 ) . unsubscribe ( f ) ;
            expect ( radio . $ . channels . channel1 . length ) . toBe ( 2 ) ;

            // Sub-test 2: A more complex chain involving multiple subscribe/unsubscribe and a final broadcast.
            spyOn ( window , 'f' ) ;
            spyOn ( window , 'f2' ) ;
            spyOn ( window , 'f3' ) ;
            radio ( 'channel2' ) . subscribe ( f , f , f , f , f2 ) . unsubscribe ( f , f2 ) . subscribe ( f3 ) . broadcast ( 'test' ) ;
            expect ( window . f2 . callCount ) . toBe ( 0 ) ; // 'f2' should have been unsubscribed and not called.
            expect ( window . f3 . callCount ) . toBe ( 1 ) ; // 'f3' should have been subscribed and called once.
            window . f . reset ( ) ;
            window . f2 . reset ( ) ;
            window . f3 . reset ( ) ;
        } ) ;

    } ) ; // End of "radio subscribe unsubscribe and broadcast methods" describe block.


    /*
     *   The 'afterEach' hook is executed after every 'it' block.
     *   It's used here to clean up the 'radio' channels, ensuring each test runs in isolation.
     */
    afterEach ( function ( ) {
        // Resets the internal channels array of the 'radio' object to an empty state.
        radio . $ . channels = [ ] ;
    } ) ;

} ) ; // End of the main "Radio Core Test" describe block.

// End of JavaScript test file.