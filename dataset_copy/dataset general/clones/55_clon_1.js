module ( 'jss-basic' , {

    teardown: function ( ) {
        // This function is called after each test within this module.
        // It ensures a clean state by removing all styles added by JSS.
        jss . remove ( ) ;
    }

} ) ;

/*
 * Test case: Verifies the 'get' method's ability to retrieve styles
 * that have been explicitly added to the JSS stylesheet.
 * It checks for both top-level selectors and their associated properties.
 */
test ( 'get retrieves styles from the JSS stylesheet' , function ( ) {

    // Initialize 'result' variable.
    var  result = jss . get ( ) ;
    // Initially, the JSS stylesheet should be empty.
    equal ( Object . keys ( result ) . length , 0 ) ;


    // Add a basic style rule for '#jss-test'.
    jss . set ( '#jss-test' , { 'color' : 'red' , 'font-size' : '20px' } ) ;

    // Retrieve the stylesheet again.
    result = jss . get ( ) ;
    // Expect one selector now.
    equal ( Object . keys ( result ) . length , 1 ) ;
    // Expect two properties for '#jss-test'.
    equal ( Object . keys ( result [ '#jss-test' ] ) . length , 2 ) ;


    // Add another style rule for a child element.
    jss . set ( '#jss-test .child-element' , { 'color' : 'blue' } ) ;

    // Retrieve the stylesheet once more for comprehensive checks.
    result = jss . get ( ) ;
    // Now there should be two distinct selectors.
    equal ( Object . keys ( result ) . length , 2 ) ;
    // The first selector should still have its two properties.
    equal ( Object . keys ( result [ '#jss-test' ] ) . length , 2 ) ;
    equal ( result [ '#jss-test' ] [ 'color' ] , 'red' ) ;
    equal ( result [ '#jss-test' ] [ 'font-size' ] , '20px' ) ;
    // The child selector should have its single property.
    equal ( Object . keys ( result [ '#jss-test .child-element' ] ) . length , 1 ) ;
    equal ( result [ '#jss-test .child-element' ] [ 'color' ] , 'blue' ) ;

} ) ;

/*
 * Test case: Checks the 'get' method when a specific selector is provided.
 * It should only return styles relevant to that selector.
 */
test ( 'calling get with a selector retrieves styles from the JSS stylesheet for that selector' , function ( ) {

    // Attempt to get styles for '#jss-test' before any are set.
    var result = jss . get ( '#jss-test' ) ;
    // Expect an empty object.
    equal ( Object . keys ( result ) . length , 0 ) ;


    // Set styles for '#jss-test'.
    jss . set ( '#jss-test' , { 'color' : 'red' , 'font-size' : '20px' } ) ;

    // Now, get styles specifically for '#jss-test'.
    result = jss . get ( '#jss-test' ) ;
    // Expect two properties for this selector.
    equal ( Object . keys ( result ) . length , 2 ) ;
    equal ( result [ 'color' ] , 'red' ) ;
    equal ( result [ 'font-size' ] , '20px' ) ;

} ) ;

/*
 * Test case: Validates the 'getAll' method. This method should retrieve
 * not only JSS-managed styles but also any existing, browser-computed styles
 * for a given selector.
 */
test ( 'getAll also retrieves styles not part of the JSS stylesheet' , function ( ) {

    // Get all styles for '#jss-test' initially.
    // Assuming a pre-existing style like 'display: none' is present for '#jss-test'.
    var   result = jss . getAll ( '#jss-test' ) ;
    equal ( Object . keys ( result ) . length , 1 ) ; // Should contain only the pre-existing 'display' property.
    equal ( result [ 'display' ] , 'none' ) ;


    // Add new styles to '#jss-test' using JSS.
    jss . set ( '#jss-test' , { 'color' : 'red' , 'font-size' : '20px' } ) ;

    // Call 'getAll' again.
    result = jss . getAll ( '#jss-test' ) ;
    // Now, it should include JSS styles ('color', 'font-size') plus the existing 'display'.
    equal ( Object . keys ( result ) . length , 3 ) ;
    equal ( result [ 'color' ] , 'red' ) ;
    equal ( result [ 'font-size' ] , '20px' ) ;
    equal ( result [ 'display' ] , 'none' ) ; // The original style should still be there.

} ) ;

/*
 * Test case: Ensures that the 'remove' method (without arguments)
 * correctly clears only the styles that were added by JSS,
 * leaving any pre-existing browser styles intact.
 */
test ( 'remove only removes styles added to the JSS stylesheet' , function ( ) {

    // Add styles to '#jss-test' using JSS.
    jss . set ( '#jss-test' , { 'color' : 'red' , 'font-size' : '20px' } ) ;
    // Verify that all styles (JSS-added and pre-existing) are present.
    var result = jss . getAll ( '#jss-test' ) ;
    equal ( Object . keys ( result ) . length , 3 ) ; // 2 JSS styles + 1 pre-existing 'display'.

    // Call 'remove' without a selector to clear all JSS-managed styles.
    jss . remove ( ) ;
    // After removal, re-check the styles.
    result = jss . getAll ( '#jss-test' ) ;
    equal ( Object . keys ( result ) . length , 1 ) ; // Only the pre-existing 'display' should remain.
    equal ( result [ 'display' ] , 'none' ) ;

} ) ;

/*
 * Test case: Confirms that 'remove' when called with a specific selector
 * only removes JSS-managed styles associated with that particular selector,
 * again preserving any pre-existing browser styles.
 */
