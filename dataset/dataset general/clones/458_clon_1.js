/*
 * This is a Type I clone of a JavaScript test file.
 * The original code's functionality is preserved exactly.
 * Only whitespace and comments have been altered significantly.
 * This file is intended for testing clone detection algorithms.
 */

var chai = require("chai")
    , jQuery = require("jQuery") /* Include jQuery library */
    ; // End of initial require statements

// Define the expectation function using Chai.
var expect = chai.expect ;

/*
 * Set up global jQuery for compatibility in test environment.
 * The '$' alias is also established here.
 */
var $ = global.jQuery = jQuery ;


// Helper function to create a <select> element for testing purposes.
function createSelect ( ) {

    // Append a new select element with id 'rating' and name 'rating' to the document body.
    $( '<select />' , { 'id' : 'rating' , 'name' : 'rating' } ) . appendTo ( 'body' ) ;

    /*
     * Populate the select element with options from 1 to 10.
     * The 5th option will be pre-selected.
     */
    for ( var i = 1 ; i <= 10 ; i ++ ) { /* Loop through values 1 to 10 */

        // Determine attributes for the current option.
        var attributes = ( i == 5 ) ?
            attributes = { 'value' : i , 'selected' : 'selected' } : // If i is 5, mark as selected.
            attributes = { 'value' : i } ; // Otherwise, just set the value.

        // Create an option and append it to the select, then set its text.
        $ ( '<option />' , attributes ) . appendTo ( '#rating' ) . html ( 'rating-text-' + i ) ;
    } // End of option creation loop

} // End of createSelect function definition


// Helper function to remove the created <select> element.
function destroySelect ( ) {

    // Remove the element identified by '#rating' from the DOM.
    $ ( '#rating' ) . remove ( ) ;

} // End of destroySelect function


// Require the plugin itself to be tested.
require ( "../jquery.barrating" ) ;


/*
 * Main test suite for the 'bar rating plugin'.
 * Focuses on initialization with custom options.
 */
describe ( 'bar rating plugin on init with custom options' , function ( ) { // Begin describe block

    // Test case: should correctly update default options.
    it ( 'should update defaults' , function ( ) { // Begin 'it' block for default update

        var BarRating ; // Declare BarRating variable

        // Instantiate the BarRating plugin object.
        BarRating = new global.BarRating ( ) ;

        // Initialize the plugin with a specific option override.
        BarRating . init ( {
            showValues : false // Override showValues default to false
        } ) ;

        // Assertions to verify the options have been set correctly.
        expect ( BarRating . options ) . to . be . a ( 'object' ) ; // Check if options is an object
        expect ( BarRating . options . initialRating ) . to . equal ( null ) ; // Default initialRating is null
        expect ( BarRating . options . showValues ) . to . equal ( false ) ; // Custom option should be false
        expect ( BarRating . options . showSelectedRating ) . to . equal ( true ) ; // Default is true
        expect ( BarRating . options . reverse ) . to . equal ( false ) ; // Default is false
        expect ( BarRating . options . readonly ) . to . equal ( false ) ; // Default is false

    } ) ; // End of 'it' block for default update

} ) ; // End of describe block for init with custom options


/*
 * Test suite for the 'bar rating plugin' when it is shown.
 * Verifies the initial state and rendering.
 */
