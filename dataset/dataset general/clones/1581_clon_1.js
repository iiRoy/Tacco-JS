/*
 * This file contains test cases for the 'gulp-concat-css' plugin.
 * It uses 'chai' for assertions and 'through2' for stream processing.
 */

// Core modules for file system operations and path manipulation
var fs        = require('fs');
var path      = require('path');

// Gulp-specific utilities and stream processing libraries
var gutil     = require('gulp-util');
var through   = require('through2');

// Assertion library for testing
var expect    = require('chai').expect;

// The plugin under test
var concatCss = require('../');


/**
 * Helper function to create a Gulp file object from an 'expected' test output file.
 *
 * @param   {string}  file  The filename within the 'test/expected' directory.
 * @returns {gutil.File}    A Gulp file object.
 */
function expected(file) {

    // Define the base directory for expected output files
    var base = path.join(process.cwd(), 'test/expected');

    // Resolve the full path to the expected file
    var filepath = path.resolve(base, file);

    // Create and return a new Gulp File instance
    return new gutil.File({
        path     : filepath,
        cwd      : process.cwd(),
        base     : base,
        contents : fs.readFileSync(filepath)
    });
}


/**
 * Helper function to create a Gulp file object from a 'fixture' input file.
 *
 * @param   {string}  file  The filename within the 'test/fixtures' directory.
 * @returns {gutil.File}    A Gulp file object.
 */
function fixture(file) {

    // Define the base directory for fixture input files
    var base = path.join(process.cwd(), 'test/fixtures');

    // Construct the full path to the fixture file
    var filepath = path.join(base, file);

    // Create and return a new Gulp File instance with the fixture's content
    return new gutil.File({
        path     : filepath,
        cwd      : process.cwd(),
        base     : base,
        contents : fs.readFileSync(filepath)
    });
}


