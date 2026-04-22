'use strict'; // This directive ensures strict mode is used for the entire script.

/*
 * This section imports necessary modules for the test suite.
 * These modules include the testing framework, the library under test,
 * file system utilities, and a custom console recorder.
 */
var test        = require('tape');          // 'tape' is a minimalist testing framework.
var sourcemaps  = require('..');            // The main 'gulp-sourcemaps' plugin being tested.
var File        = require('vinyl');         // 'vinyl' provides a virtual file format for streams.
var ReadableStream = require('stream').Readable; // Node.js core module for creating readable streams.
var path        = require('path');          // Node.js 'path' module for path manipulation.
var fs          = require('fs');            // Node.js 'fs' module for file system operations.
var recordConsole = require('./consolerecorder.js'); // A custom utility to capture console output during tests.


// Reads the content of a sample JavaScript file synchronously.
// This content will be used as input for various test cases.
var sourceContent = fs.readFileSync( path.join( __dirname, 'assets/helloworld.js' ) ).toString();


/**
 * @function makeFile
 * @description Creates a new Vinyl file object with static content.
 *              This function is a factory for consistent test file generation.
 * @returns {File} A Vinyl file instance populated with 'helloworld.js' content.
 */
function makeFile()
{
  return new File(
    {
      cwd:      __dirname,                                  // Current working directory.
      base:     path.join(__dirname, 'assets'),             // Base path for relative resolution.
      path:     path.join(__dirname, 'assets', 'helloworld.js'), // Full path of the virtual file.
      contents: new Buffer(sourceContent)                   // File content as a Node.js Buffer.
    }
  );
}


/*
 * @function makeStreamFile
 * @description Generates a Vinyl file object where the contents are a ReadableStream.
 *              This is specifically used to test error handling when streams are provided.
 * @returns {File} A Vinyl file instance with stream contents.
 */
function makeStreamFile()
{
  return new File(
    {
      cwd:      __dirname,
      base:     path.join(__dirname, 'assets'),
      path:     path.join(__dirname, 'assets', 'helloworld.js'),
      contents: new ReadableStream() // Content is a stream, which should cause an error in init().
    }
  );
}


/**
 * @function makeFileWithInlineSourceMap
 * @description Creates a Vinyl file containing minified JavaScript code
 *              and an embedded (inline) base64-encoded source map.
 *              This is crucial for testing the `loadMaps` option.
 * @returns {File} A Vinyl file with inline source map.
 */
function makeFileWithInlineSourceMap()
{
  return new File(
    {
      cwd:      __dirname,
      base:     path.join(__dirname, 'assets'),
      path:     path.join(__dirname, 'assets', 'all.js'),
      contents: new Buffer('console.log("line 1.1"),console.log("line 1.2"),console.log("line 2.1"),console.log("line 2.2");\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxsLmpzIiwic291cmNlcyI6WyJ0ZXN0MS5qcyIsInRlc3QyLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBQSxRQUFBQyxJQUFBLFlBQ0FELFFBQUFDLElBQUEsWUNEQUQsUUFBQUMsSUFBQSxZQUNBRCxRQUFBQyxJQUFBIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ2xpbmUgMS4xJyk7XG5jb25zb2xlLmxvZygnbGluZSAxLjInKTtcbiIsImNvbnNvbGUubG9nKCdsaW5lIDIuMScpO1xuY29uc29sZS5sb2coJ2xpbmUgMi4yJyk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9')
    }
  );
}


// --- Test Suite for sourcemaps.init() function ---