describe ( 'bar rating plugin on show' , function ( ) {

    // Setup before each test in this suite.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.
        $ ( '#rating' ) . barrating ( 'show' ) ; // Initialize and show the bar rating.
    } ) ;

    // Teardown after each test in this suite.
    after ( function ( ) {
        $ ( '#rating' ) . barrating ( 'destroy' ) ; // Destroy the bar rating instance.
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should have data associated with the element.
    it ( 'should have data' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) ) . to . be . a ( 'object' ) ;
    } ) ;

    // Test case: should transform the select field into a rating widget.
    it ( 'should transform the select field into a rating widget' , function ( ) {
        expect ( $ ( '.br-widget a' ) ) . to . have . length ( 10 ) ; // Expect 10 rating items.
    } ) ;

    // Test case: should store rating values in data attributes.
    it ( 'should store rating values in data attributes' , function ( ) {
        expect ( $ ( '.br-widget a:first' ) . attr ( 'data-rating-value' ) ) . to . equal ( '1' ) ;
        expect ( $ ( '.br-widget a:nth-child(8)' ) . attr ( 'data-rating-value' ) ) . to . equal ( '8' ) ;
        expect ( $ ( '.br-widget a:first' ) . attr ( 'data-rating-text' ) ) . to . equal ( 'rating-text-1' ) ;
        expect ( $ ( '.br-widget a:nth-child(8)' ) . attr ( 'data-rating-text' ) ) . to . equal ( 'rating-text-8' ) ;
    } ) ;

    // Test case: should read the selected rating from the select field.
    it ( 'should read the selected rating from the select field' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( '5' ) ;
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( 'rating-text-5' ) ;
    } ) ;

    // Test case: should set correct classes for selected items.
    it ( 'should set correct class' , function ( ) {
        expect ( $ ( '.br-widget a:nth-child(4)' ) . hasClass ( 'br-selected' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(5)' ) . hasClass ( 'br-selected br-current' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(6)' ) . hasClass ( 'br-selected' ) ) . to . equal ( false ) ;
    } ) ;

    // Test case: should append a rating div.
    it ( 'should append a rating div' , function ( ) {
        expect ( $ ( 'div.br-current-rating' ) ) . to . have . length ( 1 ) ;
    } ) ;

    // Test case: should display a correct rating in the appended div.
    it ( 'should display a correct rating' , function ( ) {
        expect ( $ ( 'div.br-current-rating' ) . html ( ) ) . to . equal (
            $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText
        ) ;
    } ) ;

    // Test case: should hide the original select field.
    it ( 'should hide the select field' , function ( ) {
        expect ( $ ( '#rating' ) . is ( ":visible" ) ) . to . equal ( false ) ;
    } ) ;

} ) ; // End of describe block for 'on show' tests


/*
 * Test suite for 'bar rating plugin' behavior when a rating is selected after show.
 * Includes testing of the onSelect callback.
 */
describe ( 'bar rating plugin on show and rating selected' , function ( ) {

    var valuesFromCallback = [ ] ; // Array to capture values passed to the callback.

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Setup the select element.

        // Show the bar rating with a custom onSelect callback.
        $ ( '#rating' ) . barrating ( 'show' , {
            onSelect : function ( value , text ) { // Define the callback function.
                valuesFromCallback . push ( value , text ) ; // Store the arguments.
            }
        } ) ;

        // Simulate a click on the second rating item.
        $ ( '.br-widget a:nth-child(2)' ) . trigger ( 'click' ) ;
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        $ ( '#rating' ) . barrating ( 'destroy' ) ; // Clean up the plugin instance.
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should update the internal data after selection.
    it ( 'should update data' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( '2' ) ;
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( 'rating-text-2' ) ;
    } ) ;

    // Test case: should apply correct classes after selection.
    it ( 'should set correct class' , function ( ) {
        expect ( $ ( '.br-widget a:nth-child(1)' ) . hasClass ( 'br-selected' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(2)' ) . hasClass ( 'br-selected br-current' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(3)' ) . hasClass ( 'br-selected' ) ) . to . equal ( false ) ;
    } ) ;

    // Test case: should display the correct rating in the UI.
    it ( 'should display a correct rating' , function ( ) {
        expect ( $ ( 'div.br-current-rating' ) . html ( ) ) . to . equal (
            $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText
        ) ;
    } ) ;

    // Test case: should pass correct values to the onSelect callback.
    it ( 'should pass correct values to a callback' , function ( ) {
        expect ( valuesFromCallback [ 0 ] ) . to . equal ( '2' ) ;
        expect ( valuesFromCallback [ 1 ] ) . to . equal ( 'rating-text-2' ) ;
    } ) ;

} ) ; // End of describe block for 'on show and rating selected'


/*
 * Test suite for the 'bar rating plugin' when it is in reversed mode.
 */
