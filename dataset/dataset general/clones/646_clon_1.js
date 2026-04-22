// This file contains a series of QUnit tests for Enumerable extensions.
// Specifically, it tests maxProperty, minProperty, and sumProperty functionality.

/*
 * Global variable declaration for the array instance used across tests.
 * This array will be populated in the setup hook of the module.
 */
var array ;


// Define a module for organizing related tests for Enumerable extensions.
module ( "EnumerableExt" , {

    // The setup function runs before each individual test within this module.
    setup : function ( ) {
        // Initialize the array with some sample data containing 'age' properties.
        array = Ember . A ( [ { age : 7 } , { age : 17 } , { age : 77 } ] ) ;
    } // End of setup function definition.

} ) ;


// Test case 1: Verify maxProperty correctly identifies the highest value.
test ( "maxProperty should return the highest value of the property in the enumerable" , function ( ) {
    // Call maxProperty on the 'age' property of the array elements.
    var max = array . maxProperty ( 'age' ) ;

    // Assert that the returned maximum value is 77, which is the highest 'age' in the array.
    equal ( max , 77 ) ;
} ) ;


// Test case 2: Verify maxProperty behavior when a starting value is provided.
test ( "maxProperty should return the start value if no higher value of the property in the enumerable is found" , function ( ) {
    // Call maxProperty with a starting value (100) that is higher than any 'age' in the array.
    var max = array . maxProperty ( 'age' , 100 ) ;

    // Assert that the function returns the provided start value, as no 'age' is higher than 100.
    equal ( max , 100 ) ;
} ) ;


// Test case 3: Verify minProperty correctly identifies the lowest value.
test ( "minProperty should return the highest value of the property in the enumerable" , function ( ) {
    // Call minProperty on the 'age' property of the array elements.
    var min = array . minProperty ( 'age' ) ;

    // Assert that the returned minimum value is 7, which is the lowest 'age' in the array.
    equal ( min , 7 ) ;
} ) ;


// Test case 4: Verify minProperty behavior when a starting value is provided.
test ( "minProperty should return the start value if no higher value of the property in the enumerable is found" , function ( ) {
    // Call minProperty with a starting value (1) that is lower than any 'age' in the array.
    var min = array . minProperty ( 'age' , 1 ) ;

    // Assert that the function returns the provided start value, as no 'age' is lower than 1.
    equal ( min , 1 ) ;
} ) ;


// Test case 5: Verify sumProperty correctly calculates the total sum of a property.
test ( "sumProperty should return the sum of the properties in the enumerable" , function ( ) {
    // Calculate the sum of the 'age' properties for all elements in the array.
    var sum = array . sumProperty ( 'age' ) ;

    // Assert that the calculated sum is 101 (7 + 17 + 77).
    equal ( sum , 101 ) ;
} ) ;

// End of EnumerableExt test suite.