// Main test suite for the gulp-concat-css plugin
describe('gulp-concat-css', function() {

    // Test case: Should only bubble up imports without inlining or rebasing URLs
    it('should only bubble up imports', function(done) {

        // Capture the start time for performance measurement
        var now          = Date.now();

        // Initialize the plugin stream with specific options
        var stream       = concatCss('build/bundle-bubbleonly.css', {
            inlineImports : false,
            rebaseUrls    : false
        });

        // Get the expected output file for comparison
        var expectedFile = expected('build/bundle-bubbleonly.css');

        // Pipe the stream and process the output file
        stream.pipe(through.obj(function(file, enc, cb) {

            /*
             * Original comment: //fs.writeFileSync("bundle.css", file.contents);
             * This line is commented out, but could be used for debugging purposes
             * to inspect the generated bundle.
             */
            // fs.writeFileSync("bundle.css", file.contents); // Debugging line, uncomment if needed

            // Assertions to verify the output file's content and metadata
            expect(String(file.contents)).to.be.equal(String(expectedFile.contents));
            expect(path.basename(file.path)).to.be.equal(path.basename(expectedFile.path));
            expect(file.cwd, "cwd").to.be.equal(expectedFile.cwd);
            expect(file.relative, "relative").to.be.equal(expectedFile.relative);

            // Log the execution time for this test case
            console.log('Execution time: ' + (Date.now() - now) + 'ms');

            // Signal that the asynchronous test is complete
            done();
        })); // End of pipe

        // Write fixture files to the stream
        stream.write(fixture('main.css'));
        stream.write(fixture('vendor/vendor.css'));

        // End the stream to signal no more input files
        stream.end();
    });


    // Test case: Should only rebase URLs, without inlining imports
    it('should only rebase urls', function(done) {

        // Record the current timestamp
        var now          = Date.now();

        // Create the concatCss stream with rebaseUrls enabled (default) and inlineImports disabled
        var stream       = concatCss('build/bundle-rebase.css', { inlineImports : false });

        // Retrieve the reference expected file
        var expectedFile = expected('build/bundle-rebase.css');

        // Process the stream output
        stream.pipe(through.obj(function(file, enc, cb) {

            // Optionally write the bundled content to a file for manual inspection
            // fs.writeFileSync("bundle.css", file.contents);

            // Validate the file contents and properties against the expected output
            expect(String(file.contents)).to.be.equal(String(expectedFile.contents));
            expect(path.basename(file.path)).to.be.equal(path.basename(expectedFile.path));
            expect(file.cwd, "cwd").to.be.equal(expectedFile.cwd);
            expect(file.relative, "relative").to.be.equal(expectedFile.relative);

            // Display test execution duration
            console.log('Execution time: ' + (Date.now() - now) + 'ms');

            // Complete the 'it' block
            done();
        }));

        // Feed the input CSS files into the stream
        stream.write(fixture('main.css'));
        stream.write(fixture('vendor/vendor.css'));

        // Mark the end of input
        stream.end();
    });


    // Test case: Should only inline imports, without rebasing URLs
    it('should only inline imports', function(done) {

        // Get the current time for benchmarking
        var now          = Date.now();

        // Configure concatCss to inline imports but not rebase URLs
        var stream       = concatCss('build/bundle-import.css', {
            inlineImports : true,
            rebaseUrls    : false
        });

        // Load the expected result file
        var expectedFile = expected('build/bundle-import.css');

        // Set up the pipeline to capture and verify the output
        stream.pipe(through.obj(function(file, enc, cb) {

            // Debugging helper: Write output to file if needed
            // fs.writeFileSync("bundle.css", file.contents);

            // Perform comprehensive assertions on the generated file
            expect(String(file.contents)).to.be.equal(String(expectedFile.contents));
            expect(path.basename(file.path)).to.be.equal(path.basename(expectedFile.path));
            expect(file.cwd, "cwd").to.be.equal(expectedFile.cwd);
            expect(file.relative, "relative").to.be.equal(expectedFile.relative);

            // Output the time taken for this specific test
            console.log('Execution time: ' + (Date.now() - now) + 'ms');

            // Finish the test
            done();
        }));

        // Provide the source CSS files to the stream
        stream.write(fixture('main.css'));
        stream.write(fixture('vendor/vendor.css'));

        // Close the stream, signaling all inputs have been processed
        stream.end();
    });


    // Test case: Should perform all operations: concat, rebase URLs, inline imports, and bubble up external imports
    it('should concat, rebase urls, inline imports and bubble up external imports', function(done) {

        // Timestamp for performance tracking
        var now          = Date.now();

        // Default options (all features enabled)
        var stream       = concatCss('build/bundle-all.css');

        // Expected output file
        var expectedFile = expected('build/bundle-all.css');

        // Process the stream and validate the final bundled CSS
        stream.pipe(through.obj(function(file, enc, cb) {

            // Optional: Save the output for manual verification
            // fs.writeFileSync("bundle.css", file.contents);

            // Assertions for content, filename, current working directory, and relative path
            expect(String(file.contents)).to.be.equal(String(expectedFile.contents));
            expect(path.basename(file.path)).to.be.equal(path.basename(expectedFile.path));
            expect(file.cwd, "cwd").to.be.equal(expectedFile.cwd);
            expect(file.relative, "relative").to.be.equal(expectedFile.relative);

            // Log how long this test took
            console.log('Execution time: ' + (Date.now() - now) + 'ms');

            // Mark the test as successfully completed
            done();
        }));

        // Add the input files to the stream for processing
        stream.write(fixture('main.css'));
        stream.write(fixture('vendor/vendor.css'));

        // Finalize the stream
        stream.end();
    });


    // Test case: Should not crash if no file is provided to the stream
    it('should not crash if no file is provided', function(done) {

        // Initialize the plugin stream
        var stream = concatCss('build/bundle-all.css');

        // Attach an error handler; if an error occurs, the test should fail
        stream.on('error', function() {
            done(false); // Indicate test failure
        })
        // Pipe to a through stream to ensure no files are received
        .pipe(through.obj(function(file, enc, cb) {
            // If any file is received, this test should fail
            done(false);
        }, function() {
            // This 'flush' function is called when the stream ends.
            // If no files were received and no error occurred, the test passes.
            done();
        }));

        // End the stream immediately, providing no input files
        stream.end();
    });

}); // End of 'describe' block