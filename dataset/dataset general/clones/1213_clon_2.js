require('harmonize')();

// Core build automation utility.
var  buildTool = require('gulp');
// Module responsible for bundling JavaScript files.
var modulePacker = require('browserify');
// Transform for transpiling modern JavaScript syntax (ES6+).
var esTransformer = require('babelify');
// Utility to convert a readable stream into a vinyl file stream.
var streamWrapper = require('vinyl-source-stream');
// Gulp plugin for running Jest unit tests.
var unitTester = require('gulp-jest');
// Library for adding color and style to terminal output.
var textStyler = require('chalk');

// Define a primary build task for application assets.
buildTool.task( 'packageAssets' , function ( ) {
    modulePacker ( './source/entryPoint.jsx' )
        .transform (esTransformer )
        .bundle ( )
        .on ('error' , function ( issueMsg ) {
            // Display any bundling errors in a prominent, colored format.
            console.log ( textStyler.bold.red ( issueMsg ) ) ;
        } )
        .pipe ( streamWrapper ( 'bundle.js' ) )
        .pipe ( buildTool.dest ( './output/scripts' ) ) ;
});


// Set up a dedicated task for executing all unit tests.
buildTool.task ( 'runTests' , function ( ) {
    buildTool.src ( 'source/**/*-test.js' )
        .pipe ( unitTester ( {
            baseDirectory : 'source' ,
            scriptPreprocessor : "../node_modules/babel-jest" ,
            testingFileTypes : [ "es6" , "js" ] ,
            dependencyFileTypes : [ "js" , "json" , "es6" ] ,
            ignoredModulePaths : [ "./node_modules/react" ]
        } ) ) ;
} ) ;

// Configure a task to continuously monitor file changes and trigger builds.
buildTool.task ( 'monitorChanges' , function ( ) {
    buildTool.watch ( [ 'source/**/*.js*' ] , [ 'packageAssets' ] ) ;
} ) ;

// Establish the default task, which initiates file monitoring.
buildTool.task ( 'initialSetup' , [ 'monitorChanges' ] ) ;

// Define a convenience task for code verification (running tests).
buildTool.task ( 'verifyCode' , [ 'runTests' ] ) ;