describe ( 'bar rating plugin reversed' , function ( ) {

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.

        // Show the bar rating with the 'reverse' option enabled.
        $ ( '#rating' ) . barrating ( 'show' , {
            reverse : true // Enable reversed mode.
        } ) ;
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        $ ( '#rating' ) . barrating ( 'destroy' ) ; // Destroy the plugin instance.
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should set correct classes in reversed mode.
    it ( 'should set correct class' , function ( ) {
        // In reversed mode, selection goes from right to left (higher values).
        // The 5th item is initially selected.
        expect ( $ ( '.br-widget a:nth-child(4)' ) . hasClass ( 'br-selected' ) ) . to . equal ( false ) ;
        expect ( $ ( '.br-widget a:nth-child(5)' ) . hasClass ( 'br-selected br-current' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(6)' ) . hasClass ( 'br-selected' ) ) . to . equal ( true ) ; // Item 6 should be selected as it's 'less' than 5 in reverse.
    } ) ;

} ) ; // End of describe block for 'reversed' tests


/*
 * Test suite for 'bar rating plugin' in read-only mode.
 */
describe ( 'bar rating plugin read-only' , function ( ) {

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.

        // Show the bar rating with the 'readonly' option enabled.
        $ ( '#rating' ) . barrating ( 'show' , {
            readonly : true // Enable read-only mode.
        } ) ;

        // Attempt to click on the 6th rating item (should be ignored due to read-only).
        $ ( '.br-widget a:nth-child(6)' ) . trigger ( 'click' ) ;
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        $ ( '#rating' ) . barrating ( 'destroy' ) ; // Destroy the plugin.
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should maintain initial classes, ignoring the click.
    it ( 'should set correct class' , function ( ) {
        // Initial selection was 5.
        expect ( $ ( '.br-widget a:nth-child(4)' ) . hasClass ( 'br-selected' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(5)' ) . hasClass ( 'br-selected br-current' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(6)' ) . hasClass ( 'br-selected' ) ) . to . equal ( false ) ; // Still false, click was ignored.
    } ) ;

    // Test case: should ignore user input when read-only.
    it ( 'should ignore user input' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( '5' ) ; // Value should remain 5.
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( 'rating-text-5' ) ; // Text should remain 'rating-text-5'.
    } ) ;

} ) ; // End of describe block for 'read-only' tests


/*
 * Test suite for 'bar rating plugin' on deselect functionality.
 */
describe ( 'bar rating plugin on deselect' , function ( ) {

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.

        // Prepend an empty OPTION to enable deselectable ratings.
        $ ( '#rating' ) . prepend ( $ ( '<option />' , { 'value' : '' } ) ) ;
        $ ( '#rating' ) . barrating ( 'show' ) ; // Initialize and show the bar rating.

        // Simulate clicking the initially selected rating (5th item) to deselect.
        $ ( '.br-widget a:nth-child(5)' ) . trigger ( 'click' ) ;
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        $ ( '#rating' ) . barrating ( 'destroy' ) ; // Destroy the plugin.
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should update data to reflect deselectable status.
    it ( 'should update data' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . deselectable ) . to . equal ( true ) ;
    } ) ;

    // Test case: should successfully deselect the rating.
    it ( 'should successfully deselect rating' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( '' ) ; // Value should be empty.
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( '' ) ; // Text should be empty.
    } ) ;

} ) ; // End of describe block for 'on deselect' tests


/*
 * Test suite for 'bar rating plugin' on clear functionality.
 */
describe ( 'bar rating plugin on clear' , function ( ) {

    var valuesFromCallback = [ ] ; // Array to capture values from the onClear callback.

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.

        // Show the bar rating with a custom onClear callback.
        $ ( '#rating' ) . barrating ( 'show' , {
            onClear : function ( value , text ) { // Define the callback function.
                valuesFromCallback . push ( value , text ) ; // Store the arguments.
            }
        } ) ;
        // Simulate a click on the 6th item to change the rating.
        $ ( '.br-widget a:nth-child(6)' ) . trigger ( 'click' ) ;
        // Call the 'clear' method on the bar rating plugin.
        $ ( '#rating' ) . barrating ( 'clear' ) ;
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        $ ( '#rating' ) . barrating ( 'destroy' ) ; // Destroy the plugin.
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should restore the original rating after clear.
    it ( 'should restore original rating' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( '5' ) ; // Should revert to original 5.
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( 'rating-text-5' ) ; // Should revert to original text.
    } ) ;

    // Test case: should set correct classes after clear.
    it ( 'should set correct class' , function ( ) {
        expect ( $ ( '.br-widget a:nth-child(4)' ) . hasClass ( 'br-selected' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(5)' ) . hasClass ( 'br-selected br-current' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(6)' ) . hasClass ( 'br-selected' ) ) . to . equal ( false ) ;
    } ) ;

    // Test case: should pass correct values to the onClear callback.
    it ( 'should pass correct values to a callback' , function ( ) {
        expect ( valuesFromCallback [ 0 ] ) . to . equal ( '5' ) ; // Value passed to callback should be original.
        expect ( valuesFromCallback [ 1 ] ) . to . equal ( 'rating-text-5' ) ; // Text passed to callback should be original.
    } ) ;

} ) ; // End of describe block for 'on clear' tests


