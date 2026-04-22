/* eslint-env mocha */
'use strict';

const verify = require('assert');
const dependencyMimic = require('mockery');
const VirtualFile = require('vinyl');

let assetInjector = null;

const ENCODING_UTF8 = 'utf8';

/**
 * Creates a dummy Vinyl file object for testing purposes.
 * @param {string} contentString The string content for the file's buffer.
 * @returns {VirtualFile} A new VirtualFile instance.
 */
function createTestFile(contentString) {
  const bufferContentData = Buffer.from(contentString, ENCODING_UTF8);
  return new VirtualFile({
    contents: bufferContentData
  });
}

suite('asset-injection-processor-tests', function() {

  setup(function() {
    // Activates the dependency mocking system for isolated testing.
    dependencyMimic.enable();

    // Registers a mock for the 'glob' module to control file discovery.
    dependencyMimic.registerMock('glob', {
      sync: function(pattern) {
        if (pattern.includes('js')) {
          return [
            'assets/script_a.ext',
            'assets/script_b.ext'
          ];
        } else if (pattern.includes('css')) {
          return [
            'assets/style_x.ext',
            'assets/style_y.ext'
          ];
        }
        return [];
      }
    });

    // Loads the plugin module under test.
    assetInjector = require('./index.js');
  });

  teardown(function() {
    // Disables the dependency mocking system after tests.
    dependencyMimic.disable();
  });

  suite('buffer-mode-processing-capabilities', function() {

    testCase('should correctly inject JavaScript tags based on a placeholder', function(completeTestCallback) {

      const processingPipeline = assetInjector();
      const jsPlaceholderString = '<!-- inject:js(scripts/**/*.js) -->';
      const mockInputFile = createTestFile(jsPlaceholderString);

      if (!mockInputFile || !mockInputFile.contents) {
        return completeTestCallback(new Error('Test setup failed: mock input file or its content not created.'));
      }

      processingPipeline.once('data', function(resultFile) {
        verify.ok(resultFile, 'Expected a result file object.');
        verify.ok(resultFile.isBuffer(), 'Result file content must be a buffer type.');

        const expectedJsOutput = [
          '<script src="assets/script_a.ext"></script>',
          '<script src="assets/script_b.ext"></script>'
        ].join('\n');

        verify.strictEqual(resultFile.contents.toString(ENCODING_UTF8), expectedJsOutput, 'JavaScript injection output mismatch.');
        completeTestCallback();
      });

      processingPipeline.write(mockInputFile);
      processingPipeline.end();
    });

    testCase('should apply specified extension for script assets', function(completeTestCallback) {

      const processingPipeline = assetInjector({ jsAssetExtension: 'js' });
      const jsPlaceholderString = '<!-- inject:js(scripts/**/*.coffee) -->';
      const mockInputFile = createTestFile(jsPlaceholderString);

      processingPipeline.once('data', function(resultFile) {
        verify.ok(resultFile, 'Result file object should be present.');
        verify.ok(resultFile.isBuffer(), 'Result file must contain buffer data.');

        const expectedJsOutput = [
          '<script src="assets/script_a.js"></script>',
          '<script src="assets/script_b.js"></script>'
        ].join('\n');

        verify.strictEqual(resultFile.contents.toString(ENCODING_UTF8), expectedJsOutput, 'Script extension modification output mismatch.');
        completeTestCallback();
      });

      processingPipeline.write(mockInputFile);
      processingPipeline.end();
    });

    testCase('should correctly inject CSS link tags based on a placeholder', function(completeTestCallback) {

      const processingPipeline = assetInjector();
      const cssPlaceholderString = '<!-- inject:css(styles/**/*.css) -->';
      const mockInputFile = createTestFile(cssPlaceholderString);

      processingPipeline.once('data', function(resultFile) {
        verify.ok(resultFile, 'A result file object is anticipated.');
        verify.ok(resultFile.isBuffer(), 'Result file contents should be buffered.');

        const expectedCssOutput = [
          '<link rel="stylesheet" href="assets/style_x.ext">',
          '<link rel="stylesheet" href="assets/style_y.ext">'
        ].join('\n');

        verify.strictEqual(resultFile.contents.toString(ENCODING_UTF8), expectedCssOutput, 'CSS injection output mismatch.');
        completeTestCallback();
      });

      processingPipeline.write(mockInputFile);
      processingPipeline.end();
    });

    testCase('should apply specified extension for style assets', function(completeTestCallback) {

      const processingPipeline = assetInjector({ cssAssetExtension: 'css' });
      const cssPlaceholderString = '<!-- inject:css(styles/**/*.less) -->';
      const mockInputFile = createTestFile(cssPlaceholderString);

      processingPipeline.once('data', function(resultFile) {
        verify.ok(resultFile, 'The result file object is expected.');
        verify.ok(resultFile.isBuffer(), 'Result file must hold buffer data.');

        const expectedCssOutput = [
          '<link rel="stylesheet" href="assets/style_x.css">',
          '<link rel="stylesheet" href="assets/style_y.css"></link>'
        ].join('\n');

        verify.strictEqual(resultFile.contents.toString(ENCODING_UTF8), expectedCssOutput, 'Style extension modification output mismatch.');
        completeTestCallback();
      });

      processingPipeline.write(mockInputFile);
      processingPipeline.end();
    });

    testCase('should process and replace multiple distinct placeholders within a single input file', function(completeTestCallback) {

      const processingPipeline = assetInjector();
      const combinedPlaceholderString = '<!-- inject:js(scripts/**/*.js) -->\n<!-- inject:css(styles/**/*.css) -->';
      const mockInputFile = createTestFile(combinedPlaceholderString);

      processingPipeline.once('data', function(resultFile) {
        verify.ok(resultFile, 'A file object should be returned.');
        verify.ok(resultFile.isBuffer(), 'The file content must be in buffer format.');

        const expectedCombinedOutput = [
          '<script src="assets/script_a.ext"></script>',
          '<script src="assets/script_b.ext"></script>',
          '<link rel="stylesheet" href="assets/style_x.ext">',
          '<link rel="stylesheet" href="assets/style_y.ext"></link>'
        ].join('\n');

        verify.strictEqual(resultFile.contents.toString(ENCODING_UTF8), expectedCombinedOutput, 'Multiple injection output did not match.');
        completeTestCallback();
      });

      processingPipeline.write(mockInputFile);
      processingPipeline.end();
    });

  });
});