'use strict';

var fileSystemModule       = require( 'fs' );
var pathOperations         = require( 'path' );
var gruntCompatibilityLayer = require( 'grunt' );
var PerformanceMonitorCore = require( '../../index' );
var PromiseLibrary         = require( 'bluebird' );
var utilityLibrary         = require( 'lodash' );

var TEMPORARY_OUTPUT_ROOT = './temp_test_output/';


/**
 * Auxiliary routines for test setup and teardown.
 */

/**
 * Recursively removes a directory and its contents.
 * This is a common utility for cleaning up test artifacts.
 *
 * @param  {String} targetPath absolute or relative path to the directory
 */
function purgeDirectoryRecursive ( targetPath ) {
  var directoryItems = [];
  if ( fileSystemModule.existsSync( targetPath ) ) {
    directoryItems = fileSystemModule.readdirSync( targetPath );
    for ( let item of directoryItems ) { // Changed to for...of for modern JS
      var currentItemPath = pathOperations.join( targetPath, item ); // Use path.join
      if ( fileSystemModule.statSync( currentItemPath ).isDirectory() ) {
          purgeDirectoryRecursive( currentItemPath );
      } else {
          fileSystemModule.unlinkSync( currentItemPath );
      }
    }
    fileSystemModule.rmdirSync( targetPath );
  }
}


/**
 * Creates a function returning a stubbed Promise for testing asynchronous operations.
 * This helps in verifying if specific methods were invoked during a test run.
 *
 * @param  {Object}  testContext     The QUnit test context object.
 * @param  {String}  functionIdentifier     A descriptive name for the function being stubbed.
 *
 * @return {Function}         A function that, when called, returns a resolved Promise
 *                            and asserts its own invocation.
 */
function createAsyncMethodStub( testContext, functionIdentifier ){
  return function() {
    return new PromiseLibrary( function( resolver ) {
      // Small delay to simulate async nature, though not strictly necessary for this test.
      setTimeout(() => {
        testContext.ok( true, `Method '${functionIdentifier}' was successfully invoked!` );
        resolver();
      }, 5);
    } );
  };
}


/**
 * Comprehensive test suite for verifying the correct flow of Promises
 * within the PerformanceMonitorCore module's asynchronous operations.
 *
 * @type {Object}
 */