/*
 * Test suite for 'bar rating plugin' on destroy functionality.
 */
describe ( 'bar rating plugin on destroy' , function ( ) {

    var valuesFromCallback = [ ] ; // Array to capture values from the onDestroy callback.

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.

        // Show the bar rating with a custom onDestroy callback.
        $ ( '#rating' ) . barrating ( 'show' , {
            onDestroy : function ( value , text ) { // Define the callback function.
                valuesFromCallback . push ( value , text ) ; // Store the arguments.
            }
        } ) ;

        // Immediately destroy the bar rating plugin.
        $ ( '#rating' ) . barrating ( 'destroy' ) ;

    } ) ;

    // Teardown after each test (only destroy the select, plugin already destroyed).
    after ( function ( ) {
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should remove data associated with the element.
    it ( 'should remove data' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) ) . to . equal ( '' ) ; // Data should be empty/removed.
    } ) ;

    // Test case: should make the original select field visible again.
    it ( 'should show the select field back again' , function ( ) {
        expect ( $ ( '#rating' ) . is ( ":visible" ) ) . to . equal ( true ) ; // Select should be visible.
    } ) ;

    // Test case: should pass correct values to the onDestroy callback.
    it ( 'should pass correct values to a callback' , function ( ) {
        expect ( valuesFromCallback [ 0 ] ) . to . equal ( '5' ) ; // Value passed to callback should be original.
        expect ( valuesFromCallback [ 1 ] ) . to . equal ( 'rating-text-5' ) ; // Text passed to callback should be original.
    } ) ;

} ) ; // End of describe block for 'on destroy' tests


/*
 * Test suite for 'bar rating plugin' on set value functionality.
 */
describe ( 'bar rating plugin on set value' , function ( ) {

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.
        // Initialize the bar rating and then set its value to 3.
        $ ( '#rating' )
            . barrating ( ) // Initialise with default options.
            . barrating ( 'set' , 3 ) ; // Set the rating to 3.
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should set the correct value internally.
    it ( 'should set correct value' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( 3 ) ;
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( 'rating-text-3' ) ;
    } ) ;

    // Test case: should apply correct classes for the newly set value.
    it ( 'should set correct class' , function ( ) {
        expect ( $ ( '.br-widget a:nth-child(3)' ) . hasClass ( 'br-selected' ) ) . to . equal ( true ) ;
        expect ( $ ( '.br-widget a:nth-child(3)' ) . hasClass ( 'br-current' ) ) . to . equal ( true ) ;
    } ) ;

} ) ; // End of describe block for 'on set value' tests


/*
 * Test suite for 'bar rating plugin' behavior when setting a non-existing value.
 */
describe ( 'bar rating plugin on set non-existing value' , function ( ) {

    // Setup before each test.
    before ( function ( ) {
        createSelect ( ) ; // Create the select element.
        // Initialize with an initial rating of 5, then attempt to set a non-existing value.
        $ ( '#rating' )
            . barrating ( 'show' , { initialRating : 5 } ) // Show with initial rating 5.
            . barrating ( 'set' , 9999 ) ; // Attempt to set a value that does not exist.
    } ) ;

    // Teardown after each test.
    after ( function ( ) {
        destroySelect ( ) ; // Remove the select element.
    } ) ;

    // Test case: should do nothing if the value does not exist.
    it ( 'should do nothing' , function ( ) {
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingValue ) . to . equal ( '5' ) ; // Value should remain 5.
        expect ( $ ( '#rating' ) . data ( 'barrating' ) . currentRatingText ) . to . equal ( 'rating-text-5' ) ; // Text should remain 'rating-text-5'.
    } ) ;

} ) ; // End of describe block for 'on set non-existing value' tests