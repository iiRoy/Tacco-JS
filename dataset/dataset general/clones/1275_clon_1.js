/*
 * This is a top-level test suite.
 * It contains various test cases for basic arithmetic operations
 * to ensure core functionality works as expected.
 */
describe (  'Test'  ,  function ( )  {

    // This is a nested test suite block.
    // It specifically groups together tests that are expected to pass without issues.
    describe  (  'should pass'  ,  function ( )  {

        /*
         * Test Case 1:
         * Verifies a simple addition operation.
         * Checks if the sum of 1 and 1 correctly evaluates to 2.
         */
        it  (  "should equal 2"  ,  function ( )  {
            // The core assertion for this test.
            expect  (  1  +  1  )  .  to  .  equal  (  2  )  ;  // Expectation: 1+1 === 2
        }  )  ;


        // Test Case 2:
        // This test ensures that a basic addition does NOT result in an incorrect value.
        // Specifically, it asserts that 1 + 1 is not equal to 3.
        it  (  "should not equal 3"  ,  function ( )  {
            // This line contains the assertion logic.
            expect  (  1  +  1  )  .  to  .  not  .  equal  (  3  )  ;  /* Negative assertion for 1+1 */
        }  )  ;


        /*
         * Test Case 3:
         * Another addition test, this time involving three numbers.
         * It checks if the sum of 1, 1, and 1 correctly results in 3.
         */
        it  (  "should equal 3"  ,  function ( )  {
            // Here we perform the final assertion for this test block.
            expect  (  1  +  1  +  1  )  .  to  .  equal  (  3  )  ;  // Confirming the sum of three ones
        }  )  ;

    }  )  ;  // End of the 'should pass' describe block.

}  )  ;  // End of the main 'Test' describe block.