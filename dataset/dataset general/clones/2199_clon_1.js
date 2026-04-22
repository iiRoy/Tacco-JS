'use strict'  ;


  var   fs        = require(   'fs'   );
 var  path      = require( 'path' );
 var grunt     = require( 'grunt' );
 var Phantomas = require( '../../index' );
 var Promise   = require( 'bluebird' );
 var  _         = require( 'lodash' );


 var TEMP_PATH = './tmp/' ;


 /**
  * Helper functions
  *
  * These are utility functions for testing purposes.
  */

 /**
  * Delete folder recursive
  * - unfortunately plain node has problems with that
  *
  * @param  {String} path The path to the folder to delete.
  * @returns {void}
  */
 function deleteFolderRecursive ( path ) {
  var files = [];
  if ( fs.existsSync( path ) ) {
    files = fs.readdirSync( path );
    files.forEach( function( file ) {
      var curPath = path + '/' + file;
      if ( fs.statSync( curPath ).isDirectory() ) {
          deleteFolderRecursive( curPath ); // recurse
      } else {
          fs.unlinkSync( curPath ); // delete file
      }
    } );
    fs.rmdirSync( path ); // delete empty folder
  }
}


 /**
  * Create a function that
  * will return a stubbed promise
  *
  * This is used to mock asynchronous operations in tests.
  *
  * @param  {Object}  test     The test object (e.g., from Nodeunit).
  * @param  {String}  name     The name of the function being stubbed, for logging.
  *
  * @return {Function}         A function that, when called, returns a Promise
  *                            that resolves immediately and asserts that the
  *                            stubbed function was called.
  */
 function createStubPromise( test, name ){
  return function() {
    return new Promise( function( resolve ) {
      test.ok( true, name + ' was called!' );
      resolve();
    } );
  };
}


 /**
  * Test suite for checking promises flow
  *
  * This suite focuses on testing the asynchronous flow of Phantomas operations.
  *
  * @type {Object}
  */
 exports.phantomasPromisesFlow = {

  setUp : function( done ){

    // save stubs for reverting after test
    this.stubs = {
      copyStyles                     : Phantomas.prototype.copyStyles,
      copyScripts                    : Phantomas.prototype.copyScripts,
      createIndexDirectory           : Phantomas.prototype.createIndexDirectory,
      createDataDirectory            : Phantomas.prototype.createDataDirectory,
      executePhantomas               : Phantomas.prototype.executePhantomas,
      formResult                     : Phantomas.prototype.formResult,
      writeData                      : Phantomas.prototype.writeData,
      processData                    : Phantomas.prototype.processData,
      readMetricsFiles               : Phantomas.prototype.readMetricsFiles,
      outputUi                       : Phantomas.prototype.outputUi,
      createIndexHtml                : Phantomas.prototype.createIndexHtml,
      notifyAboutNotDisplayedMetrics : Phantomas.prototype.notifyAboutNotDisplayedMetrics,
      copyAssets                     : Phantomas.prototype.copyAssets,
      showSuccessMessage             : Phantomas.prototype.showSuccessMessage
    };

    done();
  },

  tearDown : function ( callback ) {

    // revert stubs to their original value
    _.each( this.stubs, function( val, key ) {
      Phantomas.prototype[ key ] = val;
    } );

    // Clean up temporary files/directories
    deleteFolderRecursive( TEMP_PATH );

    callback();
  },


  copyAssets : {

    publicFolderExists : function( test ) {

      var options     = {
        buildUi   : true,
        indexPath : TEMP_PATH
      };
      var done = function() {};

      var phantomas = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH );
      fs.mkdirSync( TEMP_PATH + '/public' );

      Phantomas.prototype.copyScripts = createStubPromise( test, 'copyScripts' );
      Phantomas.prototype.copyStyles  = createStubPromise( test, 'copyStyles' );

      phantomas.copyAssets()
                .then( function() {
                  test.expect( 2 ); // Expect 2 assertions from the stub promises
                  test.done();
                } );
    },

    publicFolderDoesNotExist : function( test ) {

      var options     = {
        buildUi   : true,
        indexPath : TEMP_PATH
      };
      var done = function() {};

      var phantomas = new Phantomas( grunt, options, done );
      var mkdirSync = fs.mkdirSync; // Save original fs.mkdirSync

      fs.mkdirSync( TEMP_PATH ); // Create base temp path

      Phantomas.prototype.copyScripts = createStubPromise( test, 'copyScripts' );
      Phantomas.prototype.copyStyles  = createStubPromise( test, 'copyStyles' );

      // Stub fs.mkdirSync to check if it's called
      fs.mkdirSync = function() {
        test.ok( true, 'fs.mkdirSync was called!' );
      };

      phantomas.copyAssets()
                .then( function() {
                  test.expect( 3 ); // Expect 2 from stubs, 1 from fs.mkdirSync
                  fs.mkdirSync = mkdirSync; // Restore original fs.mkdirSync
                  test.done();
                } );
    }
  },


  kickOff : function( test ) {

    var options     = {
      buildUi   : true,
      indexPath : TEMP_PATH
    };
    var done = function() {
      test.expect( 6 ); // Expect 5 from stubs + 1 from formResult
      test.done();
    };

    var results = {
        requests : {
          values : [ 1, 2, 3, 4 ]
        }
      };

    // stubbing form result here as it needs to use a fake results object
    Phantomas.prototype.formResult = function(){
      return new Promise( function( resolve ) {
        resolve( results );
        test.ok( true, 'formResult was called!' );
      } );
    };

    var phantomas = new Phantomas( grunt, options, done );

    // create stubs for Phantomas functions
    Phantomas.prototype.createIndexDirectory = createStubPromise( test, 'createIndexDirectory' );
    Phantomas.prototype.createDataDirectory  = createStubPromise( test, 'createDataDirectory' );
    Phantomas.prototype.executePhantomas     = createStubPromise( test, 'executePhantomas' );
    Phantomas.prototype.writeData            = createStubPromise( test, 'writeData' );
    Phantomas.prototype.processData          = createStubPromise( test, 'processData' );

    phantomas.kickOff();
  },


  processData : {

    withUI : {

      jsonIsNotSet : function( test ) {

        var options     = {
          indexPath : TEMP_PATH,
          buildUi   : true,
          output    : [ 'whatever' ] // Not 'json'
        };
        var done = function() {};
        var phantomas = new Phantomas( grunt, options, done );

        // create stubs for Phantomas functions
        Phantomas.prototype.readMetricsFiles = createStubPromise( test, 'readMetricsFiles' );
        Phantomas.prototype.outputUi         = createStubPromise( test, 'outputUi' );

        phantomas.processData()
                  .catch( function( e ) {
                    test.strictEqual(
                      e,
                      'Please set \'output\' to \'json\' if you want to build UI\n\n' +
                      '-- or --\n\n' +
                      'set \'buildUi\' to \'false\' if you want to get only the csv files.'
                    );
                    test.expect( 1 ); // Expect 1 assertion from the catch block
                    test.done();
                  } );
      },
      jsonIsSet : function( test ) {

        var options     = {
          indexPath : TEMP_PATH,
          buildUi   : true,
          output    : [ 'json' ] // 'json' is set
        };
        var done = function() {};
        var phantomas = new Phantomas( grunt, options, done );

        // create stubs for Phantomas functions
        Phantomas.prototype.readMetricsFiles = createStubPromise( test, 'readMetricsFiles' );
        Phantomas.prototype.outputUi         = createStubPromise( test, 'outputUi' );

        phantomas.processData()
                  .then( function() {
                    test.expect( 2 ); // Expect 2 assertions from the stub promises
                    test.done();
                  } );
      },
    },
    withoutUi : function( test ) {

      var options     = {
        indexPath : TEMP_PATH,
        buildUi   : false, // UI is disabled
        output    : 'json'
      };
      var done = function() {};
      var phantomas = new Phantomas( grunt, options, done );

      // create stubs for Phantomas functions
      // These should not be called because buildUi is false
      Phantomas.prototype.readMetricsFiles = createStubPromise( test, 'readMetricsFiles' );
      Phantomas.prototype.outputUi         = createStubPromise( test, 'outputUi' );

      phantomas.processData()
                .then( function() {
                  test.expect( 0 ); // Expect no assertions, as UI related stubs shouldn't be hit
                  test.done();
                } );
    }
  },


  outputUi : function( test ) {

    var options     = {
      indexPath : TEMP_PATH,
      buildUi   : true
    };
    var done = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    // create stubs for Phantomas functions
    Phantomas.prototype.createIndexHtml                 = createStubPromise( test, 'createIndexHtml' );
    Phantomas.prototype.notifyAboutNotDisplayedMetrics  = createStubPromise( test, 'notifyAboutNotDisplayedMetrics' );
    Phantomas.prototype.copyAssets                      = createStubPromise( test, 'copyAssets' );

    phantomas.outputUi()
              .then( function() {
                test.expect( 3 ); // Expect 3 assertions from the stub promises
                test.done();
              } );

  }
};


 /**
  * General unit test suite
  *
  * This suite contains basic unit tests for individual Phantomas functions.
  *
  * @type {Object}
  */
 exports.phantomas = {

  setUp : function( done ) {
    // setup here if necessary
    fs.mkdirSync( TEMP_PATH );

    done();
  },

  tearDown : function ( callback ) {
    deleteFolderRecursive( TEMP_PATH );

    callback();
  },

  constructor : function( test ) {
    var options   = {
      indexPath : TEMP_PATH,
      buildUi   : false
    };
    var done      = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    test.strictEqual( phantomas.dataPath,  'tmp/data/' );
    test.strictEqual( phantomas.done,      done );
    test.strictEqual( phantomas.grunt,     grunt );
    test.strictEqual( phantomas.imagePath, 'tmp/images/' );
    test.strictEqual( phantomas.options,   options );
    test.strictEqual( phantomas.buildUi,   false );

    test.strictEqual( typeof phantomas.timestamp,  'number' );

    test.done();
  },


  copyScripts : function( test ) {
    var options     = {
      indexPath : TEMP_PATH
    };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );

    fs.mkdirSync( TEMP_PATH + 'public' );

    phantomas.copyScripts();

    test.strictEqual(
      fs.existsSync( TEMP_PATH + 'public/scripts/phantomas.min.js' ),
      true
    );

    test.strictEqual(
      fs.existsSync( TEMP_PATH + 'public/scripts/d3.min.js' ),
      true
    );

    test.done();
  },


  copyStyles : {

    withoutAdditionalStylesheet : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH + 'public' );

      phantomas.copyStyles();

      test.strictEqual(
        fs.existsSync( TEMP_PATH + 'public/styles/phantomas.css' ),
        true
      );

      test.strictEqual(
        fs.existsSync( TEMP_PATH + 'public/styles/custom.css' ),
        false
      );

      test.done();
    },
    withAdditionalStylesheet : {

      stylesheetExists : function( test ) {
        var options     = {
          additionalStylesheet : TEMP_PATH + 'foo.css',
          indexPath            : TEMP_PATH
        };
        var done        = function() {};
        var phantomas   = new Phantomas( grunt, options, done );

        fs.writeFileSync(
          TEMP_PATH +
          'foo.css', 'body { color : red !important; }'
        );
        fs.mkdirSync( TEMP_PATH + 'public' );

        phantomas.copyStyles();

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/phantomas.css' ),
          true
        );

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/custom.css' ),
          true
        );

        test.done();
      },
      stylesheetDoesNotExist : function( test ) {
        var options     = {
          additionalStylesheet : TEMP_PATH + 'foo.css', // This file does not exist
          indexPath            : TEMP_PATH
        };
        var done        = function() {};
        var phantomas   = new Phantomas( grunt, options, done );

        fs.mkdirSync( TEMP_PATH + 'public' );

        phantomas.copyStyles();

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/phantomas.css' ),
          true
        );

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/custom.css' ),
          false
        );

        test.done();
      }
    }
  },


  createDataDirectory : {

    directoryDoesNotExist : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      phantomas.createDataDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH + '/data' ), true );
          test.done();
        } );
    },
    directoryExists : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH + 'data' ); // Directory already exists

      phantomas.createDataDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH + '/data' ), true );
          test.done();
        } );
    }
  },


  createIndexDirectory : {

    directoryDoesNotExist : function( test ) {
      var options     = {
        // check if recursive folder
        // creation works by using a nested path
        indexPath : TEMP_PATH + 'tmp/'
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      phantomas.createIndexDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH ), true );
          test.strictEqual( fs.existsSync( TEMP_PATH + 'tmp/' ), true );
          test.done();
        } );
    },
    directoryExists : function( test ) {
      var options     = {
        // check if recursive folder
        // creation works
        indexPath : TEMP_PATH + 'tmp/'
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      // Manually create the directory beforehand
      fs.mkdirSync(
        path.normalize(
          TEMP_PATH + 'tmp/'
        ),
        '0777', // Permissions
        true    // Recursive
      );

      phantomas.createIndexDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH ), true );
          test.strictEqual( fs.existsSync( TEMP_PATH + 'tmp/' ), true );
          test.done();
        } );
    }
  }
};