/*
 * This file contains a Type I clone of an existing JavaScript module.
 * The purpose is to demonstrate code cloning where only whitespace and comments
 * are altered, while the core logic and structure remain identical.
 */

/* Importing necessary modules for the test suite */
var     expect =  require ( 'chai' ) . expect ;  // Chai for assertions
var fs = require('fs');                         // File system module (though not directly used in this test)
var AWS = require('mock-aws-s3');               /*
                                                 * This dependency is crucial as it provides
                                                 * the 'walk' method used throughout the test.
                                                 */


// Begin the S3 test suite description
describe(   'S3'   , function () {

    /*
     * This is the primary test case.
     * It verifies the expected lengths of various file system walks,
     * simulating different S3 bucket scenarios.
     */
    it  (   'should do what it is supposed to do'   ,   function    (   done   )   {

        // --- Variable declarations for S3 'walk' results ---
        // Each variable stores the result of walking a specific directory path.
        var first               = AWS . walk ( __dirname + '/local/bucket/first' ) ;
        var second              = AWS . walk ( __dirname + '/local/bucket/second' ) ;
        var updated             = AWS . walk ( __dirname + '/local/bucket/first/otters/updated' ) ;
        var backup              = AWS . walk ( __dirname + '/local/download/backup' ) ;
        var third               = AWS . walk ( __dirname + '/local/bucket/third' ) ;
        var fourth_bucket       = AWS . walk ( __dirname + '/local/bucket/fourth' ) ;
        var fourth              = AWS . walk ( __dirname + '/local/download/fourth' ) ;
        var fifth               = AWS . walk ( __dirname + '/local/download/fifth' ) ;
        var fifth_bucket        = AWS . walk ( __dirname + '/local/bucket/fifth' ) ;
        var copies              = AWS . walk ( __dirname + '/local/bucket/copies' ) ;

        /*
         * --- Assertions for the 'walk' results ---
         * Each assertion checks if the length of the walked directory
         * matches a predefined expected value.
         */

        // Verifying the length of the 'first' directory walk
        expect  (   first   .   length  )   .   to  .   equal ( 1473 ) ;

        // Verifying the length of the 'second' directory walk
        expect  (   second  .   length  )   .   to  .   equal ( 1472 ) ;

        // Verifying the length of the 'updated' directory walk
        expect  (   updated .   length  )   .   to  .   equal ( 0 ) ;

        // Verifying the length of the 'backup' directory walk
        expect  (   backup  .   length  )   .   to  .   equal ( 2945 ) ;

        // Verifying the length of the 'third' directory walk
        expect  (   third   .   length  )   .   to  .   equal ( 912 ) ;

        // Verifying the length of the 'fourth_bucket' directory walk
        expect  (   fourth_bucket   .   length  )   .   to  .   equal ( 2945 ) ;

        // Verifying the length of the 'fourth' directory walk
        expect  (   fourth  .   length  )   .   to  .   equal ( 1472 ) ;

        // Verifying the length of the 'fifth' directory walk
        expect  (   fifth   .   length  )   .   to  .   equal ( 560 ) ;

        // Verifying the length of the 'fifth_bucket' directory walk
        expect  (   fifth_bucket    .   length  )   .   to  .   equal ( 2 ) ;

        // Verifying the length of the 'copies' directory walk
        expect  (   copies  .   length  )   .   to  .   equal ( 1473 ) ;

        // Indicate that the asynchronous test has completed successfully.
        done    (   )   ;
    }   )   ;
}   )   ;
/* End of S3 test suite */