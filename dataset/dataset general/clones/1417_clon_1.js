/*
 * This file is part of a Yeoman generator test suite.
 * It's used to verify the functionality of the 'slim' generator.
 */

/*global   describe,   beforeEach,   it */
'use strict' ; /* Enforce strict mode for cleaner code. */


var path        = require ( 'path' ) ; // Node.js path module for directory manipulation.
var helpers     = require ( 'yeoman-generator' ) . test ; // Yeoman test helpers.
var randomString= require ( 'random-string' ) ; // Utility to generate random strings.

// Main test suite for the 'slim' generator.
describe ( 'slim generator' , function ( ) {


  // Setup hook to run before each test case.
  beforeEach ( function ( done ) {
    // Create a temporary directory for testing purposes.
    helpers . testDirectory ( path . join ( __dirname , 'temp' ) , function ( err ) {
      if ( err ) {
        // If an error occurs during directory creation, propagate it.
        return done ( err ) ;
      }

      // Initialize the generator instance.
      this . app = helpers . createGenerator ( 'slim:app' , [
        '../../app' // Path to the generator itself.
      ] ) ;
      // Signal that the asynchronous setup is complete.
      done ( ) ;
    } . bind ( this ) ) ; // Ensure 'this' context is correctly bound.
  } ) ;


  // Test case: Verify that the generator creates all expected files.
  it ( 'creates expected files' , function ( done ) {
    // Define an array of file paths that are expected to be generated.
    var expected = [
      // Core configuration files.
      '.editorconfig' ,
      '.gitignore' ,
      '.bowerrc' ,
      'package.json' ,
      'gruntfile.js' ,
      'bower.json' ,
      'composer.json' ,

      // Public web directory files.
      'public/index.php' ,
      'public/.htaccess' ,

      // Application core files.
      'app/app.php' ,
      'app/bootstrap.php' ,
      'app/autoload.php' ,

      // Application helper classes.
      'app/helpers/Search.php' ,
      'app/helpers/Authhash.php' ,

      // Application routes.
      'app/routes/index.php' ,

      // Test suite files.
      'test/jasmine/testSpec.js' ,

      // Source assets (CoffeeScript, LESS, Handlebars).
      'app/src/coffee/app.coffee' ,
      'app/src/coffee/views/viewTest.coffee' ,
      'app/src/less/styles.less' ,
      'app/src/hbs/head.hbs' ,
      'app/src/hbs/config.env.hbs' ,

      // Twig view templates and HTML layouts.
      'app/views/index.twig' ,
      'app/views/layouts/master.twig' ,
      'app/views/layouts/head.html' ,
      'app/views/layouts/one_column.twig' ,
      'app/views/layouts/breadcrumb.twig' ,
      'app/views/layouts/LICENSE.md' , // License file for layout components.

      // Error pages.
      'app/views/errors/404.twig' ,

      // Environment-specific configuration files.
      'app/config/config.env.php' ,
      'app/config/config.development.php' ,
      'app/config/config.production.php'
    ] ;

    // Mock user prompts for the generator.
    helpers . mockPrompt ( this . app , {
      siteName        : 'Slim Generator' ,
      authHashSecret  : randomString ( { length : 30 } ) ,
      sessionCookieSecret : randomString ( { length : 30 } ) ,
      author          : 'Katja Lutz' ,
      serverPort      : 80
    } ) ;

    // Set generator options to skip package installation during testing.
    this . app . options [ 'skip-install' ] = true ;

    // Run the generator.
    this . app . run ( { } , function ( ) {
      // Assert that all expected files have been created.
      helpers . assertFile ( expected ) ;
      // Signal that the asynchronous test is complete.
      done ( ) ;
    } ) ;
  } ) ;
} ) ;