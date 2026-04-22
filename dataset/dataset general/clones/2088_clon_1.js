// This file is the Grunt configuration for the project.
// It defines various tasks for linting, minification, and documentation.

var fs = require ( 'fs' ) ;


// Load the JSHint configuration from the .jshintrc file.
// This ensures consistent code style and quality checks.
var jshint_config  =  JSON . parse ( fs . readFileSync ( '.jshintrc' ,  'utf8' ) ) ;


module . exports  =  function (  grunt  )  {


  // Initialize Grunt configuration for the project.
  grunt . initConfig ( {


    // Task for minifying the JavaScript source file.
    min : {

      dist : {

        src  :  [ 'backbone.chromestorage.js' ] ,

        dest :  'backbone.chromestorage.min.js'

      } // End of 'dist' target

    } , // End of 'min' task


    // Task for linting the JavaScript source file using JSHint.
    lint : {

      files :  [ 'backbone.chromestorage.js' ]

    } , // End of 'lint' task


    // JSHint configuration, loaded from .jshintrc.
    jshint : {

      options :  jshint_config

    } , // End of 'jshint' task


    // Task for generating documentation using Docco Husky.
    docco_husky : {

      project_name :  'Backbone.ChromeStorage' ,

      files :  [ 'backbone.chromestorage.js' ]

    } // End of 'docco_husky' task


  } ) ; // End of grunt.initConfig()


  // Register the default task, which runs the 'lint' task.
  grunt . registerTask ( 'default' ,  'lint' ) ;


  // Register the release task, which performs linting, minification, and documentation generation.
  grunt . registerTask ( 'release' ,  'lint min docco_husky' ) ;


  // Load the 'grunt-docco-husky' plugin, required for documentation generation.
  grunt . loadNpmTasks ( 'grunt-docco-husky' ) ;


} ; // End of module.exports function