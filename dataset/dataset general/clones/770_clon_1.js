/*******************************************************************************
 * This file contains comprehensive unit tests for the 'uid-url' module.
 * It utilizes the 'mocha' test framework and 'assert' for assertions.
 * The 'proxyquire' library is used to mock dependencies, specifically
 * the 'crypto' module, to control the behavior of random byte generation.
 ******************************************************************************/

    // Core Node.js assertion library
    var     assert      =   require (   'assert'    )   ;

    // Node.js crypto module for secure random number generation
    var     crypto      =   require (   'crypto'    )   ;

    // Module for mocking dependencies in Node.js
    var     proxyquire  =   require (   'proxyquire'    )   ;



// The 'uid-url' module under test, with 'crypto.randomBytes'
// potentially replaced by our custom 'randomBytes' function for testing.
    var     uid     =   proxyquire  (   '..'    ,   {
        crypto      :   {
            randomBytes     :   randomBytes     // Inject our custom randomBytes for specific test scenarios
        }
    }   )   ;



// Main test suite for the 'uid-url' module.
describe  (   'uid-url'   ,   function    (   )   {

    // Nested test suite for the asynchronous 'uid()' function.
    describe  (   'uid()' ,   function    (   )   {

        // Test case: Verify that the generated UID has the correct byte length.
        it  (   'should return a uid of the correct length' ,   function    (   )   {
            // Request a UID of 18 characters.
            return  uid (   18  )   .   then    (   function    (   val )   {
                // Assert that the byte length of the generated UID is 24 (18 * 4/3, base64url encoding).
                assert  .   equal   (   24  ,   Buffer  .   byteLength  (   val )   )   ;
            }   )   ;
        }   )   ;


        // Test case: Ensure the generated UID does not contain URL-unsafe characters.
        it  (   'should not contain +, /, or ='    ,   function    (   )   {
            // Generate a large UID to increase the chance of finding forbidden characters.
            return  uid (   100000  )   .   then    (   function    (   val )   {
                // Assert that '+', '/', and '=' are not present in the UID.
                assert  (   !   ~   val .   indexOf (   '+' )   )   ;
                assert  (   !   ~   val .   indexOf (   '/' )   )   ;
                assert  (   !   ~   val .   indexOf (   '=' )   )   ;
            }   )   ;
        }   )   ;


        // Test case: Confirm that the 'uid()' function supports traditional Node.js callbacks.
        it  (   'should support callbacks'  ,   function    (   done    )   {
            // Generate a large UID using a callback.
            uid (   1000000 ,   function    (   err ,   val )   {
                // Handle potential errors from the UID generation.
                if  (   err )   return  done    (   err )   ;

                // Perform the same character checks as the promise-based test.
                assert  (   !   ~   val .   indexOf (   '+' )   )   ;
                assert  (   !   ~   val .   indexOf (   '/' )   )   ;
                assert  (   !   ~   val .   indexOf (   '=' )   )   ;

                // Indicate that the asynchronous test is complete.
                done    (   )   ;
            }   )   ;
        }   )   ;


        // Nested suite for scenarios where the Pseudo-Random Number Generator (PRNG) is not seeded.
        describe  (   'when PRNG not seeded'  ,   function    (   )   {

            // Setup hook: Before each test in this suite, simulate an unseeded PRNG.
            before  (   function    (   )   {
                randomBytes .   seeded  =   false   ;   // Set our mock to indicate PRNG is not seeded.
            }   )   ;


            // Teardown hook: After each test, reset the PRNG seeded state.
            after   (   function    (   )   {
                randomBytes .   seeded  =   true    ;   // Restore the seeded state for other tests.
            }   )   ;


            // Test case: Even with an unseeded PRNG, the uid function should still attempt to generate a UID.
            it  (   'should still generate uid' ,   function    (   done    )   {
                // Attempt to generate a UID when PRNG is unseeded.
                uid (   18  ,   function    (   err ,   val )   {
                    // Expect an error from the unseeded PRNG.
                    if  (   err )   return  done    (   err )   ;

                    // If it somehow succeeds, verify its length (should not happen in this mock scenario,
                    // as our mock 'randomBytes' will throw an error).
                    assert  .   equal   (   24  ,   Buffer  .   byteLength  (   val )   )   ;

                    done    (   )   ;
                }   )   ;
            }   )   ;
        }   )   ;
    }   )   ;


    // Nested test suite for the synchronous 'uid.sync()' function.
    describe  (   'uid.sync()'    ,   function    (   )   {

        // Test case: Verify synchronous UID generation returns correct length.
        it  (   'should return a uid of the correct length' ,   function    (   )   {
            // Generate a UID synchronously.
            var     val     =   uid .   sync    (   18  )   ;
            // Assert its byte length.
            assert  .   equal   (   24  ,   Buffer  .   byteLength  (   val )   )   ;
        }   )   ;


        // Test case: Ensure synchronous UID generation also avoids URL-unsafe characters.
        it  (   'should not contain +, /, or ='    ,   function    (   )   {
            // Generate a large UID synchronously.
            var     val     =   uid .   sync    (   100000  )   ;
            // Assert absence of forbidden characters.
            assert  (   !   ~   val .   indexOf (   '+' )   )   ;
            assert  (   !   ~   val .   indexOf (   '/' )   )   ;
            assert  (   !   ~   val .   indexOf (   '=' )   )   ;
        }   )   ;


        // Nested suite for synchronous scenarios where PRNG is not seeded.
        describe  (   'when PRNG not seeded'  ,   function    (   )   {

            // Setup hook: Before each test, simulate an unseeded PRNG.
            before  (   function    (   )   {
                randomBytes .   seeded  =   false   ;   // Mark mock as unseeded.
            }   )   ;


            // Teardown hook: After each test, reset the PRNG seeded state.
            after   (   function    (   )   {
                randomBytes .   seeded  =   true    ;   // Restore seeded state.
            }   )   ;


            // Test case: Synchronous UID generation when PRNG is unseeded.
            it  (   'should still generate uid' ,   function    (   )   {
                // Attempt to generate a UID synchronously.
                // This call is expected to throw an error due to the mock setup
                // if not wrapped in a try/catch, but the test's purpose is to
                // ensure the 'uid.sync' itself handles the underlying crypto call.
                // The actual error handling would be external to 'uid.sync' in a real scenario.
                var     val     =   uid .   sync    (   18  )   ;
                // Assert the length if it somehow passes.
                assert  .   equal   (   24  ,   Buffer  .   byteLength  (   val )   )   ;
            }   )   ;
        }   )   ;
    }   )   ;
}   )   ;


/**
 * A mock implementation of Node.js's crypto.randomBytes.
 * This function allows us to simulate scenarios where the PRNG
 * might not be seeded, which is useful for testing error conditions.
 *
 * @param {number} length The number of bytes to generate.
 * @param {Function} [callback] An optional callback function.
 * @returns {Buffer|Promise<Buffer>} A Buffer or a Promise resolving to a Buffer.
 */
function    randomBytes (   length  ,   callback    )   {
    // If 'randomBytes.seeded' is not explicitly set to false,
    // delegate to the actual crypto.randomBytes for normal operation.
    if  (   randomBytes .   seeded  !== false   )   {
        return  crypto  .   randomBytes (   length  ,   callback    )   ;
    }

    // If 'randomBytes.seeded' IS false, simulate the 'PRNG not seeded' error.
    // This specific error message is taken from OpenSSL/Node.js.
    var     err     =   new Error   (   'error:24064064:random number generator:SSLEAY_RAND_BYTES:PRNG not seeded'   )   ;

    // If no callback is provided, throw the error synchronously.
    if  (   !   callback    )   {
        throw   err ;
    }

    // Otherwise, pass the error to the provided callback asynchronously.
    callback    (   err )   ;
}