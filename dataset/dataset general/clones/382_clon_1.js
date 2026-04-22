/*
 * This file contains Jasmine specifications for the Toastmessage jQuery Plugin.
 * It ensures the plugin functions correctly across various scenarios.
 */
describe ( 'the Toastmessage jQuery Plugin' , function ( ) {

    // This block runs before each individual test specification.
    // Its primary purpose is to ensure a clean state by removing any existing
    // toast message containers from the DOM, preventing interference between tests.
    beforeEach ( function ( ) {
        /* Remove any existing toast-container element from the document body. */
        $ ( '.toast-container' ) . remove ( ) ;

        // Define a custom Jasmine matcher for convenience.
        // This matcher checks if a toast container element has been created.
        this . addMatchers ( {
            toastContainterCreated : function ( ) {
                return $ ( '.toast-container' ) . length > 0 ;
            }
        } ) ;

    } ) ;


    // This block executes after every test specification completes.
    // It cleans up the DOM by removing the toast message container,
    // ensuring a fresh start for the next test.
    afterEach ( function ( ) {
        // Clean up the DOM: remove the toast container.
        $ ( '.toast-container' ) . remove ( ) ;
    } ) ;


    // This describes a suite of tests specifically focused on the functionality
    // of showing various types of toast messages.
    describe ( 'showing toastmessages' , function ( ) {

        // Test case: Verify that a success toast message is displayed correctly.
        it ( 'shows a success toastmessage' , function ( ) {

            // Invoke the jQuery plugin to show a success toast.
            $ ( ) . toastmessage ( 'showSuccessToast' , "SUCCESS" ) ;

            // Assertions to confirm the toast container and success toast item are present.
            expect ( ) . toastContainterCreated ( ) ;
            expect ( $ ( '.toast-item.toast-type-success' ) . length > 0 ) . toBeTruthy ( ) ;
        } ) ;


        // Test case: Verify that a notice toast message is displayed.
        it ( 'shows a notice toastmessage' , function ( ) {

            // Call the plugin to display a notice toast.
            $ ( ) . toastmessage ( 'showNoticeToast' , "NOTICE" ) ;

            // Check for the creation of the toast container and the specific notice toast item.
            expect ( ) . toastContainterCreated ( ) ;
            expect ( $ ( '.toast-item.toast-type-notice' ) . length > 0 ) . toBeTruthy ( ) ;
        } ) ;


        // Test case: Ensure a warning toast message appears as expected.
        it ( 'shows a warning toastmessage' , function ( ) {

            // Trigger the display of a warning toast via the plugin.
            $ ( ) . toastmessage ( 'showWarningToast' , "WARNING" ) ;

            // Validate that the container exists and the warning toast item is visible.
            expect ( ) . toastContainterCreated ( ) ;
            expect ( $ ( '.toast-item.toast-type-warning' ) . length > 0 ) . toBeTruthy ( ) ;
        } ) ;


        // Test case: Confirm that an error toast message is shown.
        it ( 'shows a error toastmessage' , function ( ) {

            // Display an error toast using the plugin.
            $ ( ) . toastmessage ( 'showErrorToast' , "ERROR" ) ;

            // Verify the presence of the toast container and the error toast item.
            expect ( ) . toastContainterCreated ( ) ;
            expect ( $ ( '.toast-item.toast-type-error' ) . length > 0 ) . toBeTruthy ( ) ;
        } ) ;


        // Test case: Validate the display of a user-configured toast message.
        it ( 'shows a user configured toastmessage' , function ( ) {

            // Configure global settings for toast messages.
            $ ( ) . toastmessage ( {
                sticky : true , /* Toast remains until manually closed */
                position : 'top-right' , /* Position on the screen */
                closeText : '' /* No close button text */
            } ) ;

            // Show a specific toast message with custom content and type.
            $ ( ) . toastmessage ( 'showToast' , {
                text : 'Success Dialog' ,
                type : 'success'
            } ) ;

            // Confirm that the toast container and the configured success toast are present.
            expect ( ) . toastContainterCreated ( ) ;
            expect ( $ ( '.toast-item.toast-type-success' ) . length > 0 ) . toBeTruthy ( ) ;
        } ) ;

    } ) ;


    // This describes a test suite dedicated to verifying the functionality
    // of removing toast messages from the display.
    describe ( 'removing toastmessages' , function ( ) {

        // Test case: Check if a toast message can be removed by a mouse click event.
        it ( 'remove the toast with a mouseclick' , function ( ) {

            // Create a Jasmine spy to track calls to a callback function.
            var callback = jasmine . createSpy ( 'Close-Callback' ) ;

            // Show a sticky toast message with a close callback.
            $ ( ) . toastmessage ( 'showToast' , {
                text : 'Success Dialog' ,
                sticky : true ,
                position : 'top-right' ,
                type : 'success' ,
                closeText : '' ,
                close : callback // The callback to be triggered on close.
            } ) ;

            // Initially, the callback should not have been called.
            expect ( callback ) . not . toHaveBeenCalled ( ) ;

            // Simulate a click on the close button of the toast item.
            $ ( '.toast-item-close' ) . click ( ) ;

            // After the click, the callback should have been invoked.
            expect ( callback ) . toHaveBeenCalled ( ) ;
        } ) ;


        // Test case: Verify that a toast message can be removed programmatically via an API call.
        it ( 'remove the toast via api call' , function ( ) {

            // Create a spy for the close callback function.
            var callback = jasmine . createSpy ( 'Close-Callback' ) ;

            // Show a toast message and capture its reference.
            var toast = $ ( ) . toastmessage ( 'showToast' , {
                text : 'Success Dialog' ,
                sticky : true ,
                position : 'top-right' ,
                type : 'success' ,
                closeText : '' ,
                close : callback
            } ) ;

            // Confirm the callback has not been called yet.
            expect ( callback ) . not . toHaveBeenCalled ( ) ;

            // Programmatically remove the toast using the API call.
            $ ( ) . toastmessage ( 'removeToast' , toast , { close : callback } ) ;

            // Verify that the close callback has now been executed.
            expect ( callback ) . toHaveBeenCalled ( ) ;
        } ) ;

    } ) ;

} ) ;