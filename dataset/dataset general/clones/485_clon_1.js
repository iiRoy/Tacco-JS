/*
 * This file serves as the main Karma configuration for the project.
 * It exports a function that takes a 'config' object and sets up the
 * test environment. This setup includes defining the base path,
 * test frameworks, files to be loaded, and browser settings.
 */
module.exports = function ( config ) {

  // Call the 'set' method on the provided config object
  // to define all Karma options.
  config.set( {

    // The 'basePath' is used to resolve all relative paths defined
    // in the 'files' and 'exclude' arrays. Here, it's set to the
    // current directory where the karma.conf.js file resides.
    basePath: './' ,


    // Specify the testing frameworks that Karma should use.
    // 'jasmine' is a popular behavior-driven development framework
    // for testing JavaScript code.
    frameworks: [ "jasmine" ] ,


    // This array defines the list of files to be loaded into the browser
    // for testing. The order of files matters, especially for dependencies.
    // It includes third-party libraries, application source code, and test files.
    files: [
      // --- Third-party libraries and dependencies ---
      // jQuery library, often a dependency for many front-end projects.
      'test/lib/jquery.min.js' ,
      // Helper utilities specific to the test environment.
      'test/lib/helpers.js' ,
      // AngularJS core library, a specific version.
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular.js' ,
      // AngularJS routing module.
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-route.js' ,
      // AngularJS animation module.
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-animate.js' ,
      // AngularJS mocks for testing purposes, essential for unit testing Angular apps.
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-mocks.js' ,

      // --- Application source code ---
      // All JavaScript files within the 'src' directory and its subdirectories.
      // This ensures that the application code under test is loaded.
      'src/**/*.js' ,

      // --- Unit test files ---
      // All JavaScript files within the 'test/unit' directory and its subdirectories.
      // These are the actual test specifications that will be run.
      'test/unit/**/*.js'
    ] ,


    // 'autoWatch' determines if Karma should watch for file changes.
    // When set to 'true', Karma will re-run tests automatically
    // every time a watched file is modified and saved.
    autoWatch: true ,


    // Specify the browsers in which to run the tests.
    // 'PhantomJS' is a headless WebKit scriptable with JavaScript,
    // useful for continuous integration environments where a GUI browser
    // is not available or desired.
    browsers: [ 'PhantomJS' ]

  } ) ; // End of the config.set() method call.

} ; // End of the module.exports function definition.