test ( 'calling remove with a selector only removes styles added to the JSS stylesheet' , function ( ) {

    // Set JSS styles for '#jss-test'.
    jss . set ( '#jss-test' , { 'color' : 'red' , 'font-size' : '20px' } ) ;
    // Confirm combined JSS and pre-existing styles are present.
    var result = jss . getAll ( '#jss-test' ) ;
    equal ( Object . keys ( result ) . length , 3 ) ; // 2 JSS styles + 1 pre-existing.

    // Remove styles specifically for '#jss-test' using JSS.
    jss . remove ( '#jss-test' ) ;
    // Re-check styles for '#jss-test'.
    result = jss . getAll ( '#jss-test' ) ;
    equal ( Object . keys ( result ) . length , 1 ) ; // Only the pre-existing 'display' should be left.
    equal ( result [ 'display' ] , 'none' ) ;

} ) ;

/*
 * Test case: Verifies that 'remove' with a selector is precise,
 * impacting only the specified selector and leaving other selectors'
 * JSS-managed styles untouched.
 */
test ( 'calling remove with a selector only removes styles for that selector' , function ( ) {

    // Set styles for two different selectors.
    jss . set ( '#jss-test' , { 'color' : 'red' } ) ;
    jss . set ( '#alternative-element' , { 'color' : 'blue' } ) ;
    // Verify both are present.
    equal ( jss . get ( '#jss-test' ) [ 'color' ] , 'red' ) ;
    equal ( jss . get ( '#alternative-element' ) [ 'color' ] , 'blue' ) ;

    // Remove styles only for '#jss-test'.
    jss . remove ( '#jss-test' ) ;
    // Confirm '#jss-test' styles are gone.
    equal ( Object . keys ( jss . get ( '#jss-test' ) ) . length , 0 ) ;
    // Crucially, confirm '#alternative-element' styles are still there.
    equal ( jss . get ( '#alternative-element' ) [ 'color' ] , 'blue' ) ;

} ) ;

/*
 * Test case: Examines how JSS handles styles without the '!important' modifier,
 * specifically regarding CSS specificity rules.
 */
test ( 'set style without !important modifier' , function ( ) {

    // Set 'color: blue' for the ID selector '#jss-test'.
    jss . set ( '#jss-test' , { 'color' : 'blue' } ) ;
    // Set 'color: red' for the element selector 'div'.
    jss . set ( 'div' , { 'color' : 'red' } ) ;
    // Due to higher specificity, the ID selector's 'blue' color should apply to '#jss-test'.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'color' ] , 'rgb(0, 0, 255)' ) ;

} ) ;

/*
 * Test case: Explores the behavior of JSS when styles include the '!important' modifier,
 * and how it interacts with CSS specificity and other !important rules.
 */
test ( 'set style with !important modifier' , function ( ) {

    // Scenario 1: ID selector without !important vs. element selector with !important.
    jss . set ( '#jss-test' , { 'background-color' : 'blue' } ) ;
    jss . set ( 'div' , { 'background-color' : 'red !important' } ) ;
    // The '!important' on 'div' should override the ID selector, resulting in 'red'.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'backgroundColor' ] , 'rgb(255, 0, 0)' ) ;

    // Scenario 2: Both ID and element selectors have !important.
    jss . set ( '#jss-test' , { 'background-color' : 'blue !important' } ) ;
    // An ID selector with '!important' has higher precedence than an element selector with '!important'.
    // Thus, the background should now be 'blue'.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'backgroundColor' ] , 'rgb(0, 0, 255)' ) ;

} ) ;

/*
 * Test case: A variation of the '!important' modifier test,
 * using a different property ('color') to confirm consistent behavior.
 */
test ( 'set a different style with !important modifier' , function ( ) {

    // Initial state: '#jss-test' has 'blue', 'div' has 'red !important'.
    jss . set ( '#jss-test' , { 'color' : 'blue' } ) ;
    jss . set ( 'div' , { 'color' : 'red !important' } ) ;
    // The 'div' rule with '!important' should take precedence.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'color' ] , 'rgb(255, 0, 0)' ) ;

    // Update: '#jss-test' now also has '!important'.
    jss . set ( '#jss-test' , { 'color' : 'blue !important' } ) ;
    // '#jss-test' with '!important' should now win over 'div' with '!important'.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'color' ] , 'rgb(0, 0, 255)' ) ;

} ) ;

/*
 * Test case: Confirms that calling 'set' multiple times for the same selector
 * and property will result in the most recent call overriding previous ones.
 */
test ( 'subsequent calls to set that modify the same property will override previous call' , function ( ) {

    // First, set 'background-color' to 'red'.
    jss . set ( '#jss-test' , { 'background-color' : 'red' } ) ;
    // Verify the computed style is 'red'.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'backgroundColor' ] , 'rgb(255, 0, 0)' ) ;

    // Then, set 'background-color' to 'blue' for the same element.
    jss . set ( '#jss-test' , { 'background-color' : 'blue' } ) ;
    // Verify the computed style is now 'blue', indicating the override.
    equal ( getComputedStyle ( document . getElementById ( 'jss-test' ) ) [ 'backgroundColor' ] , 'rgb(0, 0, 255)' ) ;

} ) ;

/*
 * Test case: Ensures that JSS correctly handles CSS property names
 * provided in camelCase format, converting them to kebab-case internally.
 */
test ( 'set accepts properties in camel-case' , function ( ) {

    // Set a style using a camelCase property name ('backgroundColor').
    jss . set ( '#jss-test' , { 'backgroundColor' : 'red' } ) ;

    // When retrieving using 'get', JSS should have normalized it to kebab-case ('background-color').
    equal ( jss . get ( '#jss-test' ) [ 'background-color' ] , 'red' ) ;

} ) ;