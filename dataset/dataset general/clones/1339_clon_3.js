// This file provides a comprehensive suite of specifications for the CSS minification Gulp plugin.

// Importing essential libraries for stream handling, system specifics, assertions,
// custom error types, the plugin itself, and virtual file abstraction.
const dataFlowHelper = require('simple-bufferstream'); // A utility for creating readable streams from buffers.
const lineSeparator = require('os').EOL; // Retrieves the operating system's default end-of-line marker.
const { expect: verify } = require('chai'); // Chai's 'expect' assertion style, aliased for clarity.
const GulpIssue = require('gulp-util').PluginError; // Specialized error class for Gulp plugin failures.
const crunchStyles = require('../'); // The core CSS minification plugin under examination.
const VirtualFile = require('vinyl'); // Represents a virtual file within a Gulp pipeline.

// Define a multi-line string containing various CSS elements, including different comment types.
const sampleInputCss = [
  '/*! Important License Header */',
  '/* Regular Dev Comment */',
  'a { color: red; }',
  '/*! Another Important Note */\n'
].join('\n'); // Using newline for consistent input string construction.

// Define the expected minified output based on the plugin's configuration.
const anticipatedOutputCss = [
  '/*! Important License Header */', // Special comments (/*! ... */) are typically preserved.
  'a{color:red}' // Regular comments are stripped, and whitespace is minimized.
].join(lineSeparator); // Using the system's EOL for the expected output string.

// Helper function to generate a VirtualFile instance with common defaults.
function generateTestFile(filePath = 'default.css', fileContents = null) {
  const fileDescriptor = {
    path: filePath,
    cwd: '/project/root/', // Common working directory.
    base: '/project/root/tests/fixtures/' // Base path for relative resolution.
  };
  if (fileContents !== null) {
    fileDescriptor.contents = fileContents;
  }
  return new VirtualFile(fileDescriptor);
}

