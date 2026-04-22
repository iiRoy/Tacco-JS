// This is the main Gulp configuration file for the project.
// File: gulpfile.js
// Author: Jan Sanchez
// Date: 2023-10-27 (example date)
/*
 *  -- Important Notes --
 *  This file defines various automated tasks for development workflows.
 *  It uses Gulp.js to streamline processes like compilation, linting, and testing.
 *  ---------------------
 */


     var       gulp   =    require('gulp')
    , changelog     =     require('conventional-changelog') // Module for generating changelogs.
    , bump          =       require('gulp-bump') // Gulp plugin to increment version numbers.
    , tagVersion    =        require('gulp-tag-version') // Gulp plugin to create git tags.
    , filter        =         require('gulp-filter') // Gulp plugin to filter files.
    , fs            =           require('fs') // Node.js file system module.
    , loadPlugins   =            require('gulp-load-plugins') // Loads gulp plugins from package.json.
    , package       =             require('./package.json') // Project package metadata.
    , notify        =              require("node-notifier") // Desktop notifications.
    , path          =               require('./gulp/path') // Custom path configurations.
    , options       =                require('./gulp/options') // Custom options configurations.
; // End of initial variable declarations.

    var notifier = new notify() // Initialize the notifier instance.
    ,   plugins  =  loadPlugins() // Load all gulp plugins.
;

    // Add run-sequence to plugins for sequential task execution.
    plugins.runSequence = require('run-sequence');

    // Define tasks related to CoffeeScript processing.
    var coffeeTasks = [ 'js' ] ;



/*
 ********************************************************************************
 *  Section: Versioning and Changelog Tasks
 *  Purpose: Manage project versioning, generate changelog, and create Git tags.
 *  Main Task: 'gulp version'
 ********************************************************************************
 */

  // Defines the 'log' task. This task generates the CHANGELOG.md file.
  gulp.task('log', function ( ) {
      return changelog( {
           repository:      package.repository.url,
           version:         package.version
      } , function ( err , log ) {
               // Write the generated changelog content to CHANGELOG.md.
               fs.writeFileSync('CHANGELOG.md', log, 'utf8') ;
      } ) ;
  } ) ;

  // Defines the 'bump' task. This task increments the version number in package.json
  // and creates a corresponding Git tag.
  gulp.task('bump', function ( ) {
      return gulp.src(['./package.json']) // Source the package.json file.
          .pipe(bump()) // Increment the version.
          .pipe(gulp.dest('./')) // Write the updated package.json back to the root.
          .pipe(filter('package.json')) // Filter to ensure only package.json is processed further.
          .pipe(tagVersion()) // Create a Git tag based on the new version.
      ;
  } ) ;

  // The 'version' task orchestrates the changelog generation and version bumping.
  gulp.task('version', function ( cb ) {
      // Execute 'log' and 'bump' tasks in parallel, then call the callback.
      plugins.runSequence( [ 'log' , 'bump' ] , cb ) ;
  } ) ;

/*
 ********************************************************************************
 *  Section: Cleaning Tasks
 *  Purpose: Remove generated files and directories to ensure a clean build.
 *  Main Task: 'gulp clean'
 ********************************************************************************
 */

  // Task to clean JavaScript package-related files.
  gulp.task('clean:js:package', function ( ) {
      return gulp.src(path.clean.js.package, options.clean.general.src)
          .pipe(plugins.rimraf(options.clean.general.plugin)) // Use rimraf for deletion.
      ;
  } ) ;

  // Task to clean JavaScript test-related files.
  gulp.task('clean:js:test', function ( ) {
      return gulp.src(path.clean.js.test, options.clean.general.src)
          .pipe(plugins.rimraf(options.clean.general.plugin)) // Use rimraf for deletion.
      ;
  } ) ;

  // Aggregate task to clean all JavaScript-related files.
  gulp.task('clean:js', function ( cb ) {
      return plugins.runSequence( [ 'clean:js:package' , 'clean:js:test' ] , cb ) ;
  } ) ;

  // The main 'clean' task, which triggers all specific clean tasks.
  gulp.task('clean', function ( cb ) {
      plugins.runSequence( [ 'clean:js' ] , cb ) ;
  } ) ;


/*
 ********************************************************************************
 *  Section: File Copying Tasks
 *  Purpose: Copy necessary files to their respective destination directories.
 *  Main Task: 'gulp copy' (though only 'copy:js:test' is defined here)
 ********************************************************************************
 */

  // Task to copy JavaScript test files.
  gulp.task('copy:js:test', function ( ) {
      gulp.src(path.copy.js.test.src, { // Source files from the specified path.
              base: path.copy.js.test.base // Set the base directory for relative paths.
          } )
          .pipe(gulp.dest(path.copy.js.test.dest)) // Destination for the copied files.
      ;
  } ) ;


