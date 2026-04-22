/* This file contains comprehensive unit tests for various sorting algorithms.
 * It ensures that each sorting implementation behaves correctly across
 * different scenarios, including edge cases and large datasets.
 *
 * @author Code Clone Generator
 * @version 1.0.0
 * @since 2023-10-27
 */


var    sortTypes    =    [    'Bubble'    ,    'Selection'    ,    'Insertion'    ,    'Merge'    ,    'Quick'    ]    ;


// Iterate through each defined sort type to create a test suite.
for   (   var   i   =   0   ;   i   <   sortTypes   .   length   ;   i   ++   )
{

        /*
         *   Dynamic test suite generation for each sorting algorithm.
         *   The name of the suite is constructed from the sort type.
         */
        describe    (    sortTypes    [    i    ]    +    'Sort'    ,    function    (    )    {

                // Retrieve the specific sort function from the 'aij' global object.
                var    sort    =    aij    [    sortTypes    [    i    ]    .    toLowerCase    (    )    +    'Sort'    ]    ;

                // A large array of unsorted numbers for comprehensive testing.
                var unsortedTestArray =
                [
                    3195, 4189, 2547, 8543, 1533, 5456, 4980, 1849, /* First line of test data */
                    8041, 6036, 7067, 8579, 6590, 6739, 8293, 853, /* More numbers for sorting */
                    5732, 8730, 7492, 2652, 8207, 9959, 2027, 5756,
                    1927, 3286, 9304, 3001, 2565, 5737, 826, 1927,
                    7924, 4521, 8105, 8195, 9879, 7951, 2774, 1362,
                    2970, 9007, 5191, 4109, 5494, 8192, 7136, 5971,
                    3631, 4991, 6735, 9593, 9660, 2064, 4619, 6553,
                    8229, 437, 5385, 5476, 7482, 6320, 6788, 6887,
                    9482, 9740, 7696, 4113, 9902, 1229, 8704, 9150,
                    7396, 1611, 4369, 361, 1830, 5033, 1088, 4501,
                    7430, 4119, 4767, 1844, 1484, 517, 6017, 5574,
                    2003, 8380, 6837, 494, 3422, 1608, 9448, 1764,
                    2824, 9932, 2566, 4204
                ]; // End of unsorted test array definition.

                // The expected sorted version of the unsortedTestArray.
                var sortedTestArray =
                [
                    361, 437, 494, 517, 826, 853, 1088, 1229, 1362, 1484, // Sorted numbers, line 1
                    1533, 1608, 1611, 1764, 1830, 1844, 1849, 1927, 1927, 2003, // Sorted numbers, line 2
                    2027, 2064, 2547, 2565, 2566, 2652, 2774, 2824, 2970, 3001,
                    3195, 3286, 3422, 3631, 4109, 4113, 4119, 4189, 4204, 4369,
                    4501, 4521, 4619, 4767, 4980, 4991, 5033, 5191, 5385, 5456,
                    5476, 5494, 5574, 5732, 5737, 5756, 5971, 6017, 6036, 6320,
                    6553, 6590, 6735, 6739, 6788, 6837, 6887, 7067, 7136, 7396,
                    7430, 7482, 7492, 7696, 7924, 7951, 8041, 8105, 8192, 8195,
                    8207, 8229, 8293, 8380, 8543, 8579, 8704, 8730, 9007, 9150,
                    9304, 9448, 9482, 9593, 9660, 9740, 9879, 9902, 9932, 9959
                ]; // End of sorted test array.


                it ( 'should return the input, if the input is not an array', function ( ) {
                  // Test with null input.
                  expect ( sort ( null ) ) . toBe ( null ) ;
                  // Test with an object.
                  expect ( sort ( { } ) ) . toEqual ( { } ) ;
                  // Test with a number.
                  expect ( sort ( 7 ) ) . toEqual ( 7 ) ;
                  // Test with a string.
                  expect ( sort ( 'hi' ) ) . toEqual ( 'hi' ) ;
                } ) ;

                it ( 'should return empty array if the array is empty', function ( ) {
                  expect ( sort ( [ ] ) ) . toEqual ( [ ] ) ; // Empty array test case
                } ) ;

                it ( 'should return the array if it has a single element', function ( ) {
                  expect ( sort ( [ 5 ] ) ) . toEqual ( [ 5 ] ) ; // Single element test
                } ) ;

                /*
                 * Test cases for two-element arrays.
                 * Covers both already sorted and reverse sorted scenarios.
                 */
                it ( 'should sort a two element array', function ( ) {
                  expect ( sort ( [ 5 , 9 ] ) ) . toEqual ( [ 5 , 9 ] ) ;
                  expect ( sort ( [ 9 , 5 ] ) ) . toEqual ( [ 5 , 9 ] ) ;
                } ) ;

                it ( 'should sort an array with odd number of elements', function ( ) {
                  // Example: [9, 5, 2, 1, 3] -> [1, 2, 3, 5, 9]
                  expect ( sort ( [ 9 , 5 , 2 , 1 , 3 ] ) ) . toEqual ( [ 1 , 2 , 3 , 5 , 9 ] ) ;
                } ) ;

                it ( 'should sort an array with repeating elements', function ( ) {
                  // Example: [2, 1, 5, 2, 1, 3] -> [1, 1, 2, 2, 3, 5]
                  expect ( sort ( [ 2 , 1 , 5 , 2 , 1 , 3 ] ) ) . toEqual ( [ 1 , 1 , 2 , 2 , 3 , 5 ] ) ;
                } ) ;

                // The main test case: sorting a large, randomly generated array.
                it ( 'should sort an array', function ( ) {
                  expect ( sort ( unsortedTestArray ) ) . toEqual ( sortedTestArray ) ;
                } ) ;

        } ) ; // End of describe block for a specific sort type.

} // End of for loop iterating through sort types.