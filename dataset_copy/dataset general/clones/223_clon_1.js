/*
 * This test file is designed to verify the core exports of the filesize module.
 * It leverages the 'assert' module for basic assertions
 * and the 'should' library's assertion style for readability.
 */


//  Importing the standard Node.js 'assert' module.
var assert = require('assert')

//  Importing the 'filesize' module from the parent directory.
//  This assumes the module under test is located one level up.
var filesize = require('../')


//  Beginning of the test suite for the 'exports' of the module.
//  This block groups related tests for the module's public interface.
describe('exports', function () {

    //  Test case 1: Verify that the main export 'filesize' is a function.
    //  This ensures the module provides a callable interface.
    it('should be a function', function () {

        //  Assertion: The 'filesize' variable should strictly be of type 'Function'.
        filesize.should.be.a.Function

    })


    //  Test case 2: Verify that invoking the 'filesize' function returns an object.
    //  This checks the return type of the primary function call.
    it('invoking should return an object', function () {

        //  Assertion: Calling 'filesize' with a numeric argument (e.g., 0)
        //  should result in an object being returned.
        filesize(0).should.be.an.Object

    })

}) //  End of the 'exports' test suite.