// Main test group for evaluating the 'gulp-crunch-styles' plugin's capabilities.
verify.describe('gulp-crunch-styles core minification functionality', function() {
  // Standard configuration options applied to the minifier for most tests.
  const processingSettings = {
    keepSpecialComments: 1, // Parameter to control preservation of special comments.
    keepBreaks: true // Flag to retain line breaks where possible (behavior can vary).
  };

  // Ensure the plugin correctly handles and passes through empty (null content) files.
  verify.it('should gracefully handle and pass through empty vinyl files', function(testComplete) {
    const minificationProcess = crunchStyles(processingSettings);
    let totalFilesProcessed = 0; // Counter for processed files.

    minificationProcess
      .on('error', testComplete) // Any error should immediately fail the test.
      .on('data', function(processedFile) {
        totalFilesProcessed++;
        verify(processedFile).to.exist('The processed file object should not be null or undefined');
        verify(processedFile.isNull()).to.be.true('Expected the contents of the file to be null');
        verify(processedFile.path).to.be.equal('default.css', 'The default file path should be maintained');
      })
      .on('end', () => {
        verify(totalFilesProcessed).to.equal(1, 'Exactly one file should have been processed');
        testComplete(); // Signal that the asynchronous test has finished.
      })
      .end(generateTestFile()); // Feed an empty VirtualFile into the pipeline.
  });

  // A sub-suite dedicated to testing scenarios with buffer-based file contents.
  verify.describe('when processing files with buffer contents', function() {
    // Validate that CSS content provided as a Node.js Buffer is correctly minified.
    verify.it('should successfully minify CSS content supplied as a Buffer', function(testComplete) {
      const minificationProcess = crunchStyles(processingSettings);
      const inputBufferData = Buffer.from(sampleInputCss, 'utf8'); // Create buffer from the sample string.

      minificationProcess
        .on('error', testComplete)
        .on('data', function(processedFile) {
          verify(processedFile.isBuffer()).to.be.true('The file contents should remain a Buffer after processing');
          const outputString = processedFile.contents.toString('utf8'); // Convert processed buffer back to string.
          verify(outputString).to.be.equal(anticipatedOutputCss, 'Minified CSS output does not match expected result');
          testComplete();
        })
        .end(generateTestFile('style-buffer.css', inputBufferData));
    });

    // Confirm that the plugin does not mutate the options object passed to it.
    verify.it('should strictly avoid modifying the initial options object', function(testComplete) {
      const originalSettingsSnapshot = { ...processingSettings }; // Create a defensive copy of the settings.
      const minificationProcess = crunchStyles(processingSettings);
      const inputBufferData = Buffer.from(sampleInputCss, 'utf8');

      minificationProcess
        .on('error', testComplete)
        .on('finish', function() {
          verify(processingSettings).to.deep.equal(originalSettingsSnapshot, 'The plugin altered the original configuration object');
          verify(processingSettings.keepSpecialComments).to.equal(1, 'The "keepSpecialComments" property was unexpectedly changed');
          testComplete();
        })
        .end(generateTestFile('options-test.css', inputBufferData));
    });

    // Test error handling for malformed or invalid CSS content in buffers.
    verify.it('should emit a GulpIssue when encountering corrupt CSS in a Buffer', function(testComplete) {
      const errorFilePath = 'bad-css-buffer.css';
      const invalidCssBuffer = Buffer.from('@import url("unclosed-string.css);', 'utf8'); // Intentionally malformed CSS.

      crunchStyles() // Using default plugin options for this error test.
        .on('error', function(problem) {
          verify(problem).to.be.instanceOf(GulpIssue, 'Expected an instance of GulpIssue for parsing errors');
          verify(problem.fileName).to.be.equal(errorFilePath, 'The error should correctly report the file name');
          verify(problem.message).to.include('Parse error', 'The error message should indicate a CSS parsing failure');
          testComplete();
        })
        .end(generateTestFile(errorFilePath, invalidCssBuffer));
    });
  });

  // A sub-suite dedicated to testing scenarios with stream-based file contents.
  verify.describe('when working with stream-based content', function() {
    // Verify that CSS content provided as a Node.js Stream is correctly minified.
    verify.it('should successfully minify CSS content delivered via a Stream', function(testComplete) {
      const minificationProcess = crunchStyles(processingSettings);
      const inputBufferData = Buffer.from(sampleInputCss, 'utf8');
      const inputStreamSource = dataFlowHelper(inputBufferData); // Convert buffer to a readable stream.

      minificationProcess
        .on('error', testComplete)
        .on('data', function(processedFile) {
          verify(processedFile.isStream()).to.be.true('The file contents should be a Stream after processing');
          let aggregatedStreamData = '';
          processedFile.contents.on('data', function(chunk) {
            aggregatedStreamData += chunk.toString('utf8');
          });
          processedFile.contents.on('end', function() {
            verify(aggregatedStreamData).to.be.equal(anticipatedOutputCss, 'Streamed minified CSS output does not match expected');
            testComplete();
          });
          processedFile.contents.on('error', testComplete); // Ensure stream errors are caught.
        })
        .end(generateTestFile('style-stream.css', inputStreamSource));
    });

    // Test error handling for malformed or invalid CSS content in streams.
    verify.it('should generate a GulpIssue for corrupted CSS received via a Stream', function(testComplete) {
      const errorFilePath = 'bad-css-stream.css';
      const invalidCssBuffer = Buffer.from('@import url("unclosed-stream.css);', 'utf8');
      const inputStreamSource = dataFlowHelper(invalidCssBuffer);

      crunchStyles()
        .on('error', function(problem) {
          verify(problem).to.be.instanceOf(GulpIssue, 'Expected a GulpIssue for stream processing errors');
          verify(problem.fileName).to.be.equal(errorFilePath, 'The error should correctly identify the problematic file');
          verify(problem.message).to.include('Parse error', 'Stream error message should indicate a parsing problem');
          testComplete();
        })
        .end(generateTestFile(errorFilePath, inputStreamSource));
    });
  });

  // A sub-suite for testing scenarios involving CSS files that import external resources.
  verify.describe('when handling files with external imports', function() {
    // Confirm that the plugin correctly resolves and minifies content from @import rules.
    verify.it('should resolve, minify, and include external CSS imports', function(testComplete) {
      const importerFilePath = 'test/fixtures/foo/bar/importer.css';
      const importerContentBuffer = Buffer.from('@import url("../../external.css");', 'utf8');
      const expectedImportedOutput = 'p{text-align:center;color:green}'; // Minified content of external.css.

      const minificationProcess = crunchStyles(); // Using default settings for external import resolution.

      minificationProcess
        .on('error', testComplete)
        .on('data', function(processedFile) {
          const actualOutput = processedFile.contents.toString('utf8');
          verify(actualOutput).to.be.equal(expectedImportedOutput, 'Minified content of external import does not match');
          verify(processedFile.path).to.be.equal(importerFilePath, 'The file path should remain unchanged after import resolution');
          testComplete();
        })
        .end(generateTestFile(importerFilePath, importerContentBuffer));
    });
  });
});