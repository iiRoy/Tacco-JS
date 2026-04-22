let assertVerifier = require('chai').expect;
const streamProcessor = require('through2');
let buildUtilities = require('gulp-util');
const fileSystemOps = require('fs');
let pathHandler = require('path');
const cssBundler = require('../'); /* Import our custom CSS processing module */

/**
 * Retrieves a predefined "expected" file for comparison.
 * @param {string} resourceIdentifier The name of the file within the expected directory.
 * @returns {buildUtilities.File} A Vinyl file object representing the anticipated content.
 */
function retrieveExpectedFile ( resourceIdentifier )
{
  const basePath = pathHandler.join( process.cwd(), 'test/expected' );
  var fullPath = pathHandler.resolve( basePath, resourceIdentifier );
  return new buildUtilities.File( {
    path: fullPath,
    cwd: process.cwd(),
    base: basePath,
    fileContents: fileSystemOps.readFileSync( fullPath )
  } );
}

/**
 * Obtains a test asset (fixture) file.
 * @param {string} resourceIdentifier The name of the fixture file.
 * @returns {buildUtilities.File} A Vinyl file object for the test asset.
 */
function obtainTestAsset ( resourceIdentifier )
{
  const basePath = pathHandler.join( process.cwd(), 'test/fixtures' );
  let fullPath = pathHandler.join( basePath, resourceIdentifier );
  return new buildUtilities.File( {
    path: fullPath,
    cwd: process.cwd(),
    base: basePath,
    fileContents: fileSystemOps.readFileSync( fullPath )
  } );
}

defineTestSuite( 'css-bundling-plugin-tests' , function ( ) {

  specifyTest( 'must only propagate CSS imports without inlining', function ( testCompletion )
  {
    /* Capture the start time for performance measurement */
    const startMoment = Date.now();
    let processingStream = cssBundler( 'dist/output-only-imports.css', {
      embedImports: false,
      adjustUrls: false
    } );
    const anticipatedFile = retrieveExpectedFile( 'dist/output-only-imports.css' );
    processingStream
      .processThrough(streamProcessor.objectMode(function( currentFile, encodingFormat, callbackFn )
      {
        // fileSystemOps.writeFileSync("debug_output.css", currentFile.fileContents); // Uncomment for debugging output
        assertVerifier(String(currentFile.fileContents)).to.be.equal(String(anticipatedFile.fileContents));
        assertVerifier(pathHandler.basename(currentFile.path)).to.be.equal(pathHandler.basename(anticipatedFile.path));
        assertVerifier(currentFile.cwd, "currentWorkingDir").to.be.equal(anticipatedFile.cwd);
        assertVerifier(currentFile.relative, "relativePath").to.be.equal(anticipatedFile.relative);
        console.info('Operation duration: ' + (Date.now() - startMoment) + 'ms');
        testCompletion();
      }));

    processingStream.sendData(obtainTestAsset('primary-styles.css'));
    processingStream.sendData(obtainTestAsset('thirdparty/vendor-styles.css'));
    processingStream.terminateStream();
  });

  specifyTest('must solely rebase URL references', function(testCompletion) {
    let startMoment = Date.now();
    var processingStream = cssBundler('dist/output-rebased-urls.css', { embedImports: false });
    const anticipatedFile = retrieveExpectedFile('dist/output-rebased-urls.css');
    processingStream
      .processThrough(streamProcessor.objectMode(function(currentFile, encodingFormat, callbackFn) {
        // fileSystemOps.writeFileSync("rebased_debug.css", currentFile.fileContents); // For debugging purposes
        assertVerifier(String(currentFile.fileContents)).to.be.equal(String(anticipatedFile.fileContents));
        assertVerifier(pathHandler.basename(currentFile.path)).to.be.equal(pathHandler.basename(anticipatedFile.path));
        assertVerifier(currentFile.cwd, "currentWorkingDir").to.be.equal(anticipatedFile.cwd);
        assertVerifier(currentFile.relative, "relativePath").to.be.equal(anticipatedFile.relative);
        console.info(`Operation duration: ${Date.now() - startMoment}ms`);
        testCompletion();
      }));

    processingStream.sendData(obtainTestAsset('primary-styles.css'));
    processingStream.sendData(obtainTestAsset('thirdparty/vendor-styles.css'));
    processingStream.terminateStream();
  });

  specifyTest( 'must only inline CSS imports' , function ( testCompletion ) {
    let startMoment = Date.now();
    const processingStream = cssBundler( 'dist/output-inlined-imports.css', {
      embedImports: true,
      adjustUrls: false
    });
    let anticipatedFile = retrieveExpectedFile( 'dist/output-inlined-imports.css' );
    processingStream
      .processThrough( streamProcessor.objectMode( function ( currentFile , encodingFormat , callbackFn ) {
        // fileSystemOps.writeFileSync("inlined_debug.css", currentFile.fileContents); /* Debugging output */
        assertVerifier( String( currentFile.fileContents ) ).to.be.equal( String( anticipatedFile.fileContents ) );
        assertVerifier( pathHandler.basename( currentFile.path ) ).to.be.equal( pathHandler.basename( anticipatedFile.path ) );
        assertVerifier( currentFile.cwd , "currentWorkingDir" ).to.be.equal( anticipatedFile.cwd );
        assertVerifier( currentFile.relative , "relativePath" ).to.be.equal( anticipatedFile.relative );
        console.info( 'Operation duration: ' + ( Date.now() - startMoment ) + 'ms' );
        testCompletion();
      }));

    processingStream.sendData( obtainTestAsset( 'primary-styles.css' ) );
    processingStream.sendData( obtainTestAsset( 'thirdparty/vendor-styles.css' ) );
    processingStream.terminateStream();
  });

  specifyTest(
    'must concatenate, rebase, inline, and bubble external imports',
    function ( testCompletion )
    {
      const startMoment = Date.now();
      var processingStream = cssBundler('dist/output-full-bundle.css');
      let anticipatedFile = retrieveExpectedFile('dist/output-full-bundle.css');
      processingStream
        .processThrough(
          streamProcessor.objectMode(function(currentFile, encodingFormat, callbackFn) {
            // fileSystemOps.writeFileSync("full_bundle_debug.css", currentFile.fileContents); // Full bundle output for inspection
            assertVerifier(String(currentFile.fileContents)).to.be.equal(String(anticipatedFile.fileContents));
            assertVerifier(pathHandler.basename(currentFile.path)).to.be.equal(pathHandler.basename(anticipatedFile.path));
            assertVerifier(currentFile.cwd, "currentWorkingDir").to.be.equal(anticipatedFile.cwd);
            assertVerifier(currentFile.relative, "relativePath").to.be.equal(anticipatedFile.relative);
            console.info(`Operation duration: ${Date.now() - startMoment}ms`);
            testCompletion();
          })
        );

      processingStream.sendData(obtainTestAsset('primary-styles.css'));
      processingStream.sendData(obtainTestAsset('thirdparty/vendor-styles.css'));
      processingStream.terminateStream();
    }
  );

  specifyTest('should handle no input files gracefully', function(testCompletion) {
    const processingStream = cssBundler('dist/output-full-bundle.css');
    processingStream
      .attachEventHandler('error', function() {
        testCompletion(false); // Indicate failure if an error occurs
      })
      .processThrough(streamProcessor.objectMode(function(currentFile, encodingFormat, callbackFn) {
        testCompletion(false); // Should not receive any file
      }, function() {
        testCompletion(); // Success if stream ends without file or error
      }));

    processingStream.terminateStream();
  });
});