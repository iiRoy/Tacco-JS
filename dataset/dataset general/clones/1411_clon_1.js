/*
 * This file serves as an experimental Gulp build script.
 * Its primary purpose is to manage a simple Apache Cordova-based application.
 * It directly leverages the 'cordova-lib' module, bypassing the 'cordova-cli'
 * for greater control over the build process.
 *
 * Key aspects of this setup:
 *  - The Cordova project structure is established within the './build/' directory.
 *    This directory is considered a build artifact and can be regenerated.
 *  - The 'gulp clean' command is responsible for removing the entire build directory.
 *  - To initialize or re-initialize the Cordova project, use 'gulp recreate'.
 *
 * This approach allows for more fine-grained management of Cordova projects
 * within a Gulp workflow.
 */

/* --- Configuration Variables & Dependencies --- */

// Note regarding Cordova plugins:
// As of the current setup, plugins cannot be reliably managed via package.json.
// Reasons include:
//  1. Plugins are typically published to the Cordova plugin registry, not npm.
//  2. Plugin package.json files often lack proper dependency declarations.
//     This might be due to platform-specific dependencies, making a universal
//     declaration difficult or impossible.
var     plugins =
        [
            'org.apache.cordova.file'
        ]
;

// Specifies the target platform for 'run' and 'emulate' tasks.
// For platform-specific operations, consider creating dedicated tasks like 'runios' or 'runandroid'.
var testPlatform = 'android'
;


// Core Node.js modules for file system operations and path manipulation
var path = require( 'path' )
;
var fs = require( 'fs' )
;
var del = require( 'del' )
;


// Project-specific dependencies and Gulp utilities
var pkg = require( './package.json' )
;
var gulp = require( 'gulp' )
;
var jshint = require( 'gulp-jshint' )
;
var cordova_lib = require( 'cordova-lib' )
;

// Raw Cordova API access
var cdv = cordova_lib.cordova.raw
;

// Defines the root directory for the Cordova build output
var buildDir = path.join( __dirname, 'build' )
;


// Dynamically determine Cordova platforms based on package.json dependencies.
// This ensures that platform file downloading and versioning are handled by npm.
var platforms = []
; // Holds platform names, e.g., ['cordova-ios', 'cordova-android']

var platform_dirs = []
; // Stores paths to platform directories under node_modules

// Iterate through available Cordova platforms in cordova-lib
for ( var p in cordova_lib.cordova_platforms )
{
    var pname = 'cordova-' + p
    ;
    // Check if the platform is listed in the project's dependencies
    if ( pkg.dependencies[ pname ] )
    {
        platforms.push( pname )
        ;
        platform_dirs.push( path.join( __dirname, 'node_modules', pname ) )
        ;
        // TODO: Implement a check here to verify if the platform directories actually exist.
        // If not, prompt the user to execute "npm install" to resolve missing dependencies.
    }
}


/* --- Gulp Task Definitions --- */

// IMPORTANT: All calls to `cordova-lib` (with the exception of `cordova create`)
// MUST be executed from within the Cordova project directory.
// This is because `cordova-lib` infers the `projectRoot` from `process.cwd()`
// within its internal utility functions (e.g., `cordova-lib/src/cordova/util.js:isCordova()`).

gulp.task(
    'jshint'
    , function()
    {
        gulp
            .src( './src/www/js/*.js' )
            .pipe( jshint() )
            .pipe( jshint.reporter( 'default' ) )
        ;
    }
)
;

gulp.task(
    'clean'
    , function( cb )
    {
        // Using 'del' for cleaning; 'gulp-rimraf' is another viable option.
        del( [ 'build' ], cb )
        ;
    }
)
;


// The 'prepare' task is often not strictly necessary in this setup.
gulp.task(
    'prepare'
    , function()
    {
        process.chdir( buildDir )
        ;
        return cdv.prepare()
        ;
    }
)
;

gulp.task(
    'build'
    , function()
    {
        process.chdir( buildDir )
        ;
        return cdv.build()
        ;
    }
)
;

gulp.task(
    'run'
    , function( cb )
    {
        process.chdir( buildDir )
        ;
        return cdv.run( { platforms: [ testPlatform ], options: [ '--device' ] } )
        ;
    }
)
;

gulp.task(
    'emulate'
    , function()
    {
        process.chdir( buildDir )
        ;
        return cdv.emulate( { platforms: [ testPlatform ] } )
        ;
    }
)
;

gulp.task(
    'release'
    , function()
    {
        process.chdir( buildDir )
        ;
        return cdv.build( { options: [ '--release' ] } )
        ;
        // TODO: Implement a mechanism to copy the generated APK file(s)
        // from the './build/' directory to a more accessible location.
    }
)
;


// Task to create the Cordova project under './build/'.
// This implementation avoids 'cordova create' and instead uses symbolic links
// for 'config.xml' and 'www/' for better control.
gulp.task(
    'recreate'
    , [ 'clean' ]
    , function()
    {
        // TODO: The 'uri' property might become obsolete in future 'cordova-lib' versions
        // (e.g., after 0.21.7 is released).
        var srcDir = path.join( __dirname, 'src' )
        ;

        // Ensure the build directory exists and change into it.
        fs.mkdirSync( buildDir )
        ;
        process.chdir( buildDir )
        ;

        // Create symbolic links for core Cordova project files.
        fs.symlinkSync( path.join( '..', 'src', 'config.xml' ), 'config.xml' )
        ;
        fs.symlinkSync( path.join( '..', 'src', 'www' ), 'www' )
        ;
        // Alternative strategy: Copy 'www' content instead of linking.
        // This is useful when working with pre-processors like SASS or CoffeeScript,
        // allowing Gulp to watch and transpile changes into the 'www' directory.

        // Order of operations: Plugins must be added before platforms.
        // If platforms are added first, Cordova may expect the './build/plugins'
        // directory to exist, leading to errors.
        // TODO: Explore the use of the 3rd parameter `{cli_variables: {...}}` for plugin addition.
        return cdv
            .plugins( 'add', plugins )
            .then(
                function()
                {
                    return cdv.platform( 'add', platform_dirs )
                    ;
                }
            )
        ;
    }
)
;


// An alternative 'recreate' task that utilizes the official 'cordova create' command,
// rather than manually setting up symbolic links.
gulp.task(
    'cdvcreate'
    , [ 'clean' ]
    , function()
    {
        // TODO: The 'uri' property might become obsolete in future 'cordova-lib' versions
        // (e.g., after 0.21.7 is released).
        var srcDir = path.join( __dirname, 'src' )
        ;
        var cfg = { lib: { www: { uri: srcDir, url: srcDir, link: true } } }
        ;

        // TODO: Consider storing the application ID within 'package.json' for better organization.
        var appId = 'org.apache.cordova.example.HelloGulp'
        ;
        return cdv
            .create( buildDir, appId, pkg.name, cfg )
            .then(
                function()
                {
                    // Subsequent Cordova commands require execution within the newly created
                    // Cordova project directory.
                    process.chdir( buildDir )
                    ;
                }
            )
            .then(
                function()
                {
                    return cdv.platform( 'add', platform_dirs )
                    ;
                }
            )
            .then(
                function()
                {
                    // TODO: Investigate the usage of the 3rd parameter, e.g., 'cli_variables'.
                    return cdv.plugins( 'add', plugins )
                    ;
                }
            )
        ;
    }
)
;