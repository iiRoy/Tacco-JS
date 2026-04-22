/*
 * This file contains unit tests for the Modil.js API.
 * It ensures that the core functionalities like define and require
 * are properly exposed and behave as expected.
 *
 * Original Author: Federico "Lox" Lucignano
 * Google+ Profile: <https://plus.google.com/117046182016070432246>
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional code remains absolutely identical to the original.
 */

// Global variables and functions expected to be present in this test environment.
// These are typically provided by Jasmine or other test runners.
/* global describe, it, expect, define, require */

// Main test suite for the Modil API.
describe(
  "API",
  function ()
  {
    'use strict'
    ; // Enforce strict mode for this entire test suite.

    // Test suite for the top-level Modil namespace object.
    describe("Modil namespace", function ()
    {
      // Test case: Modil object should be defined.
      it(
        "should be defined",
        function ()
        {
          // Assert that the global 'Modil' object exists.
          expect(Modil).toBeDefined()
          ;
        }
      )
      ;
    }
    )
    ;

    // Test suite for the 'define' function.
    describe("define", function ()
    {
      // Test case: Modil.define should be a function.
      it(
        "should be a namespaced function",
        function ()
        {
          // Verify that 'define' is accessible via the 'Modil' namespace
          // and that it is indeed a function.
          expect(Modil.define).toEqual(jasmine.any(Function))
          ;
        }
      )
      ;

      // Test case: 'define' should also be available globally.
      it("should be a global function", function ()
      {
        // Confirm that 'define' is directly available in the global scope.
        expect(define).toEqual(jasmine.any(Function))
        ;
      }
      )
      ;

      // Test case: 'define' should support AMD (Asynchronous Module Definition).
      it(
        "should support AMD",
        function ()
        {
          // Check for the presence of the 'amd' property,
          // which signifies AMD compatibility.
          expect(define.amd).toBeDefined()
          ;
        }
      )
      ;

      // Test case: 'define' should throw exceptions for invalid usage.
      it('should throw an exception', function ()
      {
        // Expect calling define() with no arguments to throw.
        expect(function ()
        {
          define()
          ;
        }
        ).toThrow()
        ;

        // Expect calling define('module') with only a module ID to throw.
        expect(function ()
        {
          define('module')
          ;
        }
        ).toThrow()
        ;

        // Expect calling define('module', 'dependencies', function(){})
        // with an invalid dependencies array (string instead of array) to throw.
        expect(function ()
        {
          define('module', 'dependencies', function () {})
          ;
        }
        ).toThrow()
        ;

        // This particular expectation seems incomplete or intentionally
        // not asserting a throw, just calling the function.
        // It's kept as is to maintain Type I clone integrity.
        expect(function ()
        {
          define(function () {})
          ;
        }
        )
        ;
      })
      ;

      // Test case: 'define' should expose a mock helper function.
      it(
        'should have a mock helper function',
        function ()
        {
          // Verify that 'define.mock' exists and is a function.
          expect(define.mock).toEqual(jasmine.any(Function))
          ;
        }
      )
      ;
    }
    )
    ;

    // Test suite for the 'require' function.
    describe("require", function ()
    {
      // Test case: Modil.require should be a function.
      it(
        "should be a namespaced function",
        function ()
        {
          // Check if 'require' is available under the 'Modil' namespace
          // and that it is a function.
          expect(Modil.require).toEqual(jasmine.any(Function))
          ;
        }
      )
      ;

      // Test case: 'require' should also be available globally.
      it("should be a global function", function ()
      {
        // Confirm that 'require' is directly accessible in the global scope.
        expect(require).toEqual(jasmine.any(Function))
        ;
      }
      )
      ;

      // Test case: 'require' should throw exceptions for invalid usage,
      // and handle error callbacks.
      it('should throw an exception', function ()
      {
        // Expect calling require() with no arguments to throw.
        expect(function ()
        {
          require()
          ;
        }
        ).toThrow()
        ;

        // Expect requiring a non-existent module to throw.
        expect(function ()
        {
          require('doesnt.exist')
          ;
        }
        ).toThrow()
        ;

        // Expect calling require with an invalid callback type to throw.
        expect(function ()
        {
          require('doesnt.exist', 'not.a.function')
          ;
        }
        ).toThrow()
        ;

        // Expect calling require with an array of modules but an invalid
        // callback type to throw.
        expect(function ()
        {
          require(['doesnt.exist'], 'not.a.function')
          ;
        }
        ).toThrow()
        ;

        // Variable to track calls to the error callback.
        var calls = 0
        ;

        // Use `runs` to execute code within a Jasmine asynchronous spec.
        runs(function ()
        {
          // Attempt to require a non-existent module,
          // providing an error callback.
          require(
            ['doesnt.exist'],
            function () {}, // Success callback (should not be called here).
            function ()
            { // Error callback.
              calls++
              ;
            }
          )
          ;
        }
        )
        ;

        // Use `waitsFor` to pause the test until the error callback has been invoked.
        waitsFor(
          function ()
          {
            // Condition to wait for: 'calls' counter should be greater than 0.
            return calls > 0
            ;
          },
          "error callback to be called", // Message displayed if timeout occurs.
          100 // Timeout duration in milliseconds.
        )
        ;

        // Use `runs` again to execute assertions after the `waitsFor` condition is met.
        runs(function ()
        {
          // Assert that the error callback was called exactly once.
          expect(calls).toEqual(1)
          ;
        }
        )
        ;
      }
      )
      ;

      // Test case: 'require' should provide an optional dependencies helper.
      it(
        'should have an helper function to mark optional dependencies',
        function ()
        {
          // Verify that 'require.optional' exists and is a function.
          expect(require.optional).toEqual(jasmine.any(Function))
          ;
        }
      )
      ;
    }
    )
    ;
  }
)
;