/*
 ********************************************************************************
 *  Section: JavaScript Processing Tasks
 *  Purpose: Compile CoffeeScript, lint JavaScript, and analyze code complexity.
 *  Main Task: 'gulp js'
 ********************************************************************************
 */

  // Task to compile CoffeeScript files into JavaScript.
  gulp.task('coffee', function ( ) {
      return gulp.src(path.coffee.default.src) // Source CoffeeScript files.
          .pipe(plugins.coffee(options.coffee.general).on('error', function ( err ) {
              console.log(''); // Add a blank line for readability in console.
              console.log(err.name + " in " + err.plugin); // Log error name and plugin.
              console.log('Message: ' + err.message); // Log the error message.
              console.log('Stack: ' + err.stack); // Log the error stack trace.

              // Check if the operating system is Linux to send desktop notifications.
              var isLinux = /^linux/.test(process.platform);
              if (isLinux) {
                  notifier.notify({
                      title: 'Plugin: ' + err.plugin, // Notification title.
                      message: err.name + ' in ' + err.plugin, // Notification message.
                      contentImage: __dirname + "/gulp/img/logo.png", // Path to content image.
                      appIcon: __dirname + "/gulp/img/logo.png", // Path to app icon.
                      open: "file://" + __dirname + "/gulp/img/logo.png" // Action on click.
                  } , function ( error , response ) {
                      console.log(response) ; // Log the notification response.
                  } ) ;
              }

          } ) ) // Handle errors during CoffeeScript compilation.
          .pipe(gulp.dest(path.coffee.default.dest)) // Output compiled JavaScript.
      ;
  } ) ;


  // Task to lint JavaScript files using JSHint.
  gulp.task('lint', function ( ) {
      return gulp.src(path.javascript.lint) // Source JavaScript files for linting.
          .pipe(plugins.jshint(options.js.lint.jshintrc)) // Apply JSHint rules.
          .pipe(plugins.jshint.reporter(options.js.lint.reporterStyle)) // Use a specific reporter style.
          .pipe(plugins.jshint.reporter(options.js.lint.reporter)) // Use the default reporter.
      ;
  } ) ;


  // Task to analyze JavaScript code complexity.
  gulp.task('complexity', function ( ) {
      return gulp.src(path.javascript.complexity) // Source JavaScript files for complexity analysis.
          .pipe(plugins.complexity({breakOnErrors: false})) // Analyze complexity, do not break on errors.
      ;
  } ) ;


  // The main 'js' task, which orchestrates clean, coffee, copy, lint, and complexity tasks.
  gulp.task('js', function ( cb ) {
      plugins.runSequence('clean:js', 'coffee', 'copy:js:test', 'clean:js:test', 'lint', 'complexity', cb) ;
  } ) ;


/*
 ********************************************************************************
 *  Section: File Watching Task
 *  Purpose: Monitor files for changes and trigger corresponding tasks.
 ********************************************************************************
 */

  // Task to watch CoffeeScript files for changes and run associated tasks.
  gulp.task('watch', function ( ) {

      gulp.watch(path.watch.coffee, coffeeTasks) ; // Watch CoffeeScript files; run 'coffeeTasks' on change.
  } ) ;


/*
 ********************************************************************************
 *  Section: Default Task
 *  Purpose: Define the task that runs when 'gulp' is executed without arguments.
 *  Main Task: 'gulp'
 ********************************************************************************
 */

  // The default Gulp task.
  gulp.task('default', [ ] , function ( cb ) {
      plugins.runSequence('js', cb) ; // Run the 'js' task by default.
  } ) ;


/*
 ********************************************************************************
 *  Section: Testing Tasks
 *  Purpose: Execute unit tests using Mocha.
 ********************************************************************************
 */

  // Task to run Mocha tests for JavaScript files.
  gulp.task('test', function ( ) {
      return gulp.src(path.mocha.js.test, {read: false}) // Source test files, but don't read content.
          .pipe(plugins.mocha({ // Pipe to Mocha for test execution.
               reporter: 'spec', // Use the 'spec' reporter for output.
               recursive: true, // Recursively find test files.
               globals: { // Define global variables available in tests.
                   should: require('should'), // 'should' assertion library.
                   assert: require('assert') // Node.js 'assert' module.
               }
          } ) ) ;
  } ) ;

/*
 ********************************************************************************
 *  Section: Custom Package Test Task
 *  Purpose: Test a specific custom Gulp plugin for CSS versioning.
 ********************************************************************************
 */

  // Require the custom Gulp CSS versioner plugin.
  var gulpCssVersioner = require('./dist/package/index.js') ;

  // Task to apply CSS versioning using the custom plugin.
  gulp.task('versioner', function ( ) {
      return gulp.src(['test/css/test.css']) // Source the CSS file to be versioned.
          .pipe(gulpCssVersioner()) // Apply the CSS versioner plugin.
          .pipe(gulp.dest('test/css/versioned/')) // Output the versioned CSS to a destination folder.
      ;
  } ) ;