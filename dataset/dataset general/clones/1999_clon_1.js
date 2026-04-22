/*
 * This is a Type I clone of a Yeoman generator file.
 * The original code's functionality is preserved entirely.
 * Only whitespace and comments have been altered significantly.
 */

'use strict' ; // Enforces strict mode for cleaner code.


var util = require( 'util' ) ;
var path = require( 'path' ) ;
var yeoman = require( 'yeoman-generator' ) ; // Yeoman core generator module.


/**
 * Define the main generator constructor function.
 * It inherits from yeoman.generators.Base.
 * @param {Array} args - Command line arguments.
 * @param {Object} options - Command line options.
 * @param {Object} config - Configuration object.
 */
var CornelioGenerator = module.exports = function CornelioGenerator( args,  options,  config ) {
    // Call the parent constructor to initialize the generator.
    yeoman.generators.Base.apply( this,  arguments ) ;

    // Register a callback to be executed at the end of the generator run.
    this.on ( 'end' ,  function () {
        // Install dependencies unless 'skip-install' option is present.
        this.installDependencies ( { skipInstall :  options [ 'skip-install' ] } ) ;
    } ) ;

    // Read the package.json file from the parent directory and parse it.
    // This makes the package information available via this.pkg.
    this.pkg = JSON.parse ( this.readFileAsString ( path.join ( __dirname, '../package.json' ) ) ) ;
} ;


// Inherit prototype methods from yeoman.generators.Base.
util.inherits ( CornelioGenerator,  yeoman.generators.Base ) ;


/**
 * Prototype method to ask the user for input via prompts.
 * This method is automatically called by Yeoman during the prompting phase.
 */
CornelioGenerator.prototype.askFor = function askFor ( ) {
    var cb = this.async ( ) ; // Get a callback function to signal async completion.

    // The following lines are commented out in the original and will remain so,
    // but with different commenting style and additional comments.

    /*
     * Yeoman can greet the user, but this feature is currently disabled.
     * console.log(this.yeoman);
     */

    // This is a placeholder for a sample prompt structure.
    // It's not an active part of the prompt array.
    /*
        {
          type: 'confirm',
          name: 'less',
          message: 'Do you want to use less?',
          default: true
        }
    */

    // Initialize an empty array for prompts. No actual prompts are defined here.
    var prompts = [ ] ;

    // Prompt the user with the defined questions.
    this.prompt ( prompts,  function ( props ) {
        // Store user's responses (if any) in generator instance properties.
        this.someOption = props.someOption ;

        // Call the callback to indicate that the async operation is complete.
        cb ( ) ;
    } .bind ( this ) ) ; // Bind 'this' context to the callback function.
} ;


/*
 * This method is responsible for creating the basic application structure,
 * including directories and core configuration files.
 */
CornelioGenerator.prototype.app = function app ( ) {

    // --- Directory Creation Phase ---
    // Log a message to the console indicating directory creation.
    console.log ( 'creating dirs' ) ;
    this.mkdir ( 'src' ) ;              // Source directory.
    this.mkdir ( 'src/img' ) ;          // Image assets.
    this.mkdir ( 'src/js' ) ;           // JavaScript files.
    this.mkdir ( 'src/css' ) ;          // CSS/LESS/SASS files.
    this.mkdir ( 'src/templates' ) ;    // HTML templates.
    this.mkdir ( 'test' ) ;             // Test files.
    this.mkdir ( 'build' ) ;            // Build output.
    this.mkdir ( '.tmp' ) ;             // Temporary files.


    // --- File Copying Phase (Application-specific files) ---
    // Copy various configuration and project files from templates.
    this.copy ( '_package.json',  'package.json' ) ;
    this.copy ( '_bower.json',  'bower.json' ) ;
    this.copy ( 'bowerrc',  '.bowerrc' ) ;
    this.copy ( 'gitignore',  '.gitignore' ) ;
    this.copy ( 'travis.yml',  '.travis.yml' ) ;
    this.copy ( '_README.md', 'README.md' ) ;
    this.copy ( '_Gruntfile.js', 'Gruntfile.js' ) ;
} ;


/**
 * Method to copy common project configuration files.
 */
CornelioGenerator.prototype.projectfiles = function projectfiles ( ) {
    // Copy editor configuration file.
    this.copy ( 'editorconfig',  '.editorconfig' ) ;
    // Copy JSHint configuration file.
    this.copy ( 'jshintrc',  '.jshintrc' ) ;
} ;


/*
 * Sets up the application structure with specific HTML, CSS, and JS files.
 * Note: The original method name 'setApp' is retained.
 */
CornelioGenerator.prototype.setApp = function ( ) {
    this.copy ( 'test/index.html',  'test/index.html' ) ;
    this.copy ( 'test/lib/chai.js',  'test/lib/chai.js' ) ;
    this.copy ( 'test/lib/expect.js',  'test/lib/expect.js' ) ;
    this.copy ( 'test/lib/mocha/mocha.css',  'test/lib/mocha/mocha.css' ) ;
    this.copy ( 'test/lib/mocha/mocha.js',  'test/lib/mocha/mocha.js' ) ;
    this.copy ( 'test/spec/test.js',  'test/spec/test.js' ) ;
    this.copy ( 'test/spec/main.js',  'test/spec/main.js' ) ;
} ;


/*
 * This method is responsible for setting up test-related files.
 * Note: The original method name 'setTest' is retained.
 */
CornelioGenerator.prototype.setTest = function ( ) {
    this.copy ( 'src/index.html',  'src/index.html' ) ;
    this.copy ( 'src/.htaccess',  'src/.htaccess' ) ;
    this.copy ( 'src/404.html',  'src/404.html' ) ;
    this.copy ( 'src/favicon.ico',  'src/favicon.ico' ) ;
    this.copy ( 'src/robots.txt',  'src/robots.txt' ) ;
    this.copy ( 'src/css/main.less',  'src/css/main.less' ) ;
    this.copy ( 'src/js/app.js',  'src/js/app.js' ) ;
    this.copy ( 'src/js/main.js',  'src/js/main.js' ) ;
    this.copy ( 'src/img/logo.png',  'src/img/logo.png' ) ;
    this.copy ( 'src/templates/allo.html', 'src/templates/allo.html' ) ;
} ;