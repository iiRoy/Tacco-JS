/*
 * This file configures the Grunt build system for the project.
 * It sets up various tasks for asset management and compilation.
 */
module.exports = function  (  grunt  )   {

  // Initialize Grunt configuration object
  grunt.initConfig ( {
    // Defines a common path for fixture files used across tasks.
    fixturesPath : "fixtures" ,


    // Configuration for the 'htmlbuild' task.
    // This task is responsible for processing HTML files.
    htmlbuild  :  {

      // 'dist' sub-task: Processes the main HTML file for distribution.
      dist: {
        src: './index.html' , // Source HTML file to process.
        dest: './samples/' , // Destination directory for the processed HTML.
        options: {
          beautify: true , // Enable HTML beautification.
          /*
           * This line was originally commented out.
           * parseTag: 'htmlbuild',
           * It defines the custom tag for HTML building directives.
           */
          relative: true , // Use relative paths for assets.

          // Configuration for script assets.
          scripts: {
            // Bundle multiple JavaScript files into one.
            bundle: [
              '<%= fixturesPath %>/scripts/*.js' , // All JS files in scripts directory.

              '!**/main.js' , // Exclude main.js from the bundle.
            ] ,
            // Inline application-specific script.
            inlineapp: '<%= fixturesPath %>/scripts/app.js' ,
            // Main application script.
            main: '<%= fixturesPath %>/scripts/main.js'
          } ,

          // Configuration for stylesheet assets.
          styles: {
            // Bundle multiple CSS files.
            bundle: {
              cwd: '<%= fixturesPath %>' , // Current working directory for this bundle.
              files: [
                'css/libs.css' , // Library CSS file.

                'css/dev.css' // Development-specific CSS file.
              ]
            } ,
            // Inline test stylesheet.
            test: '<%= fixturesPath %>/css/inline.css'
          } ,

          // Configuration for HTML sections (views, templates).
          sections: {
            views: '<%= fixturesPath %>/views/**/*.html' , // All HTML views.
            templates: '<%= fixturesPath %>/templates/**/*.html' , // All HTML templates.
          } ,

          // Data to be injected into the HTML build process.
          data: {
            version: "0.1.0" , // Project version number.
            title: "test" , // Page title.
          } ,
        } // End of 'options'
      } // End of 'dist' sub-task
    } // End of 'htmlbuild' task
  } ) ; // End of grunt.initConfig() call

  // Load Grunt tasks from the 'tasks' directory.
  grunt.loadTasks ( 'tasks' ) ;


  // Register the default Grunt task.
  // When 'grunt' is run without arguments, it will execute 'htmlbuild'.
  grunt.registerTask ( 'default' , [ 'htmlbuild' ] ) ;
} ; // End of module.exports function