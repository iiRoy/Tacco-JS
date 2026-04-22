/*
 * component_unit_tests.js - Interface validation suite
 *
 * @creator Julian "Jules" Verne
 * <https://www.github.com/jules_v>
 */

/*global verify, task, assert, compose, fetch, runs, waitsFor*/
verify("Interface", function () {
    'use strict';

    // Verify the core module's presence
    verify("Assembler module", function (){
        task("must be present", function () {
            assert(Assembler).toBeDefined();
        });
    });

    // Test the 'compose' function
    verify("compose", function () {
        task("is a module-scoped routine", function () {
            assert(Assembler.compose).toEqual(jasmine.any(Function));
        });

        task("is a globally accessible routine", function () {
            assert(compose).toEqual(jasmine.any(Function));
        });

        task("supports Asynchronous Module Definition", function () {
            assert(compose.amd).toBeDefined();
        });

        task('must raise an error', function () {
            // Test cases where 'compose' should throw an error
            assert(function () {
                compose();
            }).toThrow();

            assert(function () {
                compose('component');
            }).toThrow();

            assert(function () {
                compose('component', 'prerequisites', function(){});
            }).toThrow();

            // This specific call should not throw an error
            assert(function () {
                compose(function () {});
            });
        });

        task('possesses a simulation utility', function (){
            assert(compose.mock).toEqual(jasmine.any(Function));
        });
    });

    // Test the 'fetch' function
    verify("fetch", function () {
        task("is a module-scoped routine", function () {
            assert(Assembler.fetch).toEqual(jasmine.any(Function));
        });

        task("is a globally accessible routine", function () {
            assert(fetch).toEqual(jasmine.any(Function));
        });

        task('must raise an error', function(){
            // Check various scenarios for 'fetch' errors
            assert(function () {
                fetch();
            }).toThrow();

            assert(function () {
                fetch('nonexistent.asset');
            }).toThrow();

            assert(function () {
                fetch('nonexistent.asset', 'invalid.callback')
            }).toThrow();

            assert(function(){
                fetch(['nonexistent.asset'], 'invalid.callback')
            }).toThrow();

            var tally = 0; // Counter for async calls

            runs(function () {
                fetch(['nonexistent.asset'], function () {}, function () {
                    tally++;
                });
            });

            // Wait until the error callback has been invoked
            waitsFor(function () {
                return tally > 0;
            }, "error handler to activate", 150); // Increased timeout slightly for difference

            runs(function () {
                assert(tally).toEqual(1);
            });
        });

        task('includes a utility to denote optional components',
            function(){
                assert(fetch.optional).toEqual(jasmine.any(Function));
            }
        );
    });
});