exports.asyncOperationFlowTests = {
  setUp : function( completionCallback ){
    // Preserve original methods to allow restoration after each test.
    this.originalMethodStubs = {
      uiStyleCopy                      : PerformanceMonitorCore.prototype.copyStyles,
      scriptAssetCopy                  : PerformanceMonitorCore.prototype.copyScripts,
      mainOutputDirectoryCreation      : PerformanceMonitorCore.prototype.createIndexDirectory,
      dataStorageDirectoryCreation     : PerformanceMonitorCore.prototype.createDataDirectory,
      coreExecution                    : PerformanceMonitorCore.prototype.executePhantomas,
      resultProcessing                 : PerformanceMonitorCore.prototype.formResult,
      outputDataWriting                : PerformanceMonitorCore.prototype.writeData,
      dataAnalysis                     : PerformanceMonitorCore.prototype.processData,
      metricFileReading                : PerformanceMonitorCore.prototype.readMetricsFiles,
      userInterfaceOutput              : PerformanceMonitorCore.prototype.outputUi,
      htmlIndexGeneration              : PerformanceMonitorCore.prototype.createIndexHtml,
      metricDisplayNotification        : PerformanceMonitorCore.prototype.notifyAboutNotDisplayedMetrics,
      staticAssetCopy                  : PerformanceMonitorCore.prototype.copyAssets,
      finalSuccessMessageDisplay       : PerformanceMonitorCore.prototype.showSuccessMessage
    };

    completionCallback(); // Signal that setup is complete.
  },

  tearDown : function ( cleanupCallback ) {
    // Revert all stubbed methods to their original implementations.
    utilityLibrary.each( this.originalMethodStubs, function( originalFunction, methodName ) {
      PerformanceMonitorCore.prototype[ methodName ] = originalFunction;
    } );

    // Ensure the temporary directory is cleaned up after each test.
    purgeDirectoryRecursive( TEMPORARY_OUTPUT_ROOT );

    cleanupCallback(); // Indicate that teardown is complete.
  },


  staticAssetManagement : {
    outputFolderExists : function( testCase ) {
      var configOptions     = {
        enableUserInterface   : true,
        outputRootPath : TEMPORARY_OUTPUT_ROOT
      };
      var completionHandler = function() {}; // Dummy completion handler

      var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      // Ensure the temporary directory structure exists before the test.
      fileSystemModule.mkdirSync( TEMPORARY_OUTPUT_ROOT );
      fileSystemModule.mkdirSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public' ) );

      // Stub key methods to verify their invocation.
      PerformanceMonitorCore.prototype.scriptAssetCopy = createAsyncMethodStub( testCase, 'scriptAssetCopy' );
      PerformanceMonitorCore.prototype.uiStyleCopy  = createAsyncMethodStub( testCase, 'uiStyleCopy' );

      perfMonitorInstance.copyAssets()
                .then( function() {
                  testCase.expect( 2 ); // Expect 2 assertions from the stubs.
                  testCase.done();
                } );
    },

    outputFolderDoesNotExist : function( testCase ) {
      var configOptions     = {
        enableUserInterface   : true,
        outputRootPath : TEMPORARY_OUTPUT_ROOT
      };
      var completionHandler = function() {};

      var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );
      var originalMkdirSync = fileSystemModule.mkdirSync; // Save original fs.mkdirSync

      fileSystemModule.mkdirSync( TEMPORARY_OUTPUT_ROOT ); // Create root, but not 'public'

      // Stub methods for tracking calls.
      PerformanceMonitorCore.prototype.scriptAssetCopy = createAsyncMethodStub( testCase, 'scriptAssetCopy' );
      PerformanceMonitorCore.prototype.uiStyleCopy  = createAsyncMethodStub( testCase, 'uiStyleCopy' );

      // Override fs.mkdirSync temporarily to assert its call.
      fileSystemModule.mkdirSync = function( dirPath ) {
        testCase.ok( true, `fs.mkdirSync was called for path: ${dirPath}!` );
        originalMkdirSync( dirPath ); // Call original to actually create directory
      };

      perfMonitorInstance.copyAssets()
                .then( function() {
                  testCase.expect( 3 ); // 2 from stubs, 1 from mkdirSync override.

                  fileSystemModule.mkdirSync = originalMkdirSync; // Restore original
                  testCase.done();
                } );
    }
  },


  initializationSequence : function( testCase ) {
    var configOptions     = {
      enableUserInterface   : true,
      outputRootPath : TEMPORARY_OUTPUT_ROOT
    };
    var completionHandler = function() {
      testCase.expect( 6 ); // Total assertions expected from stubs.
      testCase.done();
    };

    var mockResultsData = {
        requestMetrics : {
          values : [ 100, 200, 300, 400 ]
        },
        pageLoadTime : {
          value : 1234
        }
      };

    // Stub the result processing to return our mock data and assert its call.
    PerformanceMonitorCore.prototype.resultProcessing = function(){
      return new PromiseLibrary( function( resolver ) {
        resolver( mockResultsData );
        testCase.ok( true, 'resultProcessing method was invoked!' );
      } );
    };

    var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

    // Stub all subsequent methods in the kickoff chain.
    PerformanceMonitorCore.prototype.mainOutputDirectoryCreation = createAsyncMethodStub( testCase, 'mainOutputDirectoryCreation' );
    PerformanceMonitorCore.prototype.dataStorageDirectoryCreation  = createAsyncMethodStub( testCase, 'dataStorageDirectoryCreation' );
    PerformanceMonitorCore.prototype.coreExecution     = createAsyncMethodStub( testCase, 'coreExecution' );
    PerformanceMonitorCore.prototype.outputDataWriting            = createAsyncMethodStub( testCase, 'outputDataWriting' );
    PerformanceMonitorCore.prototype.dataAnalysis          = createAsyncMethodStub( testCase, 'dataAnalysis' );

    perfMonitorInstance.kickOff(); // Start the process.
  },


  dataProcessingModule : {
    withUserInterfaceEnabled : {
      jsonOutputNotConfigured : function( testCase ) {
        var configOptions     = {
          outputRootPath : TEMPORARY_OUTPUT_ROOT,
          enableUserInterface   : true,
          outputFormats    : [ 'csv', 'xml' ] // Missing 'json'
        };
        var completionHandler = function() {};
        var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

        // Stub methods that would be called if validation passed.
        PerformanceMonitorCore.prototype.metricFileReading = createAsyncMethodStub( testCase, 'metricFileReading' );
        PerformanceMonitorCore.prototype.userInterfaceOutput         = createAsyncMethodStub( testCase, 'userInterfaceOutput' );

        perfMonitorInstance.processData()
                  .catch( function( validationError ) {
                    testCase.strictEqual(
                      validationError,
                      'Error: UI generation requires \'json\' output format to be enabled.\n' +
                      'Please add \'json\' to the \'outputFormats\' array in your configuration, or set \'enableUserInterface\' to false.'
                    );
                    testCase.expect( 1 ); // Only the error message assertion.
                    testCase.done();
                  } );
      },
      jsonOutputIsConfigured : function( testCase ) {
        var configOptions     = {
          outputRootPath : TEMPORARY_OUTPUT_ROOT,
          enableUserInterface   : true,
          outputFormats    : [ 'json', 'csv' ] // 'json' is present.
        };
        var completionHandler = function() {};
        var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

        // Stub expected methods.
        PerformanceMonitorCore.prototype.metricFileReading = createAsyncMethodStub( testCase, 'metricFileReading' );
        PerformanceMonitorCore.prototype.userInterfaceOutput         = createAsyncMethodStub( testCase, 'userInterfaceOutput' );

        perfMonitorInstance.processData()
                  .then( function() {
                    testCase.expect( 2 ); // Both stubs should be called.
                    testCase.done();
                  } );
      },
    },
    withoutUserInterfaceEnabled : function( testCase ) {
      var configOptions     = {
        outputRootPath : TEMPORARY_OUTPUT_ROOT,
        enableUserInterface   : false, // UI explicitly disabled.
        outputFormats    : [ 'json', 'csv' ]
      };
      var completionHandler = function() {};
      var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      // Stub methods. Note: userInterfaceOutput should NOT be called.
      PerformanceMonitorCore.prototype.metricFileReading = createAsyncMethodStub( testCase, 'metricFileReading' );
      PerformanceMonitorCore.prototype.userInterfaceOutput         = createAsyncMethodStub( testCase, 'userInterfaceOutput' ); // This stub should NOT trigger its assertion.

      perfMonitorInstance.processData()
                .then( function() {
                  testCase.expect( 1 ); // Only metricFileReading should be called.
                  testCase.done();
                } );
    }
  },


  userInterfaceOutputModule : function( testCase ) {
    var configOptions     = {
      outputRootPath : TEMPORARY_OUTPUT_ROOT,
      enableUserInterface   : true
    };
    var completionHandler = function() {};
    var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

    // Stub all methods involved in UI output.
    PerformanceMonitorCore.prototype.htmlIndexGeneration                 = createAsyncMethodStub( testCase, 'htmlIndexGeneration' );
    PerformanceMonitorCore.prototype.metricDisplayNotification  = createAsyncMethodStub( testCase, 'metricDisplayNotification' );
    PerformanceMonitorCore.prototype.staticAssetCopy                      = createAsyncMethodStub( testCase, 'staticAssetCopy' );

    perfMonitorInstance.outputUi()
              .then( function() {
                testCase.expect( 3 ); // All three stubs should be called.
                testCase.done();
              } );

  }
};