// Test case: Verifies that the 'init' function correctly handles a null file.
// It should pass the file through without modification or adding a source map.
test(
  'init: should pass through when file is null',
  function(t)
  {
    var file     = new File();          // Create an empty Vinyl file object.
    var pipeline = sourcemaps.init();   // Initialize the sourcemaps plugin pipeline.

    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data, 'should pass something through');                       // Assert that data is received.
          t.ok(data instanceof File, 'should pass a vinyl file through');    // Assert the data is a Vinyl file.
          t.ok(!data.sourceMap, 'should not add a source map object');       // No source map should be added to a null file.
          t.deepEqual(data, file, 'should not change file');                 // The file object should be identical.
          t.end();                                                           // Mark the end of this test.
        }
      )
      .on(
        'error',
        function()
        {
          t.fail('emitted error'); // This test should NOT emit an error.
          t.end();                 // End the test prematurely if an error occurs.
        }
      )
      .write(file); // Push the null file into the pipeline.
  }
);


// Test case: Ensures that the 'init' function emits an error when processing a file
// whose contents are provided as a stream, as streams are not supported for initial map generation.
test(
  'init: should emit an error if file content is a stream',
  function(t)
  {
    var pipeline = sourcemaps.init(); // Initialize the sourcemaps plugin.
    pipeline
      .on(
        'data',
        function(data)
        {
          t.fail('should emit an error'); // Receiving data here means the error was NOT emitted.
          t.end();
        }
      )
      .on(
        'error',
        function()
        {
          t.ok('should emit an error'); // Assert that an error event was indeed emitted.
          t.end();
        }
      )
      .write(makeStreamFile()); // Push a file with stream contents into the pipeline.
  }
);


/*
 * This test verifies that `sourcemaps.init()` correctly adds a new,
 * valid source map object to a file that does not already have one.
 * It checks for key properties like version, sources, sourcesContent, and mappings.
 */
test(
  'init: should add a valid source map',
  function(t)
  {
    var pipeline = sourcemaps.init(); // Create the sourcemaps pipeline.
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data, 'should pass something through');                               // Data should be present.
          t.ok(data instanceof File, 'should pass a vinyl file through');            // Data should be a Vinyl file.
          t.ok(data.sourceMap, 'should add a source map object');                    // A source map object must exist.
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');     // Source map version should be 3.
          t.equal(data.sourceMap.sources[0], 'helloworld.js', 'should add file to sources'); // File name in sources.
          t.equal(data.sourceMap.sourcesContent[0], sourceContent, 'should add file content to sourcesContent'); // Original content in sourcesContent.
          t.equal(data.sourceMap.mappings, '', 'should add empty mappings');         // Mappings should be empty initially.
          t.end();
        }
      )
      .on(
        'error',
        function()
        {
          t.fail('emitted error'); // No error is expected for this test.
          t.end();
        }
      )
      .write(makeFile()); // Provide a standard file for processing.
  }
);


// Test case: Checks if `init` can correctly parse and import an existing inline source map
// from a file, extracting its properties like sources, sourcesContent, and mappings.
test(
  'init: should import an existing inline source map',
  function(t)
  {
    var pipeline = sourcemaps.init( { loadMaps: true } ); // Initialize with 'loadMaps' option enabled.
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data, 'should pass something through');
          t.ok(data instanceof File, 'should pass a vinyl file through');
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['test1.js', 'test2.js'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, ['console.log(\'line 1.1\');\nconsole.log(\'line 1.2\');\n', 'console.log(\'line 2.1\');\nconsole.log(\'line 2.2\');'], 'should have right sourcesContent');
          t.equal(data.sourceMap.mappings, 'AAAAA,QAAAC,IAAA,YACAD,QAAAC,IAAA,YCDAD,QAAAC,IAAA,YACAD,QAAAC,IAAA', 'should have right mappings');
          t.end();
        }
      )
      .on(
        'error',
        function()
        {
          t.fail('emitted error');
          t.end();
        }
      )
      .write(makeFileWithInlineSourceMap()); // Process a file containing an inline source map.
  }
);


/**
 * Test to confirm that after an inline sourcemap is loaded,
 * its corresponding `sourceMappingURL` comment is removed from the file's contents.
 */
