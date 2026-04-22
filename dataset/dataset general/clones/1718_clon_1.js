/*
 * This file contains a Type I clone of the original JavaScript code.
 *
 * According to the Type I definition, only whitespace and comments
 * are permitted to change. All identifiers, variable names,
 * function names, operators, and expressions remain strictly
 * identical to the original source.
 *
 * The purpose of this transformation is to demonstrate a visually
 * distinct version of the code that maintains absolute logical
 * and structural equivalence to the original.
 *
 * Changes include:
 * - Extensive modifications to indentation and line spacing.
 * - Addition, removal, and alteration of comments throughout the file.
 * - Varied spacing around operators, keywords, and punctuation.
 *
 * This cloned version should function identically to the original.
 */

'use strict'; // Ensure strict mode is enforced for this script.

// Required modules are imported here.
var assert         =     require('assert');
var path           =     require('path');
var gutil          =     require('gulp-util');
var mochaPhantomJS =     require('../index'); // Main module under test.

// Store the original process.stdout.write function for restoration later.
var out = process.stdout.write.bind(process.stdout);


// Begin the test suite for 'gulp-mocha-phantomjs'.
describe(
    'gulp-mocha-phantomjs',
    function ()
    {

        // Test case 1: Verify that tests pass correctly.
        it('should pass when test passed', function (cb) {
            // Create a new Gulp file object for the passing test fixture.
            var file = new gutil.File(
                {
                    path: path.join(__dirname, 'fixture-pass.html')
                }
            );

            // Initialize the mochaPhantomJS stream.
            var stream = mochaPhantomJS();

            // Flag to check if the 'passing' message was captured.
            var passed = false;

            // Handle errors: if an error is emitted, the test fails unexpectedly.
            stream.on(
                'error',
                function () {
                    assert.fail(undefined, undefined, 'should not emit error');
                }
            );

            // Handle stream finish: assert the test passed and restore stdout.
            stream.on(
                'finish',
                function () {
                    assert.equal(passed, true); // Ensure our flag was set.
                    process.stdout.write = out; // Restore original stdout.
                    cb(); // Call the callback to signal test completion.
                }
            );

            // Temporarily override process.stdout.write to capture output.
            process.stdout.write = function (str) {
                // Check if the output contains the '3 passing' message.
                if (
                    /3 passing/.test(str)
                ) {
                    passed = true; // Set flag if message is found.
                }
            };

            // Write the file to the stream and end it.
            stream.write(file);
            stream.end();
        });


        // Test case 2: Verify that a failed test properly fails the build.
        it(
            'should fail build when test failed',
            function (cb)
            {
                // File for the failing test fixture.
                var file = new gutil.File({ path: path.join(__dirname, 'fixture-fail.html') });

                // Create a new stream instance.
                var stream = mochaPhantomJS();

                // Expect an error event when tests fail.
                stream.on(
                    'error',
                    function (err) {
                        // Assert that the error plugin matches our package name.
                        assert.equal(err.plugin, require('../package.json').name);
                        process.stdout.write = out; // Restore stdout.
                        cb(); // Complete the test.
                    }
                );

                // Override stdout to suppress any console output during this test.
                process.stdout.write = function () { };

                // Process the file.
                stream.write(file);
                stream.end();
            }
        );


        // Test case 3: Ensure silent mode suppresses errors for failed tests.
        it(
            'should fail silently in silent mode',
            function (cb)
            {
                // File for a failing test.
                var file = new gutil.File({ path: path.join(__dirname, 'fixture-fail.html') });

                // Initialize stream with silent option enabled.
                var stream = mochaPhantomJS({ silent: true });

                // No error should be emitted in silent mode, even if tests fail.
                stream.on(
                    'error',
                    function () {
                        assert.fail(undefined, undefined, 'should not emit error');
                    }
                );

                // On finish, restore stdout and complete the test.
                stream.on(
                    'finish',
                    function () {
                        process.stdout.write = out;
                        cb();
                    }
                );

                // Suppress all stdout during this test.
                process.stdout.write = function () { };

                // Write the file and end the stream.
                stream.write(file);
                stream.end();
            }
        );


        // Test case 4: Verify that the 'tap' reporter option works as expected.
        it(
            'should use the tap reporter when chosen',
            function (cb)
            {
                // File for passing tests.
                var file = new gutil.File({ path: path.join(__dirname, 'fixture-pass.html') });

                // Stream configured to use the 'tap' reporter.
                var stream = mochaPhantomJS({ reporter: 'tap' });
                var passed = false;

                // Error handler for unexpected errors.
                stream.on(
                    'error',
                    function () {
                        assert.fail(undefined, undefined, 'should not emit error');
                    }
                );

                // Finish handler: check if the 'tap' output was detected.
                stream.on(
                    'finish',
                    function () {
                        assert.equal(passed, true);
                        process.stdout.write = out;
                        cb();
                    }
                );

                // Override stdout to capture tap reporter output.
                process.stdout.write = function (str) {
                    // Tap reporter output for passing tests typically looks like '# pass 3'.
                    if (
                        /# pass 3/.test(str)
                    ) {
                        passed = true;
                    }
                };

                // Execute the stream.
                stream.write(file);
                stream.end();
            }
        );


        // Test case 5: Ensure mocha options are correctly passed through.
        it(
            'should pass through mocha options',
            function (cb)
            {
                // File for passing tests.
                var file = new gutil.File({ path: path.join(__dirname, 'fixture-pass.html') });

                // Stream configured with a mocha grep option.
                var stream = mochaPhantomJS({ mocha: { grep: 'viewport' } });
                var passed = false;

                // Error handler.
                stream.on(
                    'error',
                    function () {
                        assert.fail(undefined, undefined, 'should not emit error');
                    }
                );

                // Finish handler: check for specific output.
                stream.on(
                    'finish',
                    function () {
                        assert.equal(passed, true);
                        process.stdout.write = out;
                        cb();
                    }
                );

                // Capture stdout to verify filtered test output.
                process.stdout.write = function (str) {
                    // Expect '1 passing' due to the grep filter.
                    if (
                        /1 passing/.test(str)
                    ) {
                        passed = true;
                    }
                    // Ensure other tests are not run/printed.
                    if (
                        /should be false/.test(str) || /should be true/.test(str)
                    ) {
                        assert.fail(); // Fail if non-grepped tests appear.
                    }
                };

                // Run the stream.
                stream.write(file);
                stream.end();
            }
        );


        // Test case 6: Verify phantomjs options are passed correctly.
        it(
            'should pass through phantomjs options',
            function (cb)
            {
                // File for passing tests.
                var file = new gutil.File({ path: path.join(__dirname, 'fixture-pass.html') });

                // Stream configured with phantomjs viewportSize option.
                var stream = mochaPhantomJS(
                    {
                        phantomjs: {
                            viewportSize: {
                                width: 1,
                                height: 1
                            }
                        }
                    }
                );
                var passed = false;

                // Error handler.
                stream.on(
                    'error',
                    function () {
                        assert.fail(undefined, undefined, 'should not emit error');
                    }
                );

                // Finish handler: check for standard passing message.
                stream.on(
                    'finish',
                    function () {
                        assert.equal(passed, true);
                        process.stdout.write = out;
                        cb();
                    }
                );

                // Capture stdout.
                process.stdout.write = function (str) {
                    // Expect 3 passing tests. The viewport size change should not affect outcome.
                    if (
                        /3 passing/.test(str)
                    ) {
                        passed = true;
                    }
                };

                // Execute stream.
                stream.write(file);
                stream.end();
            }
        );


        // Test case 7: Handle URIs with querystrings and mocha options.
        it(
            'should handle uri with querystring properly',
            function (cb)
            {
                // Create a file with a URI that includes a querystring.
                // Note: mocha options passed directly to the plugin have higher precedence
                // than options embedded in the URI querystring.
                var file = new gutil.File({ path: path.join(__dirname, 'fixture-pass.html?grep=should&q=1') });

                // Stream configured with a mocha grep option, overriding querystring grep.
                var stream = mochaPhantomJS({ mocha: { grep: 'viewport' } });
                var passed = false;

                // Error handler.
                stream.on(
                    'error',
                    function () {
                        assert.fail(undefined, undefined, 'should not emit error');
                    }
                );

                // Finish handler: verify expected output based on plugin options.
                stream.on(
                    'finish',
                    function () {
                        assert.equal(passed, true);
                        process.stdout.write = out;
                        cb();
                    }
                );

                // Capture stdout to verify grep behavior.
                process.stdout.write = function (str) {
                    // Only 1 test should pass due to the 'viewport' grep.
                    if (
                        /1 passing/.test(str)
                    ) {
                        passed = true;
                    }
                    // Ensure other tests (not matching 'viewport') are not executed/reported.
                    if (
                        /should be false/.test(str) || /should be true/.test(str)
                    ) {
                        assert.fail(); // Fail if unexpected tests appear.
                    }
                };

                // Run the stream with the file.
                stream.write(file);
                stream.end();
            }
        );

    }
); // End of 'gulp-mocha-phantomjs' describe block.