/**
 * General unit test suite for the PerformanceMonitorCore constructor and basic functionalities.
 *
 * @type {Object}
 */
exports.coreModuleTests = {
  setUp : function( completionCallback ) {
    // Ensure a clean temporary directory for each test.
    fileSystemModule.mkdirSync( TEMPORARY_OUTPUT_ROOT );

    completionCallback();
  },

  tearDown : function ( cleanupCallback ) {
    purgeDirectoryRecursive( TEMPORARY_OUTPUT_ROOT );

    cleanupCallback();
  },

  constructorInitialization : function( testCase ) {
    var configOptions   = {
      outputRootPath : TEMPORARY_OUTPUT_ROOT,
      enableUserInterface   : false,
      extraOption : 'some_value' // Added an extra option
    };
    var completionHandler      = function() {};
    var perfMonitorInstance = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

    // Assertions for core properties.
    testCase.strictEqual( perfMonitorInstance.dataStoragePath,  `${TEMPORARY_OUTPUT_ROOT}data/` );
    testCase.strictEqual( perfMonitorInstance.completionCallback,      completionHandler );
    testCase.strictEqual( perfMonitorInstance.gruntRef,     gruntCompatibilityLayer );
    testCase.strictEqual( perfMonitorInstance.screenshotPath, `${TEMPORARY_OUTPUT_ROOT}images/` ); // Renamed imagePath
    testCase.deepStrictEqual( perfMonitorInstance.configuration,   configOptions ); // Use deepStrictEqual for objects
    testCase.strictEqual( perfMonitorInstance.isUiEnabled,   false ); // Renamed buildUi

    // Additional check for timestamp type and range.
    testCase.ok( typeof perfMonitorInstance.executionTimestamp ===  'number', 'Execution timestamp should be a number.' );
    testCase.ok( perfMonitorInstance.executionTimestamp > 0, 'Execution timestamp should be positive.' ); // Basic validation

    testCase.done();
  },


  scriptFileCopy : function( testCase ) {
    var configOptions     = {
      outputRootPath : TEMPORARY_OUTPUT_ROOT
    };
    var completionHandler        = function() {};
    var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

    fileSystemModule.mkdirSync( pathOperations.join(TEMPORARY_OUTPUT_ROOT, 'public') ); // Ensure target directory exists

    perfMonitorInstance.copyScripts(); // Call the method under test.

    // Verify existence of copied files.
    testCase.ok(
      fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/scripts/phantomas.min.js' ) ),
      'phantomas.min.js should exist after copying.'
    );

    testCase.ok(
      fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/scripts/d3.min.js' ) ),
      'd3.min.js should exist after copying.'
    );

    testCase.done();
  },


  styleFileCopy : {
    withoutCustomStylesheet : function( testCase ) {
      var configOptions     = {
        outputRootPath : TEMPORARY_OUTPUT_ROOT
      };
      var completionHandler        = function() {};
      var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      fileSystemModule.mkdirSync( pathOperations.join(TEMPORARY_OUTPUT_ROOT, 'public') );

      perfMonitorInstance.copyStyles();

      testCase.ok(
        fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/styles/phantomas.css' ) ),
        'phantomas.css should exist.'
      );

      testCase.ok(
        !fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/styles/custom.css' ) ),
        'custom.css should NOT exist without an additional stylesheet.'
      );

      testCase.done();
    },
    withCustomStylesheet : {
      stylesheetSourceExists : function( testCase ) {
        var customStylePath = pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'my-custom-styles.css' );
        var configOptions     = {
          userDefinedStylesheet : customStylePath, // Renamed option
          outputRootPath            : TEMPORARY_OUTPUT_ROOT
        };
        var completionHandler        = function() {};
        var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

        fileSystemModule.writeFileSync(
          customStylePath, 'body { font-size: 1.2em; }' // Simple content
        );
        fileSystemModule.mkdirSync( pathOperations.join(TEMPORARY_OUTPUT_ROOT, 'public') );

        perfMonitorInstance.copyStyles();

        testCase.ok(
          fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/styles/phantomas.css' ) ),
          'phantomas.css should exist.'
        );

        testCase.ok(
          fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/styles/custom.css' ) ),
          'custom.css should exist as the additional stylesheet was provided and found.'
        );

        testCase.done();
      },
      stylesheetSourceDoesNotExist : function( testCase ) {
        var configOptions     = {
          userDefinedStylesheet : pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'non-existent-styles.css' ),
          outputRootPath            : TEMPORARY_OUTPUT_ROOT
        };
        var completionHandler        = function() {};
        var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

        fileSystemModule.mkdirSync( pathOperations.join(TEMPORARY_OUTPUT_ROOT, 'public') );

        perfMonitorInstance.copyStyles();

        testCase.ok(
          fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/styles/phantomas.css' ) ),
          'phantomas.css should exist.'
        );

        testCase.ok(
          !fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'public/styles/custom.css' ) ),
          'custom.css should NOT exist as the additional stylesheet was specified but not found.'
        );

        testCase.done();
      }
    }
  },


  dataDirectoryCreation : {
    directoryMissing : function( testCase ) {
      var configOptions     = {
        outputRootPath : TEMPORARY_OUTPUT_ROOT
      };
      var completionHandler        = function() {};
      var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      // Ensure data directory does NOT exist initially.
      purgeDirectoryRecursive( pathOperations.join(TEMPORARY_OUTPUT_ROOT, 'data') );

      perfMonitorInstance.createDataDirectory()
        .then( function() {
          testCase.ok( fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'data' ) ), 'Data directory should be created.' );
          testCase.done();
        } );
    },
    directoryAlreadyExists : function( testCase ) {
      var configOptions     = {
        outputRootPath : TEMPORARY_OUTPUT_ROOT
      };
      var completionHandler        = function() {};
      var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      fileSystemModule.mkdirSync( pathOperations.join(TEMPORARY_OUTPUT_ROOT, 'data') ); // Create it beforehand.

      perfMonitorInstance.createDataDirectory()
        .then( function() {
          testCase.ok( fileSystemModule.existsSync( pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'data' ) ), 'Data directory should still exist.' );
          testCase.done();
        } );
    }
  },


  mainOutputDirectoryCreation : {
    directoryMissingRecursively : function( testCase ) {
      var deepPath = pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'level1', 'level2' ); // Deeper path
      var configOptions     = {
        // Test recursive folder creation
        outputRootPath : deepPath
      };
      var completionHandler        = function() {};
      var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      // Ensure the entire path is clean.
      purgeDirectoryRecursive( TEMPORARY_OUTPUT_ROOT );

      perfMonitorInstance.createIndexDirectory()
        .then( function() {
          testCase.ok( fileSystemModule.existsSync( TEMPORARY_OUTPUT_ROOT ), 'Root of temporary path should exist.' );
          testCase.ok( fileSystemModule.existsSync( deepPath ), 'Deeply nested path should be created recursively.' );
          testCase.done();
        } );
    },
    directoryAlreadyExists : function( testCase ) {
      var configOptions     = {
        outputRootPath : pathOperations.join( TEMPORARY_OUTPUT_ROOT, 'existing_dir' )
      };
      var completionHandler        = function() {};
      var perfMonitorInstance   = new PerformanceMonitorCore( gruntCompatibilityLayer, configOptions, completionHandler );

      // Create the directory beforehand.
      fileSystemModule.mkdirSync( configOptions.outputRootPath, { recursive: true } ); // Use recursive option for modern node

      perfMonitorInstance.createIndexDirectory()
        .then( function() {
          testCase.ok( fileSystemModule.existsSync( TEMPORARY_OUTPUT_ROOT ), 'Root of temporary path should still exist.' );
          testCase.ok( fileSystemModule.existsSync( configOptions.outputRootPath ), 'Existing output directory should still exist.' );
          testCase.done();
        } );
    }
  }
};