test(
  'init: should remove inline sourcemap',
  function(t)
  {
    var pipeline = sourcemaps.init( { loadMaps: true } ); // Enable loading of maps.
    pipeline
      .on(
        'data',
        function(data)
        {
          // Assert that the 'sourceMappingURL' string is no longer present in the file content.
          t.notOk( /sourceMappingURL/.test( data.contents.toString() ), 'should not have sourcemapping' );
          t.end();
        }
      )
      .write(makeFileWithInlineSourceMap()); // Process file with an inline source map.
  }
);


// Test case: Verifies the ability of `init` to load an external source map file
// when it's referenced by a specific `//# sourceMappingURL` comment syntax.
test(
  'init: should load external source map file referenced in comment with the \/\/# syntax',
  function(t)
  {
    var file = makeFile(); // Create a base file.
    // Add a source map comment referencing an external map file.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld2.js.map' );

    var pipeline = sourcemaps.init( { loadMaps: true } ); // Initialize with 'loadMaps' enabled.
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['helloworld2.js'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, ['source content from source map'], 'should have right sourcesContent');
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.end();
        }
      )
      .write(file); // Push the file with external map reference.
  }
);


/*
 * This test confirms that the `init` function successfully removes
 * the `//# sourceMappingURL` comment from the file's contents
 * once the external source map has been loaded.
 */
test(
  'init: should remove source map comment with the \/\/# syntax',
  function(t)
  {
    var file = makeFile();
    // Append the source map comment to the file content.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld2.js.map' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          // Check that the sourceMappingURL comment is no longer present in the content.
          t.notOk( /sourceMappingURL/.test( data.contents.toString() ), 'should not have sourcemapping' );
          t.end();
        }
      )
      .write(file);
  }
);


// Test case: Confirms that `init` can also load external source maps
// when they are referenced using the `/*# sourceMappingURL */` block comment syntax.
test(
  'init: should load external source map file referenced in comment with the \/*# *\/ syntax',
  function(t)
  {
    var file = makeFile();
    // Add a block-style source map comment.
    file.contents = new Buffer( sourceContent + '\n/*# sourceMappingURL=helloworld2.js.map */' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['helloworld2.js'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, ['source content from source map'], 'should have right sourcesContent');
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.end();
        }
      )
      .write(file);
  }
);


/**
 * Ensures that the `/*# sourceMappingURL *\/` comment is removed
 * from the file's contents after its corresponding external source map has been loaded.
 */
test(
  'init: should remove source map comment with the \/\/# syntax',
  function(t)
  {
    var file = makeFile();
    // Use the block comment syntax for source map reference.
    file.contents = new Buffer( sourceContent + '\n/*# sourceMappingURL=helloworld2.js.map */' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.notOk( /sourceMappingURL/.test( data.contents.toString() ), 'should not have sourcemapping' );
          t.end();
        }
      )
      .write(file);
  }
);


// Test case: Verifies that `init` can automatically discover and load an external source map
// if no explicit `sourceMappingURL` comment is present in the file, by looking for a `.map` file.
test(
  'init: should load external source map if no source mapping comment',
  function(t)
  {
    var file = makeFile();
    // Change the file path to match a known external source map file (helloworld2.js.map).
    file.path = file.path.replace('helloworld.js', 'helloworld2.js');

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['helloworld2.js'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, ['source content from source map'], 'should have right sourcesContent');
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.end();
        }
      )
      .write(file);
  }
);


/*
 * This test ensures that `init` can load an external source map
 * and, if the source map is missing `sourcesContent` for some sources,
 * it attempts to read that content from the file system.
 */
test(
  'init: should load external source map and add sourceContent if missing',
  function(t)
  {
    var file = makeFile();
    // Reference a source map that is known to have missing sourcesContent.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld3.js.map' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['helloworld.js', 'test1.js'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, [file.contents.toString(), 'test1\n'], 'should have right sourcesContent'); // Expected content includes loaded content.
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.end();
        }
      )
      .write(file);
  }
);


// Test case: Confirms that `init` does not throw an error when a source file
// referenced in a source map (for `sourcesContent`) cannot be found.
// Instead, it should gracefully set `sourceContent` for that file to `null`.
test(
  'init: should not throw when source file for sourceContent not found',
  function(t)
  {
    var file = makeFile();
    // Reference a source map that includes a non-existent source file.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld4.js.map' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['helloworld.js', 'missingfile'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, [file.contents.toString(), null], 'should have right sourcesContent'); // 'null' for the missing file.
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.end();
        }
      )
      .write(file);
  }
);


// Test case: Verifies that the paths generated within the sourcemap
// (e.g., `file` and `sources`) consistently use Unix-style path separators.
test(
  'init: should use unix style paths in sourcemap',
  function(t)
  {
    var file = makeFile();
    file.base = file.cwd; // Set base to cwd to ensure relative paths are generated correctly.

    var pipeline = sourcemaps.init();
    pipeline
      .on(
        'data',
        function(data)
        {
          t.equal(data.sourceMap.file, 'assets/helloworld.js', 'should have right file');
          t.deepEqual(data.sourceMap.sources, ['assets/helloworld.js'], 'should have right sources');
          t.end();
        }
      )
      .write(file);
  }
);


/*
 * This test confirms that `init` respects and correctly utilizes
 * the `sourceRoot` property specified within an external source map
 * when resolving the paths of its individual sources.
 */
test(
  'init: should use sourceRoot when resolving path to sources',
  function(t)
  {
    var file = makeFile();
    // Reference a source map that explicitly defines a 'sourceRoot'.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld5.js.map' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['../helloworld.js', '../test1.js'], 'should have right sources'); // Paths should be resolved relative to sourceRoot.
          t.deepEqual(data.sourceMap.sourcesContent, [file.contents.toString(), 'test1\n'], 'should have right sourcesContent');
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.equal(data.sourceMap.sourceRoot, 'test', 'should have right sourceRoot'); // Verify the sourceRoot value.
          t.end();
        }
      )
      .write(file);
  }
);


// Test case: Verifies that `init` does NOT attempt to load `sourceContent`
// for sources whose paths are identified as URLs, instead setting them to `null`.
test(
  'init: should not load source content if the path is a url',
  function(t)
  {
    var file = makeFile();
    // Reference a source map that contains a source path as a URL.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld6.js.map' );

    var pipeline = sourcemaps.init( { loadMaps: true } );
    pipeline
      .on(
        'data',
        function(data)
        {
          t.ok(data.sourceMap, 'should add a source map object');
          t.equal(String(data.sourceMap.version), '3', 'should have version 3');
          t.deepEqual(data.sourceMap.sources, ['helloworld.js', 'http://example2.com/test1.js'], 'should have right sources');
          t.deepEqual(data.sourceMap.sourcesContent, [null, null]); // Source content for URLs should be null.
          t.equal(data.sourceMap.mappings, '', 'should have right mappings');
          t.end();
        }
      )
      .write(file);
  }
);


/*
 * This final test case checks the debug output of `init`.
 * When `debug` is true and `sourceContent` for a source file is missing,
 * the plugin should log appropriate warning and informational messages.
 */
test(
  'init: should output an error message if debug option is set and sourceContent is missing',
  function(t)
  {
    var file = makeFile();
    // Use a source map that references a missing source file to trigger the warning.
    file.contents = new Buffer( sourceContent + '\n//# sourceMappingURL=helloworld4.js.map' );

    var hConsole = recordConsole(); // Start recording console output.
    var pipeline = sourcemaps.init( { loadMaps: true, debug: true } ); // Initialize with both 'loadMaps' and 'debug' enabled.
    pipeline
      .on(
        'data',
        function(data)
        {
          hConsole.restore(); // Restore the original console functions.
          // Check the logged message for missing source content.
          t.equal(hConsole.history.log[0], 'gulp-sourcemap-init: No source content for "missingfile". Loading from file.', 'should log missing source content');
          // Check the warning message for the file not found.
          t.ok(hConsole.history.warn[0].indexOf('gulp-sourcemap-init: source file not found: ') === 0, 'should warn about missing file');
          t.end();
        }
      )
      .write(file);
  }
);
// End of the test suite.